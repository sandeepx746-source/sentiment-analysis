"""
Compare Routes — Topic Battle Mode ⚔️
"""

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from services.analyzer import analyze_batch
from services.insights_generator import generate_compare_insights
from services.mock_data import generate_comments

compare_bp = Blueprint('compare', __name__)


@compare_bp.route('/api/compare', methods=['GET'])
@jwt_required()
def compare_topics():
    """Compare two topics head-to-head."""
    topic_a = request.args.get('a', '').strip()
    topic_b = request.args.get('b', '').strip()

    if not topic_a or not topic_b:
        return jsonify({'error': 'Provide both topics using ?a=TopicA&b=TopicB'}), 400

    if topic_a.lower() == topic_b.lower():
        return jsonify({'error': 'Please choose two different topics to compare'}), 400

    # Analyze both topics
    comments_a = generate_comments(topic_a, count=25)
    comments_b = generate_comments(topic_b, count=25)

    data_a = analyze_batch(comments_a)
    data_b = analyze_batch(comments_b)

    data_a['topic'] = topic_a
    data_b['topic'] = topic_b

    # Generate comparison insights
    compare_result = generate_compare_insights(topic_a, data_a, topic_b, data_b)

    return jsonify({
        'topic_a': data_a,
        'topic_b': data_b,
        'comparison': compare_result,
    }), 200
