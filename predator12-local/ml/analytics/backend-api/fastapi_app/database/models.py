from sqlalchemy import Column, String, JSON, DateTime, Text
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

Base = declarative_base()


class QueryHistory(Base):
    """
    Database model for storing the history of user queries in PostgreSQL.
    """
    __tablename__ = 'query_history'

    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, index=True)
    query_text = Column(Text)
    query_plan = Column(JSON)
    results = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow) 