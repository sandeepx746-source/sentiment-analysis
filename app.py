"""
SentimentIQ — AI-Powered Public Opinion Intelligence Platform
Main Flask Application Entry Point
"""

import os
from flask import Flask, send_from_directory
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from models.database import init_db
from routes.auth_routes import auth_bp
from routes.dashboard_routes import dashboard_bp
from routes.compare_routes import compare_bp
from routes.social_routes import social_bp

app = Flask(__name__, template_folder='templates', static_folder='static')

# ── Configuration ──────────────────────────────────────────────────────────────
app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', 'sentimentiq-super-secret-key-2025')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = 86400  # 24 hours

# ── Extensions ─────────────────────────────────────────────────────────────────
CORS(app, resources={r"/api/*": {"origins": "*"}})
jwt = JWTManager(app)

# ── Blueprints ─────────────────────────────────────────────────────────────────
app.register_blueprint(auth_bp)
app.register_blueprint(dashboard_bp)
app.register_blueprint(compare_bp)
app.register_blueprint(social_bp)

# ── Page Routes ────────────────────────────────────────────────────────────────
from flask import render_template, redirect, url_for

@app.route('/')
def index():
    return redirect('/login')

@app.route('/login')
def login_page():
    return render_template('login.html')

@app.route('/register')
def register_page():
    return render_template('register.html')

@app.route('/dashboard')
def dashboard_page():
    return render_template('dashboard.html')

@app.route('/compare')
def compare_page():
    return render_template('compare.html')

@app.route('/connect')
def connect_page():
    return render_template('connect.html')

@app.route('/social-dashboard')
def social_dashboard_page():
    return render_template('social_dashboard.html')

# ── JWT Error Handlers ──────────────────────────────────────────────────────────
@jwt.unauthorized_loader
def unauthorized_callback(error):
    from flask import jsonify
    return jsonify({'error': 'Authentication required. Please log in.'}), 401

@jwt.expired_token_loader
def expired_token_callback(jwt_header, jwt_payload):
    from flask import jsonify
    return jsonify({'error': 'Session expired. Please log in again.'}), 401

@jwt.invalid_token_loader
def invalid_token_callback(error):
    from flask import jsonify
    return jsonify({'error': 'Invalid token. Please log in again.'}), 422

# ── Health Check ───────────────────────────────────────────────────────────────
@app.route('/api/health')
def health():
    from flask import jsonify
    return jsonify({'status': 'ok', 'app': 'SentimentIQ', 'version': '1.0.0'}), 200


if __name__ == '__main__':
    init_db()
    print("🚀 SentimentIQ is running at http://127.0.0.1:5001")
    app.run(debug=True, host='0.0.0.0', port=5001)
