import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Instagram, Twitter, Youtube, Facebook, Link2, CheckCircle2 } from 'lucide-react';

const SocialConnect = () => {
  const [connected, setConnected] = useState({
    instagram: false,
    twitter: false,
    youtube: true,
    facebook: false
  });

  const handleConnect = (platform) => {
    // Simulate OAuth connection delay
    setTimeout(() => {
      setConnected(prev => ({ ...prev, [platform]: !prev[platform] }));
    }, 800);
  };

  const platforms = [
    { id: 'instagram', name: 'Instagram', icon: <Instagram size={32} />, color: 'from-purple-500 to-pink-500', mockFollowers: '12.4k', mockEngagement: '4.8%' },
    { id: 'twitter', name: 'Twitter / X', icon: <Twitter size={32} />, color: 'from-blue-400 to-blue-600', mockFollowers: '5.2k', mockEngagement: '2.1%' },
    { id: 'youtube', name: 'YouTube', icon: <Youtube size={32} />, color: 'from-red-500 to-red-600', mockFollowers: '105k', mockEngagement: '8.4%' },
    { id: 'facebook', name: 'Facebook', icon: <Facebook size={32} />, color: 'from-blue-600 to-blue-800', mockFollowers: '3.1k', mockEngagement: '1.2%' }
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h2 className="text-3xl font-bold mb-2">Connected Accounts</h2>
        <p className="text-gray-400 text-sm">Link your social media accounts to sync posts and comments automatically (Mocked for educational purposes).</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {platforms.map((plat, idx) => (
          <motion.div 
            key={plat.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className={`glass-panel p-6 border ${connected[plat.id] ? 'border-[var(--color-neon-blue)]' : 'border-white/10'}`}
          >
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center space-x-4">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${plat.color} flex items-center justify-center text-white shadow-lg`}>
                  {plat.icon}
                </div>
                <div>
                  <h3 className="text-xl font-bold">{plat.name}</h3>
                  <p className="text-xs text-gray-400">
                    {connected[plat.id] ? 'Active connection' : 'Not connected'}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => handleConnect(plat.id)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold flex items-center space-x-2 transition-colors ${
                  connected[plat.id] 
                    ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' 
                    : 'bg-white/10 hover:bg-white/20'
                }`}
              >
                {connected[plat.id] ? <><CheckCircle2 size={16}/><span>Connected</span></> : <><Link2 size={16}/><span>Connect</span></>}
              </button>
            </div>

            {connected[plat.id] && (
              <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-white/10">
                <div>
                  <div className="text-xs text-gray-400 mb-1">Mock Followers</div>
                  <div className="text-lg font-bold text-white">{plat.mockFollowers}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-400 mb-1">Mock Engagement Rate</div>
                  <div className="text-lg font-bold text-white">{plat.mockEngagement}</div>
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default SocialConnect;
