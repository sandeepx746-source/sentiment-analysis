from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import io

# Import custom modules
from database import init_db, get_db_connection
from sentiment import analyze_text
from fake_review_detector import detect_fake_review
from hashtag_tracker import update_trending, get_top_hashtags
from social_api import fetch_mock_social_data
from chatbot import generate_chatbot_response

app = Flask(__name__)
CORS(app) # Enable CORS for frontend integration

# Initialize Database
init_db()

@app.route('/api/analyze', methods=['POST'])
def api_analyze_text():
    """Real-time sentiment analysis endpoint."""
    data = request.json
    text = data.get('text', '')
    
    # 1. Sentiment Analysis
    sentiment_result = analyze_text(text)
    
    # 2. Fake Review Detection
    fake_review_result = detect_fake_review(text)
    
    # 3. Trending Hashtags
    conn = get_db_connection()
    update_trending(conn, text, sentiment_result['score'])
    
    # Optional: Save to db (commented out for real-time speed, but could be added)
    
    return jsonify({
        "text": text,
        "sentiment": sentiment_result,
        "spam_analysis": fake_review_result
    })

@app.route('/api/upload_csv', methods=['POST'])
def api_upload_csv():
    """Handles bulk CSV upload for analysis."""
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400
        
    file = request.files['file']
    if not file.filename.endswith('.csv'):
        return jsonify({"error": "Invalid file format. Please upload CSV."}), 400
        
    try:
        stream = io.StringIO(file.stream.read().decode("UTF8"), newline=None)
        df = pd.read_csv(stream)
        
        # Verify columns
        required_cols = ['comment']
        if not any(col in df.columns for col in required_cols):
            return jsonify({"error": "CSV must contain a 'comment' column"}), 400
            
        results = []
        pos_count = neg_count = neu_count = 0
        
        for index, row in df.iterrows():
            text = str(row['comment']) if 'comment' in df.columns else ""
            if text:
                analysis = analyze_text(text)
                spam = detect_fake_review(text)
                
                results.append({
                    "id": index,
                    "text": text,
                    "label": analysis['label'],
                    "is_fake": spam['is_fake']
                })
                
                if "Positive" in analysis['label']: pos_count += 1
                elif "Negative" in analysis['label']: neg_count += 1
                else: neu_count += 1
                
        total = len(results)
        summary = {
            "total": total,
            "positive_pct": round((pos_count/total)*100) if total > 0 else 0,
            "negative_pct": round((neg_count/total)*100) if total > 0 else 0,
            "neutral_pct": round((neu_count/total)*100) if total > 0 else 0,
        }
        
        return jsonify({"summary": summary, "results": results})
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/social_fetch', methods=['GET'])
def api_social_fetch():
    """Fetches real-time social media data (Mocked)"""
    platform = request.args.get('platform', 'Twitter')
    query = request.args.get('query', 'AI')
    
    data = fetch_mock_social_data(platform, query)
    
    # Process the fetched data
    analyzed_data = []
    for item in data:
        sentiment = analyze_text(item['text'])
        item['sentiment'] = sentiment
        analyzed_data.append(item)
        
    return jsonify({"data": analyzed_data})

@app.route('/api/dashboard_stats', methods=['GET'])
def api_dashboard_stats():
    """Returns aggregated statistics for the dashboard."""
    conn = get_db_connection()
    hashtags = get_top_hashtags(conn)
    
    # For MVP, we simulate some stats if the DB is empty
    stats = {
        "total_posts": 15420,
        "positive_pct": 65,
        "negative_pct": 15,
        "neutral_pct": 20,
        "top_hashtags": hashtags,
        "engagement_score": 87
    }
    return jsonify(stats)

@app.route('/api/chatbot', methods=['POST'])
def api_chatbot():
    """AI Chatbot endpoint."""
    data = request.json
    message = data.get('message', '')
    
    # Get basic context for the bot
    stats_context = {
        "total_posts": 15420,
        "positive": 65,
        "negative": 15,
        "neutral": 20,
        "top_hashtag": "AI"
    }
    
    response = generate_chatbot_response(message, stats_context)
    return jsonify({"response": response})

if __name__ == '__main__':
    app.run(debug=True, port=5000)
