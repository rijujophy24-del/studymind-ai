import React, { useState } from "react";
import { MessageSquare, Sparkles, Copy, Check, Save, AlignLeft, AlertCircle, RefreshCw, Send, HelpCircle, Download } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { SavedDoubt } from "../types";
import { exportDoubtToPDF } from "../utils/pdfExport";

interface DoubtSolverProps {
  language: "english" | "malayalam";
  onSaveDoubt: (doubt: SavedDoubt) => void;
  savedDoubts: SavedDoubt[];
}

export default function DoubtSolver({ language, onSaveDoubt, savedDoubts }: DoubtSolverProps) {
  const [question, setQuestion] = useState("");
  const [context, setContext] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [answer, setAnswer] = useState("");
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  const parseMarkdown = (text: string) => {
    if (!text) return "";
    let html = text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    html = html.replace(/^### (.*?)$/gm, "<h3 class='text-base font-bold text-indigo-700 dark:text-indigo-300 mt-3 mb-1.5'>$1</h3>");
    html = html.replace(/^## (.*?)$/gm, "<h2 class='text-lg font-bold text-indigo-800 dark:text-indigo-200 mt-4 mb-2 border-b border-indigo-50/50 pb-1'>$1</h2>");
    html = html.replace(/^# (.*?)$/gm, "<h1 class='text-xl font-extrabold text-indigo-900 dark:text-indigo-100 mt-5 mb-3'>$1</h1>");
    html = html.replace(/\*\*(.*?)\*\*/g, "<strong class='font-semibold text-gray-900 dark:text-white'>$1</strong>");
    html = html.replace(/```([\s\S]*?)```/g, "<pre class='bg-gray-950 text-gray-200 p-4 rounded-lg overflow-x-auto my-3 font-mono text-xs border border-gray-800'><code>$1</code></pre>");
    html = html.replace(/`(.*?)`/g, "<code class='bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 px-1 py-0.5 rounded font-mono text-xs'>$1</code>");
    html = html.replace(/^> (.*?)$/gm, "<blockquote class='border-l-4 border-indigo-500 bg-indigo-50/40 dark:bg-indigo-950/15 pl-4 py-2 pr-2 my-3 italic text-gray-600 dark:text-gray-400 rounded-r-md'>$1</blockquote>");
    html = html.replace(/^\s*-\s+(.*?)$/gm, "<li class='text-gray-700 dark:text-gray-300 ml-5 list-disc my-1'>$1</li>");

    const lines = html.split("\n");
    const processedLines = lines.map(line => {
      if (line.trim() === "") return "";
      if (line.startsWith("<h") || line.startsWith("<li") || line.startsWith("<pre") || line.startsWith("<blockquote")) {
        return line;
      }
      return `<p class="my-2 text-sm text-gray-700 dark:text-gray-300 leading-relaxed">${line}</p>`;
    });

    return processedLines.join("\n");
  };

  const handleSolve = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    setLoading(true);
    setError(null);
    setAnswer("");
    setCopied(false);
    setSaved(false);

    try {
      const response = await fetch("/api/solve-doubt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: question.trim(),
          context: context.trim() || undefined,
          language
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to solve doubt");
      }

      setAnswer(data.answer || "");
    } catch (err: any) {
      setError(err.message || "Failed to resolve your query.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!answer) return;
    navigator.clipboard.writeText(answer);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveSolved = () => {
    if (!answer) return;
    const newDoubt: SavedDoubt = {
      id: crypto.randomUUID(),
      question: question.trim(),
      context: context.trim() || undefined,
      language,
      answer,
      createdAt: new Date().toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric"
      })
    };
    onSaveDoubt(newDoubt);
    setSaved(true);
  };

  return (
    <div id="doubt-solver-module" className="space-y-6">
      {/* Parameter Block */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700/50">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {language === "malayalam" ? "ഐയ് ഡൗട്ട് സോൾവർ" : "AI Doubt Solver"}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {language === "malayalam"
                ? "നിങ്ങളുടെ സംശയങ്ങൾ പഠനഭാഗങ്ങൾ സഹിതം ചോദിച്ചു തൽക്ഷണ പരിഹാരം നേടുക."
                : "Ask precise academic questions with context attachments for complete conceptual resolution."}
            </p>
          </div>
        </div>

        <form onSubmit={handleSolve} className="space-y-4">
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-2">
                {language === "malayalam" ? "പഠന പശ്ചാത്തലം / സിലബസ് വിവരങ്ങൾ (ഓപ്ഷണൽ)" : "Context / Study text (Optional)"}
              </label>
              <textarea
                value={context}
                onChange={(e) => setContext(e.target.value)}
                placeholder={
                  language === "malayalam"
                    ? "സംശയം വ്യക്തമാക്കാൻ എന്തെങ്കിലും പാരഗ്രാഫോ പുസ്തക വിവരങ്ങളോ ഇവിടെ പേസ്റ്റ് ചെയ്യാം."
                    : "Paste a textbook paragraph, problem definition, or chemical formula in this workspace to contextualize the doubts..."
                }
                rows={3}
                className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm leading-relaxed"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-2">
                {language === "malayalam" ? "നിങ്ങളുടെ സംശയം / ചോദ്യം എന്താണ്?" : "Your Doubt / Question"}
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder={
                    language === "malayalam"
                      ? "ഉദാഹരണത്തിന്: എന്താണ് ഇലക്ട്രോലിസിസ് രീതി?"
                      : "e.g., Explain why ice floats on water in terms of hydrogen bonds."
                  }
                  className="w-full pl-4 pr-12 py-3.5 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  required
                />
                
                <button
                  type="submit"
                  disabled={loading || !question.trim()}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-2 bg-gradient-to-br from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white rounded-lg active:scale-95 disabled:opacity-50 disabled:pointer-events-none transition-all cursor-pointer"
                  title="Ask AI Solver"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Error status */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-xl text-red-600 dark:text-red-400 text-sm flex gap-2"
          >
            <AlertCircle className="w-5 h-5 shrink-0" />
            <div>
              <p className="font-semibold">Calculation failed</p>
              <p>{error}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Thinking indicator */}
      {loading && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-16 shadow-sm border border-gray-100 dark:border-gray-700/50 flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-14 h-14 bg-gradient-to-tr from-indigo-500 to-violet-600 rounded-2xl flex items-center justify-center text-white scale-110 shadow-lg animate-pulse">
            <MessageSquare className="w-6 h-6 animate-bounce" />
          </div>
          <div>
            <h3 className="font-semibold text-lg text-gray-800 dark:text-white">
              {language === "malayalam" ? "ഡൗട്ടുകൾ പരിഹരിക്കുന്നു" : "Troubleshooting Doubt..."}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mt-1">
              {language === "malayalam"
                ? "നിങ്ങളുടെ സിലബസും ചോദ്യങ്ങളും ലാമ മികച്ച രീതിയിൽ വിലയിരുത്തുന്നു."
                : "Establishing conceptual definitions, selecting study tips, and verifying facts."}
            </p>
          </div>
        </div>
      )}

      {/* Answer Board */}
      {!loading && answer && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/50 overflow-hidden"
        >
          {/* Output Toolbar */}
          <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/80 border-b border-gray-100 dark:border-gray-700/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-500" />
              <span className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 tracking-wider">
                {language === "malayalam" ? "തയ്യാറാക്കിയ ഉത്തരം" : "AI Solver Resolution"}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 flex items-center gap-1.5 text-xs text-nowrap cursor-pointer transition-all"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="text-emerald-500">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Response</span>
                  </>
                )}
              </button>

              <button
                onClick={handleSaveSolved}
                disabled={saved}
                className={`p-1.5 rounded-lg border flex items-center gap-1.5 text-xs text-nowrap cursor-pointer transition-all ${
                  saved
                    ? "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 text-emerald-600 dark:text-emerald-400"
                    : "border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
                }`}
              >
                {saved ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Saved!</span>
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Resolution</span>
                  </>
                )}
              </button>

              <button
                onClick={() => {
                  exportDoubtToPDF({
                    id: "temp",
                    question: question.trim(),
                    context: context.trim() || undefined,
                    language,
                    answer,
                    createdAt: new Date().toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric"
                    })
                  });
                }}
                className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 flex items-center gap-1.5 text-xs text-nowrap cursor-pointer transition-all"
                title="Download Solution PDF"
              >
                <Download className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>Download PDF</span>
              </button>
            </div>
          </div>

          <div className="p-6 md:p-8">
            <div className="p-4 bg-indigo-50/20 dark:bg-indigo-950/10 rounded-xl border border-indigo-150 dark:border-indigo-900/10 mb-6">
              <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded uppercase tracking-wider block w-fit mb-1.5">
                {language === "malayalam" ? "നിങ്ങളുടെ ക്വറി" : "Query"}
              </span>
              <p className="text-sm font-semibold text-gray-850 dark:text-gray-100">
                {question}
              </p>
            </div>

            <article 
              className="markdown-content text-gray-850 dark:text-gray-200 break-words"
              dangerouslySetInnerHTML={{ __html: parseMarkdown(answer) }}
            />
          </div>
        </motion.div>
      )}

      {/* Info card */}
      {!loading && !answer && (
        <div className="bg-gradient-to-br from-indigo-50/50 to-blue-50/20 dark:from-violet-950/10 dark:to-blue-950/10 border border-indigo-100/40 dark:border-indigo-900/10 p-6 rounded-xl flex items-start gap-4">
          <HelpCircle className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
              {language === "malayalam" ? "പൊരുത്തമുള്ള പഠന പശ്ചാത്തലങ്ങൾ" : "Study Context Precision Guidance"}
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              {language === "malayalam"
                ? "ചുരുക്കം വാക്കുകളിൽ സംശയങ്ങൾ ചോദിക്കുന്നതിനൊപ്പം ചോദ്യം അടങ്ങിയിട്ടുള്ള പുസ്തക ഭാഗം കൂടി മുകളിലെ ബോക്സിൽ എഴുതി നൽകിയാൽ കൂടുതൽ വ്യക്തത ലഭിക്കും."
                : "Provide reference formulas, code, or context in the optional textarea block. StudyMind will adapt perfectly to that specific vocabulary."}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
