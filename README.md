# AI Social Media Sentiment Analyzer

A complete full-stack web application with a futuristic glassmorphism UI to analyze social media sentiments and detect fake reviews.

## Tech Stack
- **Frontend**: React + Vite + Tailwind CSS v4 + Recharts + Framer Motion
- **Backend**: Node.js + Express + SQLite
- **Auth**: JWT Login System
- **CSV Parsing**: PapaParse

## Features
- Futuristic glassmorphism dashboard with Recharts visualizations
- JWT Authentication (Login/Signup)
- Mock Social Media Account Connections (Instagram, Twitter, YouTube)
- NLP Sentiment Analysis (Positive, Negative, Neutral)
- Fake Review Detector scoring
- CSV Upload System for bulk processing
- AI Chatbot Assistant floating widget
- Real-time Analytics Simulation

## Setup & Installation (VS Code Friendly)

### 1. Backend Setup
1. Open terminal and navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the server (runs on `http://localhost:5000`):
   ```bash
   npm run start
   # or
   node server.js
   ```

### 2. Frontend Setup
1. Open a new terminal and navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Open the displayed local URL (typically `http://localhost:5173`) in your browser.

## Beginner Tips
- **Database**: The SQLite database (`app.db`) will be automatically created in the `backend/database/` folder when you run the server for the first time.
- **Uploads**: CSV files are temporarily stored in `backend/uploads/` during processing and then automatically deleted.
- **Styling**: All the futuristic glowing styles are located in `frontend/src/index.css`.
