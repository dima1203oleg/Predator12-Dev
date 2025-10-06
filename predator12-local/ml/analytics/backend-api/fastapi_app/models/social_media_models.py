from pydantic import BaseModel, Field
from typing import List, Optional, Dict


class InfluencerProfile(BaseModel):
    id: str = Field(..., description="Unique identifier of the influencer")
    username: str = Field(
        ...,
        description="Username or handle of the influencer"
    )
    platform: str = Field(
        ...,
        description="Social media platform (e.g., Twitter, Telegram)"
    )
    followers_count: int = Field(0, description="Number of followers")
    engagement_rate: float = Field(
        0.0,
        description="Average engagement rate (e.g., likes/comments per post)"
    )
    influence_score: float = Field(
        0.0,
        description="Calculated influence score"
    )
    key_topics: List[str] = Field(
        default_factory=list,
        description="Key topics or areas of influence"
    )
    verified: bool = Field(
        False,
        description="Whether the influencer is verified on the platform"
    )


class InfluencerAnalyticsResponse(BaseModel):
    influencers: List[InfluencerProfile] = Field(
        ...,
        description="List of identified influencers"
    )
    platform_summary: Optional[Dict[str, int]] = Field(
        None,
        description="Summary of influencers per platform"
    )


class InfluencerImpactRequest(BaseModel):
    influencer_ids: List[str] = Field(
        ...,
        description="List of influencer IDs to analyze"
    )
    keywords: Optional[List[str]] = Field(
        None,
        description="Keywords to filter content by"
    )
    time_period_days: Optional[int] = Field(
        7,
        description="Time period in days to analyze for impact"
    )
    region_id: Optional[str] = Field(
        None,
        description="Optional region ID to filter impact analysis by specific geographic region"
    )


class InfluencerImpactResponse(BaseModel):
    influencer_id: str
    estimated_reach: int
    engagement_on_keywords: int
    key_themes_in_posts: List[str]
    # Sentiment: e.g., "positive", "negative", "neutral"
    overall_sentiment_on_keywords: str


class RegionSentiment(BaseModel):
    region_id: str = Field(
        ..., 
        description="Identifier for the geographic region"
    )
    sentiment_score: float = Field(
        ...,
        description="Aggregated sentiment score (-1.0 to 1.0)",
        ge=-1.0,
        le=1.0
    )
    trend: str = Field(
        ..., 
        description="Sentiment trend (e.g., improving, declining, stable)"
    )
    key_topics_contributing: List[str] = Field(
        default_factory=list,
        description="Top topics influencing sentiment in this region"
    )


class SentimentUpdateMessage(BaseModel):
    timestamp: str = Field(
        ..., 
        description="ISO 8601 timestamp of the update"
    )
    region_sentiments: List[RegionSentiment] = Field(
        ..., 
        description="List of sentiment data for various regions"
    ) 