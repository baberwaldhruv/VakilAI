import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Sparkles, Copy, Check, ThumbsUp, ThumbsDown, Download, FileCheck } from "lucide-react";
import { useTheme } from "../Context/ThemeContext";
import jsPDF from "jspdf";

export default function ChatStream({ messages = [], loading = false, messagesEndRef }) {
  const [copiedIndex, setCopiedIndex] = useState(null);
  const { theme } = useTheme();

  const handleCopy = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const isDraftMessage = (text) => {
    if (!text || typeof text !== "string") return false;
    const lower = text.toLowerCase();
    return (
      (lower.includes("public information officer") || lower.includes("to,")) &&
      (lower.includes("details of information") || lower.includes("applicant details") || lower.includes("application fee"))
    );
  };

  const handleDownloadPDF = (content) => {
    if (!content) return;

    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const margin = 18;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const maxWidth = pageWidth - margin * 2;
    let currentY = 22;

    const checkPageBreak = (neededHeight = 8) => {
      if (currentY + neededHeight > pageHeight - 20) {
        doc.addPage();
        currentY = 20;
      }
    };

    const sanitized = content
      .replace(/₹/g, "Rs. ")
      .replace(/\[\s*\]/g, "[ ]")
      .replace(/\r\n/g, "\n");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12.5);
    doc.text("APPLICATION UNDER THE RIGHT TO INFORMATION ACT, 2005", pageWidth / 2, currentY, { align: "center" });

    currentY += 6;
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.4);
    doc.line(margin, currentY, pageWidth - margin, currentY);
    currentY += 8;

    const lines = sanitized.split("\n");

    lines.forEach((rawLine) => {
      const trimmed = rawLine.trim();

      if (!trimmed) {
        currentY += 3;
        return;
      }

      const isHeading =
        /^\*{0,2}\d+\.\s+/.test(trimmed) ||
        /^\*{0,2}(To,|Right to Information Application|Applicant Details:|Period of Information:|Details of Information Required:|Application Fee:|Below Poverty Line|Place:|Date:)/i.test(trimmed);

      const cleanLine = trimmed.replace(/\*\*/g, "").replace(/\*/g, "");

      if (isHeading) {
        checkPageBreak(9);
        currentY += 2;
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(25, 25, 25);

        const split = doc.splitTextToSize(cleanLine, maxWidth);
        split.forEach((t) => {
          checkPageBreak(5.5);
          doc.text(t, margin, currentY);
          currentY += 5;
        });
        doc.setFont("helvetica", "normal");
      } else {
        checkPageBreak(6);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9.5);
        doc.setTextColor(60, 60, 60);

        const isList = /^\d+\.|\*/.test(cleanLine);
        const indent = isList ? margin + 3 : margin;
        const printWidth = isList ? maxWidth - 3 : maxWidth;

        const split = doc.splitTextToSize(cleanLine, printWidth);
        split.forEach((t) => {
          checkPageBreak(5);
          doc.text(t, indent, currentY);
          currentY += 4.8;
        });
      }
    });

    doc.save("RTI_Application_Draft.pdf");
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-6 pt-6 pb-44 px-4 w-full">
      {messages.map((msg, idx) => {
        const hasDraft = msg.role === "assistant" && !msg.isError && isDraftMessage(msg.content);

        return (
          <div
            key={idx}
            className={`flex w-full ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {msg.role === "user" ? (
              <div
                className={`max-w-[80%] md:max-w-[70%] px-5 py-3.5 rounded-3xl rounded-tr-md text-[15px] leading-relaxed shadow-sm break-words whitespace-pre-wrap transition-colors ${
                  theme === "dark"
                    ? "bg-[#232730] text-[#f1f5f9] border border-[#2e3442]"
                    : "bg-blue-600 text-white shadow-blue-500/10"
                }`}
              >
                {msg.content}
              </div>
            ) : (
              <div className="flex gap-4 items-start max-w-[90%] md:max-w-[85%] group">
                <div className="h-8 w-8 rounded-full flex items-center justify-center bg-gradient-to-tr from-[#4285f4] via-[#9b72cb] to-[#d96570] text-white p-1.5 shrink-0 shadow-md mt-0.5">
                  <Sparkles size={16} />
                </div>

                <div className="flex-1 min-w-0">
                  <div
                    className={`text-[15px] leading-relaxed transition-colors ${
                      msg.isError
                        ? "text-red-400 bg-red-500/10 p-3 rounded-2xl border border-red-500/20"
                        : theme === "dark"
                        ? "text-[#e3e3e3]"
                        : "text-slate-800"
                    }`}
                  >
                    <div
                      className={`prose text-[15px] max-w-none break-words leading-relaxed ${
                        theme === "dark"
                          ? "prose-invert text-[#e3e3e3] prose-p:text-[#e3e3e3] prose-headings:text-white prose-strong:text-white prose-li:text-[#cbd5e1]"
                          : "text-slate-800 prose-p:text-slate-800 prose-headings:text-slate-900 prose-strong:text-slate-950 prose-li:text-slate-700"
                      }`}
                    >
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                  </div>

                  {hasDraft && (
                    <div
                      className={`mt-4 p-3 rounded-xl flex items-center justify-between border transition-all ${
                        theme === "dark"
                          ? "bg-[#181a20] border-[#292d39]"
                          : "bg-blue-50/60 border-blue-100"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <FileCheck size={18} className="text-blue-500" />
                        <div>
                          <p
                            className={`text-xs font-medium ${
                              theme === "dark" ? "text-slate-200" : "text-slate-800"
                            }`}
                          >
                            RTI Application Ready
                          </p>
                          <p className="text-[11px] text-slate-400">
                            Download the formatted application document
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDownloadPDF(msg.content)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors cursor-pointer shadow-sm"
                      >
                        <Download size={13} />
                        Download PDF
                      </button>
                    </div>
                  )}

                  {!msg.isError && (
                    <div className="flex items-center gap-1.5 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleCopy(msg.content, idx)}
                        className={`p-1.5 rounded-full transition-colors cursor-pointer ${
                          theme === "dark"
                            ? "hover:bg-[#1e1f20] text-[#8e918f] hover:text-[#e3e3e3]"
                            : "hover:bg-slate-100 text-slate-400 hover:text-slate-700"
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
                          theme === "dark"
                            ? "hover:bg-[#1e1f20] text-[#8e918f] hover:text-[#e3e3e3]"
                            : "hover:bg-slate-100 text-slate-400 hover:text-slate-700"
                        }`}
                        title="Good response"
                      >
                        <ThumbsUp size={15} />
                      </button>
                      <button
                        className={`p-1.5 rounded-full transition-colors cursor-pointer ${
                          theme === "dark"
                            ? "hover:bg-[#1e1f20] text-[#8e918f] hover:text-[#e3e3e3]"
                            : "hover:bg-slate-100 text-slate-400 hover:text-slate-700"
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
        );
      })}

      {loading && (
        <div className="flex gap-4 items-start max-w-[85%]">
          <div className="h-8 w-8 rounded-full flex items-center justify-center bg-gradient-to-tr from-[#4285f4] via-[#9b72cb] to-[#d96570] text-white p-1.5 shrink-0 animate-spin">
            <Sparkles size={16} />
          </div>
          <div className="flex flex-col gap-2.5 flex-1 mt-1">
            <div
              className={`h-3 w-44 rounded-full animate-pulse ${
                theme === "dark" ? "bg-[#1e1f20]" : "bg-slate-200"
              }`}
            />
            <div
              className={`h-3 w-72 rounded-full animate-pulse ${
                theme === "dark" ? "bg-[#1e1f20]" : "bg-slate-200"
              }`}
            />
          </div>
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
}