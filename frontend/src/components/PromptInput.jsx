import React, { useRef, useEffect } from 'react';
import { SendHorizontal, Plus, Mic } from 'lucide-react';
import { useTheme } from '../Context/ThemeContext';

export default function PromptInput({ input, setInput, onSubmit, loading }) {
  const textareaRef = useRef(null);
  const { theme } = useTheme();

  // Auto-grow textarea height up to 160px
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  }, [input]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSubmit();
    }
  };

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 pt-8 pb-4 z-10 pointer-events-none transition-colors duration-300 ${
        theme === 'dark'
          ? 'bg-gradient-to-t from-[#0e0f12] via-[#0e0f12]/90 to-transparent'
          : 'bg-gradient-to-t from-[#eef5fc] via-[#eef5fc]/90 to-transparent'
      }`}
    >
      <div className="max-w-3xl mx-auto px-4 pointer-events-auto">
        <div
          className={`flex items-end gap-3 rounded-3xl px-4 py-3 transition-all shadow-2xl backdrop-blur-md border ${
            theme === 'dark'
              ? 'bg-[#17191e]/90 border-[#272b35] hover:border-[#383a3d] focus-within:border-[#444746]'
              : 'bg-white/95 border-slate-200 hover:border-slate-300 focus-within:border-blue-400 shadow-slate-200/80'
          }`}
        >
          {/* Attach Button */}
          <button
            type="button"
            className={`p-1.5 rounded-full transition-colors mb-0.5 cursor-pointer ${
              theme === 'dark'
                ? 'hover:bg-[#232730] text-[#94a3b8] hover:text-[#f1f5f9]'
                : 'hover:bg-slate-100 text-slate-400 hover:text-slate-700'
            }`}
            title="Add files"
          >
            <Plus size={18} />
          </button>

          {/* Auto-expanding Input Area */}
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            placeholder="Ask VakilAI anything about legal clauses, RTI, or rights..."
            className={`flex-1 bg-transparent text-[14px] outline-none resize-none overflow-y-auto leading-relaxed max-h-40 py-0.5 ${
              theme === 'dark'
                ? 'text-[#f1f5f9] placeholder-[#64748b]'
                : 'text-slate-900 placeholder-slate-400'
            }`}
          />

          {/* Tools & Send Button */}
          <div className="flex items-center gap-1.5 mb-0.5">
            <button
              type="button"
              className={`p-1.5 rounded-full transition-colors cursor-pointer ${
                theme === 'dark'
                  ? 'hover:bg-[#232730] text-[#94a3b8] hover:text-[#f1f5f9]'
                  : 'hover:bg-slate-100 text-slate-400 hover:text-slate-700'
              }`}
              title="Voice Input"
            >
              <Mic size={18} />
            </button>

            <button
              onClick={() => onSubmit()}
              disabled={!input.trim() || loading}
              className={`p-2 rounded-full transition-all cursor-pointer ${
                input.trim() && !loading
                  ? theme === 'dark'
                    ? 'bg-white text-slate-950 hover:bg-[#e2e8f0] scale-100 shadow-md'
                    : 'bg-blue-600 text-white hover:bg-blue-700 scale-100 shadow-md shadow-blue-500/20'
                  : theme === 'dark'
                    ? 'text-[#5e5f62] cursor-not-allowed opacity-50'
                    : 'text-slate-300 cursor-not-allowed opacity-50'
              }`}
              title="Send message"
            >
              <SendHorizontal size={16} />
            </button>
          </div>
        </div>

        <p className={`text-[11px] text-center mt-2.5 ${theme === 'dark' ? 'text-[#64748b]' : 'text-slate-400'}`}>
          VakilAI provides legal information, not formal counsel. Verify critical clauses with a lawyer.
        </p>
      </div>
    </div>
  );
}