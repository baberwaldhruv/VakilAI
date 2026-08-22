import React, { useState } from 'react';
import { User, LogOut, Sun, Moon, Languages } from 'lucide-react';
import { useAuth } from '../Context/AuthContext';
import { useTheme } from '../Context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../Context/LanguageContext';

export default function Header({ onNewChat }) {
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { lang, toggleLanguage } = useLanguage();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const handleBrandClick = () => {
    if (onNewChat) {
      onNewChat();
    } else {
      navigate('/');
    }
  };

  return (
    <header className="w-full flex justify-between items-center px-6 py-4 bg-transparent z-30 select-none pointer-events-auto">
      {/* Brand Title */}
      <button
        onClick={handleBrandClick}
        className="flex items-center gap-2 cursor-pointer opacity-90 hover:opacity-100 transition-opacity bg-transparent border-0 p-0 text-left"
        title="Start a new chat"
      >
        <span
          className={`text-xl font-normal tracking-tight ${
            theme === 'dark' ? 'text-[#e3e3e3]' : 'text-[#1e293b]'
          }`}
        >
          VakilAI
        </span>
      </button>

      {/* Right Controls: Language Switcher, Theme Toggle & Avatar */}
      <div className="flex items-center gap-2.5">
        {/* Language Toggle Pill */}
        <button
          onClick={toggleLanguage}
          className={`h-8 px-3 flex items-center gap-1.5 rounded-full border text-xs font-semibold transition-all cursor-pointer ${
            theme === 'dark'
              ? 'bg-[#1e2025]/80 hover:bg-[#282b33] text-[#93c5fd] border-[#2d3139]/80'
              : 'bg-white/80 hover:bg-white text-blue-600 border-slate-200/80 shadow-sm'
          }`}
          title="Switch Language / भाषा बदलें"
        >
          <Languages size={14} />
          <span>{lang === 'en' ? 'हिन्दी' : 'EN'}</span>
        </button>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className={`h-8 w-8 flex items-center justify-center rounded-full border transition-all cursor-pointer ${
            theme === 'dark'
              ? 'bg-[#1e2025]/80 hover:bg-[#282b33] text-[#93c5fd] border-[#2d3139]/80'
              : 'bg-white/80 hover:bg-white text-amber-500 border-slate-200/80 shadow-sm'
          }`}
          title={`Current: ${theme === 'dark' ? 'Dark' : 'Light'} mode (click to switch)`}
        >
          {theme === 'dark' ? <Moon size={15} /> : <Sun size={15} />}
        </button>

        {/* User Profile */}
        <div className="relative">
          <button
            onClick={() => setUserDropdownOpen(!userDropdownOpen)}
            className={`h-8 w-8 flex items-center justify-center rounded-full border backdrop-blur-md transition-all font-medium text-xs cursor-pointer shadow-sm ${
              theme === 'dark'
                ? 'bg-[#1e2025]/80 hover:bg-[#282b33] text-[#c4c7c5] hover:text-white border-[#2d3139]/80'
                : 'bg-white/90 hover:bg-white text-slate-700 border-slate-200/90'
            }`}
            title="Account"
          >
            {user?.name ? user.name[0].toUpperCase() : <User size={15} />}
          </button>

          {userDropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-20"
                onClick={() => setUserDropdownOpen(false)}
              />
              <div
                className={`absolute top-11 right-0 w-56 rounded-2xl p-2 shadow-2xl z-30 flex flex-col gap-1 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150 ${
                  theme === 'dark'
                    ? 'bg-[#17191e]/95 border border-[#272b35]'
                    : 'bg-white/95 border border-slate-200 shadow-slate-300/50'
                }`}
              >
                <div
                  className={`px-3 py-2 border-b ${
                    theme === 'dark' ? 'border-[#272b35]/60' : 'border-slate-100'
                  }`}
                >
                  <div
                    className={`text-xs font-semibold truncate ${
                      theme === 'dark' ? 'text-[#f1f5f9]' : 'text-slate-900'
                    }`}
                  >
                    {user?.name || 'User'}
                  </div>
                  <div
                    className={`text-[11px] truncate ${
                      theme === 'dark' ? 'text-[#94a3b8]' : 'text-slate-500'
                    }`}
                  >
                    {user?.email || 'user@example.com'}
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2.5 px-3 py-2 text-xs text-red-500 hover:bg-red-500/10 rounded-xl transition text-left mt-1 cursor-pointer"
                >
                  <LogOut size={14} />
                  <span>Sign out</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}