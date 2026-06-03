import React, { useState } from 'react';
import { Send, X, Bot, User } from 'lucide-react';
import { motion } from 'framer-motion';

const Chatbot = ({ onClose }) => {
  const [messages, setMessages] = useState([
    { text: "Hello! I'm your AI Sentiment Assistant. How can I help you today?", isBot: true }
  ]);
  const [input, setInput] = useState('');

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = { text: input, isBot: false };
    setMessages([...messages, userMsg]);
    setInput('');

    // Mock AI Response
    setTimeout(() => {
      let botResponse = "I can analyze sentiment in real-time. Try uploading a CSV or pasting text in the Analytics tab!";
      const lower = userMsg.text.toLowerCase();
      if (lower.includes('fake')) botResponse = "Our AI looks for spam keywords, repetitive patterns, and all-caps text to flag potential fake reviews.";
      if (lower.includes('sentiment')) botResponse = "We classify text into Positive, Negative, or Neutral based on NLP heuristics.";
      
      setMessages(prev => [...prev, { text: botResponse, isBot: true }]);
    }, 1000);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 50, scale: 0.9 }}
      className="w-80 h-96 glass-panel flex flex-col overflow-hidden neon-glow-blue"
    >
      <div className="h-14 border-b border-white/5 flex items-center justify-between px-4 bg-white/5">
        <div className="flex items-center space-x-2">
          <Bot size={20} className="text-[var(--color-neon-blue)]" />
          <span className="font-semibold">AI Assistant</span>
        </div>
        <button onClick={onClose} className="hover:text-red-400 transition-colors">
          <X size={20} />
        </button>
      </div>
      
      <div className="flex-1 p-4 overflow-y-auto space-y-4 flex flex-col">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.isBot ? 'justify-start' : 'justify-end'}`}>
            <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
              msg.isBot 
                ? 'bg-white/10 rounded-tl-none border border-white/5' 
                : 'bg-gradient-to-r from-[var(--color-neon-blue)] to-[var(--color-neon-purple)] rounded-tr-none'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSend} className="p-3 border-t border-white/5 flex items-center space-x-2 bg-black/20">
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask AI..."
          className="flex-1 bg-transparent border-none outline-none text-sm placeholder-white/30"
        />
        <button type="submit" className="text-[var(--color-neon-blue)] hover:text-white transition-colors">
          <Send size={18} />
        </button>
      </form>
    </motion.div>
  );
};

export default Chatbot;
