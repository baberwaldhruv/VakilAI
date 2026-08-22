import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { Sparkles, Copy, Check, ThumbsUp, ThumbsDown } from 'lucide-react';
import { useTheme } from '../Context/ThemeContext';

export default function ChatStream({ messages = [], loading = false, messagesEndRef }) {
  const [copiedIndex, setCopiedIndex] = useState(null);
  const { theme } = useTheme();

  const handleCopy = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-6 pt-6 pb-44 px-4 w-full">
      {messages.map((msg, idx) => (
        <div
          key={idx}
          className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
        >
          {msg.role === 'user' ? (
            /* User Message Bubble */
            <div
              className={`max-w-[80%] md:max-w-[70%] px-5 py-3.5 rounded-3xl rounded-tr-md text-[15px] leading-relaxed shadow-sm break-words whitespace-pre-wrap transition-colors ${
                theme === 'dark'
                  ? 'bg-[#232730] text-[#f1f5f9] border border-[#2e3442]'
                  : 'bg-blue-600 text-white shadow-blue-500/10'
              }`}
            >
              {msg.content}
            </div>
          ) : (
            /* AI Response */
            <div className="flex gap-4 items-start max-w-[90%] md:max-w-[85%] group">
              {/* Avatar */}
              <div className="h-8 w-8 rounded-full flex items-center justify-center bg-gradient-to-tr from-[#4285f4] via-[#9b72cb] to-[#d96570] text-white p-1.5 shrink-0 shadow-md mt-0.5">
                <Sparkles size={16} />
              </div>

              {/* AI Content */}
              <div className="flex-1 min-w-0">
                <div
                  className={`text-[15px] leading-relaxed transition-colors ${
                    msg.isError
                      ? 'text-red-400 bg-red-500/10 p-3 rounded-2xl border border-red-500/20'
                      : theme === 'dark'
                      ? 'text-[#e3e3e3]'
                      : 'text-slate-800'
                  }`}
                >
                  <div
                    className={`prose text-[15px] max-w-none break-words leading-relaxed ${
                      theme === 'dark'
                        ? 'prose-invert text-[#e3e3e3] prose-p:text-[#e3e3e3] prose-headings:text-white prose-strong:text-white prose-li:text-[#cbd5e1]'
                        : 'text-slate-800 prose-p:text-slate-800 prose-headings:text-slate-900 prose-strong:text-slate-950 prose-li:text-slate-700'
                    }`}
                  >
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      rehypePlugins={[rehypeHighlight]}
                      components={{
                        code({ node, inline, className, children, ...props }) {
                          const match = /language-(\w+)/.exec(className || '');
                          const codeText = String(children).replace(/\n$/, '');

                          return !inline && match ? (
                            <div
                              className={`relative my-3 rounded-xl overflow-hidden border ${
                                theme === 'dark'
                                  ? 'border-[#333537] bg-[#1a1a1c]'
                                  : 'border-slate-200 bg-slate-900 text-white'
                              }`}
                            >
                              <div
                                className={`flex justify-between items-center px-4 py-1.5 text-xs ${
                                  theme === 'dark'
                                    ? 'bg-[#282a2c] text-[#8e918f]'
                                    : 'bg-slate-800 text-slate-300'
                                }`}
                              >
                                <span className="font-mono">{match[1]}</span>
                                <button
                                  onClick={() => handleCopy(codeText, idx)}
                                  className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer"
                                >
                                  {copiedIndex === idx ? (
                                    <Check size={14} className="text-green-400" />
                                  ) : (
                                    <Copy size={14} />
                                  )}
                                  <span>{copiedIndex === idx ? 'Copied' : 'Copy'}</span>
                                </button>
                              </div>
                              <pre className="p-4 text-xs font-mono overflow-x-auto text-slate-100">
                                <code className={className} {...props}>
                                  {children}
                                </code>
                              </pre>
                            </div>
                          ) : (
                            <code
                              className={`px-1.5 py-0.5 rounded text-xs font-mono ${
                                theme === 'dark'
                                  ? 'bg-[#282a2c] text-[#a8c7fa]'
                                  : 'bg-slate-100 text-blue-700 border border-slate-200'
                              }`}
                              {...props}
                            >
                              {children}
                            </code>
                          );
                        },
                      }}
                    >
                      {msg.content}
                    </ReactMarkdown>
                  </div>
                </div>

                {/* Feedback & Actions */}
                {!msg.isError && (
                  <div className="flex items-center gap-1.5 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleCopy(msg.content, idx)}
                      className={`p-1.5 rounded-full transition-colors cursor-pointer ${
                        theme === 'dark'
                          ? 'hover:bg-[#1e1f20] text-[#8e918f] hover:text-[#e3e3e3]'
                          : 'hover:bg-slate-100 text-slate-400 hover:text-slate-700'
                      }`}
                      title="Copy response"
                    >
                      {copiedIndex === idx ? (
                        <Check size={15} className="text-green-500" />
                      ) : (
                        <Copy size={15} />
                      )}
                    </button>
                    <button
                      className={`p-1.5 rounded-full transition-colors cursor-pointer ${
                        theme === 'dark'
                          ? 'hover:bg-[#1e1f20] text-[#8e918f] hover:text-[#e3e3e3]'
                          : 'hover:bg-slate-100 text-slate-400 hover:text-slate-700'
                      }`}
                      title="Good response"
                    >
                      <ThumbsUp size={15} />
                    </button>
                    <button
                      className={`p-1.5 rounded-full transition-colors cursor-pointer ${
                        theme === 'dark'
                          ? 'hover:bg-[#1e1f20] text-[#8e918f] hover:text-[#e3e3e3]'
                          : 'hover:bg-slate-100 text-slate-400 hover:text-slate-700'
                      }`}
                      title="Bad response"
                    >
                      <ThumbsDown size={15} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      ))}

      {/* Loading Skeleton */}
      {loading && (
        <div className="flex gap-4 items-start max-w-[85%]">
          <div className="h-8 w-8 rounded-full flex items-center justify-center bg-gradient-to-tr from-[#4285f4] via-[#9b72cb] to-[#d96570] text-white p-1.5 shrink-0 animate-spin">
            <Sparkles size={16} />
          </div>
          <div className="flex flex-col gap-2.5 flex-1 mt-1">
            <div
              className={`h-3 w-44 rounded-full animate-pulse ${
                theme === 'dark' ? 'bg-[#1e1f20]' : 'bg-slate-200'
              }`}
            />
            <div
              className={`h-3 w-72 rounded-full animate-pulse ${
                theme === 'dark' ? 'bg-[#1e1f20]' : 'bg-slate-200'
              }`}
            />
          </div>
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
}