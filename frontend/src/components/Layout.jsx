import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, BarChart2, Upload, Share2, LogOut, MessageSquare } from 'lucide-react';
import Chatbot from './Chatbot';

const Layout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showChatbot, setShowChatbot] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/app', icon: <Home size={20} /> },
    { name: 'Analytics', path: '/app/analytics', icon: <BarChart2 size={20} /> },
    { name: 'Upload CSV', path: '/app/upload', icon: <Upload size={20} /> },
    { name: 'Social Connect', path: '/app/social', icon: <Share2 size={20} /> },
  ];

  return (
    <div className="flex h-screen bg-transparent text-white overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 glass-panel m-4 flex flex-col justify-between">
        <div>
          <div className="p-6">
            <h1 className="text-2xl font-bold neon-text-blue tracking-wider">AI Senti</h1>
          </div>
          <nav className="mt-6 px-4 space-y-2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                    isActive
                      ? 'bg-gradient-to-r from-[var(--color-neon-blue)] to-[var(--color-neon-purple)] shadow-lg shadow-[var(--color-neon-blue)]/20'
                      : 'hover:bg-white/5'
                  }`}
                >
                  {item.icon}
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="p-4">
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 w-full px-4 py-3 rounded-xl hover:bg-white/5 transition-all text-red-400 hover:text-red-300"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col relative m-4 ml-0 glass-panel overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 border-b border-white/5 flex items-center justify-between px-6">
          <h2 className="text-xl font-semibold capitalize">{location.pathname.split('/').pop() || 'Dashboard'}</h2>
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[var(--color-neon-blue)] to-[var(--color-neon-purple)] flex items-center justify-center animate-pulse-slow">
              <span className="font-bold text-sm">AI</span>
            </div>
          </div>
        </header>
        
        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6 scroll-smooth">
          <Outlet />
        </main>

        {/* AI Chatbot FAB */}
        <div className="absolute bottom-6 right-6">
          <button 
            onClick={() => setShowChatbot(!showChatbot)}
            className="w-14 h-14 rounded-full bg-gradient-to-tr from-[var(--color-neon-blue)] to-[var(--color-neon-purple)] flex items-center justify-center neon-glow-purple transition-transform hover:scale-110"
          >
            <MessageSquare size={24} />
          </button>
          {showChatbot && (
            <div className="absolute bottom-20 right-0">
              <Chatbot onClose={() => setShowChatbot(false)} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Layout;
