from fastapi import APIRouter, Depends, Query
from typing import List, Optional

from ..services.social_media_service import (
    social_media_service,
    SocialMediaService
)
from ..models.social_media_models import (
    InfluencerAnalyticsResponse,
    InfluencerImpactRequest,
    InfluencerImpactResponse
)

router = APIRouter(
    prefix="/api/analysis",
    tags=["Analysis & Social Media"],
)


@router.get(
    "/social-media-influencers",
    response_model=InfluencerAnalyticsResponse
)
async def get_influencers(
    platform: Optional[str] = Query(
        None,
        description="Filter by social media platform (e.g., Twitter, Telegram)"
    ),
    min_followers: int = Query(0, description="Minimum number of followers"),
    topic: Optional[str] = Query(
        None,
        description="Filter by a key topic of influence"
    ),
    service: SocialMediaService = Depends(lambda: social_media_service)
):
    """
    Retrieve a list of social media influencers based on specified criteria.
    """
    return await service.get_social_media_influencers(
        platform=platform, min_followers=min_followers, topic=topic
    )


@router.post(
    "/influencer-impact",
    response_model=List[InfluencerImpactResponse]
)
async def get_influencer_impact(
    impact_request: InfluencerImpactRequest,
    service: SocialMediaService = Depends(lambda: social_media_service)
):
    """
    Analyze the impact of specified influencers based on keywords and time period.
    """
    return await service.analyze_influencer_impact(impact_request)


# Placeholder for other analysis endpoints that might already
# exist or be added later
# @router.get("/some-other-analysis")
# async def some_other_analysis_endpoint():
#     return {"message": "Another analysis result"} 