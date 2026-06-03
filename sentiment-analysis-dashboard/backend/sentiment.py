from textblob import TextBlob
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer

analyzer = SentimentIntensityAnalyzer()

def analyze_text(text):
    """
    Analyzes the sentiment of a given text using VADER and TextBlob.
    Returns a dictionary with sentiment label, confidence score, and emotions.
    """
    if not text or not text.strip():
        return {
            "label": "Neutral 😐",
            "score": 0.5,
            "percentages": {"positive": 33, "neutral": 34, "negative": 33},
            "explanation": "No text provided to analyze."
        }
        
    # VADER Analysis
    vader_scores = analyzer.polarity_scores(text)
    compound = vader_scores['compound']
    
    # Determine Label
    if compound >= 0.05:
        label = "Positive 😊"
    elif compound <= -0.05:
        label = "Negative 😠"
    else:
        label = "Neutral 😐"
        
    # Calculate percentages for the UI
    pos_pct = round(vader_scores['pos'] * 100)
    neg_pct = round(vader_scores['neg'] * 100)
    neu_pct = round(vader_scores['neu'] * 100)
    
    # Adjust for very short neutral sentences where VADER gives 100% neutral
    if pos_pct == 0 and neg_pct == 0 and neu_pct == 100:
        # Give a little bit of weight to textblob to see if it catches anything
        tb = TextBlob(text)
        if tb.sentiment.polarity > 0.1:
            label = "Positive 😊"
            pos_pct = 60
            neu_pct = 40
        elif tb.sentiment.polarity < -0.1:
            label = "Negative 😠"
            neg_pct = 60
            neu_pct = 40

    # Ensure they sum to 100
    total = pos_pct + neg_pct + neu_pct
    if total > 0:
        pos_pct = round((pos_pct / total) * 100)
        neg_pct = round((neg_pct / total) * 100)
        neu_pct = 100 - (pos_pct + neg_pct)
    else:
        neu_pct = 100
        
    # Generate AI explanation
    explanation = f"The text expresses a {label.split(' ')[0].lower()} tone, heavily weighted by words indicating this sentiment."
    if compound > 0.5:
        explanation = "Highly positive expression detected, with strong indicators of approval or happiness."
    elif compound < -0.5:
        explanation = "Strongly negative expression detected, indicating dissatisfaction, anger, or sadness."

    return {
        "label": label,
        "score": round((compound + 1) / 2, 2), # Normalize from -1..1 to 0..1
        "percentages": {
            "positive": pos_pct,
            "neutral": neu_pct,
            "negative": neg_pct
        },
        "compound": compound,
        "explanation": explanation
    }
