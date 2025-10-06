import os
import json
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
from fastapi import FastAPI, Request, Response, Depends, HTTPException, status, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import stripe
from sqlalchemy import create_engine, Column, Integer, String, Float, Boolean, DateTime, Text, JSON, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from kafka import KafkaProducer
from dotenv import load_dotenv
from pydantic import BaseModel, Field

# Load environment variables
load_dotenv()

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    handlers=[logging.StreamHandler()]
)
logger = logging.getLogger("stripe-proxy")

# Initialize Stripe
stripe.api_key = os.getenv("STRIPE_API_KEY")
webhook_secret = os.getenv("STRIPE_WEBHOOK_SECRET")

# Initialize database
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/predator")
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Initialize Kafka producer
kafka_bootstrap_servers = os.getenv("KAFKA_BOOTSTRAP_SERVERS", "localhost:9092")
kafka_producer = KafkaProducer(
    bootstrap_servers=kafka_bootstrap_servers,
    value_serializer=lambda v: json.dumps(v).encode('utf-8'),
    key_serializer=lambda v: v.encode('utf-8') if v else None
)

# Database models
class Subscription(Base):
    __tablename__ = "subscriptions"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True)
    stripe_customer_id = Column(String(255), index=True)
    stripe_subscription_id = Column(String(255), unique=True, index=True)
    plan_id = Column(String(100))
    status = Column(String(50))
    current_period_start = Column(DateTime)
    current_period_end = Column(DateTime)
    cancel_at_period_end = Column(Boolean, default=False)
    metadata = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Payment(Base):
    __tablename__ = "payments"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True)
    stripe_customer_id = Column(String(255), index=True)
    stripe_payment_intent_id = Column(String(255), unique=True, index=True)
    amount = Column(Float)
    currency = Column(String(3))
    status = Column(String(50))
    payment_method = Column(String(50))
    description = Column(Text)
    metadata = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

# Create tables
Base.metadata.create_all(bind=engine)

# Pydantic models
class CreateCheckoutSessionRequest(BaseModel):
    user_id: int
    price_id: str
    success_url: str
    cancel_url: str
    metadata: Optional[Dict[str, Any]] = None

class CreateCustomerPortalRequest(BaseModel):
    user_id: int
    return_url: str

class SubscriptionStatus(BaseModel):
    user_id: int
    active: bool
    plan: Optional[str] = None
    status: Optional[str] = None
    current_period_end: Optional[datetime] = None
    cancel_at_period_end: Optional[bool] = None

# FastAPI app
app = FastAPI(
    title="Stripe Proxy API",
    description="API for handling Stripe payments and subscriptions",
    version="1.0.0",
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency to get database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Add OpenTelemetry middleware if enabled
if os.getenv("ENABLE_TELEMETRY", "false").lower() == "true":
    from opentelemetry import trace
    from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor
    from opentelemetry.sdk.trace import TracerProvider
    from opentelemetry.sdk.trace.export import BatchSpanProcessor
    from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter
    
    # Setup OpenTelemetry
    tracer_provider = TracerProvider()
    processor = BatchSpanProcessor(OTLPSpanExporter(endpoint=os.getenv("OTLP_ENDPOINT", "tempo:4317")))
    tracer_provider.add_span_processor(processor)
    trace.set_tracer_provider(tracer_provider)
    
    # Instrument FastAPI
    FastAPIInstrumentor.instrument_app(app)
    logger.info("OpenTelemetry instrumentation enabled")

@app.get("/")
async def root():
    """Root endpoint returning API information"""
    return {
        "name": "Stripe Proxy API",
        "version": "1.0.0",
        "status": "operational",
        "timestamp": datetime.now().isoformat(),
    }

@app.get("/health")
async def health_check():
    """Health check endpoint for monitoring and load balancers"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "version": "1.0.0",
    }

@app.post("/create-checkout-session")
async def create_checkout_session(
    request: CreateCheckoutSessionRequest,
    db = Depends(get_db)
):
    """Create a Stripe Checkout Session for subscription or one-time payment"""
    try:
        # Check if user already has a Stripe customer ID
        subscription = db.query(Subscription).filter(Subscription.user_id == request.user_id).first()
        
        customer_id = None
        if subscription:
            customer_id = subscription.stripe_customer_id
        
        # If no customer ID, create a new customer
        if not customer_id:
            # In a real implementation, you would fetch user details from your database
            customer = stripe.Customer.create(
                metadata={
                    "user_id": str(request.user_id)
                }
            )
            customer_id = customer.id
        
        # Create checkout session
        checkout_session = stripe.checkout.Session.create(
            customer=customer_id,
            payment_method_types=["card"],
            line_items=[
                {
                    "price": request.price_id,
                    "quantity": 1,
                },
            ],
            mode="subscription",
            success_url=request.success_url,
            cancel_url=request.cancel_url,
            metadata={
                "user_id": str(request.user_id),
                **(request.metadata or {})
            }
        )
        
        return {"url": checkout_session.url}
    
    except Exception as e:
        logger.error(f"Error creating checkout session: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/create-customer-portal")
async def create_customer_portal(
    request: CreateCustomerPortalRequest,
    db = Depends(get_db)
):
    """Create a Stripe Customer Portal session for managing subscriptions"""
    try:
        # Get user's Stripe customer ID
        subscription = db.query(Subscription).filter(Subscription.user_id == request.user_id).first()
        
        if not subscription or not subscription.stripe_customer_id:
            raise HTTPException(status_code=404, detail="No subscription found for this user")
        
        # Create customer portal session
        portal_session = stripe.billing_portal.Session.create(
            customer=subscription.stripe_customer_id,
            return_url=request.return_url,
        )
        
        return {"url": portal_session.url}
    
    except Exception as e:
        logger.error(f"Error creating customer portal: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/subscription/{user_id}")
async def get_subscription_status(
    user_id: int,
    db = Depends(get_db)
):
    """Get subscription status for a user"""
    try:
        # Get user's subscription
        subscription = db.query(Subscription).filter(Subscription.user_id == user_id).first()
        
        if not subscription:
            return SubscriptionStatus(
                user_id=user_id,
                active=False
            )
        
        # Check if subscription is active
        active = subscription.status in ["active", "trialing"]
        
        return SubscriptionStatus(
            user_id=user_id,
            active=active,
            plan=subscription.plan_id,
            status=subscription.status,
            current_period_end=subscription.current_period_end,
            cancel_at_period_end=subscription.cancel_at_period_end
        )
    
    except Exception as e:
        logger.error(f"Error getting subscription status: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/webhook")
async def stripe_webhook(
    request: Request,
    background_tasks: BackgroundTasks,
    db = Depends(get_db)
):
    """Handle Stripe webhook events"""
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")
    
    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, webhook_secret
        )
    except ValueError as e:
        logger.error(f"Invalid payload: {str(e)}")
        raise HTTPException(status_code=400, detail="Invalid payload")
    except stripe.error.SignatureVerificationError as e:
        logger.error(f"Invalid signature: {str(e)}")
        raise HTTPException(status_code=400, detail="Invalid signature")
    
    # Handle the event
    logger.info(f"Received Stripe event: {event['type']}")
    
    # Process event in background
    background_tasks.add_task(process_stripe_event, event, db)
    
    return {"status": "success"}

async def process_stripe_event(event, db):
    """Process Stripe webhook event"""
    event_type = event["type"]
    
    try:
        if event_type == "checkout.session.completed":
            await handle_checkout_session_completed(event, db)
        
        elif event_type == "customer.subscription.created":
            await handle_subscription_created(event, db)
        
        elif event_type == "customer.subscription.updated":
            await handle_subscription_updated(event, db)
        
        elif event_type == "customer.subscription.deleted":
            await handle_subscription_deleted(event, db)
        
        elif event_type == "invoice.payment_succeeded":
            await handle_invoice_payment_succeeded(event, db)
        
        elif event_type == "invoice.payment_failed":
            await handle_invoice_payment_failed(event, db)
        
        # Send event to Kafka
        kafka_producer.send(
            "stripe_events",
            key=event_type,
            value={
                "event_type": event_type,
                "event_id": event["id"],
                "timestamp": datetime.now().isoformat(),
                "data": event["data"]["object"]
            }
        )
        
        logger.info(f"Processed Stripe event: {event_type}")
    
    except Exception as e:
        logger.error(f"Error processing Stripe event {event_type}: {str(e)}")

async def handle_checkout_session_completed(event, db):
    """Handle checkout.session.completed event"""
    session = event["data"]["object"]
    
    # Get user ID from metadata
    user_id = int(session["metadata"].get("user_id", 0))
    
    if user_id == 0:
        logger.error("No user_id in checkout session metadata")
        return
    
    # If subscription checkout, the subscription will be handled by subscription.created event
    # If one-time payment, create payment record
    if session["mode"] == "payment":
        payment_intent = session["payment_intent"]
        if payment_intent:
            pi = stripe.PaymentIntent.retrieve(payment_intent)
            
            # Create payment record
            payment = Payment(
                user_id=user_id,
                stripe_customer_id=session["customer"],
                stripe_payment_intent_id=payment_intent,
                amount=pi["amount"] / 100,  # Convert from cents
                currency=pi["currency"],
                status=pi["status"],
                payment_method=pi["payment_method_types"][0] if pi["payment_method_types"] else None,
                description=session.get("description"),
                metadata=session.get("metadata")
            )
            
            db.add(payment)
            db.commit()
            
            logger.info(f"Created payment record for user {user_id}")

async def handle_subscription_created(event, db):
    """Handle customer.subscription.created event"""
    subscription_data = event["data"]["object"]
    
    # Get customer
    customer = stripe.Customer.retrieve(subscription_data["customer"])
    
    # Get user ID from customer metadata
    user_id = int(customer["metadata"].get("user_id", 0))
    
    if user_id == 0:
        logger.error("No user_id in customer metadata")
        return
    
    # Create subscription record
    subscription = Subscription(
        user_id=user_id,
        stripe_customer_id=subscription_data["customer"],
        stripe_subscription_id=subscription_data["id"],
        plan_id=subscription_data["items"]["data"][0]["price"]["id"] if subscription_data["items"]["data"] else None,
        status=subscription_data["status"],
        current_period_start=datetime.fromtimestamp(subscription_data["current_period_start"]),
        current_period_end=datetime.fromtimestamp(subscription_data["current_period_end"]),
        cancel_at_period_end=subscription_data["cancel_at_period_end"],
        metadata=subscription_data.get("metadata")
    )
    
    db.add(subscription)
    db.commit()
    
    logger.info(f"Created subscription record for user {user_id}")

async def handle_subscription_updated(event, db):
    """Handle customer.subscription.updated event"""
    subscription_data = event["data"]["object"]
    
    # Find subscription in database
    subscription = db.query(Subscription).filter(
        Subscription.stripe_subscription_id == subscription_data["id"]
    ).first()
    
    if not subscription:
        logger.error(f"Subscription not found: {subscription_data['id']}")
        return
    
    # Update subscription record
    subscription.status = subscription_data["status"]
    subscription.current_period_start = datetime.fromtimestamp(subscription_data["current_period_start"])
    subscription.current_period_end = datetime.fromtimestamp(subscription_data["current_period_end"])
    subscription.cancel_at_period_end = subscription_data["cancel_at_period_end"]
    subscription.metadata = subscription_data.get("metadata")
    subscription.updated_at = datetime.utcnow()
    
    db.commit()
    
    logger.info(f"Updated subscription record for user {subscription.user_id}")

async def handle_subscription_deleted(event, db):
    """Handle customer.subscription.deleted event"""
    subscription_data = event["data"]["object"]
    
    # Find subscription in database
    subscription = db.query(Subscription).filter(
        Subscription.stripe_subscription_id == subscription_data["id"]
    ).first()
    
    if not subscription:
        logger.error(f"Subscription not found: {subscription_data['id']}")
        return
    
    # Update subscription record
    subscription.status = subscription_data["status"]
    subscription.updated_at = datetime.utcnow()
    
    db.commit()
    
    logger.info(f"Marked subscription as canceled for user {subscription.user_id}")

async def handle_invoice_payment_succeeded(event, db):
    """Handle invoice.payment_succeeded event"""
    invoice = event["data"]["object"]
    
    # Only process subscription invoices
    if not invoice.get("subscription"):
        return
    
    # Find subscription in database
    subscription = db.query(Subscription).filter(
        Subscription.stripe_subscription_id == invoice["subscription"]
    ).first()
    
    if not subscription:
        logger.error(f"Subscription not found: {invoice['subscription']}")
        return
    
    # Create payment record
    payment = Payment(
        user_id=subscription.user_id,
        stripe_customer_id=invoice["customer"],
        stripe_payment_intent_id=invoice["payment_intent"],
        amount=invoice["amount_paid"] / 100,  # Convert from cents
        currency=invoice["currency"],
        status="succeeded",
        payment_method=invoice.get("payment_method_details", {}).get("type"),
        description=f"Invoice {invoice['number']}",
        metadata=invoice.get("metadata")
    )
    
    db.add(payment)
    db.commit()
    
    logger.info(f"Created payment record for invoice {invoice['id']}")

async def handle_invoice_payment_failed(event, db):
    """Handle invoice.payment_failed event"""
    invoice = event["data"]["object"]
    
    # Only process subscription invoices
    if not invoice.get("subscription"):
        return
    
    # Find subscription in database
    subscription = db.query(Subscription).filter(
        Subscription.stripe_subscription_id == invoice["subscription"]
    ).first()
    
    if not subscription:
        logger.error(f"Subscription not found: {invoice['subscription']}")
        return
    
    # Update subscription status if needed
    if subscription.status == "active" and invoice["attempt_count"] > 3:
        subscription.status = "past_due"
        db.commit()
        
        logger.info(f"Marked subscription as past_due for user {subscription.user_id}")
    
    # Send notification about failed payment
    # In a real implementation, this would trigger an email or in-app notification
    
    logger.info(f"Payment failed for invoice {invoice['id']}")

if __name__ == "__main__":
    import uvicorn
    
    # Get configuration from environment variables
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", "4242"))
    
    # Start the server
    logger.info(f"Starting Stripe Proxy API server on {host}:{port}")
    uvicorn.run("app:app", host=host, port=port, reload=True)
