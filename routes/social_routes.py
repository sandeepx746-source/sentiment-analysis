"""
Social Account Analytics Routes
Handles social account connection, mock OAuth syncing, and dashboard metrics loading.
"""

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.database import get_db
import services.social_mock as mock

social_bp = Blueprint('social', __name__)


@social_bp.route('/api/connect-account', methods=['POST'])
@jwt_required()
def connect_account():
    user_id = get_jwt_identity()
    data = request.get_json()

    if not data:
        return jsonify({'error': 'No data provided'}), 400

    platform = data.get('platform', '').strip().lower()
    handle   = data.get('handle', '').strip()

    if not platform or not handle:
        return jsonify({'error': 'Platform and account handle are required'}), 400

    if platform not in ['instagram', 'twitter', 'youtube', 'reddit']:
        return jsonify({'error': 'Unsupported social platform'}), 400

    try:
        conn = get_db()
        
        # 1. Connect or update the account
        cursor = conn.cursor()
        cursor.execute(
            '''INSERT INTO social_accounts (user_id, platform, handle)
               VALUES (?, ?, ?)
               ON CONFLICT(user_id, platform) DO UPDATE SET handle=excluded.handle, connected_at=CURRENT_TIMESTAMP''',
            (user_id, platform, handle)
        )
        
        # Fetch account ID
        account = conn.execute(
            'SELECT id FROM social_accounts WHERE user_id = ? AND platform = ?',
            (user_id, platform)
        ).fetchone()
        account_id = account['id']

        # 2. Clear old data for a fresh mock sync
        conn.execute('DELETE FROM social_metrics WHERE account_id = ?', (account_id,))
        conn.execute('DELETE FROM audience_insights WHERE account_id = ?', (account_id,))
        conn.execute('DELETE FROM comment_analysis WHERE account_id = ?', (account_id,))

        # 3. Generate mock stats and populate database tables
        profile = mock.generate_profile_data(platform, handle)
        conn.execute(
            '''INSERT INTO social_metrics (account_id, followers, likes, views, comments, shares, engagement_rate, virality_score)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?)''',
            (account_id, profile['followers'], profile['likes'], profile['views'],
             profile['comments'], profile['shares'], profile['engagement_rate'], profile['virality_score'])
        )

        # AI Insights
        insights = mock.get_social_insights(platform)
        for ins in insights:
            conn.execute(
                'INSERT INTO audience_insights (account_id, insight_text, insight_type) VALUES (?, ?, ?)',
                (account_id, ins['text'], ins['type'])
            )

        # Comments
        comments = mock.get_social_comments(platform, count=30)
        for comment in comments:
            conn.execute(
                'INSERT INTO comment_analysis (account_id, text, sentiment, score) VALUES (?, ?, ?, ?)',
                (account_id, comment['text'], comment['sentiment'], comment['score'])
            )

        conn.commit()
        conn.close()

        return jsonify({
            'message': f'{platform.capitalize()} account @{handle} connected successfully!',
            'platform': platform,
            'handle': handle
        }), 200

    except Exception as e:
        print(f"Error connecting account: {e}")
        return jsonify({'error': 'Failed to connect social account'}), 500


@social_bp.route('/api/social-dashboard', methods=['GET'])
@jwt_required()
def get_social_dashboard():
    user_id = get_jwt_identity()
    platform = request.args.get('platform', '').strip().lower()

    try:
        conn = get_db()
        
        # Check connected accounts for user
        accounts_rows = conn.execute(
            'SELECT id, platform, handle FROM social_accounts WHERE user_id = ?', (user_id,)
        ).fetchall()
        
        connected_list = [dict(a) for a in accounts_rows]

        if not connected_list:
            conn.close()
            return jsonify({'connected_accounts': [], 'message': 'No social accounts connected yet'}), 200

        # Decide which platform to load
        target_account = None
        if platform:
            target_account = next((a for a in connected_list if a['platform'] == platform), None)
        else:
            # Load first available
            target_account = connected_list[0]

        if not target_account:
            conn.close()
            return jsonify({'connected_accounts': connected_list, 'error': f'{platform.capitalize()} is not connected'}), 404

        account_id = target_account['id']

        # Fetch current metrics
        metrics = conn.execute(
            'SELECT * FROM social_metrics WHERE account_id = ? ORDER BY id DESC LIMIT 1',
            (account_id,)
        ).fetchone()

        # Fetch AI Insights
        insights_rows = conn.execute(
            'SELECT * FROM audience_insights WHERE account_id = ?', (account_id,)
        ).fetchall()

        # Fetch word cloud (using service logic or static mapping)
        keywords = mock.get_social_keywords(target_account['platform'])

        # Generate timeline details
        timeline = mock.get_social_timeline(target_account['platform'])

        # Positive / negative count ratios for the doughnut chart
        comments_data = conn.execute(
            '''SELECT 
                SUM(case when sentiment = 'positive' then 1 else 0 end) as pos_count,
                SUM(case when sentiment = 'negative' then 1 else 0 end) as neg_count,
                SUM(case when sentiment = 'neutral' then 1 else 0 end) as neu_count,
                COUNT(*) as total_count
               FROM comment_analysis WHERE account_id = ?''', (account_id,)
        ).fetchone()

        # Calculate percentages
        total = comments_data['total_count'] or 1
        pos_pct = round((comments_data['pos_count'] or 0) / total * 100, 1)
        neg_pct = round((comments_data['neg_count'] or 0) / total * 100, 1)
        neu_pct = round(100 - pos_pct - neg_pct, 1)

        # Dominant emotion based on positivity ratio
        if pos_pct >= 55:
            dominant_emotion = 'excited' if pos_pct >= 70 else 'happy'
        elif neg_pct >= 40:
            dominant_emotion = 'angry' if neg_pct >= 55 else 'sad'
        else:
            dominant_emotion = 'neutral'

        # Emotion counts
        emotions_breakdown = {
            'happy': int(comments_data['pos_count'] or 0) // 2 + 1,
            'excited': int(comments_data['pos_count'] or 0) // 2,
            'neutral': int(comments_data['neu_count'] or 0),
            'sad': int(comments_data['neg_count'] or 0) // 2,
            'angry': int(comments_data['neg_count'] or 0) // 2 + 1,
        }

        dashboard_data = {
            'connected_accounts': connected_list,
            'current_account': target_account,
            'metrics': dict(metrics) if metrics else {},
            'insights': [dict(i) for i in insights_rows],
            'keywords': keywords,
            'timeline': timeline,
            'sentiment_breakdown': {
                'positive_pct': pos_pct,
                'negative_pct': neg_pct,
                'neutral_pct': neu_pct,
                'dominant_emotion': dominant_emotion,
                'emotions': emotions_breakdown
            }
        }

        conn.close()
        return jsonify(dashboard_data), 200

    except Exception as e:
        print(f"Error fetching social dashboard: {e}")
        return jsonify({'error': 'Failed to retrieve social metrics'}), 500


@social_bp.route('/api/social-comments', methods=['GET'])
@jwt_required()
def get_social_comments():
    user_id = get_jwt_identity()
    platform = request.args.get('platform', '').strip().lower()
    page      = int(request.args.get('page', 1))
    per_page  = int(request.args.get('per_page', 8))
    sentiment = request.args.get('sentiment', '')
    search    = request.args.get('search', '').strip()

    if not platform:
        return jsonify({'error': 'Platform parameter required'}), 400

    try:
        conn = get_db()
        account = conn.execute(
            'SELECT id FROM social_accounts WHERE user_id = ? AND platform = ?',
            (user_id, platform)
        ).fetchone()

        if not account:
            conn.close()
            return jsonify({'comments': [], 'total': 0, 'pages': 0}), 200

        account_id = account['id']
        offset = (page - 1) * per_page

        query = 'SELECT * FROM comment_analysis WHERE account_id = ?'
        params = [account_id]

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

        comments = [dict(r) for r in rows]
        return jsonify({
            'comments': comments,
            'total': total,
            'page': page,
            'per_page': per_page,
            'pages': (total + per_page - 1) // per_page,
        }), 200

    except Exception as e:
        print(f"Error loading comments: {e}")
        return jsonify({'error': 'Failed to retrieve comment intelligence feed'}), 500


@social_bp.route('/api/audience-insights', methods=['GET'])
@jwt_required()
def get_social_insights():
    user_id = get_jwt_identity()
    platform = request.args.get('platform', '').strip().lower()

    if not platform:
        return jsonify({'error': 'Platform parameter required'}), 400

    try:
        conn = get_db()
        account = conn.execute(
            'SELECT id FROM social_accounts WHERE user_id = ? AND platform = ?',
            (user_id, platform)
        ).fetchone()

        if not account:
            conn.close()
            return jsonify({'insights': []}), 200

        rows = conn.execute(
            'SELECT * FROM audience_insights WHERE account_id = ? ORDER BY id DESC',
            (account['id'],)
        ).fetchall()
        conn.close()

        return jsonify({'insights': [dict(r) for r in rows]}), 200

    except Exception as e:
        return jsonify({'error': 'Failed to retrieve insights'}), 500


@social_bp.route('/api/social-trends', methods=['GET'])
@jwt_required()
def get_social_trends():
    platform = request.args.get('platform', '').strip().lower()
    if not platform:
        return jsonify({'error': 'Platform parameter required'}), 400

    timeline = mock.get_social_timeline(platform)
    return jsonify({'timeline': timeline}), 200
