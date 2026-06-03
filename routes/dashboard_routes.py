"""
Dashboard Routes — Main analysis, comments, insights, trending.
Uses real-time Reddit + Google News data instead of fake/mock comments.
"""

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from services.analyzer import analyze_batch
from services.insights_generator import generate_insights
from services.mock_data import get_trending_topics
from services.social_fetcher import fetch_real_time_social_posts
from models.database import get_db

dashboard_bp = Blueprint('dashboard', __name__)


@dashboard_bp.route('/api/analyze', methods=['GET'])
@jwt_required()
def analyze():
    topic = request.args.get('q', '').strip()

    if not topic:
        return jsonify({'error': 'Please provide a topic using ?q=TopicName'}), 400

    if len(topic) > 100:
        return jsonify({'error': 'Topic name too long'}), 400

    raw_comments = fetch_real_time_social_posts(topic, limit=30)

    if not raw_comments:
        return jsonify({'error': 'No real-time data found for this topic.'}), 404

    analysis = analyze_batch(raw_comments)
    insights = generate_insights(analysis)

    analysis['insights'] = insights
    analysis['topic'] = topic
    analysis['source'] = 'Real-Time Public Data: Reddit + Google News'

    try:
        user_id = get_jwt_identity()
        conn = get_db()

        conn.execute(
            'INSERT INTO topic_history (topic, user_id) VALUES (?, ?)',
            (topic, user_id)
        )

        conn.execute(
            '''INSERT INTO sentiment_analysis
               (topic, positive_pct, negative_pct, neutral_pct, virality_score,
                total_comments, engagement_rate, avg_compound)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?)''',
            (
                topic,
                analysis.get('positive_pct', 0),
                analysis.get('negative_pct', 0),
                analysis.get('neutral_pct', 0),
                analysis.get('virality_score', 0),
                analysis.get('total', 0),
                analysis.get('engagement_rate', 0),
                analysis.get('avg_compound', 0)
            )
        )

        for comment in analysis.get('comments', []):
            conn.execute(
                '''INSERT INTO comments
                   (topic, text, sentiment, score, compound, positive, negative, neutral)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?)''',
                (
                    topic,
                    comment.get('text', ''),
                    comment.get('sentiment', ''),
                    comment.get('score', 0),
                    comment.get('compound', 0),
                    comment.get('positive', 0),
                    comment.get('negative', 0),
                    comment.get('neutral', 0)
                )
            )

        for insight in insights:
            conn.execute(
                'INSERT INTO ai_insights (topic, insight_text, insight_type) VALUES (?, ?, ?)',
                (
                    topic,
                    insight.get('text', ''),
                    insight.get('type', 'general')
                )
            )

        conn.commit()
        conn.close()

    except Exception as e:
        print("DB save error:", e)

    return jsonify(analysis), 200


@dashboard_bp.route('/api/comments', methods=['GET'])
@jwt_required()
def get_comments():
    topic = request.args.get('q', '').strip()
    page = int(request.args.get('page', 1))
    per_page = int(request.args.get('per_page', 10))
    sentiment = request.args.get('sentiment', '')
    search = request.args.get('search', '').strip()

    offset = (page - 1) * per_page

    try:
        conn = get_db()
        query = 'SELECT * FROM comments WHERE 1=1'
        params = []

        if topic:
            query += ' AND topic LIKE ?'
            params.append(f'%{topic}%')

        if sentiment:
            query += ' AND sentiment = ?'
            params.append(sentiment)

        if search:
            query += ' AND text LIKE ?'
            params.append(f'%{search}%')

        total = conn.execute(f'SELECT COUNT(*) FROM ({query})', params).fetchone()[0]

        query += ' ORDER BY id DESC LIMIT ? OFFSET ?'
        params += [per_page, offset]

        rows = conn.execute(query, params).fetchall()
        conn.close()

        return jsonify({
            'comments': [dict(r) for r in rows],
            'total': total,
            'page': page,
            'per_page': per_page,
            'pages': (total + per_page - 1) // per_page,
        }), 200

    except Exception as e:
        print("Comments fetch error:", e)
        return jsonify({'error': 'Could not retrieve comments'}), 500


@dashboard_bp.route('/api/insights', methods=['GET'])
@jwt_required()
def get_insights():
    topic = request.args.get('q', '').strip()

    try:
        conn = get_db()
        query = 'SELECT * FROM ai_insights'
        params = []

        if topic:
            query += ' WHERE topic LIKE ?'
            params.append(f'%{topic}%')

        query += ' ORDER BY created_at DESC LIMIT 20'

        rows = conn.execute(query, params).fetchall()
        conn.close()

        return jsonify({'insights': [dict(r) for r in rows]}), 200

    except Exception as e:
        print("Insights fetch error:", e)
        return jsonify({'error': 'Could not retrieve insights'}), 500


@dashboard_bp.route('/api/dashboard', methods=['GET'])
@jwt_required()
def get_dashboard():
    user_id = get_jwt_identity()

    try:
        conn = get_db()

        recent = conn.execute(
            '''SELECT topic, analyzed_at, positive_pct, negative_pct, neutral_pct,
                      virality_score, total_comments
               FROM sentiment_analysis
               ORDER BY analyzed_at DESC LIMIT 10'''
        ).fetchall()

        history = conn.execute(
            '''SELECT topic, searched_at
               FROM topic_history
               WHERE user_id = ?
               ORDER BY searched_at DESC LIMIT 10''',
            (user_id,)
        ).fetchall()

        conn.close()

        return jsonify({
            'recent_analyses': [dict(r) for r in recent],
            'search_history': [dict(r) for r in history],
            'trending_topics': get_trending_topics(),
        }), 200

    except Exception as e:
        print("Dashboard fetch error:", e)
        return jsonify({'error': 'Could not retrieve dashboard data'}), 500


@dashboard_bp.route('/api/trending', methods=['GET'])
def get_trending():
    return jsonify({'topics': get_trending_topics()}), 200