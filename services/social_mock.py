"""
Social media mock analytics data generator.
Simulates platform specific data for Instagram, Twitter/X, YouTube, and Reddit.
"""

import random

# Comments templates for platforms
PLATFORM_COMMENTS = {
    'instagram': [
        ('positive', "Amazing reel! Your editing skills are fire 🔥"),
        ('positive', "Love this outfit/aesthetic so much! 😍"),
        ('positive', "This is highly educational. Saved for later!"),
        ('positive', "Wow, pure beauty. Best thing on my feed today."),
        ('positive', "Can you share the tutorial for this? Incredible!"),
        ('neutral', "Where did you get that background filter?"),
        ('neutral', "Nice post. What camera did you use?"),
        ('neutral', "Is this in London or New York?"),
        ('neutral', "Okay post, but last week's reel was better."),
        ('neutral', "Check your DMs please! Sent a question."),
        ('negative', "Way too sponsored. Getting tired of these ads."),
        ('negative', "This feels so fake and staged. Unfollowing."),
        ('negative', "The audio is totally out of sync. Horrible."),
        ('negative', "Total waste of screen space. Boring."),
        ('negative', "Stop posting clickbait. Not helpful at all.")
    ],
    'twitter': [
        ('positive', "Exactly this. Spot-on analysis on tech trends! 💯"),
        ('positive', "Underrated thread. Everyone needs to read this!"),
        ('positive', "Brilliant take. Retweeting this immediately!"),
        ('positive', "Super helpful. Thanks for compiling this resource!"),
        ('positive', "This tool literally saved me 4 hours of work today. 🙏"),
        ('neutral', "Interesting perspective, but what about competitor products?"),
        ('neutral', "Is there a github repository link for this project?"),
        ('neutral', "I agree with point 2 but not point 5. Let's debate."),
        ('neutral', "What programming language was used for this dashboard?"),
        ('neutral', "Any updates on when the next version drops?"),
        ('negative', "Complete garbage take. Clearly sponsored by big tech."),
        ('negative', "This thread could have been a single sentence. Spammer."),
        ('negative', "This is factually incorrect. Read the docs first!"),
        ('negative', "Total nonsense. Disappointed in this account."),
        ('negative', "Another developer hyping up basic web utilities. Yawn.")
    ],
    'youtube': [
        ('positive', "The production value on this channel is top-tier! 🚀"),
        ('positive', "Learned more in 10 minutes than my entire college semester!"),
        ('positive', "Thank you so much! Your explanation made it so simple!"),
        ('positive', "The animations and examples are absolutely spot-on! 🎉"),
        ('positive', "Liked, subscribed, and hitting the notification bell!"),
        ('neutral', "Timestamps please? Need to skip to the coding part."),
        ('neutral', "What IDE theme and font is that? Looks clean."),
        ('neutral', "Can you do a video comparing this to Next.js?"),
        ('neutral', "Good video. A bit too long in the introduction though."),
        ('neutral', "Will this work on Windows or is it macOS only?"),
        ('negative', "The audio volume is way too low. Had to turn to 100%."),
        ('negative', "Too much talking and not enough action. Skip the fluff!"),
        ('negative', "Worst tutorial I have ever watched. So confusing."),
        ('negative', "This is literally outdated. The libraries have changed."),
        ('negative', "Clickbait thumbnail. Nothing of value in the video.")
    ],
    'reddit': [
        ('positive', "This is the high-quality content I subbed for. Upvoted!"),
        ('positive', "Excellent write-up! Thanks for taking the time to compile."),
        ('positive', "Absolute legend! This solves the bug I had for weeks."),
        ('positive', "Mods should pin this post. Extremely informative!"),
        ('positive', "Wow, this is a goldmine of resources. Saving this post."),
        ('neutral', "Source? Would love to read the original study/link."),
        ('neutral', "Can you cross-post this to r/webdev as well?"),
        ('neutral', "Interesting. How does this scale under load?"),
        ('neutral', "Took a look at the code. Appears decent enough."),
        ('neutral', "Is there a tl;dr summary available?"),
        ('negative', "This violates subreddit rule 4. Expect deletion."),
        ('negative', "Total repost. Seen this same advice ten times here."),
        ('negative', "Pure garbage. This code has huge security leaks."),
        ('negative', "OP has no idea what they are talking about. Downvoted."),
        ('negative', "This subreddit is going downhill fast. Low effort garbage.")
    ]
}

# Platform Profile Stats templates
PLATFORM_BASE_STATS = {
    'instagram': {
        'followers': 18450,
        'likes': 92450,
        'views': 250000,
        'comments': 5420,
        'shares': 1800,
        'engagement_rate': 8.2,
        'virality_score': 74
    },
    'twitter': {
        'followers': 8920,
        'likes': 41200,
        'views': 182000,
        'comments': 2850,
        'shares': 7200,
        'engagement_rate': 6.8,
        'virality_score': 62
    },
    'youtube': {
        'followers': 45200,
        'likes': 198200,
        'views': 850000,
        'comments': 18400,
        'shares': 9800,
        'engagement_rate': 10.4,
        'virality_score': 85
    },
    'reddit': {
        'followers': 3420,
        'likes': 22400,
        'views': 120000,
        'comments': 4100,
        'shares': 820,
        'engagement_rate': 5.2,
        'virality_score': 48
    }
}

# AI insights templates per platform
PLATFORM_INSIGHTS = {
    'instagram': [
        ('😊', "Your audience strongly enjoys visual carousel tutorials over single image posts."),
        ('🔥', "Reels posted on Friday afternoons see a 40% higher share rate than average."),
        ('⚠️', "Engagement dips when promotional codes are included in the first line of the caption."),
        ('📈', "Overall follower growth is up 12% this month due to your latest educational reel series.")
    ],
    'twitter': [
        ('😊', "Short code snippet screenshots receive 3x more retweets than plain text developer updates."),
        ('🔥', "Threads explaining framework features generate the highest profile clicks."),
        ('⚠️', "Promotional product tweets show a 15% increase in negative comments regarding pricing."),
        ('📈', "Engagement peaks on Tuesday mornings. Scheduling threads for this window is recommended.")
    ],
    'youtube': [
        ('😊', "Videos with detailed timestamps show a 25% higher audience retention rate."),
        ('🔥', "Project-based tutorial videos generate 2x more subscribers than theory lectures."),
        ('⚠️', "Long introductions (over 90 seconds) cause a steep drop in initial viewer retention."),
        ('📈', "Community posts linking to external github repos drive high profile interactions.")
    ],
    'reddit': [
        ('😊', "Detail-heavy text posts with code block formatting receive 80% higher upvote ratios."),
        ('🔥', "Answering comments within the first 30 minutes boosts post visibility and upvotes."),
        ('⚠️', "Promotional posts without a 'disclaimer' tag face heavy community criticism and reports."),
        ('📈', "Your post engagement rate spikes on Sunday evening subreddits updates.")
    ]
}

# Word Cloud keywords per platform
PLATFORM_KEYWORDS = {
    'instagram': [
        {'word': 'aesthetic', 'sentiment': 'positive', 'count': 45, 'size': 36},
        {'word': 'amazing', 'sentiment': 'positive', 'count': 60, 'size': 42},
        {'word': 'tutorial', 'sentiment': 'positive', 'count': 32, 'size': 28},
        {'word': 'save', 'sentiment': 'positive', 'count': 28, 'size': 24},
        {'word': 'sponsored', 'sentiment': 'negative', 'count': 22, 'size': 20},
        {'word': 'fake', 'sentiment': 'negative', 'count': 18, 'size': 18},
        {'word': 'camera', 'sentiment': 'neutral', 'count': 30, 'size': 26},
        {'word': 'filter', 'sentiment': 'neutral', 'count': 25, 'size': 22},
        {'word': 'love', 'sentiment': 'positive', 'count': 75, 'size': 48},
        {'word': 'boring', 'sentiment': 'negative', 'count': 14, 'size': 16}
    ],
    'twitter': [
        {'word': 'thread', 'sentiment': 'positive', 'count': 55, 'size': 38},
        {'word': 'spot-on', 'sentiment': 'positive', 'count': 40, 'size': 32},
        {'word': 'github', 'sentiment': 'neutral', 'count': 48, 'size': 34},
        {'word': 'analytics', 'sentiment': 'neutral', 'count': 30, 'size': 26},
        {'word': 'sponsored', 'sentiment': 'negative', 'count': 20, 'size': 20},
        {'word': 'garbage', 'sentiment': 'negative', 'count': 15, 'size': 16},
        {'word': 'tech', 'sentiment': 'neutral', 'count': 35, 'size': 28},
        {'word': 'helpful', 'sentiment': 'positive', 'count': 65, 'size': 44},
        {'word': 'webdev', 'sentiment': 'neutral', 'count': 42, 'size': 30},
        {'word': 'spam', 'sentiment': 'negative', 'count': 12, 'size': 14}
    ],
    'youtube': [
        {'word': 'subscribe', 'sentiment': 'positive', 'count': 82, 'size': 48},
        {'word': 'production', 'sentiment': 'positive', 'count': 40, 'size': 32},
        {'word': 'explain', 'sentiment': 'positive', 'count': 58, 'size': 40},
        {'word': 'timestamps', 'sentiment': 'neutral', 'count': 38, 'size': 30},
        {'word': 'clickbait', 'sentiment': 'negative', 'count': 25, 'size': 22},
        {'word': 'outdated', 'sentiment': 'negative', 'count': 19, 'size': 18},
        {'word': 'tutorial', 'sentiment': 'positive', 'count': 70, 'size': 44},
        {'word': 'volume', 'sentiment': 'neutral', 'count': 24, 'size': 22},
        {'word': 'nextjs', 'sentiment': 'neutral', 'count': 35, 'size': 28},
        {'word': 'confusing', 'sentiment': 'negative', 'count': 15, 'size': 16}
    ],
    'reddit': [
        {'word': 'write-up', 'sentiment': 'positive', 'count': 38, 'size': 30},
        {'word': 'upvoted', 'sentiment': 'positive', 'count': 50, 'size': 36},
        {'word': 'mods', 'sentiment': 'neutral', 'count': 28, 'size': 24},
        {'word': 'source', 'sentiment': 'neutral', 'count': 44, 'size': 32},
        {'word': 'repost', 'sentiment': 'negative', 'count': 22, 'size': 20},
        {'word': 'downvoted', 'sentiment': 'negative', 'count': 18, 'size': 18},
        {'word': 'informative', 'sentiment': 'positive', 'count': 55, 'size': 38},
        {'word': 'code', 'sentiment': 'neutral', 'count': 60, 'size': 42},
        {'word': 'security', 'sentiment': 'neutral', 'count': 32, 'size': 26},
        {'word': 'repost', 'sentiment': 'negative', 'count': 16, 'size': 16}
    ]
}


def generate_profile_data(platform: str, handle: str) -> dict:
    """Generate detailed profile KPI stats based on platform and custom handle."""
    platform = platform.lower()
    base = PLATFORM_BASE_STATS.get(platform, PLATFORM_BASE_STATS['instagram']).copy()
    
    # Introduce small variations based on the handle length or characters to make it feel dynamic
    modifier = len(handle) % 10 - 5
    base['followers'] = int(base['followers'] * (1 + modifier / 50.0))
    base['likes'] = int(base['likes'] * (1 + modifier / 40.0))
    base['views'] = int(base['views'] * (1 + modifier / 30.0))
    base['comments'] = int(base['comments'] * (1 + modifier / 50.0))
    base['shares'] = int(base['shares'] * (1 + modifier / 40.0))
    base['engagement_rate'] = round(base['engagement_rate'] * (1 + modifier / 100.0), 1)
    base['virality_score'] = max(0, min(100, int(base['virality_score'] + modifier)))
    
    base['handle'] = handle
    base['platform'] = platform
    return base


def get_social_comments(platform: str, count: int = 25) -> list:
    """Return a list of comments with analyzed sentiment for the platform."""
    platform = platform.lower()
    pool = PLATFORM_COMMENTS.get(platform, PLATFORM_COMMENTS['instagram'])
    
    comments = []
    # Fill up comments list by randomly sampling from templates
    for i in range(count):
        sentiment, text = random.choice(pool)
        
        # Calculate matching polarity score based on sentiment
        if sentiment == 'positive':
            score = round(random.uniform(0.4, 0.95), 2)
        elif sentiment == 'negative':
            score = round(random.uniform(-0.85, -0.2), 2)
        else:
            score = round(random.uniform(-0.15, 0.15), 2)
            
        comments.append({
            'text': text,
            'sentiment': sentiment,
            'score': score
        })
        
    return comments


def get_social_insights(platform: str) -> list:
    """Return AI Insights list for the platform."""
    platform = platform.lower()
    insights = PLATFORM_INSIGHTS.get(platform, PLATFORM_INSIGHTS['instagram'])
    
    res = []
    for icon, text in insights:
        res.append({
            'icon': icon,
            'text': text,
            'type': 'audience'
        })
    return res


def get_social_keywords(platform: str) -> list:
    """Return Word Cloud items for the platform."""
    platform = platform.lower()
    return PLATFORM_KEYWORDS.get(platform, PLATFORM_KEYWORDS['instagram'])


def get_social_timeline(platform: str) -> list:
    """Generate 7-day timeline trend for Likes, Comments, and Mood."""
    days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    platform = platform.lower()
    base = PLATFORM_BASE_STATS.get(platform, PLATFORM_BASE_STATS['instagram'])
    
    timeline = []
    likes_growth = 0
    for day in days:
        # Day variation
        noise = random.uniform(0.85, 1.25)
        
        # Simulated numbers
        day_likes = int((base['likes'] / 30) * noise)
        day_comments = int((base['comments'] / 30) * noise)
        day_engagement = round(base['engagement_rate'] * noise, 1)
        
        likes_growth += day_likes
        
        # Mood ratios
        pos = round(random.uniform(45, 75), 1)
        neg = round(random.uniform(10, 30), 1)
        neu = round(100 - pos - neg, 1)
        
        timeline.append({
            'day': day,
            'likes': day_likes,
            'likes_growth': likes_growth,
            'comments': day_comments,
            'engagement': day_engagement,
            'positive': pos,
            'negative': neg,
            'neutral': neu
        })
        
    return timeline
