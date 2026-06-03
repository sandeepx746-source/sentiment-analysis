import random

def generate_chatbot_response(user_message, stats_context=None):
    """
    Generates an AI chatbot response based on the user's message.
    Uses simple rule-based matching for MVP.
    """
    msg = user_message.lower()
    
    # Context-aware responses
    if stats_context:
        if any(word in msg for word in ["stats", "analytics", "summary", "report", "overall"]):
            return f"Based on the current data, {stats_context.get('total_posts', 0)} posts have been analyzed. The sentiment is {stats_context.get('positive', 0)}% positive, {stats_context.get('negative', 0)}% negative, and {stats_context.get('neutral', 0)}% neutral."
            
        if any(word in msg for word in ["trend", "trending", "hashtag"]):
            top = stats_context.get('top_hashtag', 'None')
            return f"The current top trending topic is #{top}. People seem to be talking about it a lot!"

    # General conversational responses
    if any(word in msg for word in ["hello", "hi", "hey"]):
        return "Hello! I am your AI assistant for the Sentiment Analysis Dashboard. I can summarize current data or explain metrics. How can I help?"
        
    if "fake" in msg or "spam" in msg:
        return "Our Fake Review Detector uses heuristic analysis and NLP to flag potential bot activity or spam comments based on keyword matching and structural patterns."
        
    if "how does it work" in msg or "model" in msg:
        return "I use VADER and TextBlob for NLP sentiment analysis, processing text in real-time to generate confidence scores and polarity metrics."
        
    if "improve" in msg or "suggestion" in msg:
        return "To improve sentiment, try engaging directly with negative feedback, and amplify positive sentiment by sharing user-generated content."
        
    # Default fallback
    responses = [
        "That's an interesting observation. The data shows mixed reactions across different platforms.",
        "I can help you analyze specific keywords if you'd like. Just use the real-time analysis panel.",
        "Based on the current trajectory, engagement seems to be shifting.",
        "I'm continuously monitoring the live feed. Let me know if you want a summary of the latest trends."
    ]
    
    return random.choice(responses)
