import re

def detect_fake_review(text):
    """
    Basic heuristic-based fake review detection.
    Looks for spammy keywords, excessive punctuation, and repetitive characters.
    """
    text = str(text).lower()
    
    spam_keywords = [
        "click here", "buy now", "subscribe to my channel", "free money", 
        "earn $", "crypto", "bitcoin", "investment", "guaranteed", 
        "100% free", "make money", "work from home"
    ]
    
    score = 0.0
    reasons = []
    
    # Check for spam keywords
    found_keywords = [kw for kw in spam_keywords if kw in text]
    if found_keywords:
        score += 0.4
        reasons.append(f"Contains spam keywords: {', '.join(found_keywords)}")
        
    # Check for excessive URLs
    urls = re.findall(r'http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\(\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+', text)
    if len(urls) > 1:
        score += 0.3
        reasons.append("Contains multiple URLs")
        
    # Check for excessive punctuation
    if re.search(r'[!?.]{4,}', text):
        score += 0.2
        reasons.append("Excessive punctuation")
        
    # Check for repetitive characters
    if re.search(r'(.)\1{4,}', text):
        score += 0.2
        reasons.append("Unnatural character repetition")
        
    # Check if text is too short but extremely positive (often bot generated)
    if len(text.split()) < 3 and score == 0:
        if any(word in text for word in ['awesome', 'great', 'perfect', 'amazing']):
            score += 0.1
            reasons.append("suspiciously short generic positive review")

    # Normalize score
    probability = min(score, 0.99)
    
    is_fake = probability > 0.5
    
    return {
        "is_fake": is_fake,
        "probability": probability,
        "reasons": reasons if reasons else ["Looks legitimate."]
    }
