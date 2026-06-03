import requests
import feedparser
from urllib.parse import quote_plus


def fetch_reddit_posts(topic, limit=20):
    url = "https://www.reddit.com/search.json"

    params = {
        "q": topic,
        "limit": limit,
        "sort": "relevance",
        "t": "week"
    }

    headers = {
        "User-Agent": "SentimentIQ/1.0"
    }

    try:
        response = requests.get(url, params=params, headers=headers, timeout=10)
        print("Reddit status:", response.status_code)

        if response.status_code != 200:
            return []

        data = response.json()
        posts = []

        for item in data.get("data", {}).get("children", []):
            post = item.get("data", {})

            title = post.get("title", "")
            body = post.get("selftext", "")

            text = f"{title} {body}".strip()

            if text:
                posts.append(text)

        print("Reddit posts found:", len(posts))
        return posts[:limit]

    except Exception as e:
        print("Reddit fetch error:", e)
        return []


def fetch_google_news(topic, limit=30):
    try:
        encoded_topic = quote_plus(topic)

        rss_urls = [
            f"https://news.google.com/rss/search?q={encoded_topic}%20when:7d&hl=en-US&gl=US&ceid=US:en",
            f"https://news.google.com/rss/search?q={encoded_topic}&hl=en-US&gl=US&ceid=US:en",
            f"https://news.google.com/rss/search?q={encoded_topic}",
        ]

        posts = []

        for rss_url in rss_urls:
            print("Trying Google News:", rss_url)

            feed = feedparser.parse(rss_url)
            print("Google News entries:", len(feed.entries))

            for entry in feed.entries[:limit]:
                title = entry.get("title", "").strip()
                summary = entry.get("summary", "").strip()

                text = f"{title} {summary}".strip()

                if text:
                    posts.append(text)

            if posts:
                break

        print("Google News posts found:", len(posts))
        return posts[:limit]

    except Exception as e:
        print("Google News fetch error:", e)
        return []


def fetch_duckduckgo_news(topic, limit=30):
    try:
        url = "https://duckduckgo.com/html/"

        headers = {
            "User-Agent": "Mozilla/5.0"
        }

        params = {
            "q": topic
        }

        response = requests.get(url, headers=headers, params=params, timeout=10)
        print("DuckDuckGo status:", response.status_code)

        if response.status_code != 200:
            return []

        html = response.text
        posts = []

        parts = html.split('class="result__a"')

        for part in parts[1:limit + 1]:
            start = part.find('>')
            end = part.find('</a>')

            if start != -1 and end != -1:
                title = part[start + 1:end]
                title = title.replace("&amp;", "&")
                title = title.replace("&#x27;", "'")
                title = title.replace("&quot;", '"')
                title = title.strip()

                if title:
                    posts.append(title)

        print("DuckDuckGo posts found:", len(posts))
        return posts[:limit]

    except Exception as e:
        print("DuckDuckGo fetch error:", e)
        return []


def fetch_real_time_social_posts(topic, limit=30):
    posts = []

    reddit_posts = fetch_reddit_posts(topic, limit=limit)
    posts.extend(reddit_posts)

    if len(posts) < 10:
        news_posts = fetch_google_news(topic, limit=limit)
        posts.extend(news_posts)

    if len(posts) < 10:
        duck_posts = fetch_duckduckgo_news(topic, limit=limit)
        posts.extend(duck_posts)

    clean_posts = []
    seen = set()

    for post in posts:
        post = post.strip()

        if post and post.lower() not in seen:
            seen.add(post.lower())
            clean_posts.append(post)

    print("TOTAL REAL-TIME POSTS FOUND:", len(clean_posts))

    return clean_posts[:limit]