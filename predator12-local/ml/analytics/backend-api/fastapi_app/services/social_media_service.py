import asyncio
from typing import List, Optional
import random

from ..models.social_media_models import (
    InfluencerProfile,
    InfluencerAnalyticsResponse,
    InfluencerImpactRequest,
    InfluencerImpactResponse
)

# Placeholder for actual social media API clients or data sources
# from some_twitter_client import TwitterClient
# from some_telegram_client import TelegramClient


class SocialMediaService:
    def __init__(self):
        # In a real application, initialize API clients here
        # self.twitter_client = TwitterClient(api_key="...")
        # self.telegram_client = TelegramClient(api_session="...")
        self.mock_influencers = [
            InfluencerProfile(
                id="tw_elon", username="elonmusk", platform="Twitter", 
                followers_count=150000000, engagement_rate=0.02, 
                influence_score=98.5, 
                key_topics=["tech", "space", "crypto"], verified=True
            ),
            InfluencerProfile(
                id="tg_durov", username="durov", platform="Telegram", 
                followers_count=2000000, engagement_rate=0.15, 
                influence_score=95.2, 
                key_topics=["privacy", "messaging", "crypto"], verified=True
            ),
            InfluencerProfile(
                id="tw_vitalik", username="VitalikButerin", platform="Twitter", 
                followers_count=5000000, engagement_rate=0.05, 
                influence_score=92.1, 
                key_topics=["ethereum", "crypto", "decentralization"], 
                verified=True
            ),
            InfluencerProfile(
                id="ig_nasa", username="nasa", platform="Instagram", 
                followers_count=90000000, engagement_rate=0.01, 
                influence_score=88.0, 
                key_topics=["space", "science", "exploration"], verified=True
            ),
            InfluencerProfile(
                id="yt_mkbhd", username="MKBHD", platform="YouTube", 
                followers_count=18000000, engagement_rate=0.08, 
                influence_score=90.5, 
                key_topics=["tech", "reviews", "smartphones"], verified=True
            ),
        ]

    async def get_social_media_influencers(
        self,
        platform: Optional[str] = None,
        min_followers: int = 0,
        topic: Optional[str] = None
    ) -> InfluencerAnalyticsResponse:
        """
        Retrieves social media influencers based on criteria.
        (Currently returns mock data)
        """
        await asyncio.sleep(0.1)  # Simulate async operation
        
        filtered_influencers = self.mock_influencers
        
        if platform:
            filtered_influencers = [
                inf for inf in filtered_influencers 
                if inf.platform.lower() == platform.lower()
            ]
        
        if min_followers > 0:
            filtered_influencers = [
                inf for inf in filtered_influencers 
                if inf.followers_count >= min_followers
            ]
            
        if topic:
            filtered_influencers = [
                inf for inf in filtered_influencers 
                if topic.lower() in [t.lower() for t in inf.key_topics]
            ]

        platform_summary = {}
        for inf in filtered_influencers:
            platform_summary[inf.platform] = (
                platform_summary.get(inf.platform, 0) + 1
            )
            
        return InfluencerAnalyticsResponse(
            influencers=filtered_influencers, 
            platform_summary=platform_summary
        )

    async def analyze_influencer_impact(
        self, impact_request: InfluencerImpactRequest
    ) -> List[InfluencerImpactResponse]:
        """
        Analyzes influencer impact based on keywords and time period.
        (Currently returns mock data)
        """
        await asyncio.sleep(0.2)  # Simulate async operation
        responses = []
        
        keywords = impact_request.keywords or ["general"]
        region_id = impact_request.region_id
        
        for influencer_id in impact_request.influencer_ids:
            influencer = next((
                inf for inf in self.mock_influencers 
                if inf.id == influencer_id
            ), None)
            if influencer:
                # Adjust impact based on region if provided (mock logic)
                region_modifier = 1.0
                if region_id:
                    # Mock: assume influence is higher in certain regions
                    # based on influencer ID
                    if (influencer_id.startswith('tw_') and 
                            region_id.startswith('USA_')):
                        # Higher impact in USA for Twitter influencers
                        region_modifier = 1.5
                    elif (influencer_id.startswith('tg_') and 
                          region_id.startswith('EU_')):
                        # Higher impact in EU for Telegram influencers
                        region_modifier = 1.3
                responses.append(
                    InfluencerImpactResponse(
                        influencer_id=influencer_id,
                        estimated_reach=int(  # Mock reach
                            influencer.followers_count * len(keywords) // 2 * 
                            region_modifier
                        ),
                        engagement_on_keywords=int(  # Mock engagement
                            influencer.followers_count * 
                            influencer.engagement_rate * 
                            random.uniform(0.1, 0.5) * region_modifier
                        ),
                        key_themes_in_posts=[
                            f"theme_{kw}_{random.randint(1,3)}"
                            for kw in keywords
                        ],
                        overall_sentiment_on_keywords=random.choice(
                            ["positive", "neutral", "negative"]
                        )
                    )
                )
        return responses


# Singleton instance
social_media_service = SocialMediaService() 