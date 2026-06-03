import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), 'sentiment.db')

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Create tables for storing analyzed posts/comments
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
    
    # Create table for trending hashtags
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

if __name__ == '__main__':
    init_db()
    print("Database initialized successfully.")
