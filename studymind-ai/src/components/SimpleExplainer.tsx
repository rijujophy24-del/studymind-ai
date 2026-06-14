import React, { useState } from "react";
import { Trees, Sparkles, Copy, Check, Save, AlertCircle, RefreshCw, Smile, Download } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { SavedSimpleExplanation } from "../types";
import { exportExplanationToPDF } from "../utils/pdfExport";

interface SimpleExplainerProps {
  language: "english" | "malayalam";
  onSaveExplanation: (exp: SavedSimpleExplanation) => void;
}

export default function SimpleExplainer({ language, onSaveExplanation }: SimpleExplainerProps) {
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [explanation, setExplanation] = useState("");
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  const parseMarkdown = (text: string) => {
    if (!text) return "";
    let html = text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    html = html.replace(/^### (.*?)$/gm, "<h3 class='text-sm font-bold text-violet-700 dark:text-violet-300 mt-3 mb-1'>$1</h3>");
    html = html.replace(/^## (.*?)$/gm, "<h2 class='text-base font-bold text-violet-800 dark:text-violet-200 mt-4 mb-2'>$1</h2>");
    html = html.replace(/^# (.*?)$/gm, "<h1 class='text-lg font-extrabold text-violet-900 dark:text-violet-100 mt-5 mb-3'>$1</h1>");
    html = html.replace(/\*\*(.*?)\*\*/g, "<strong class='font-semibold text-gray-900 dark:text-white'>$1</strong>");
    html = html.replace(/```([\s\S]*?)```/g, "<pre class='bg-gray-950 text-gray-250 p-4 rounded-lg overflow-x-auto my-3 font-mono text-xs border border-gray-800'><code>$1</code></pre>");
    html = html.replace(/`(.*?)`/g, "<code class='bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300 px-1 py-0.5 rounded font-mono text-xs'>$1</code>");
    html = html.replace(/^> (.*?)$/gm, "<blockquote class='border-l-4 border-violet-500 bg-violet-50/40 dark:bg-violet-950/15 pl-4 py-2 pr-2 my-3 italic text-gray-600 dark:text-gray-400 rounded-r-md'>$1</blockquote>");
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

  const handleExplain = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setLoading(true);
    setError(null);
    setExplanation("");
    setCopied(false);
    setSaved(false);

    try {
      const response = await fetch("/api/explain-simple", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: topic.trim(),
          language
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to create simplified explanation");
      }

      setExplanation(data.explanation || "");
    } catch (err: any) {
      setError(err.message || "An error occurred during communication.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!explanation) return;
    navigator.clipboard.writeText(explanation);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveExplanation = () => {
    if (!explanation) return;
    const newExp: SavedSimpleExplanation = {
      id: crypto.randomUUID(),
      topic: topic.trim(),
      language,
      explanation,
      createdAt: new Date().toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric"
      })
    };
    onSaveExplanation(newExp);
    setSaved(true);
  };

  return (
    <div id="simple-explainer-module" className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700/50">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
            <Smile className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {language === "malayalam" ? "ലളിതമായ വിശദീകരണം" : "Simple Explainer (ELI5)"}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {language === "malayalam"
                ? "ഏറ്റവും ബുദ്ധിമുട്ടുള്ള ശാസ്ത്ര ഗണിത ആശയങ്ങളും ഇളം പ്രായത്തിലുള്ള വിദ്യാർത്ഥികൾക്ക് പോലും ലളിതമാക്കി നൽകുന്നു."
                : "Translate complex technical concepts or deep academic literature into easy-to-understand metaphors."}
            </p>
          </div>
        </div>

        <form onSubmit={handleExplain} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-2">
              {language === "malayalam" ? "നിങ്ങൾക്ക് ലളിതമാക്കേണ്ട വിഷയം നൽകുക" : "Complex Concept to Simplify"}
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder={
                language === "malayalam"
                  ? "ഉദാഹરણത്തിന്: ശാസ്ത്രജ്ഞർ സൂചിപ്പിക്കുന്ന ക്വാണ്ടം കമ്പ്യൂട്ടിങ്"
                  : "e.g., Quantum Superposition, Supply/Demand, Photosynthesis, Blockchain..."
              }
              className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              required
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={loading || !topic.trim()}
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium text-sm hover:opacity-95 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none shadow-md shadow-blue-500/10 cursor-pointer transition-all"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>{language === "malayalam" ? "ലളിതമാക്കുകയാണ്..." : "Simplifying..."}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>{language === "malayalam" ? "ലളിതമായി വിശദീകരിക്കുക" : "Explain Simply"}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Error state */}
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
              <p className="font-semibold">Creation Error</p>
              <p>{error}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading state */}
      {loading && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-16 shadow-sm border border-gray-100 dark:border-gray-700/50 flex flex-col items-center justify-center text-center space-y-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-indigo-200 dark:border-indigo-950 rounded-full animate-spin border-t-indigo-500 flex items-center justify-center">
              <Smile className="w-6 h-6 text-indigo-500 animate-bounce" />
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-lg text-gray-800 dark:text-white">
              {language === "malayalam" ? "അതിലളിതമാക്കുന്നു" : "Dressing Down Concepts..."}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mt-1">
              {language === "malayalam"
                ? "നിങ്ങളുടെ കുട്ടിക്കാലത്തിന് സമാനമായി കഥകളും രൂപങ്ങളും ചേർത്ത് ലാമ തയ്യാറാക്കുകയാണ്."
                : "Replacing heavy terminology with standard block diagrams and LEGO-block equivalents."}
            </p>
          </div>
        </div>
      )}

      {/* Results block */}
      {!loading && explanation && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/50 overflow-hidden"
        >
          {/* Output Toolbar */}
          <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/80 border-b border-gray-100 dark:border-gray-700/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Smile className="w-4 h-4 text-emerald-500" />
              <span className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 tracking-wider">
                {language === "malayalam" ? "ലളിതമായ രൂപം" : "ELI5 Explanation Draft"}
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
                    <span>Copy explanation</span>
                  </>
                )}
              </button>

              <button
                onClick={handleSaveExplanation}
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
                    <span>Save to Library</span>
                  </>
                )}
              </button>

              <button
                onClick={() => {
                  exportExplanationToPDF({
                    id: "temp",
                    topic: topic.trim() || "Explanation",
                    language,
                    explanation,
                    createdAt: new Date().toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric"
                    })
                  });
                }}
                className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 flex items-center gap-1.5 text-xs text-nowrap cursor-pointer transition-all"
                title="Download Explanation PDF"
              >
                <Download className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>Download PDF</span>
              </button>
            </div>
          </div>

          <div className="p-6 md:p-8">
            <article 
              className="markdown-content text-gray-800 dark:text-gray-200 break-words"
              dangerouslySetInnerHTML={{ __html: parseMarkdown(explanation) }}
            />
          </div>
        </motion.div>
      )}

      {/* Info card */}
      {!loading && !explanation && (
        <div className="bg-gradient-to-br from-indigo-50/50 to-blue-50/20 dark:from-violet-950/10 dark:to-blue-950/10 border border-indigo-100/40 dark:border-indigo-900/10 p-6 rounded-xl flex items-start gap-4">
          <Smile className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
              {language === "malayalam" ? "മെറ്റാഫോറുകളുടെ പവർ" : "Simplification with Analogy Engine"}
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              {language === "malayalam"
                ? "സങ്കീർണ്ണമായ സയൻസ് ടോപ്പിക്കുകൾ പോലും സുപരിചിതമായ മെറ്റാഫോറുകൾ (ഉദാഹരണത്തിന് ഇലക്ട്രിക് കറന്റിനെ ഒഴുക്കുള്ള വെള്ളത്തിനോട് ചേർത്തു) വെച്ച് പഠിച്ചാൽ ഓർമ്മിച്ചെടുക്കാൻ വളരെ എളുപ്പമാണ്."
                : "Replacing heavy vocabulary with friendly, day-to-day visual counterparts allows neural connections to map the actual core architecture quickly."}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
