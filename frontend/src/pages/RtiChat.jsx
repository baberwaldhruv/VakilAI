import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { rtiService } from "../services/apiServices";
import { useAuth } from "../Context/AuthContext";
import { useTheme } from "../Context/ThemeContext";
import { useLanguage } from "../Context/LanguageContext";
import { X, Download, FileText } from "lucide-react";
import jsPDF from "jspdf";

// Modular Components
import Sidebar from "../components/sidebar";
import Header from "../components/Header";
import WelcomeScreen from "../components/WelcomeScreen";
import ChatStream from "../components/ChatStream";
import PromptInput from "../components/PromptInput";

export default function RtiChat() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme } = useTheme();
  const { t } = useLanguage();

  const [recentChats, setRecentChats] = useState([]);
  const [messages, setMessages] = useState([]);
  const [caseData, setCaseData] = useState(null);
  const [draft, setDraft] = useState(null);
  const [showCasePanel, setShowCasePanel] = useState(false);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  // Mouse coordinate state for dynamic radial spotlight glow
  const [mousePos, setMousePos] = useState({ x: 50, y: 30 });
  const containerRef = useRef(null);
  const messagesEndRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePos({ x, y });
  };

  // PDF Generation Function
  const handleDownloadPDF = (contentToExport) => {
    const textContent = contentToExport || draft;
    if (!textContent) return;

    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const margin = 15;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const maxWidth = pageWidth - margin * 2;
    let currentY = 20;

    // Header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("APPLICATION UNDER THE RIGHT TO INFORMATION ACT, 2005", pageWidth / 2, currentY, { align: "center" });

    currentY += 8;
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.line(margin, currentY, pageWidth - margin, currentY);

    currentY += 8;

    // Body content with pagination support
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);

    const splitLines = doc.splitTextToSize(textContent, maxWidth);

    splitLines.forEach((line) => {
      if (currentY > pageHeight - 20) {
        doc.addPage();
        currentY = 20;
      }
      doc.text(line, margin, currentY);
      currentY += 6;
    });

    // Output filename
    const filename = caseData?.issue 
      ? `RTI_${caseData.issue.slice(0, 20).replace(/[^a-zA-Z0-9]/g, "_")}.pdf` 
      : "RTI_Draft_Application.pdf";

    doc.save(filename);
  };

  // Load chat history for Sidebar
  const fetchRecentChats = async () => {
    try {
      const res = await rtiService.listCases();
      const formatted = (res.data || []).map((c) => ({
        id: c.id,
        sessionId: c.session_id,
        title: c.issue || t("newChat"),
      }));
      setRecentChats(formatted);
    } catch (err) {
      console.error("Failed to load chat history", err);
    }
  };

  useEffect(() => {
    fetchRecentChats();
  }, []);

  // Reset or load session messages and case details when sessionId changes
  useEffect(() => {
    if (!sessionId) {
      setMessages([]);
      setInput("");
      setCaseData(null);
      setDraft(null);
      setShowCasePanel(false);
      return;
    }

    async function loadActiveSession() {
      try {
        setLoading(true);
        const [caseRes, msgRes] = await Promise.allSettled([
          rtiService.getCase(sessionId),
          rtiService.getMessages(sessionId),
        ]);

        if (caseRes.status === "fulfilled") {
          const data = caseRes.value.data;
          setCaseData(data);
          if (data?.draft_content || data?.draft) {
            setDraft(data.draft_content || data.draft);
          }
        }

        if (msgRes.status === "fulfilled") {
          const mapped = (msgRes.value.data || []).map((m) => ({
            role: m.role,
            content: m.message || m.content,
          }));
          setMessages(mapped);

          // Find the latest assistant response as draft fallback if not explicitly set
          const lastAssistant = [...mapped].reverse().find((m) => m.role === "assistant" && !m.isError);
          if (lastAssistant && lastAssistant.content.includes("To,")) {
            setDraft(lastAssistant.content);
          }
        }
      } catch (err) {
        console.error("Error loading chat messages:", err);
      } finally {
        setLoading(false);
      }
    }

    loadActiveSession();
  }, [sessionId]);

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

  // Reset all state and return to Home/Welcome screen
  const handleNewChat = () => {
    setMessages([]);
    setInput("");
    setCaseData(null);
    setDraft(null);
    setShowCasePanel(false);
    navigate("/");
  };

  const handleSelectChat = (chat) => {
    navigate(`/${chat.sessionId}`);
  };

  // Clear all chats from DB
  const handleClearHistory = async () => {
    try {
      if (window.confirm("Are you sure you want to clear all chat history?")) {
        await rtiService.clearAllCases();
        setRecentChats([]);
        handleNewChat();
      }
    } catch (err) {
      console.error("Failed to clear chat history:", err);
    }
  };

  // Delete a single specific chat
  const handleDeleteSingleChat = async (e, chatToDelete) => {
    e.stopPropagation();
    try {
      await rtiService.deleteCase(chatToDelete.sessionId);
      setRecentChats((prev) =>
        prev.filter((c) => c.sessionId !== chatToDelete.sessionId)
      );

      if (sessionId === chatToDelete.sessionId) {
        handleNewChat();
      }
    } catch (err) {
      console.error("Failed to delete chat:", err);
    }
  };

  // Unified Send Prompt Handler
  const handleSendMessage = async (promptOverride) => {
    const rawText = typeof promptOverride === "string" ? promptOverride : input;
    if (!rawText || !rawText.trim() || sending) return;

    const userText = rawText.trim();
    setInput("");

    let activeSessionId = sessionId;

    if (!activeSessionId) {
      try {
        setSending(true);
        const newCaseRes = await rtiService.createCase();
        activeSessionId = newCaseRes.data?.session_id;
        navigate(`/${activeSessionId}`, { replace: true });
        await fetchRecentChats();
      } catch (err) {
        alert(err.message || "Failed to initialize chat session.");
        setSending(false);
        return;
      }
    }

    setMessages((prev) => [
      ...prev,
      { role: "user", content: userText },
    ]);
    setSending(true);

    try {
      const res = await rtiService.sendMessage(activeSessionId, userText);
      const assistantText = res.data?.response;
      
      if (assistantText) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: assistantText },
        ]);

        // Auto-detect draft pattern and update draft drawer
        if (assistantText.includes("Public Information Officer") || assistantText.includes("To,")) {
          setDraft(assistantText);
          setShowCasePanel(true);
        }
      }

      if (res.data?.case) {
        setCaseData(res.data.case);
        if (res.data.case.draft_content) {
          setDraft(res.data.case.draft_content);
        }
      }
      fetchRecentChats();
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: err.message || "Failed to fetch response. Please retry.",
          isError: true,
        },
      ]);
    } finally {
      setSending(false);
    }
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className={`relative flex h-screen w-screen font-sans antialiased overflow-hidden select-none transition-colors duration-300 ${
        theme === 'dark' ? 'bg-[#0e0f12] text-[#e3e3e3]' : 'bg-[#eef5fc] text-[#1e293b]'
      }`}
    >
      {/* Ambient Top Gradient */}
      <div
        className={`absolute inset-0 pointer-events-none z-0 transition-all duration-500 ${
          theme === 'dark'
            ? 'bg-[radial-gradient(ellipse_at_top,_#142442_0%,_#0a101d_45%,_#0e0f12_85%)]'
            : 'bg-[radial-gradient(ellipse_at_top,_#c9e2fa_0%,_#dbeefe_35%,_#eef5fc_75%,_#f8fafc_100%)]'
        }`}
      />

      {/* Interactive Spotlight Glow */}
      <div
        className="absolute inset-0 pointer-events-none transition-all duration-300 ease-out z-0"
        style={{
          background:
            theme === 'dark'
              ? `radial-gradient(750px circle at ${mousePos.x}% ${mousePos.y}%, rgba(29, 78, 216, 0.20), rgba(15, 23, 42, 0.08) 50%, transparent 80%)`
              : `radial-gradient(750px circle at ${mousePos.x}% ${mousePos.y}%, rgba(147, 197, 253, 0.50), rgba(191, 219, 254, 0.25) 45%, transparent 75%)`,
        }}
      />

      {/* Sidebar */}
      <Sidebar
        onNewChat={handleNewChat}
        recentChats={recentChats}
        onSelectChat={handleSelectChat}
        onClearHistory={handleClearHistory}
        onDeleteChat={handleDeleteSingleChat}
      />

      {/* Main Viewport */}
      <div className="flex-1 flex flex-col h-full min-w-0 relative z-10 bg-transparent overflow-hidden">
        {/* Floating Header */}
        <div className="flex items-center justify-between px-4">
          <Header onNewChat={handleNewChat} />
          {draft && !showCasePanel && (
            <button
              onClick={() => setShowCasePanel(true)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer border ${
                theme === 'dark'
                  ? 'bg-blue-600/20 border-blue-500/40 text-blue-300 hover:bg-blue-600/30'
                  : 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100'
              }`}
            >
              <FileText size={14} />
              View Draft & PDF
            </button>
          )}
        </div>

        {/* Dynamic Center Stage */}
        <main className="flex-1 flex flex-row h-full min-h-0 relative z-10 overflow-hidden bg-transparent">
          <div className="flex-1 flex flex-col h-full min-h-0 overflow-y-auto">
            {!sessionId && messages.length === 0 ? (
              <WelcomeScreen
                input={input}
                setInput={setInput}
                onSubmit={handleSendMessage}
                loading={sending || loading}
              />
            ) : (
              <>
                <ChatStream
                  messages={messages}
                  loading={sending}
                  messagesEndRef={messagesEndRef}
                />

                <PromptInput
                  input={input}
                  setInput={setInput}
                  onSubmit={() => handleSendMessage()}
                  loading={sending || loading}
                />
              </>
            )}
          </div>

          {/* Collapsible Case Info & Draft Side Drawer */}
          {showCasePanel && (
            <div
              className={`w-96 border-l p-5 flex flex-col h-full overflow-y-auto backdrop-blur-xl animate-in slide-in-from-right duration-200 ${
                theme === 'dark'
                  ? 'border-[#222630]/60 bg-[#121419]/90'
                  : 'border-slate-200/80 bg-white/90 shadow-2xl'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-sm font-semibold ${theme === 'dark' ? 'text-[#f1f5f9]' : 'text-slate-800'}`}>
                  {t("caseIntelligence")}
                </h3>
                <button
                  onClick={() => setShowCasePanel(false)}
                  className={`p-1 rounded-md transition-colors cursor-pointer ${
                    theme === 'dark'
                      ? 'hover:bg-[#1e222b] text-[#64748b] hover:text-white'
                      : 'hover:bg-slate-100 text-slate-400 hover:text-slate-700'
                  }`}
                >
                  <X size={15} />
                </button>
              </div>

              <div
                className={`space-y-3 text-xs p-3.5 rounded-xl border mb-4 ${
                  theme === 'dark'
                    ? 'bg-[#17191e] border-[#272b35]'
                    : 'bg-slate-50 border-slate-200 shadow-sm'
                }`}
              >
                <div>
                  <span className="text-[#64748b] block mb-0.5 font-medium">{t("issue")}</span>
                  <span className={`font-semibold ${theme === 'dark' ? 'text-[#e2e8f0]' : 'text-slate-800'}`}>
                    {caseData?.issue || t("pending")}
                  </span>
                </div>
                <div>
                  <span className="text-[#64748b] block mb-0.5 font-medium">{t("targetDept")}</span>
                  <span className={`font-semibold ${theme === 'dark' ? 'text-[#e2e8f0]' : 'text-slate-800'}`}>
                    {caseData?.department || t("pending")}
                  </span>
                </div>
                <div>
                  <span className="text-[#64748b] block mb-0.5 font-medium">{t("location")}</span>
                  <span className={theme === 'dark' ? 'text-[#e2e8f0]' : 'text-slate-700'}>
                    {[caseData?.village, caseData?.city, caseData?.district, caseData?.state]
                      .filter(Boolean)
                      .join(", ") || t("pending")}
                  </span>
                </div>
                <div>
                  <span className="text-[#64748b] block mb-0.5 font-medium">{t("applicant")}</span>
                  <span className={theme === 'dark' ? 'text-[#e2e8f0]' : 'text-slate-700'}>
                    {caseData?.applicant_name || t("pending")}
                  </span>
                </div>
              </div>

              {draft && (
                <div className="flex-1 flex flex-col min-h-0">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className={`text-xs font-semibold ${theme === 'dark' ? 'text-[#f1f5f9]' : 'text-slate-800'}`}>
                      {t("applicationDraft")}
                    </h4>
                    <button
                      onClick={() => handleDownloadPDF(draft)}
                      className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors cursor-pointer shadow-sm"
                    >
                      <Download size={13} />
                      Download PDF
                    </button>
                  </div>
                  <div
                    className={`flex-1 border rounded-xl p-3 overflow-y-auto ${
                      theme === 'dark'
                        ? 'bg-[#17191e] border-[#3b4252]'
                        : 'bg-white border-slate-200 shadow-sm'
                    }`}
                  >
                    <pre
                      className={`text-xs whitespace-pre-wrap font-sans leading-relaxed ${
                        theme === 'dark' ? 'text-[#cbd5e1]' : 'text-slate-700'
                      }`}
                    >
                      {draft}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}