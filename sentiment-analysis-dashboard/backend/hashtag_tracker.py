import re
from collections import Counter

def extract_hashtags(text):
    """Extracts hashtags from a given text string."""
    return re.findall(r'#(\w+)', str(text).lower())

def update_trending(db_conn, text, sentiment_score):
    """Updates the hashtag counts and average sentiments in the database."""
    tags = extract_hashtags(text)
    cursor = db_conn.cursor()
    
    for tag in tags:
        # Check if exists
        cursor.execute("SELECT count, sentiment_score FROM hashtags WHERE hashtag = ?", (tag,))
        row = cursor.fetchone()
        
        if row:
            new_count = row['count'] + 1
            # Moving average for sentiment
            new_score = ((row['sentiment_score'] * row['count']) + sentiment_score) / new_count
            cursor.execute('''
                UPDATE hashtags 
                SET count = ?, sentiment_score = ?, last_updated = CURRENT_TIMESTAMP 
                WHERE hashtag = ?
            ''', (new_count, new_score, tag))
        else:
            cursor.execute('''
                INSERT INTO hashtags (hashtag, count, sentiment_score) 
                VALUES (?, 1, ?)
            ''', (tag, sentiment_score))
            
    db_conn.commit()

def get_top_hashtags(db_conn, limit=10):
    """Retrieves top trending hashtags."""
    cursor = db_conn.cursor()
    cursor.execute('''
        SELECT hashtag, count, sentiment_score 
        FROM hashtags 
        ORDER BY count DESC, last_updated DESC 
        LIMIT ?
    ''', (limit,))
    return [dict(row) for row in cursor.fetchall()]
