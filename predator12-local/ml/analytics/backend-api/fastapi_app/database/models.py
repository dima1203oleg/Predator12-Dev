from datetime import datetime

from sqlalchemy import JSON, Column, DateTime, String, Text
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()


class QueryHistory(Base):
    """
    Database model for storing the history of user queries in PostgreSQL.
    """

    __tablename__ = "query_history"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, index=True)
    query_text = Column(Text)
    query_plan = Column(JSON)
    results = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow)
