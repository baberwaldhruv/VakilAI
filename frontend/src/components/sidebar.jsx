import React, { useState } from 'react';
import {
  PenSquare,
  Search,
  PanelLeftClose,
  PanelLeftOpen,
  Trash2,
  MessageSquare,
  LogOut,
  Sun,
  Moon,
  History,
  ShieldCheck,
  Zap,
  HelpCircle,
  ChevronRight,
  Languages
} from 'lucide-react';
import { useAuth } from '../Context/AuthContext';
import { useTheme } from '../Context/ThemeContext';
import { useLanguage } from '../Context/LanguageContext';
import { useNavigate } from 'react-router-dom';

export default function Sidebar({
  onNewChat,
  recentChats = [],
  onSelectChat,
  onClearHistory,
  onDeleteChat
}) {
  const [isOpen, setIsOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchInput, setShowSearchInput] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { lang, toggleLanguage, t } = useLanguage();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const filteredChats = recentChats.filter((chat) =>
    (chat.title || chat).toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <aside
      className={`${
        isOpen
          ? theme === 'dark'
            ? 'w-64 bg-[#131418]/85 backdrop-blur-xl border-r border-[#222630]/50'
            : 'w-64 bg-white/80 backdrop-blur-xl border-r border-slate-200/80 shadow-sm'
          : 'w-[68px] bg-transparent border-r border-transparent'
      } flex flex-col justify-between h-screen transition-all duration-300 ease-in-out select-none z-30 shrink-0 relative`}
    >
      <div className="flex flex-col p-3">
        {/* Header / Collapse Toggle */}
        <div className={`flex items-center mb-5 ${isOpen ? 'justify-between px-1' : 'justify-center'}`}>
          {isOpen ? (
            <>
              <button
                onClick={onNewChat}
                className="flex items-center gap-2.5 min-w-0 group cursor-pointer text-left hover:opacity-90 transition-opacity p-1 -ml-1 rounded-lg"
                title={t('newChat')}
              >
                <img
                  src="/VakilAI.png"
                  alt="VakilAI Logo"
                  className="w-6 h-6 object-contain rounded-md shrink-0 group-hover:scale-105 transition-transform"
                />
                {/* <span
                  className={`text-[16px] font-medium tracking-tight truncate ${
                    theme === 'dark' ? 'text-[#f1f5f9]' : 'text-slate-900'
                  }`}
                >
                  VakilAI
                </span> */}
              </button>

              <button
                onClick={() => {
                  setIsOpen(false);
                  setShowSearchInput(false);
                }}
                className={`p-2 rounded-xl transition-colors shrink-0 cursor-pointer ${
                  theme === 'dark'
                    ? 'hover:bg-[#1f232d]/60 text-[#94a3b8] hover:text-[#f1f5f9]'
                    : 'hover:bg-slate-100 text-slate-500 hover:text-slate-900'
                }`}
                title={t('collapseSidebar')}
              >
                <PanelLeftClose size={18} />
              </button>
            </>
          ) : (
            <div className="relative group/toggle flex items-center justify-center">
              <button
                onClick={() => setIsOpen(true)}
                className={`relative h-10 w-10 flex items-center justify-center rounded-xl transition-all cursor-pointer ${
                  theme === 'dark' ? 'hover:bg-[#1f232d]/80' : 'hover:bg-white/80 shadow-xs'
                }`}
              >
                <img
                  src="/VakilAI.png"
                  alt="VakilAI Logo"
                  className="w-6 h-6 object-contain rounded-md shrink-0 transition-opacity duration-200 group-hover/toggle:opacity-0"
                />
                <PanelLeftOpen
                  size={19}
                  className={`absolute opacity-0 group-hover/toggle:opacity-100 transition-opacity duration-200 ${
                    theme === 'dark' ? 'text-[#f1f5f9]' : 'text-slate-800'
                  }`}
                />
              </button>

              <div
                className={`pointer-events-none absolute left-[54px] z-50 hidden group-hover/toggle:flex items-center px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap shadow-xl animate-in fade-in zoom-in-95 duration-150 ${
                  theme === 'dark' ? 'bg-[#e3e3e3] text-[#131314]' : 'bg-[#1e293b] text-white'
                }`}
              >
                {t('openSidebar')}
              </div>
            </div>
          )}
        </div>

        {/* Core Actions */}
        <div className="flex flex-col gap-1.5">
          {/* New Chat */}
          <div className="relative group/btn flex items-center">
            <button
              onClick={onNewChat}
              className={`w-full flex items-center gap-3.5 rounded-xl transition-all cursor-pointer ${
                isOpen ? 'px-3 py-2 text-left' : 'justify-center p-2.5'
              } ${
                theme === 'dark'
                  ? 'hover:bg-[#1f232d]/60 text-[#cbd5e1] hover:text-white'
                  : 'hover:bg-slate-100 text-slate-700 hover:text-slate-950'
              }`}
            >
              <PenSquare
                size={18}
                className={`shrink-0 ${
                  theme === 'dark'
                    ? 'text-[#94a3b8] group-hover/btn:text-white'
                    : 'text-slate-500 group-hover/btn:text-slate-900'
                }`}
              />
              {isOpen && <span className="text-[13.5px] font-normal truncate">{t('newChat')}</span>}
            </button>

            {!isOpen && (
              <div
                className={`pointer-events-none absolute left-[54px] z-50 hidden group-hover/btn:flex items-center px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap shadow-xl animate-in fade-in zoom-in-95 duration-150 ${
                  theme === 'dark' ? 'bg-[#e3e3e3] text-[#131314]' : 'bg-[#1e293b] text-white'
                }`}
              >
                {t('newChat')}
              </div>
            )}
          </div>

          {/* Search Chats */}
          <div className="relative group/btn flex flex-col">
            <button
              onClick={() => {
                if (!isOpen) {
                  setIsOpen(true);
                  setShowSearchInput(true);
                } else {
                  setShowSearchInput(!showSearchInput);
                }
              }}
              className={`w-full flex items-center gap-3.5 rounded-xl transition-all cursor-pointer ${
                isOpen ? 'px-3 py-2 text-left' : 'justify-center p-2.5'
              } ${
                theme === 'dark'
                  ? showSearchInput && isOpen
                    ? 'bg-[#1f232d]/80 text-white'
                    : 'hover:bg-[#1f232d]/60 text-[#cbd5e1] hover:text-white'
                  : showSearchInput && isOpen
                  ? 'bg-slate-100 text-slate-900'
                  : 'hover:bg-slate-100 text-slate-700 hover:text-slate-950'
              }`}
            >
              <Search
                size={18}
                className={`shrink-0 ${
                  theme === 'dark'
                    ? 'text-[#94a3b8] group-hover/btn:text-white'
                    : 'text-slate-500 group-hover/btn:text-slate-900'
                }`}
              />
              {isOpen && <span className="text-[13.5px] font-normal truncate">{t('searchChats')}</span>}
            </button>

            {!isOpen && (
              <div
                className={`pointer-events-none absolute left-[54px] top-1/2 -translate-y-1/2 z-50 hidden group-hover/btn:flex items-center px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap shadow-xl animate-in fade-in zoom-in-95 duration-150 ${
                  theme === 'dark' ? 'bg-[#e3e3e3] text-[#131314]' : 'bg-[#1e293b] text-white'
                }`}
              >
                {t('searchChats')}
              </div>
            )}

            {isOpen && showSearchInput && (
              <div className="px-1 pt-1.5 pb-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('filterChats')}
                  className={`w-full border rounded-lg px-3 py-1.5 text-xs outline-none ${
                    theme === 'dark'
                      ? 'bg-[#17191e]/90 border-[#272b35] text-[#f1f5f9] placeholder-[#64748b] focus:border-[#475569]'
                      : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-blue-400'
                  }`}
                  autoFocus
                />
              </div>
            )}
          </div>
        </div>

        {/* Dynamic Chat History */}
        {isOpen && (
          <div
            className={`flex flex-col mt-5 border-t pt-3 overflow-hidden flex-1 animate-in fade-in duration-200 ${
              theme === 'dark' ? 'border-[#222630]/40' : 'border-slate-200/70'
            }`}
          >
            <div className="flex items-center justify-between px-2 mb-2">
              <span
                className={`text-[11px] font-medium uppercase tracking-wider ${
                  theme === 'dark' ? 'text-[#64748b]' : 'text-slate-400'
                }`}
              >
                {t('recent')}
              </span>
              {recentChats.length > 0 && (
                <button
                  onClick={onClearHistory}
                  className={`p-1 rounded-md transition-colors cursor-pointer ${
                    theme === 'dark' ? 'text-[#64748b] hover:text-red-400' : 'text-slate-400 hover:text-red-500'
                  }`}
                  title={t('clearHistory')}
                >
                  <Trash2 size={12} />
                </button>
              )}
            </div>

            <div className="overflow-y-auto max-h-[48vh] flex flex-col gap-1 pr-1 custom-scrollbar">
              {filteredChats.length === 0 ? (
                <div
                  className={`text-xs px-2 py-4 text-center ${
                    theme === 'dark' ? 'text-[#64748b]' : 'text-slate-400'
                  }`}
                >
                  {recentChats.length === 0 ? t('noConversations') : t('noMatchingChats')}
                </div>
              ) : (
                filteredChats.map((chat, idx) => (
                  <div
                    key={chat.sessionId || chat.id || idx}
                    onClick={() => onSelectChat && onSelectChat(chat)}
                    className={`group relative flex items-center justify-between px-2.5 py-2 rounded-lg text-[13px] transition-colors cursor-pointer ${
                      theme === 'dark'
                        ? 'hover:bg-[#1f232d]/70 text-[#cbd5e1] hover:text-white'
                        : 'hover:bg-slate-100 text-slate-700 hover:text-slate-950'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1 pr-2">
                      <MessageSquare
                        size={14}
                        className={`shrink-0 ${
                          theme === 'dark'
                            ? 'text-[#64748b] group-hover:text-[#93c5fd]'
                            : 'text-slate-400 group-hover:text-blue-600'
                        }`}
                      />
                      <span className="truncate">{chat.title || chat}</span>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onDeleteChat) onDeleteChat(e, chat);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1.5 rounded-md hover:bg-red-500/20 text-[#64748b] hover:text-red-400 transition-all shrink-0 cursor-pointer"
                      title="Delete chat"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* User Profile Footer */}
      <div
        className={`p-3 relative ${
          isOpen
            ? theme === 'dark'
              ? 'border-t border-[#222630]/40 px-3'
              : 'border-t border-slate-200/70 px-3'
            : 'border-t-0 justify-center'
        } flex items-center justify-between`}
      >
        <button
          onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
          className={`flex items-center gap-2.5 min-w-0 rounded-xl p-1.5 transition-colors cursor-pointer text-left ${
            isOpen ? 'flex-1 mr-1' : 'justify-center'
          } ${theme === 'dark' ? 'hover:bg-[#1f232d]/60' : 'hover:bg-slate-100'}`}
          title="Settings & Profile"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-rose-500 flex items-center justify-center text-xs font-semibold text-white shrink-0 shadow-sm">
            {user?.name ? user.name[0].toUpperCase() : 'U'}
          </div>
          {isOpen && (
            <div className="flex flex-col min-w-0">
              <span className={`text-xs font-medium truncate ${theme === 'dark' ? 'text-[#f1f5f9]' : 'text-slate-800'}`}>
                {user?.name || 'User'}
              </span>
              <span className={`text-[10px] truncate ${theme === 'dark' ? 'text-[#64748b]' : 'text-slate-400'}`}>
                {user?.email || 'Free Plan'}
              </span>
            </div>
          )}
        </button>

        {/* Gemini-Style Settings Popover Menu */}
        {profileDropdownOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setProfileDropdownOpen(false)}
            />
            <div
              className={`absolute bottom-14 ${
                isOpen ? 'left-3 w-64' : 'left-14 w-64'
              } rounded-2xl p-2 shadow-2xl z-50 flex flex-col backdrop-blur-2xl border animate-in fade-in zoom-in-95 duration-150 max-h-[460px] overflow-y-auto custom-scrollbar ${
                theme === 'dark'
                  ? 'bg-[#17191e]/95 border-[#272b35] text-[#e3e3e3]'
                  : 'bg-white/95 border-slate-200 text-slate-800 shadow-slate-300/50'
              }`}
            >
              {/* Account summary */}
              <div
                className={`px-3 py-2 border-b mb-1 ${
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

              {/* Menu Options */}
              <div className="flex flex-col gap-0.5 text-[13px]">
                <button
                  onClick={() => setProfileDropdownOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-xl transition text-left cursor-pointer ${
                    theme === 'dark' ? 'hover:bg-[#1f232d]' : 'hover:bg-slate-100'
                  }`}
                >
                  <History size={16} className={theme === 'dark' ? 'text-[#94a3b8]' : 'text-slate-500'} />
                  <span>{t('activity')}</span>
                </button>

                <button
                  onClick={() => setProfileDropdownOpen(false)}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl transition text-left cursor-pointer ${
                    theme === 'dark' ? 'hover:bg-[#1f232d]' : 'hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <ShieldCheck size={16} className={theme === 'dark' ? 'text-[#94a3b8]' : 'text-slate-500'} />
                    <span>{t('personalIntelligence')}</span>
                  </div>
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                </button>

                <button
                  onClick={() => setProfileDropdownOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-xl transition text-left cursor-pointer ${
                    theme === 'dark' ? 'hover:bg-[#1f232d]' : 'hover:bg-slate-100'
                  }`}
                >
                  <Zap size={16} className={theme === 'dark' ? 'text-[#94a3b8]' : 'text-slate-500'} />
                  <span>{t('usageLimits')}</span>
                </button>

                {/* Language Switch */}
                <button
                  onClick={toggleLanguage}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl transition text-left cursor-pointer ${
                    theme === 'dark' ? 'hover:bg-[#1f232d]' : 'hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Languages size={16} className={theme === 'dark' ? 'text-[#94a3b8]' : 'text-slate-500'} />
                    <span>{t('language')}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs font-semibold text-blue-500">
                    <span>{lang === 'en' ? 'English' : 'हिंदी'}</span>
                    <ChevronRight size={14} />
                  </div>
                </button>

                {/* Theme Switch */}
                <button
                  onClick={toggleTheme}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl transition text-left cursor-pointer ${
                    theme === 'dark' ? 'hover:bg-[#1f232d]' : 'hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {theme === 'dark' ? (
                      <Moon size={16} className="text-blue-400" />
                    ) : (
                      <Sun size={16} className="text-amber-500" />
                    )}
                    <span>{t('theme')}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs opacity-60">
                    <span>{theme === 'dark' ? 'Dark' : 'Light'}</span>
                    <ChevronRight size={14} />
                  </div>
                </button>

                <button
                  onClick={() => setProfileDropdownOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-xl transition text-left cursor-pointer ${
                    theme === 'dark' ? 'hover:bg-[#1f232d]' : 'hover:bg-slate-100'
                  }`}
                >
                  <HelpCircle size={16} className={theme === 'dark' ? 'text-[#94a3b8]' : 'text-slate-500'} />
                  <span>{t('help')}</span>
                </button>

                <div
                  className={`my-1 border-t ${
                    theme === 'dark' ? 'border-[#272b35]/60' : 'border-slate-100'
                  }`}
                />

                {/* Sign Out */}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-3 py-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition text-left cursor-pointer"
                >
                  <LogOut size={16} />
                  <span>{t('signOut')}</span>
                </button>
              </div>
            </div>
          </>
        )}

        {isOpen && (
          <button
            onClick={handleLogout}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer shrink-0 ${
              theme === 'dark'
                ? 'hover:bg-[#1f232d]/60 text-[#64748b] hover:text-red-400'
                : 'hover:bg-slate-100 text-slate-400 hover:text-red-500'
            }`}
            title={t('signOut')}
          >
            <LogOut size={15} />
          </button>
        )}
      </div>
    </aside>
  );
}