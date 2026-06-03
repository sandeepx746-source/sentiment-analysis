# Viva Questions & Answers

**Q1: What is Sentiment Analysis and how does it work in your project?**
**Answer:** Sentiment Analysis is a Natural Language Processing (NLP) technique used to determine whether data is positive, negative, or neutral. In this project, I used VADER (Valence Aware Dictionary and sEntiment Reasoner) and TextBlob. These libraries analyze words based on a pre-defined lexicon to assign polarity scores (from -1 to 1) and calculate the overall emotional tone of a sentence.

**Q2: Why did you choose Flask for the backend over Django or Node.js?**
**Answer:** I chose Flask because it is a lightweight, micro web framework for Python. Since my core logic (sentiment analysis, NLP, data manipulation) is heavily Python-dependent (utilizing TextBlob and Pandas), Flask provided the fastest and most efficient way to expose these Python functions as RESTful APIs without the heavy overhead that comes with Django. 

**Q3: Explain the concept of Glassmorphism and how you achieved it in CSS.**
**Answer:** Glassmorphism is a UI design trend that creates a frosted glass effect. I achieved this in CSS by using a semi-transparent background color (`rgba()`) combined with the `backdrop-filter: blur()` property. I also added a subtle border and a drop shadow to give the panel depth, making it look like it's floating above the background.

**Q4: How does your Fake Review Detector work?**
**Answer:** For the MVP, it utilizes a heuristic approach rather than complex ML. It scans the text for specific spam keywords (e.g., "click here", "buy now"), excessive punctuation, multiple URLs, and unnatural character repetitions. Based on these flags, it calculates a probability score. If the score crosses a certain threshold, the comment is flagged as a potential fake or spam review.

**Q5: How do the frontend and backend communicate?**
**Answer:** They communicate via RESTful APIs. The frontend uses the asynchronous JavaScript `fetch()` API to send HTTP POST and GET requests to the Flask server. Data (like user input for real-time analysis) is sent in JSON format, and the backend processes it and returns a JSON response containing the sentiment scores, which the frontend then parses to dynamically update the DOM.

**Q6: How did you implement the animations?**
**Answer:** I used a combination of pure CSS keyframes (for continuous neon glowing and pulse effects) and the GSAP (GreenSock Animation Platform) library. GSAP was used for more complex, staggered entry animations (like the live social feed items sliding in) and for the smooth, bounce-like toggling of the AI chatbot window.

**Q7: What happens when a user uploads a CSV file?**
**Answer:** The frontend sends the CSV file using `FormData` via a POST request to the `/api/upload_csv` endpoint. The Flask backend receives it, uses the `pandas` library to read the CSV into a DataFrame, and iterates through the 'comment' column. Each row is analyzed for sentiment and spam, and aggregated statistics (percentages, total counts) are returned to the frontend along with the individual results.
