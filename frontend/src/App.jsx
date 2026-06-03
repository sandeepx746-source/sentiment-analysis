
import { useState } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";

function App() {
  const [text, setText] = useState("");
  const [result, setResult] = useState("");

  const analyzeSentiment = async () => {
    const genAI = new GoogleGenerativeAI(
      import.meta.env.VITE_GEMINI_API_KEY
    );

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
    });

    const prompt = `
    Analyze the sentiment of this text:
    "${text}"

    Give:
    - Sentiment
    - Short explanation
    `;

    const response = await model.generateContent(prompt);

    setResult(response.response.text());
  };

  return (
    <div style={{ padding: "40px", fontFamily: "Arial" }}>
      <h1>AI Sentiment Analysis</h1>

      <textarea
        rows="6"
        cols="50"
        placeholder="Enter text..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      <br /><br />

      <button onClick={analyzeSentiment}>
        Analyze
      </button>

      <h3>Result:</h3>
      <pre>{result}</pre>
    </div>
  );
}

export default App;