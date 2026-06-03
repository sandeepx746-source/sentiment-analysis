import random
from datetime import datetime, timedelta

def fetch_mock_social_data(platform, query, count=10):
    """
    Simulates fetching data from social media APIs.
    Returns realistic-looking mock data.
    """
    templates = {
        "Twitter": [
            "Just saw {query}, absolutely amazing! 🚀 #trending #{query}",
            "Not really a fan of {query} to be honest. Very disappointed. 😠",
            "What does everyone think about {query}? Let me know! 🤔",
            "{query} is the best thing that happened this year! ❤️",
            "This {query} trend is getting out of hand... make it stop.",
            "Wow, {query} completely changed my perspective! Highly recommend. 💯",
            "Still waiting for an update on {query}. Taking way too long. 📉",
            "Just bought into {query}, let's see how it goes. 💸",
            "Can't believe the news about {query}!! Is this real? 😱",
            "{query} is okay, but could be better. 😐"
        ],
        "YouTube": [
            "Great video explaining {query}! Subscribed.",
            "I disagree with your take on {query}, here is why...",
            "First! Love {query} ❤️",
            "This tutorial on {query} saved me so much time, thanks!",
            "Clickbait. This has nothing to do with {query}. Dislike.",
            "Can you do another video on {query}?",
            "Audio quality is bad, but good points about {query}."
        ],
        "Reddit": [
            "ELI5: What is {query} and why is everyone talking about it?",
            "Unpopular opinion: {query} is overrated.",
            "I built a project using {query}, here is the source code.",
            "Megathread: All discussion related to {query} goes here.",
            "PSA regarding {query}: Be careful out there folks."
        ]
    }
    
    platforms = ["Twitter", "YouTube", "Reddit"]
    if platform not in platforms:
        platform = "Twitter"
        
    results = []
    now = datetime.now()
    
    for i in range(count):
        text = random.choice(templates[platform]).format(query=query)
        # Add random hashtags sometimes
        if random.random() > 0.7:
            text += f" #AI #tech #{query.replace(' ', '')}"
            
        results.append({
            "id": f"{platform.lower()}_{random.randint(10000, 99999)}",
            "username": f"user_{random.randint(100, 999)}",
            "text": text,
            "timestamp": (now - timedelta(minutes=random.randint(1, 1440))).isoformat(),
            "platform": platform
        })
        
    return results
