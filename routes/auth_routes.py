"""
Authentication Routes — Register, Login, Logout
Using JWT tokens + password hashing via Werkzeug.
"""

from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash
from models.database import get_db

auth_bp = Blueprint('auth', __name__)


@auth_bp.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 400

    username = data.get('username', '').strip()
    email    = data.get('email', '').strip()
    password = data.get('password', '')

    if not username or not email or not password:
        return jsonify({'error': 'Username, email, and password are required'}), 400

    if len(password) < 6:
        return jsonify({'error': 'Password must be at least 6 characters'}), 400

    password_hash = generate_password_hash(password)

    try:
        conn = get_db()
        conn.execute(
            'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
            (username, email, password_hash)
        )
        conn.commit()
        conn.close()
        return jsonify({'message': f'Welcome to SentimentIQ, {username}! Please log in.'}), 201
    except Exception as e:
        if 'UNIQUE' in str(e):
            if 'username' in str(e):
                return jsonify({'error': 'Username already taken. Please choose another.'}), 409
            elif 'email' in str(e):
                return jsonify({'error': 'Email already registered. Please log in.'}), 409
        return jsonify({'error': 'Registration failed. Please try again.'}), 500


@auth_bp.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 400

    identifier = data.get('username', '').strip()  # username or email
    password   = data.get('password', '')

    if not identifier or not password:
        return jsonify({'error': 'Username/email and password are required'}), 400

    try:
        conn = get_db()
        user = conn.execute(
            'SELECT * FROM users WHERE username = ? OR email = ?',
            (identifier, identifier)
        ).fetchone()
        conn.close()

        if not user:
            return jsonify({'error': 'No account found with that username or email'}), 404

        if not check_password_hash(user['password_hash'], password):
            return jsonify({'error': 'Incorrect password. Please try again.'}), 401

        token = create_access_token(identity=str(user['id']))
        return jsonify({
            'access_token': token,
            'user': {
                'id':       user['id'],
                'username': user['username'],
                'email':    user['email'],
            },
            'message': f'Welcome back, {user["username"]}! 🎉'
        }), 200

    except Exception as e:
        return jsonify({'error': 'Login failed. Please try again.'}), 500


@auth_bp.route('/api/me', methods=['GET'])
@jwt_required()
def get_me():
    user_id = get_jwt_identity()
    try:
        conn = get_db()
        user = conn.execute('SELECT id, username, email, created_at FROM users WHERE id = ?', (user_id,)).fetchone()
        conn.close()
        if not user:
            return jsonify({'error': 'User not found'}), 404
        return jsonify({'user': dict(user)}), 200
    except Exception:
        return jsonify({'error': 'Could not retrieve user info'}), 500
