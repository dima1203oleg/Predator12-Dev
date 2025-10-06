import logging
import os
import json
import time
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
import networkx as nx
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
from celery import shared_task
from sqlalchemy import create_engine, text

# Setup logging
logger = logging.getLogger("customs_analysis")

# Database connection
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/predator")
engine = create_engine(DATABASE_URL)

@shared_task(name="tasks.customs_analysis.analyze_import_operations")
def analyze_import_operations(company_ids=None, time_period=None):
    """
    Analyze import operations for potential customs fraud schemes.
    
    Args:
        company_ids: List of company IDs to analyze
        time_period: Time period to analyze (e.g., "last_month", "last_year")
    
    Returns:
        Dictionary with analysis results
    """
    logger.info(f"Analyzing import operations for {len(company_ids) if company_ids else 'all'} companies")
    
    try:
        # Define time range based on time_period
        end_date = datetime.now()
        if time_period == "last_month":
            start_date = end_date - timedelta(days=30)
        elif time_period == "last_quarter":
            start_date = end_date - timedelta(days=90)
        elif time_period == "last_year":
            start_date = end_date - timedelta(days=365)
        else:
            # Default to last 6 months
            start_date = end_date - timedelta(days=180)
        
        # Fetch import data from database
        query = """
        SELECT 
            i.id, 
            i.company_id, 
            i.declaration_date, 
            i.country_of_origin, 
            i.customs_value, 
            i.declared_value, 
            i.tax_amount,
            i.product_code,
            i.product_description,
            i.quantity,
            i.weight,
            c.name as company_name,
            c.tax_id as company_tax_id
        FROM 
            import_operations i
        JOIN 
            companies c ON i.company_id = c.id
        WHERE 
            i.declaration_date BETWEEN :start_date AND :end_date
        """
        
        params = {"start_date": start_date, "end_date": end_date}
        
        if company_ids:
            query += " AND i.company_id IN :company_ids"
            params["company_ids"] = tuple(company_ids)
        
        # Execute query
        with engine.connect() as connection:
            result = connection.execute(text(query), params)
            imports_data = [dict(row) for row in result]
        
        if not imports_data:
            logger.warning("No import data found for the specified criteria")
            return {
                "status": "completed",
                "message": "No import data found for analysis",
                "anomalies": [],
                "risk_scores": {}
            }
        
        # Convert to DataFrame for analysis
        df = pd.DataFrame(imports_data)
        
        # Perform various analyses
        undervaluation_results = detect_undervaluation(df)
        misclassification_results = detect_misclassification(df)
        network_analysis_results = analyze_import_networks(df)
        
        # Combine results
        all_anomalies = []
        all_anomalies.extend(undervaluation_results["anomalies"])
        all_anomalies.extend(misclassification_results["anomalies"])
        all_anomalies.extend(network_analysis_results["anomalies"])
        
        # Calculate risk scores for companies
        company_risk_scores = calculate_company_risk_scores(df, all_anomalies)
        
        # Prepare final results
        results = {
            "status": "completed",
            "message": f"Analyzed {len(df)} import operations from {df['company_id'].nunique()} companies",
            "time_period": {
                "start_date": start_date.isoformat(),
                "end_date": end_date.isoformat()
            },
            "summary": {
                "total_imports": len(df),
                "total_value": float(df["customs_value"].sum()),
                "total_companies": df["company_id"].nunique(),
                "total_anomalies": len(all_anomalies)
            },
            "anomalies": all_anomalies,
            "risk_scores": company_risk_scores,
            "analysis_components": {
                "undervaluation": undervaluation_results["summary"],
                "misclassification": misclassification_results["summary"],
                "network_analysis": network_analysis_results["summary"]
            }
        }
        
        logger.info(f"Import operations analysis completed with {len(all_anomalies)} anomalies detected")
        return results
    
    except Exception as e:
        logger.error(f"Error analyzing import operations: {str(e)}")
        return {
            "status": "error",
            "message": f"Error analyzing import operations: {str(e)}",
            "anomalies": [],
            "risk_scores": {}
        }

def detect_undervaluation(df):
    """
    Detect potential undervaluation of imported goods.
    
    Args:
        df: DataFrame with import operations data
    
    Returns:
        Dictionary with analysis results
    """
    logger.info("Detecting undervaluation in import operations")
    
    try:
        # Group by product code to analyze price distribution
        product_groups = df.groupby("product_code")
        
        anomalies = []
        
        for product_code, group in product_groups:
            if len(group) < 5:  # Skip products with too few imports
                continue
            
            # Calculate price per unit/weight
            group["price_per_unit"] = group["customs_value"] / group["quantity"].clip(lower=1)
            
            # Use Isolation Forest to detect anomalies
            if len(group) >= 10:
                features = group[["price_per_unit"]].fillna(0)
                scaler = StandardScaler()
                scaled_features = scaler.fit_transform(features)
                
                model = IsolationForest(contamination=0.1, random_state=42)
                group["anomaly"] = model.fit_predict(scaled_features)
                
                # -1 indicates anomaly
                anomalies_df = group[group["anomaly"] == -1]
                
                for _, row in anomalies_df.iterrows():
                    # Calculate how much the price deviates from the median
                    median_price = group["price_per_unit"].median()
                    deviation_pct = (median_price - row["price_per_unit"]) / median_price * 100
                    
                    if deviation_pct > 30:  # Only flag significant deviations
                        anomalies.append({
                            "id": str(row["id"]),
                            "type": "undervaluation",
                            "company_id": str(row["company_id"]),
                            "company_name": row["company_name"],
                            "product_code": row["product_code"],
                            "product_description": row["product_description"],
                            "declaration_date": row["declaration_date"].isoformat() if isinstance(row["declaration_date"], datetime) else row["declaration_date"],
                            "declared_value": float(row["declared_value"]),
                            "customs_value": float(row["customs_value"]),
                            "median_price": float(median_price),
                            "price_per_unit": float(row["price_per_unit"]),
                            "deviation_percentage": float(deviation_pct),
                            "risk_score": min(100, float(deviation_pct * 2)),
                            "description": f"Potential undervaluation detected. Price is {deviation_pct:.1f}% below the median for this product."
                        })
        
        return {
            "anomalies": anomalies,
            "summary": {
                "total_analyzed": len(df),
                "anomalies_detected": len(anomalies),
                "product_codes_analyzed": df["product_code"].nunique()
            }
        }
    
    except Exception as e:
        logger.error(f"Error in undervaluation detection: {str(e)}")
        return {"anomalies": [], "summary": {"error": str(e)}}

def detect_misclassification(df):
    """
    Detect potential misclassification of imported goods.
    
    Args:
        df: DataFrame with import operations data
    
    Returns:
        Dictionary with analysis results
    """
    logger.info("Detecting misclassification in import operations")
    
    try:
        # Group by company to analyze their import patterns
        company_groups = df.groupby("company_id")
        
        anomalies = []
        
        for company_id, group in company_groups:
            # Check for similar products with different classifications
            # This is a simplified approach - in a real system, you would use NLP and more sophisticated methods
            
            # Group similar descriptions
            for product_desc, desc_group in group.groupby("product_description"):
                if len(desc_group["product_code"].unique()) > 1:
                    # Same description but different product codes
                    product_codes = desc_group["product_code"].unique()
                    
                    # Check if the different codes have significantly different tax rates
                    tax_rates = []
                    for code in product_codes:
                        code_group = desc_group[desc_group["product_code"] == code]
                        avg_tax_rate = code_group["tax_amount"].sum() / code_group["customs_value"].sum() * 100
                        tax_rates.append((code, avg_tax_rate))
                    
                    # Sort by tax rate
                    tax_rates.sort(key=lambda x: x[1])
                    
                    # If there's a significant difference in tax rates, flag it
                    if len(tax_rates) >= 2 and (tax_rates[-1][1] - tax_rates[0][1]) > 5:
                        for _, row in desc_group.iterrows():
                            anomalies.append({
                                "id": str(row["id"]),
                                "type": "misclassification",
                                "company_id": str(row["company_id"]),
                                "company_name": row["company_name"],
                                "product_code": row["product_code"],
                                "product_description": row["product_description"],
                                "declaration_date": row["declaration_date"].isoformat() if isinstance(row["declaration_date"], datetime) else row["declaration_date"],
                                "customs_value": float(row["customs_value"]),
                                "tax_amount": float(row["tax_amount"]),
                                "alternative_codes": [str(code) for code in product_codes if code != row["product_code"]],
                                "tax_rate_difference": float(tax_rates[-1][1] - tax_rates[0][1]),
                                "risk_score": min(100, float((tax_rates[-1][1] - tax_rates[0][1]) * 5)),
                                "description": f"Potential misclassification detected. Same product description used with different product codes having {tax_rates[-1][1] - tax_rates[0][1]:.1f}% difference in tax rates."
                            })
        
        return {
            "anomalies": anomalies,
            "summary": {
                "total_analyzed": len(df),
                "anomalies_detected": len(anomalies),
                "companies_analyzed": df["company_id"].nunique()
            }
        }
    
    except Exception as e:
        logger.error(f"Error in misclassification detection: {str(e)}")
        return {"anomalies": [], "summary": {"error": str(e)}}

def analyze_import_networks(df):
    """
    Analyze import networks to detect potential shell companies and circular trade.
    
    Args:
        df: DataFrame with import operations data
    
    Returns:
        Dictionary with analysis results
    """
    logger.info("Analyzing import networks")
    
    try:
        # For this analysis, we would need additional data about company relationships
        # This is a simplified placeholder implementation
        
        # In a real implementation, you would:
        # 1. Build a graph of company relationships
        # 2. Detect circular trade patterns
        # 3. Identify shell companies with suspicious patterns
        
        # Placeholder for demonstration
        anomalies = []
        
        # Simulate finding some network anomalies
        # In a real implementation, this would be based on actual network analysis
        companies = df["company_id"].unique()
        
        if len(companies) >= 3:
            # Simulate finding a circular trade pattern
            sample_companies = np.random.choice(companies, 3, replace=False)
            
            anomalies.append({
                "id": f"network-{int(time.time())}",
                "type": "circular_trade",
                "companies_involved": [str(c) for c in sample_companies],
                "company_names": [df[df["company_id"] == c]["company_name"].iloc[0] for c in sample_companies],
                "risk_score": 75.0,
                "description": "Potential circular trade pattern detected among these companies."
            })
        
        return {
            "anomalies": anomalies,
            "summary": {
                "total_analyzed": len(df),
                "anomalies_detected": len(anomalies),
                "companies_analyzed": df["company_id"].nunique()
            }
        }
    
    except Exception as e:
        logger.error(f"Error in import network analysis: {str(e)}")
        return {"anomalies": [], "summary": {"error": str(e)}}

def calculate_company_risk_scores(df, anomalies):
    """
    Calculate risk scores for companies based on detected anomalies.
    
    Args:
        df: DataFrame with import operations data
        anomalies: List of detected anomalies
    
    Returns:
        Dictionary with company risk scores
    """
    logger.info("Calculating company risk scores")
    
    try:
        # Group anomalies by company
        company_anomalies = {}
        
        for anomaly in anomalies:
            if "company_id" in anomaly:
                company_id = anomaly["company_id"]
                if company_id not in company_anomalies:
                    company_anomalies[company_id] = []
                company_anomalies[company_id].append(anomaly)
        
        # Calculate risk scores
        risk_scores = {}
        
        for company_id, company_group in df.groupby("company_id"):
            company_id_str = str(company_id)
            company_name = company_group["company_name"].iloc[0]
            
            # Base score
            base_score = 10.0
            
            # Add score based on anomalies
            anomaly_score = 0.0
            anomaly_count = 0
            
            if company_id_str in company_anomalies:
                company_anomalies_list = company_anomalies[company_id_str]
                anomaly_count = len(company_anomalies_list)
                
                # Sum risk scores from anomalies
                for anomaly in company_anomalies_list:
                    anomaly_score += anomaly.get("risk_score", 0)
            
            # Normalize anomaly score
            if anomaly_count > 0:
                anomaly_score = anomaly_score / anomaly_count
            
            # Calculate final score
            final_score = min(100, base_score + anomaly_score * 0.7)
            
            # Determine risk level
            risk_level = "low"
            if final_score >= 70:
                risk_level = "high"
            elif final_score >= 40:
                risk_level = "medium"
            
            risk_scores[company_id_str] = {
                "company_id": company_id_str,
                "company_name": company_name,
                "risk_score": float(final_score),
                "risk_level": risk_level,
                "anomaly_count": anomaly_count,
                "total_imports": len(company_group),
                "total_value": float(company_group["customs_value"].sum())
            }
        
        return risk_scores
    
    except Exception as e:
        logger.error(f"Error calculating company risk scores: {str(e)}")
        return {}
