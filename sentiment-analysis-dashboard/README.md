# Sentiment Analysis of Social Media Presence 🚀

A futuristic, AI-powered full-stack web application designed to analyze public opinion across various social media platforms. Built with a premium Cyberpunk/Glassmorphism aesthetic, this application utilizes NLP techniques to evaluate sentiment, detect fake reviews, and track trending topics in real time.

## ✨ Features

- **AI Futuristic Dashboard**: Premium dark theme with glassmorphism UI, neon animations, and real-time statistics.
- **Sentiment Analysis**: Evaluates text using VADER and TextBlob to classify sentiment as Positive, Negative, or Neutral with confidence scores.
- **Real-Time Analysis**: Instantly analyzes sentiment as you type.
- **Fake Review Detection**: Heuristic-based bot and spam detection engine.
- **Bulk CSV Upload**: Analyze large datasets instantly and generate percentage-based insights.
- **Interactive Analytics**: Animated Chart.js implementations for Sentiment Distribution and 7-Day Trend Analysis.
- **AI Chatbot Assistant**: A floating assistant that helps you interpret dashboard data and explains the analysis methodology.
- **Live Social Feed**: Aggregates mock real-time data from platforms like Twitter, YouTube, and Reddit.

## 🛠 Tech Stack

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla ES6+), Chart.js, GSAP (Animations).
- **Backend**: Python, Flask, Flask-CORS.
- **Database**: SQLite3.
- **AI/NLP**: TextBlob, VADER Sentiment, Scikit-learn (Optional).

## 🚀 Step-by-Step Setup Guide

### Prerequisites
Make sure you have **Python 3.x** installed on your machine.

### 1. Clone/Navigate to the directory
Open your terminal and navigate to the project directory:
```bash
cd sentiment-analysis-dashboard
```

### 2. Install Backend Dependencies
It's recommended to create a virtual environment, but you can also install directly:
```bash
pip install -r requirements.txt
```

### 3. Run the Backend Server
Navigate to the backend folder and start the Flask app:
```bash
cd backend
python app.py
```
*The server will start on `http://127.0.0.1:5000`.*

### 4. Run the Frontend
Since the frontend uses basic HTML/JS with API calls, you can either:
- Open `frontend/index.html` directly in your web browser.
- Or use a simple local server like Live Server (VS Code Extension) or Python's HTTP server:
  ```bash
  cd ../frontend
  python -m http.server 8000
  ```
  Then visit `http://localhost:8000`.

## 📁 Project Structure

```
sentiment-analysis-dashboard/
│
├── frontend/             # HTML, CSS, JS files for the dashboard UI
├── backend/              # Python Flask APIs, DB initialization, and AI logic
├── dataset/              # Folder for sample datasets (CSV files)
├── uploads/              # Folder for user-uploaded CSV files
└── requirements.txt      # Python package dependencies
```

## 🤝 Contributing
Contributions are welcome! If you have suggestions to improve the NLP algorithms or UI design, please fork the repository and submit a pull request.
