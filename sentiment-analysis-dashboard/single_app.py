import sqlite3
import os
import re
import random
import io
from datetime import datetime, timedelta
from collections import Counter

from flask import Flask, request, jsonify, render_template_string
from flask_cors import CORS
import pandas as pd
from textblob import TextBlob
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer

# ---------------------------------------------------------
# 1. DATABASE & LOGIC MODULES
# ---------------------------------------------------------

DB_PATH = 'sentiment_single.db'

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS analyzed_data (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            source TEXT NOT NULL,
            username TEXT,
            content TEXT NOT NULL,
            sentiment_label TEXT,
            confidence_score REAL,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS hashtags (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            hashtag TEXT UNIQUE NOT NULL,
            count INTEGER DEFAULT 1,
            sentiment_score REAL DEFAULT 0.0,
            last_updated DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    conn.commit()
    conn.close()

analyzer = SentimentIntensityAnalyzer()

def analyze_text(text):
    if not text or not text.strip():
        return {"label": "Neutral 😐", "score": 0.5, "percentages": {"positive": 33, "neutral": 34, "negative": 33}, "explanation": "No text."}
    vader_scores = analyzer.polarity_scores(text)
    compound = vader_scores['compound']
    if compound >= 0.05: label = "Positive 😊"
    elif compound <= -0.05: label = "Negative 😠"
    else: label = "Neutral 😐"
    
    pos_pct, neg_pct, neu_pct = round(vader_scores['pos'] * 100), round(vader_scores['neg'] * 100), round(vader_scores['neu'] * 100)
    if pos_pct == 0 and neg_pct == 0 and neu_pct == 100:
        tb = TextBlob(text)
        if tb.sentiment.polarity > 0.1: label, pos_pct, neu_pct = "Positive 😊", 60, 40
        elif tb.sentiment.polarity < -0.1: label, neg_pct, neu_pct = "Negative 😠", 60, 40

    total = pos_pct + neg_pct + neu_pct
    if total > 0:
        pos_pct = round((pos_pct / total) * 100)
        neg_pct = round((neg_pct / total) * 100)
        neu_pct = 100 - (pos_pct + neg_pct)
    else: neu_pct = 100
    
    return {"label": label, "score": round((compound + 1) / 2, 2), "percentages": {"positive": pos_pct, "neutral": neu_pct, "negative": neg_pct}, "compound": compound}

def detect_fake_review(text):
    text = str(text).lower()
    spam_keywords = ["click here", "buy now", "subscribe", "crypto", "bitcoin", "guaranteed"]
    score = 0.0
    if any(kw in text for kw in spam_keywords): score += 0.4
    if len(re.findall(r'http[s]?://', text)) > 1: score += 0.3
    if re.search(r'[!?.]{4,}', text): score += 0.2
    return {"is_fake": score > 0.5, "probability": min(score, 0.99)}

def update_trending(db_conn, text, sentiment_score):
    tags = re.findall(r'#(\w+)', str(text).lower())
    cursor = db_conn.cursor()
    for tag in tags:
        cursor.execute("SELECT count, sentiment_score FROM hashtags WHERE hashtag = ?", (tag,))
        row = cursor.fetchone()
        if row:
            new_count = row['count'] + 1
            new_score = ((row['sentiment_score'] * row['count']) + sentiment_score) / new_count
            cursor.execute('UPDATE hashtags SET count=?, sentiment_score=?, last_updated=CURRENT_TIMESTAMP WHERE hashtag=?', (new_count, new_score, tag))
        else:
            cursor.execute('INSERT INTO hashtags (hashtag, count, sentiment_score) VALUES (?, 1, ?)', (tag, sentiment_score))
    db_conn.commit()

def fetch_mock_social_data(platform, query):
    templates = ["Just saw {query}, amazing! 🚀", "Not a fan of {query}. 😠", "What does everyone think about {query}? 🤔", "{query} is the best! ❤️"]
    return [{"id": f"id_{random.randint(100,999)}", "username": f"user_{random.randint(1,99)}", "text": random.choice(templates).format(query=query), "timestamp": datetime.now().isoformat()} for _ in range(5)]

# ---------------------------------------------------------
# 2. FLASK APP & ROUTES
# ---------------------------------------------------------

app = Flask(__name__)
CORS(app)
init_db()

@app.route('/api/analyze', methods=['POST'])
def api_analyze_text():
    text = request.json.get('text', '')
    sentiment = analyze_text(text)
    update_trending(get_db_connection(), text, sentiment['score'])
    return jsonify({"text": text, "sentiment": sentiment, "spam_analysis": detect_fake_review(text)})

@app.route('/api/upload_csv', methods=['POST'])
def api_upload_csv():
    file = request.files.get('file')
    if not file or not file.filename.endswith('.csv'): return jsonify({"error": "Invalid file"}), 400
    df = pd.read_csv(io.StringIO(file.stream.read().decode("UTF8")))
    if 'comment' not in df.columns: return jsonify({"error": "CSV must contain 'comment' column"}), 400
    
    results = []
    pos, neg, neu = 0, 0, 0
    for text in df['comment'].dropna().astype(str):
        analysis = analyze_text(text)
        results.append({"text": text, "label": analysis['label']})
        if "Positive" in analysis['label']: pos += 1
        elif "Negative" in analysis['label']: neg += 1
        else: neu += 1
    total = len(results)
    return jsonify({"summary": {"total": total, "positive_pct": round((pos/total)*100) if total else 0, "negative_pct": round((neg/total)*100) if total else 0, "neutral_pct": round((neu/total)*100) if total else 0}, "results": results})

@app.route('/api/social_fetch', methods=['GET'])
def api_social_fetch():
    data = fetch_mock_social_data(request.args.get('platform', 'Twitter'), request.args.get('query', 'AI'))
    for item in data: item['sentiment'] = analyze_text(item['text'])
    return jsonify({"data": data})

@app.route('/api/dashboard_stats', methods=['GET'])
def api_dashboard_stats():
    cursor = get_db_connection().cursor()
    cursor.execute('SELECT hashtag FROM hashtags ORDER BY count DESC LIMIT 1')
    top = cursor.fetchone()
    return jsonify({"total_posts": 15420, "positive_pct": 65, "negative_pct": 15, "neutral_pct": 20, "top_hashtags": [{"hashtag": top['hashtag']}] if top else [{"hashtag": "AI"}]})

@app.route('/api/chatbot', methods=['POST'])
def api_chatbot():
    return jsonify({"response": "I am analyzing the current sentiment metrics. How can I help further?"})

# ---------------------------------------------------------
# 3. HTML/CSS/JS FRONTEND
# ---------------------------------------------------------

HTML_CONTENT = """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SentimentIQ | Single File</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"></script>
    <style>
        :root { --bg-color: #0b0c10; --panel-bg: rgba(31, 40, 51, 0.6); --glass-border: rgba(69, 162, 158, 0.3); --neon-blue: #45a29e; --neon-purple: #c56ceb; --neon-green: #66fcf1; --neon-red: #ff4b4b; --text-primary: #ffffff; --text-secondary: #c5c6c7; font-family: 'Inter', sans-serif;}
        body { background-color: var(--bg-color); color: var(--text-primary); margin: 0; min-height: 100vh; overflow-x: hidden;}
        .glass-panel { background: var(--panel-bg); backdrop-filter: blur(12px); border: 1px solid var(--glass-border); border-radius: 16px; box-shadow: 0 8px 32px 0 rgba(0,0,0,0.37); padding: 20px;}
        .app-container { display: flex; padding: 20px; gap: 20px; height: 100vh;}
        .sidebar { width: 250px; display: flex; flex-direction: column; gap: 20px;}
        .main-content { flex: 1; display: flex; flex-direction: column; gap: 20px; overflow-y: auto;}
        .top-bar { display: flex; gap: 20px;}
        .search-box { flex: 1; display: flex; align-items: center; padding: 10px 20px; }
        .search-box input { background: transparent; border: none; color: white; width: 100%; outline: none; margin-left: 10px; font-size:16px;}
        .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px;}
        .stat-card { display: flex; align-items: center; gap: 15px;}
        .stat-icon { font-size: 2rem; color: var(--neon-blue);}
        .charts-area { display: flex; gap: 20px; height: 300px;}
        .chart-container { flex: 1; display: flex; flex-direction: column;}
        .chart-wrapper { flex: 1; position: relative;}
        .hidden { display: none !important;}
        .neon-text-blue { color: var(--neon-blue); text-shadow: 0 0 8px var(--neon-blue); }
        .feed-item { padding: 10px; border-bottom: 1px solid rgba(255,255,255,0.1);}
        #particles-js { position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: -1; }
    </style>
</head>
<body>
    <div id="particles-js"></div>
    <div class="app-container">
        <nav class="sidebar glass-panel">
            <h2 class="neon-text-blue"><i class="fa-solid fa-brain"></i> SentimentIQ</h2>
            <hr style="border-color:var(--glass-border)">
            <p><i class="fa-solid fa-chart-line"></i> Dashboard</p>
        </nav>
        <main class="main-content">
            <header class="top-bar">
                <div class="search-box glass-panel">
                    <i class="fa-solid fa-magnifying-glass" style="color:var(--neon-blue)"></i>
                    <input type="text" id="live-analyze-input" placeholder="Type for real-time analysis...">
                </div>
            </header>
            
            <div id="realtime-banner" class="glass-panel hidden" style="border-left: 4px solid var(--neon-blue)">
                <h3 id="banner-text">Analyzing...</h3>
                <span id="banner-label" style="padding: 5px 10px; background: rgba(255,255,255,0.1); border-radius:10px;">--</span>
            </div>

            <section class="stats-grid">
                <div class="stat-card glass-panel"><div class="stat-icon"><i class="fa-solid fa-database"></i></div><div><h4>Analyzed</h4><h2 id="total-posts">0</h2></div></div>
                <div class="stat-card glass-panel"><div class="stat-icon"><i class="fa-solid fa-smile"></i></div><div><h4>Positive</h4><h2 id="stat-positive">0%</h2></div></div>
                <div class="stat-card glass-panel"><div class="stat-icon"><i class="fa-solid fa-angry"></i></div><div><h4>Negative</h4><h2 id="stat-negative">0%</h2></div></div>
                <div class="stat-card glass-panel"><div class="stat-icon"><i class="fa-solid fa-fire"></i></div><div><h4>Top Trend</h4><h2 id="stat-trend">#AI</h2></div></div>
            </section>

            <section class="charts-area">
                <div class="chart-container glass-panel"><h3>Sentiment Distribution</h3><div class="chart-wrapper"><canvas id="pieChart"></canvas></div></div>
                <div class="chart-container glass-panel" style="flex:2"><h3>Social Feed</h3><div id="feed" style="overflow-y:auto; height: 100%;"></div></div>
            </section>
        </main>
    </div>

    <script>
        const API_URL = 'http://127.0.0.1:5000/api';
        let pieChart;

        document.addEventListener('DOMContentLoaded', () => {
            initChart();
            fetchStats();
            fetchFeed();

            let timer;
            document.getElementById('live-analyze-input').addEventListener('input', (e) => {
                clearTimeout(timer);
                const text = e.target.value.trim();
                const banner = document.getElementById('realtime-banner');
                if(!text) return banner.classList.add('hidden');
                
                banner.classList.remove('hidden');
                document.getElementById('banner-text').textContent = 'Analyzing...';
                
                timer = setTimeout(async () => {
                    const res = await fetch(`${API_URL}/analyze`, {
                        method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({text})
                    });
                    const data = await res.json();
                    document.getElementById('banner-text').textContent = text;
                    document.getElementById('banner-label').textContent = data.sentiment.label;
                }, 500);
            });
        });

        function initChart() {
            Chart.defaults.color = '#fff';
            pieChart = new Chart(document.getElementById('pieChart'), {
                type: 'doughnut',
                data: { labels: ['Pos', 'Neu', 'Neg'], datasets: [{ data: [33,34,33], backgroundColor: ['#66fcf1', '#c56ceb', '#ff4b4b'] }] },
                options: { responsive: true, maintainAspectRatio: false }
            });
        }

        async function fetchStats() {
            const res = await fetch(`${API_URL}/dashboard_stats`);
            const data = await res.json();
            document.getElementById('total-posts').textContent = data.total_posts;
            document.getElementById('stat-positive').textContent = data.positive_pct + '%';
            document.getElementById('stat-negative').textContent = data.negative_pct + '%';
            if(data.top_hashtags.length) document.getElementById('stat-trend').textContent = '#' + data.top_hashtags[0].hashtag;
            
            pieChart.data.datasets[0].data = [data.positive_pct, data.neutral_pct, data.negative_pct];
            pieChart.update();
        }

        async function fetchFeed() {
            const res = await fetch(`${API_URL}/social_fetch`);
            const data = await res.json();
            const feed = document.getElementById('feed');
            feed.innerHTML = '';
            data.data.forEach(item => {
                feed.innerHTML += `<div class="feed-item"><strong>@${item.username}</strong> (${item.sentiment.label})<br>${item.text}</div>`;
            });
        }
    </script>
</body>
</html>
"""

@app.route('/')
def serve_html():
    return render_template_string(HTML_CONTENT)

if __name__ == '__main__':
    print("🚀 Starting SentimentIQ Single-File App...")
    print("👉 Open your browser to: http://127.0.0.1:5000")
    app.run(debug=True, port=5000)
