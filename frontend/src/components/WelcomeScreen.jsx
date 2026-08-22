import React, { useRef, useEffect } from 'react';
import { 
  Plus, 
  ChevronDown, 
  Mic, 
  SendHorizontal, 
  FileText, 
  Scale, 
  CheckCircle2, 
  ArrowUpRight 
} from 'lucide-react';
import { useTheme } from '../Context/ThemeContext';

const SERVICES = [
  {
    id: 'rti',
    title: 'Draft an RTI',
    tag: 'RTI Application',
    description: 'Converts plain-language questions into properly formatted applications for the right department.',
    icon: FileText,
    prompt: 'I want to draft an RTI application regarding '
  },
  {
    id: 'rights',
    title: 'Know your Rights',
    tag: 'Legal Advisory',
    description: 'Explains in simple terms what you can do about tenant, consumer, or workplace disputes.',
    icon: Scale,
    prompt: 'Explain my legal rights regarding a dispute with '
  },
  {
    id: 'eligibility',
    title: 'Scheme Eligibility',
    tag: 'Govt Schemes',
    description: 'Reads government portals and answers your scheme eligibility questions in plain language.',
    icon: CheckCircle2,
    prompt: 'Check my eligibility for government schemes related to '
  }
];

export default function WelcomeScreen({ input, setInput, onSubmit, loading, onSelectService }) {
  const textareaRef = useRef(null);
  const { theme } = useTheme();

  // Auto-resize textarea height smoothly up to 200px as text grows
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSubmit();
    }
  };

  const handleCardClick = (service) => {
    if (onSelectService) {
      onSelectService(service);
    }
    setInput(service.prompt);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  return (
    <div className="relative flex-1 h-full w-full flex flex-col justify-between select-none overflow-hidden px-4 pb-6 bg-transparent">
      {/* Top / Center Content */}
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-4xl mx-auto my-auto">
        <div className="text-center mb-10">
          <h1
            className={`text-3xl md:text-5xl font-light tracking-tight font-sans ${
              theme === 'dark' ? 'text-[#e3e3e3]' : 'text-[#1e293b]'
            }`}
          >
            What should we focus on?
          </h1>
          <p className={`text-sm mt-2.5 ${theme === 'dark' ? 'text-[#94a3b8]' : 'text-slate-500'}`}>
            Select a service to get started or ask anything below
          </p>
        </div>

        {/* Service Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
          {SERVICES.map((service) => {
            const Icon = service.icon;
            return (
              <button
                key={service.id}
                type="button"
                onClick={() => handleCardClick(service)}
                className={`group text-left flex flex-col justify-between p-5 rounded-2xl border backdrop-blur-md transition-all duration-200 shadow-lg hover:-translate-y-0.5 cursor-pointer ${
                  theme === 'dark'
                    ? 'bg-[#17191e]/75 hover:bg-[#1f2229]/90 border-[#272b35] hover:border-[#383a3d]'
                    : 'bg-white/80 hover:bg-white border-slate-200/90 hover:border-slate-300 shadow-slate-200/50'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3.5">
                    <div
                      className={`p-2 rounded-xl border transition-colors ${
                        theme === 'dark'
                          ? 'bg-[#111317] text-[#93c5fd] group-hover:text-blue-400 border-[#272b35]'
                          : 'bg-blue-50 text-blue-600 border-blue-100 group-hover:bg-blue-100'
                      }`}
                    >
                      <Icon size={18} />
                    </div>
                    <span
                      className={`text-[11px] flex items-center gap-0.5 transition-colors ${
                        theme === 'dark'
                          ? 'text-[#94a3b8] group-hover:text-[#bfdbfe]'
                          : 'text-slate-400 group-hover:text-blue-600'
                      }`}
                    >
                      {service.tag}
                      <ArrowUpRight size={13} className="opacity-70 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </span>
                  </div>
                  <h3
                    className={`text-sm font-medium mb-1.5 transition-colors ${
                      theme === 'dark' ? 'text-[#f1f5f9] group-hover:text-white' : 'text-slate-800 group-hover:text-slate-950'
                    }`}
                  >
                    {service.title}
                  </h3>
                  <p className={`text-xs leading-relaxed line-clamp-3 ${theme === 'dark' ? 'text-[#94a3b8]' : 'text-slate-500'}`}>
                    {service.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Prompt Bar */}
      <div className="w-full max-w-2xl mx-auto pb-1">
        <div
          className={`flex items-end gap-3 border rounded-3xl px-4 py-3 transition-all shadow-2xl backdrop-blur-md ${
            theme === 'dark'
              ? 'bg-[#17191e]/85 border-[#272b35] hover:border-[#383a3d] focus-within:border-[#444746]'
              : 'bg-white/95 border-slate-200 hover:border-slate-300 focus-within:border-blue-400 shadow-slate-200/80'
          }`}
        >
          <button
            type="button"
            className={`p-1.5 rounded-full transition-colors mb-0.5 cursor-pointer ${
              theme === 'dark'
                ? 'hover:bg-[#232730] text-[#94a3b8] hover:text-[#f1f5f9]'
                : 'hover:bg-slate-100 text-slate-400 hover:text-slate-700'
            }`}
            title="Add context or files"
          >
            <Plus size={18} />
          </button>

          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            placeholder="Ask VakilAI..."
            className={`flex-1 bg-transparent text-[15px] outline-none resize-none overflow-y-auto leading-relaxed max-h-48 py-1 ${
              theme === 'dark'
                ? 'text-[#f1f5f9] placeholder-[#64748b]'
                : 'text-slate-900 placeholder-slate-400'
            }`}
            autoFocus
          />

          <div className="flex items-center gap-2 mb-0.5">
            <button
              type="button"
              className={`p-1.5 rounded-full transition-colors cursor-pointer ${
                theme === 'dark'
                  ? 'hover:bg-[#232730] text-[#94a3b8] hover:text-[#f1f5f9]'
                  : 'hover:bg-slate-100 text-slate-400 hover:text-slate-700'
              }`}
              title="Voice Input"
            >
              <Mic size={17} />
            </button>

            {input.trim().length > 0 && (
              <button
                onClick={() => onSubmit()}
                disabled={loading}
                className={`p-1.5 rounded-full transition-all transform scale-100 animate-in fade-in cursor-pointer ${
                  theme === 'dark'
                    ? 'bg-white text-slate-950 hover:bg-[#e2e8f0]'
                    : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-500/20'
                }`}
                title="Send"
              >
                <SendHorizontal size={15} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}