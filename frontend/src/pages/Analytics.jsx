import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Activity, AlertTriangle } from 'lucide-react';
import api from '../services/api';

const Analytics = () => {
  const [text, setText] = useState('');
  const [platform, setPlatform] = useState('Instagram');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);

  const fetchHistory = async () => {
    try {
      const res = await api.get('/sentiment/history');
      setHistory(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleAnalyze = async () => {
    if (!text) return;
    setLoading(true);
    try {
      const res = await api.post('/sentiment/analyze', { text, platform });
      setResult(res.data);
      fetchHistory();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="space-y-6">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-panel p-6"
        >
          <h2 className="text-xl font-bold mb-4">Quick Analysis</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-2 uppercase">Platform</label>
              <select 
                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[var(--color-neon-blue)]"
                value={platform}
                onChange={e => setPlatform(e.target.value)}
              >
                <option value="Instagram">Instagram</option>
                <option value="Twitter">Twitter / X</option>
                <option value="YouTube">YouTube</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-2 uppercase">Comment / Post Text</label>
              <textarea 
                rows="5"
                placeholder="Paste text here to analyze sentiment and check for fake reviews..."
                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[var(--color-neon-blue)] resize-none"
                value={text}
                onChange={e => setText(e.target.value)}
              />
            </div>
            <button 
              onClick={handleAnalyze}
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[var(--color-neon-blue)] to-[var(--color-neon-purple)] font-bold text-white shadow-lg neon-glow-blue hover:opacity-90 transition-opacity flex items-center justify-center space-x-2"
            >
              {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <><Play size={18} /><span>Analyze</span></>}
            </button>
          </div>
        </motion.div>

        {result && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-panel p-6"
          >
            <h3 className="text-lg font-bold mb-4">Analysis Result</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                <div className="text-sm text-gray-400 mb-1 flex items-center"><Activity size={14} className="mr-1"/> Sentiment</div>
                <div className={`text-2xl font-bold ${result.sentiment === 'Positive' ? 'text-green-400' : result.sentiment === 'Negative' ? 'text-red-400' : 'text-purple-400'}`}>
                  {result.sentiment}
                </div>
              </div>
              <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                <div className="text-sm text-gray-400 mb-1 flex items-center"><AlertTriangle size={14} className="mr-1"/> Fake Score</div>
                <div className="text-2xl font-bold text-[var(--color-neon-blue)]">
                  {result.fakeScore}%
                </div>
              </div>
            </div>
            <div className="mt-4 p-3 bg-black/30 rounded-xl text-sm">
              <span className="text-gray-400">AI Confidence:</span> {result.confidence}%
            </div>
          </motion.div>
        )}
      </div>

      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="glass-panel p-6 flex flex-col h-[calc(100vh-140px)]"
      >
        <h2 className="text-xl font-bold mb-4">Recent History</h2>
        <div className="flex-1 overflow-y-auto space-y-3 pr-2 scroll-smooth">
          {history.length === 0 ? (
            <p className="text-gray-400 text-center py-10">No history available yet.</p>
          ) : (
            history.map(item => (
              <div key={item.id} className="p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-semibold px-2 py-1 bg-[var(--color-neon-blue)]/20 text-[var(--color-neon-blue)] rounded">{item.platform}</span>
                  <span className="text-xs text-gray-400">{new Date(item.created_at).toLocaleDateString()}</span>
                </div>
                <p className="text-sm mb-3 line-clamp-2">{item.content}</p>
                <div className="flex justify-between items-center text-xs font-medium">
                  <span className={`${item.sentiment === 'Positive' ? 'text-green-400' : item.sentiment === 'Negative' ? 'text-red-400' : 'text-purple-400'}`}>
                    {item.sentiment}
                  </span>
                  <span className="text-orange-400">Fake: {item.fake_score}%</span>
                </div>
              </div>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Analytics;
