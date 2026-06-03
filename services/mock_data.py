"""
Mock data service — generates realistic comments for any topic.
Used to simulate real social media/comment data for demo purposes.
"""

import random

# Positive comment templates
POSITIVE_TEMPLATES = [
    "I absolutely love {topic}! It has completely changed how I work.",
    "{topic} is a game changer. Cannot imagine life without it now.",
    "Just tried {topic} for the first time and I'm blown away! 🔥",
    "The team behind {topic} is doing incredible work. Keep it up!",
    "{topic} exceeded all my expectations. Highly recommend to everyone.",
    "Been using {topic} for a month and the results are amazing.",
    "{topic} is hands down the best thing to happen this year.",
    "Wow, {topic} just solved a problem I've had for years. Love it!",
    "So impressed with {topic}. The innovation is mind-blowing! 😍",
    "{topic} is exactly what the world needed right now.",
    "The new update to {topic} is absolutely brilliant. Well done!",
    "I recommended {topic} to all my friends. They're all hooked now.",
    "{topic} makes everything so much easier. 10/10 experience.",
    "The quality of {topic} is unmatched. Truly impressive work.",
    "Using {topic} has been a complete joy. Smooth, fast, and reliable!",
    "Can't stop talking about {topic}. It's revolutionizing the industry.",
    "{topic} is the future. We're lucky to witness it firsthand.",
    "Shoutout to {topic} for making my day so much better! 🙌",
    "Everything about {topic} is polished and professional. Impressive!",
    "{topic} deserves way more credit. It's genuinely outstanding.",
]

# Negative comment templates
NEGATIVE_TEMPLATES = [
    "{topic} is a complete disappointment. Expected so much more.",
    "I really wanted to like {topic} but it keeps letting me down.",
    "The latest update to {topic} broke everything. Super frustrated.",
    "{topic} has serious issues that nobody is addressing properly.",
    "Overrated and underdelivering — that's {topic} in a nutshell.",
    "Save your money and avoid {topic}. It's just not worth it.",
    "{topic} crashed again for the third time today. Unacceptable!",
    "The customer service for {topic} is absolutely terrible. Shame.",
    "I regret spending money on {topic}. Total waste of time.",
    "{topic} promised so much but delivered nothing but problems.",
    "Still waiting for {topic} to fix the bugs from last month. Pathetic.",
    "Not impressed with {topic} at all. Way too many glitches.",
    "{topic} feels like a beta product sold at a premium price.",
    "The UI of {topic} is confusing and outdated. Needs a full rework.",
    "Why does {topic} keep getting worse with every update? 😤",
    "Terrible experience with {topic}. Will not be recommending this.",
    "{topic} has potential but the execution is just awful right now.",
    "Honestly, {topic} is the biggest letdown of the year for me.",
    "Support team for {topic} is non-existent. Complete disaster.",
    "If {topic} doesn't fix these issues soon, I'm switching to a competitor.",
]

# Neutral comment templates
NEUTRAL_TEMPLATES = [
    "Has anyone else been using {topic}? Curious what you think.",
    "{topic} is okay. Has some good features but also some issues.",
    "Just heard about {topic}. Still deciding if it's worth trying.",
    "{topic} is interesting but I'm not sure it's right for me yet.",
    "Tried {topic} last week. It's decent, nothing revolutionary.",
    "The reviews for {topic} are all over the place. Hard to judge.",
    "{topic} seems like a solid option but there are better alternatives.",
    "I've been watching {topic} develop. Progress is slow but steady.",
    "{topic} works as advertised. No complaints but nothing special either.",
    "Mixed feelings about {topic}. Some days great, some days not so much.",
    "Not sure what all the hype around {topic} is about honestly.",
    "{topic} is fine for basic use but lacks advanced features.",
    "Comparing {topic} to competitors right now. Tough call honestly.",
    "The pricing for {topic} seems fair but the value is debatable.",
    "{topic} has potential. Let's see where it goes in the next year.",
    "Following {topic} closely. Not making any decisions just yet.",
    "Average experience with {topic}. Met expectations, nothing more.",
    "{topic} is usable but I've seen better products in this space.",
    "Neutral on {topic} for now. Need more time to form an opinion.",
    "Still on the fence about {topic}. Reading more reviews before deciding.",
]

# Emotion templates for variety
EXCITED_TEMPLATES = [
    "OMG {topic} just announced something HUGE! 🚀🔥",
    "Cannot WAIT for what {topic} has coming next. So hyped!!",
    "{topic} IS EVERYTHING RIGHT NOW. I'm obsessed! 😍🔥",
    "THE NEW {topic} UPDATE IS INSANE. Everyone needs to see this!",
]

ANGRY_TEMPLATES = [
    "{topic} seriously needs to get its act together. This is ridiculous!",
    "I'm DONE with {topic}. Absolute disgrace of a product! 😡",
    "How is {topic} still this broken?! Fix your product already!",
    "FURIOUS at {topic} right now. This is completely unacceptable! 🤬",
]


def generate_comments(topic: str, count: int = 30) -> list:
    """Generate a list of realistic mock comments for a given topic."""
    comments = []

    # Distribution: 45% positive, 30% negative, 25% neutral
    positive_count = int(count * 0.45)
    negative_count = int(count * 0.30)
    neutral_count = count - positive_count - negative_count

    # Add some excited/angry ones mixed in
    excited = random.sample(EXCITED_TEMPLATES, min(2, len(EXCITED_TEMPLATES)))
    angry = random.sample(ANGRY_TEMPLATES, min(2, len(ANGRY_TEMPLATES)))

    pos_templates = random.sample(POSITIVE_TEMPLATES, min(positive_count, len(POSITIVE_TEMPLATES)))
    if len(pos_templates) < positive_count:
        pos_templates += random.choices(POSITIVE_TEMPLATES, k=positive_count - len(pos_templates))
    pos_templates = pos_templates[:positive_count - 2] + excited[:2]

    neg_templates = random.sample(NEGATIVE_TEMPLATES, min(negative_count, len(NEGATIVE_TEMPLATES)))
    if len(neg_templates) < negative_count:
        neg_templates += random.choices(NEGATIVE_TEMPLATES, k=negative_count - len(neg_templates))
    neg_templates = neg_templates[:negative_count - 2] + angry[:2]

    neu_templates = random.sample(NEUTRAL_TEMPLATES, min(neutral_count, len(NEUTRAL_TEMPLATES)))
    if len(neu_templates) < neutral_count:
        neu_templates += random.choices(NEUTRAL_TEMPLATES, k=neutral_count - len(neu_templates))

    for t in pos_templates:
        comments.append(('positive', t.format(topic=topic)))
    for t in neg_templates:
        comments.append(('negative', t.format(topic=topic)))
    for t in neu_templates:
        comments.append(('neutral', t.format(topic=topic)))

    random.shuffle(comments)
    return comments


def get_trending_topics() -> list:
    """Return a list of trending topics for suggestions."""
    return [
        "ChatGPT", "Tesla", "iPhone 16", "IPL 2025", "Marvel",
        "Gemini AI", "Climate Change", "Bitcoin", "Netflix",
        "CSK", "RCB", "Anime", "Elon Musk", "OpenAI",
        "Taylor Swift", "FIFA 2026", "Apple Vision Pro"
    ]
