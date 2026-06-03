import React, { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, AlertTriangle, MessageCircle, Share2 } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../services/api';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const res = await api.get('/stats');
      setStats(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    // Simulate real-time updates
    const interval = setInterval(() => {
      fetchStats();
    }, 15000); // 15s refresh
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="w-16 h-16 border-4 border-[var(--color-neon-blue)] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const pieData = [
    { name: 'Positive', value: Number(stats?.rawCounts?.positiveCount) || 0, color: '#00f3ff' },
    { name: 'Negative', value: Number(stats?.rawCounts?.negativeCount) || 0, color: '#ff003c' },
    { name: 'Neutral', value: Number(stats?.rawCounts?.neutralCount) || 0, color: '#bc13fe' }
  ];

  const StatBox = ({ title, value, icon, delay }) => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="glass-panel p-6 flex items-center justify-between hover:scale-105 transition-transform"
    >
      <div>
        <h3 className="text-gray-400 text-sm uppercase tracking-wider mb-2">{title}</h3>
        <p className="text-3xl font-bold">{value}</p>
      </div>
      <div className="p-3 bg-white/5 rounded-2xl text-[var(--color-neon-blue)] neon-glow-blue">
        {icon}
      </div>
    </motion.div>
  );

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-4 gap-6">
        <StatBox title="Total Analyzed" value={stats?.totalPosts || 0} icon={<MessageCircle size={24}/>} delay={0.1} />
        <StatBox title="Positive Sent." value={`${stats?.positivePct || 0}%`} icon={<TrendingUp size={24}/>} delay={0.2} />
        <StatBox title="Avg Fake Score" value={`${stats?.avgFakeScore || 0}%`} icon={<AlertTriangle size={24}/>} delay={0.3} />
        <StatBox title="Top Platform" value={stats?.activePlatform || 'None'} icon={<Share2 size={24}/>} delay={0.4} />
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="md:col-span-2 glass-panel p-6"
        >
          <h3 className="text-lg font-semibold mb-6">Sentiment Trends (7 Days)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats?.trendData || []}>
                <defs>
                  <linearGradient id="colorPos" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-neon-blue)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--color-neon-blue)" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorNeg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ff003c" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ff003c" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid #333', borderRadius: '8px' }} />
                <Area type="monotone" dataKey="positive" stroke="var(--color-neon-blue)" fillOpacity={1} fill="url(#colorPos)" />
                <Area type="monotone" dataKey="negative" stroke="#ff003c" fillOpacity={1} fill="url(#colorNeg)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 }}
          className="glass-panel p-6 flex flex-col"
        >
          <h3 className="text-lg font-semibold mb-6">Overall Sentiment</h3>
          <div className="flex-1 min-h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: 'none', borderRadius: '8px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center space-x-4 mt-4">
            {pieData.map(d => (
              <div key={d.name} className="flex items-center space-x-2 text-sm">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }}></div>
                <span>{d.name}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
