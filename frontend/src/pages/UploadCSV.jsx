import React, { useState } from 'react';
import { UploadCloud, CheckCircle, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../services/api';

const UploadCSV = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setResult(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.post('/upload/csv', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setResult({ type: 'success', data: res.data });
    } catch (err) {
      setResult({ type: 'error', message: err.response?.data?.message || 'Upload failed' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-3xl mx-auto space-y-6"
    >
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold mb-4">Bulk Analysis via CSV</h2>
        <p className="text-gray-400">Upload a CSV containing your social media data. Must include a 'Comment' or 'text' column.</p>
      </div>

      <div className="glass-panel p-10 border-dashed border-2 border-white/20 hover:border-[var(--color-neon-blue)] transition-colors flex flex-col items-center justify-center rounded-2xl relative group cursor-pointer">
        <input 
          type="file" 
          accept=".csv"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          onChange={(e) => setFile(e.target.files[0])}
        />
        <UploadCloud size={64} className="text-[var(--color-neon-blue)] mb-4 group-hover:scale-110 transition-transform" />
        <h3 className="text-xl font-semibold mb-2">
          {file ? file.name : "Drag & Drop or Click to Browse"}
        </h3>
        <p className="text-sm text-gray-400">CSV files only (Max 5MB)</p>
      </div>

      {file && (
        <div className="flex justify-center">
          <button 
            onClick={handleUpload}
            disabled={loading}
            className="px-8 py-3 rounded-xl bg-gradient-to-r from-[var(--color-neon-blue)] to-[var(--color-neon-purple)] font-bold text-white shadow-lg neon-glow-blue hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Upload & Analyze'}
          </button>
        </div>
      )}

      {result && result.type === 'success' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl flex items-center space-x-3 text-green-400">
          <CheckCircle size={24} />
          <div>
            <p className="font-semibold">Upload Successful!</p>
            <p className="text-sm">Processed {result.data.processed} rows. {result.data.errors} errors skipped.</p>
          </div>
        </motion.div>
      )}

      {result && result.type === 'error' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center space-x-3 text-red-400">
          <AlertCircle size={24} />
          <p className="font-semibold">{result.message}</p>
        </motion.div>
      )}
    </motion.div>
  );
};

export default UploadCSV;
