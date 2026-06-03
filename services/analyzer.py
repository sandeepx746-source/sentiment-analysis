"""
Sentiment Analyzer Service
Uses VADER + TextBlob to analyze text sentiment with compound scoring.
"""

import re
import random
from collections import Counter
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
from textblob import TextBlob

vader = SentimentIntensityAnalyzer()

# Stop words to filter out from word cloud
STOP_WORDS = {
    'i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'you',
    'your', 'yours', 'yourself', 'he', 'him', 'his', 'himself', 'she',
    'her', 'hers', 'herself', 'it', 'its', 'itself', 'they', 'them',
    'their', 'theirs', 'themselves', 'what', 'which', 'who', 'whom',
    'this', 'that', 'these', 'those', 'am', 'is', 'are', 'was', 'were',
    'be', 'been', 'being', 'have', 'has', 'had', 'having', 'do', 'does',
    'did', 'doing', 'a', 'an', 'the', 'and', 'but', 'if', 'or', 'because',
    'as', 'until', 'while', 'of', 'at', 'by', 'for', 'with', 'through',
    'about', 'against', 'between', 'into', 'during', 'to', 'from', 'in',
    'out', 'on', 'off', 'then', 'once', 'here', 'there', 'when', 'where',
    'why', 'how', 'all', 'both', 'each', 'few', 'more', 'most', 'other',
    'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so',
    'than', 'too', 'very', 's', 't', 'can', 'will', 'just', 'don',
    'should', 'now', 'd', 'll', 'm', 'o', 're', 've', 'y', 'ain',
    'could', 'would', 'might', 'must', 'shall', 'need', 'dare', 'ought',
    'used', 'it\'s', 'i\'m', 'i\'ve', 'i\'ll', 'that\'s', 'it\'s'
}


def analyze_text(text: str) -> dict:
    """Analyze a single text using VADER + TextBlob."""
    # VADER scores
    vader_scores = vader.polarity_scores(text)
    compound = vader_scores['compound']
    pos = vader_scores['pos']
    neg = vader_scores['neg']
    neu = vader_scores['neu']

    # TextBlob for subjectivity
    blob = TextBlob(text)
    subjectivity = blob.sentiment.subjectivity
    polarity = blob.sentiment.polarity

    # Determine sentiment label
    if compound >= 0.05:
        sentiment = 'positive'
    elif compound <= -0.05:
        sentiment = 'negative'
    else:
        sentiment = 'neutral'

    # Determine emotion
    emotion = _detect_emotion(compound, subjectivity, text)

    return {
        'text': text,
        'sentiment': sentiment,
        'compound': round(compound, 4),
        'score': round(compound, 4),
        'positive': round(pos, 4),
        'negative': round(neg, 4),
        'neutral': round(neu, 4),
        'subjectivity': round(subjectivity, 4),
        'polarity': round(polarity, 4),
        'emotion': emotion,
    }


def _detect_emotion(compound: float, subjectivity: float, text: str) -> str:
    """Map compound score + text signals to an emotion label."""
    text_lower = text.lower()
    exclamation = text.count('!')
    caps_ratio = sum(1 for c in text if c.isupper()) / max(len(text), 1)

    if compound >= 0.5 and (exclamation > 0 or caps_ratio > 0.15):
        return 'excited'
    elif compound >= 0.05:
        return 'happy'
    elif compound <= -0.5 and (exclamation > 0 or caps_ratio > 0.15):
        return 'angry'
    elif compound <= -0.05:
        return 'sad'
    else:
        return 'neutral'


def analyze_batch(comments: list) -> dict:
    """
    Analyze a batch of (sentiment_label, text) tuples.
    Returns aggregate statistics.
    """
    results = []
    for item in comments:
        if isinstance(item, tuple):
            _, text = item
        else:
            text = item

        result = analyze_text(text)
        if isinstance(item, tuple):
            result['expected_sentiment'] = item[0]
        results.append(result)

    # Aggregate stats
    total = len(results)
    if total == 0:
        return {}

    positive_results = [r for r in results if r['sentiment'] == 'positive']
    negative_results = [r for r in results if r['sentiment'] == 'negative']
    neutral_results  = [r for r in results if r['sentiment'] == 'neutral']

    pos_pct = round(len(positive_results) / total * 100, 1)
    neg_pct = round(len(negative_results) / total * 100, 1)
    neu_pct = round(100 - pos_pct - neg_pct, 1)

    avg_compound = round(sum(r['compound'] for r in results) / total, 4)

    # Emotion breakdown
    emotions = Counter(r['emotion'] for r in results)
    emotion_data = {
        'happy':   emotions.get('happy', 0),
        'excited': emotions.get('excited', 0),
        'neutral': emotions.get('neutral', 0),
        'sad':     emotions.get('sad', 0),
        'angry':   emotions.get('angry', 0),
    }

    # Virality score (0–100)
    virality = _calculate_virality(pos_pct, avg_compound, total)

    # Engagement rate (simulated)
    engagement_rate = round(random.uniform(3.2, 18.7), 1)

    # Dominant mood
    dominant_emotion = max(emotion_data, key=emotion_data.get)

    # Keyword extraction
    all_text = ' '.join(r['text'] for r in results)
    keywords = extract_keywords(all_text, 30)

    # Timeline data (7 days simulated)
    timeline = _generate_timeline(pos_pct, neg_pct, neu_pct)

    return {
        'total': total,
        'positive_pct': pos_pct,
        'negative_pct': neg_pct,
        'neutral_pct':  neu_pct,
        'avg_compound': avg_compound,
        'virality_score': virality,
        'engagement_rate': engagement_rate,
        'emotions': emotion_data,
        'dominant_emotion': dominant_emotion,
        'keywords': keywords,
        'timeline': timeline,
        'comments': results,
    }


def _calculate_virality(pos_pct: float, avg_compound: float, total: int) -> int:
    """Calculate a custom virality score (0–100)."""
    base = pos_pct * 0.5                          # 50% weight: positivity
    compound_boost = max(0, avg_compound) * 30    # 30% weight: compound
    volume_boost = min(20, total / 5)             # 20% weight: volume
    noise = random.uniform(-3, 3)                 # small noise
    score = base + compound_boost + volume_boost + noise
    return max(0, min(100, round(score)))


def extract_keywords(text: str, top_n: int = 25) -> list:
    """Extract top N keywords with frequency and sentiment."""
    # Clean text
    words = re.findall(r'\b[a-zA-Z]{3,}\b', text.lower())
    words = [w for w in words if w not in STOP_WORDS]
    freq = Counter(words)
    top_words = freq.most_common(top_n)

    keywords = []
    for word, count in top_words:
        score = vader.polarity_scores(word)['compound']
        if score >= 0.05:
            color = 'positive'
        elif score <= -0.05:
            color = 'negative'
        else:
            color = 'neutral'
        keywords.append({
            'word': word,
            'count': count,
            'sentiment': color,
            'size': min(count * 8 + 12, 48),  # font size range 12–48px
        })

    return keywords


def _generate_timeline(pos_pct: float, neg_pct: float, neu_pct: float) -> list:
    """Generate a 7-day simulated timeline of sentiment trends."""
    days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    timeline = []
    for day in days:
        p_noise = random.uniform(-8, 8)
        n_noise = random.uniform(-6, 6)
        p = max(0, min(100, pos_pct + p_noise))
        n = max(0, min(100, neg_pct + n_noise))
        ne = max(0, 100 - p - n)
        timeline.append({
            'day': day,
            'positive': round(p, 1),
            'negative': round(n, 1),
            'neutral':  round(ne, 1),
            'engagement': round(random.uniform(4, 20), 1),
        })
    return timeline
