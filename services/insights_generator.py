"""
AI Insights Generator
Produces human-readable, non-technical insight cards from analysis data.
"""

import random


# Insight templates per scenario
POSITIVE_INSIGHTS = [
    ("😊", "Most users feel genuinely excited and enthusiastic about this topic. The public mood is overwhelmingly warm."),
    ("🔥", "Public interest is surging rapidly. Engagement levels indicate this is a trending conversation right now."),
    ("🌟", "This topic enjoys strong positive reception across audiences. People are actively recommending it to others."),
    ("📈", "Positive sentiment has been climbing steadily. The trend suggests growing public approval over time."),
    ("💡", "Users frequently highlight innovation and quality as key reasons for their enthusiasm toward this topic."),
    ("🚀", "This topic is generating serious buzz. Tutorial and review-style content is receiving the highest engagement."),
    ("🎯", "The audience for this topic is highly engaged and vocal. Expect the conversation to grow even larger soon."),
]

NEGATIVE_INSIGHTS = [
    ("⚠️", "Negative reactions have spiked recently, often tied to performance issues or unmet expectations."),
    ("😤", "A notable portion of the audience expresses frustration. Common complaints center around reliability and support."),
    ("📉", "Sentiment dipped this week. Critical voices are becoming louder and may influence wider public perception."),
    ("🔔", "User dissatisfaction is visible and growing. Addressing the core complaints could reverse this trend quickly."),
    ("💬", "Negative conversations are spreading across communities. Transparency from decision-makers could help rebuild trust."),
]

NEUTRAL_INSIGHTS = [
    ("🤔", "Public opinion is divided and exploratory. Many users are still evaluating before forming strong views."),
    ("⚖️", "Sentiment is balanced. Both supporters and critics are equally vocal, creating an interesting public debate."),
    ("🔍", "Users are in research mode — comparing options, reading reviews, and gathering information before deciding."),
    ("📊", "The neutral majority suggests this topic hasn't yet had a defining moment that polarizes public opinion."),
]

VIRAL_INSIGHTS = [
    ("🔥", "The Virality Score is exceptionally high! This topic is dominating conversations across multiple communities."),
    ("🚀", "Viral momentum detected. Share-worthy content around this topic is spreading rapidly right now."),
    ("⚡", "High engagement rates signal that this topic has struck an emotional chord with a large audience."),
]

TREND_INSIGHTS = [
    ("📅", "Engagement peaks mid-week. Content published on Tuesdays and Wednesdays sees the highest interaction rates."),
    ("🌍", "This topic is gaining global traction. Conversation volume has increased significantly over the past 7 days."),
    ("📱", "Mobile users are driving most of the engagement. Short-form, visual content performs best for this audience."),
    ("⏱️", "Peak activity occurs in the evening hours. Scheduling content during this window maximizes visibility."),
]

KEYWORD_INSIGHTS = [
    ("🔑", "Power words like 'amazing', 'incredible', and 'game-changer' dominate positive conversations."),
    ("📝", "The most discussed themes revolve around performance, value, and user experience."),
    ("💬", "Community discussions frequently mention 'update', 'feature', and 'support' — key decision factors for users."),
]


def generate_insights(analysis: dict) -> list:
    """Generate 5–7 AI insight cards based on analysis results."""
    insights = []

    pos_pct = analysis.get('positive_pct', 0)
    neg_pct = analysis.get('negative_pct', 0)
    virality = analysis.get('virality_score', 0)
    dominant_emotion = analysis.get('dominant_emotion', 'neutral')
    total = analysis.get('total', 0)

    # Always add 1 dominant sentiment insight
    if pos_pct >= 50:
        pool = POSITIVE_INSIGHTS
    elif neg_pct >= 40:
        pool = NEGATIVE_INSIGHTS
    else:
        pool = NEUTRAL_INSIGHTS

    chosen = random.sample(pool, min(2, len(pool)))
    for icon, text in chosen:
        insights.append({'icon': icon, 'text': text, 'type': 'sentiment'})

    # Virality insight
    if virality >= 70:
        vi = random.choice(VIRAL_INSIGHTS)
        insights.append({'icon': vi[0], 'text': vi[1], 'type': 'viral'})
    elif virality >= 40:
        insights.append({
            'icon': '📊',
            'text': f'The Virality Score of {virality}/100 indicates moderate public interest. There\'s room for this topic to trend further.',
            'type': 'viral'
        })

    # Trend insight
    ti = random.sample(TREND_INSIGHTS, 2)
    for icon, text in ti:
        insights.append({'icon': icon, 'text': text, 'type': 'trend'})

    # Keyword insight
    ki = random.choice(KEYWORD_INSIGHTS)
    insights.append({'icon': ki[0], 'text': ki[1], 'type': 'keyword'})

    # Volume insight
    if total > 20:
        insights.append({
            'icon': '👥',
            'text': f'Analysis is based on {total} public comments. This sample size provides a statistically meaningful picture of public opinion.',
            'type': 'meta'
        })

    # Dominant emotion insight
    emotion_map = {
        'excited': ('🎉', 'The dominant emotion is excitement. People are enthusiastic and eager to share their experience.'),
        'happy':   ('😊', 'Happiness dominates the comment section. Users are satisfied and spreading positivity.'),
        'angry':   ('😡', 'Anger is the dominant emotion. Users feel strongly let down and are seeking resolution.'),
        'sad':     ('😢', 'A sad and disappointed tone prevails. Empathetic communication could help turn this around.'),
        'neutral': ('😐', 'Most users remain impartial, suggesting an opportunity to make a stronger first impression.'),
    }
    if dominant_emotion in emotion_map:
        icon, text = emotion_map[dominant_emotion]
        insights.append({'icon': icon, 'text': text, 'type': 'emotion'})

    return insights[:7]  # Return max 7 insights


def generate_compare_insights(topic_a: str, data_a: dict, topic_b: str, data_b: dict) -> dict:
    """Generate comparison insights for Topic Battle Mode."""
    pos_a = data_a.get('positive_pct', 0)
    pos_b = data_b.get('positive_pct', 0)
    vir_a = data_a.get('virality_score', 0)
    vir_b = data_b.get('virality_score', 0)
    eng_a = data_a.get('engagement_rate', 0)
    eng_b = data_b.get('engagement_rate', 0)

    sentiment_winner = topic_a if pos_a >= pos_b else topic_b
    virality_winner  = topic_a if vir_a >= vir_b else topic_b
    engagement_winner = topic_a if eng_a >= eng_b else topic_b

    # Overall winner by points
    points_a = (1 if pos_a > pos_b else 0) + (1 if vir_a > vir_b else 0) + (1 if eng_a > eng_b else 0)
    overall_winner = topic_a if points_a >= 2 else topic_b

    return {
        'sentiment_winner': sentiment_winner,
        'virality_winner': virality_winner,
        'engagement_winner': engagement_winner,
        'overall_winner': overall_winner,
        'summary': f'🏆 {overall_winner} wins the Public Opinion Battle with stronger sentiment, higher virality, and better engagement rates.',
        'insights': [
            f'📊 {topic_a} has {pos_a}% positive sentiment vs {topic_b}\'s {pos_b}%.',
            f'🔥 Virality: {topic_a} scores {vir_a}/100 while {topic_b} scores {vir_b}/100.',
            f'⚡ Engagement rate is {"higher for " + topic_a if eng_a > eng_b else "higher for " + topic_b}.',
            f'🏆 {overall_winner} dominates the public opinion battle across all key metrics.',
        ]
    }
