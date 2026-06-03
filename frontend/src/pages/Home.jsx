import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Activity, ShieldAlert, BarChart3 } from 'lucide-react';

const Home = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[var(--color-neon-blue)]/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[var(--color-neon-purple)]/20 rounded-full blur-[100px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center z-10"
      >
        <div className="inline-block px-4 py-1.5 rounded-full border border-[var(--color-neon-blue)]/30 bg-[var(--color-neon-blue)]/10 text-[var(--color-neon-blue)] text-sm font-medium mb-6">
          v2.0 Advanced Analytics Live
        </div>
        <h1 className="text-6xl font-extrabold mb-6 tracking-tight">
          AI Social Media <br /> 
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-neon-blue)] to-[var(--color-neon-purple)]">
            Sentiment Analyzer
          </span>
        </h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10">
          Uncover hidden insights, detect fake reviews, and monitor your brand's reputation with our futuristic NLP engine.
        </p>

        <div className="flex items-center justify-center space-x-6 mb-16">
          <Link to="/login" className="px-8 py-4 rounded-xl bg-gradient-to-r from-[var(--color-neon-blue)] to-[var(--color-neon-purple)] font-bold text-white shadow-lg neon-glow-blue hover:scale-105 transition-transform">
            Get Started Free
          </Link>
          <a href="#features" className="px-8 py-4 rounded-xl glass-panel font-bold hover:bg-white/10 transition-colors">
            View Features
          </a>
        </div>
      </motion.div>

      {/* Features Grid */}
      <div id="features" className="grid md:grid-cols-3 gap-6 max-w-5xl z-10 px-6">
        {[
          { icon: <Activity size={32} className="text-blue-400"/>, title: "Real-time Sentiment", desc: "Analyze text and comments instantly to determine Positive, Negative, or Neutral mood." },
          { icon: <ShieldAlert size={32} className="text-purple-400"/>, title: "Fake Review Detector", desc: "Our AI model flags suspicious patterns, spam bots, and overly promotional content." },
          { icon: <BarChart3 size={32} className="text-pink-400"/>, title: "Deep Analytics", desc: "Upload CSVs to generate beautiful charts and insights from thousands of posts." }
        ].map((feat, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + (idx * 0.1) }}
            className="glass-panel p-6 flex flex-col items-center text-center hover:border-white/20 transition-colors"
          >
            <div className="mb-4 p-3 bg-white/5 rounded-2xl">
              {feat.icon}
            </div>
            <h3 className="text-xl font-bold mb-2">{feat.title}</h3>
            <p className="text-gray-400 text-sm">{feat.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Home;
