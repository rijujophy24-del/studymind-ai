import React, { useState } from "react";
import { ListCollapse, Sparkles, Copy, Check, Save, AlertCircle, RefreshCw, Download } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { SavedSummary } from "../types";
import { exportSummaryToPDF } from "../utils/pdfExport";

interface SummaryGeneratorProps {
  language: "english" | "malayalam";
  onSaveSummary: (sum: SavedSummary) => void;
}

export default function SummaryGenerator({ language, onSaveSummary }: SummaryGeneratorProps) {
  const [text, setText] = useState("");
  const [targetLength, setTargetLength] = useState("intermediate");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summaryOutput, setSummaryOutput] = useState("");
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  const parseMarkdown = (text: string) => {
    if (!text) return "";
    let html = text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    html = html.replace(/^### (.*?)$/gm, "<h3 class='text-sm font-bold text-violet-700 dark:text-violet-300 mt-3 mb-1'>$1</h3>");
    html = html.replace(/^## (.*?)$/gm, "<h2 class='text-base font-bold text-violet-800 dark:text-violet-200 mt-4 mb-2 border-b border-violet-50 pb-1'>$1</h2>");
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

  const handleSummarize = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    setLoading(true);
    setError(null);
    setSummaryOutput("");
    setCopied(false);
    setSaved(false);

    try {
      const response = await fetch("/api/generate-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: text.trim(),
          targetLength,
          language
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to generate text summary");
      }

      setSummaryOutput(data.summary || "");
    } catch (err: any) {
      setError(err.message || "Something went wrong while compiling summary.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!summaryOutput) return;
    navigator.clipboard.writeText(summaryOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveSummary = () => {
    if (!summaryOutput) return;
    const newSum: SavedSummary = {
      id: crypto.randomUUID(),
      originalText: text.trim(),
      targetLength,
      language,
      summary: summaryOutput,
      createdAt: new Date().toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric"
      })
    };
    onSaveSummary(newSum);
    setSaved(true);
  };

  return (
    <div id="summary-generator-module" className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700/50">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
            <ListCollapse className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {language === "malayalam" ? "സമ്മറി ജനറേറ്റർ" : "Smart Summary Generator"}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {language === "malayalam"
                ? "വളരെ നീണ്ട ലേഖനങ്ങളും ഉപന്യാസങ്ങളും തനിപ്പകർപ്പാക്കി ആവശ്യമുള്ള അളവിൽ ചുരുക്കി തരും."
                : "Condense long text passages, research notes, essays, or complex literature instantly."}
            </p>
          </div>
        </div>

        <form onSubmit={handleSummarize} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-2">
              {language === "malayalam" ? "ചുരുക്കേണ്ട വരികൾ ഇവിടെ പേസ്റ്റ് ചെയ്യുക" : "Paste Text Passage to Summarize"}
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={
                language === "malayalam"
                  ? "ഒരു പുസ്തക ഖണ്ഡികയോ വാർത്താ ഭാഗങ്ങളോ ഇവിടെ കോപ്പി ചെയ്ത് ചേർക്കുക..."
                  : "Paste your essays, textbook segments, or lecture transcripts here..."
              }
              rows={6}
              className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm leading-relaxed"
              required
            />
            <div className="text-right text-xs text-gray-400 dark:text-gray-500 mt-1">
              {text.length} {language === "malayalam" ? "അക്ഷരങ്ങൾ" : "characters"}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-2">
                {language === "malayalam" ? "സമ്മറിയുടെ ദൈർഘ്യം" : "Summary Target Length"}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {["short", "intermediate", "detailed"].map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setTargetLength(lvl)}
                    className={`py-2 px-3 rounded-lg text-xs font-medium border capitalize transition-all ${
                      targetLength === lvl
                        ? "bg-blue-50 dark:bg-blue-950/40 border-blue-500 text-blue-600 dark:text-blue-400"
                        : "border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                    }`}
                  >
                    {lvl === "short" ? (language === "malayalam" ? "ചുരുങ്ങിയത്" : "Short") : lvl === "intermediate" ? (language === "malayalam" ? "ഇടത്തരം" : "Medium") : (language === "malayalam" ? "വിശദമായത്" : "Detailed")}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                disabled={loading || !text.trim()}
                className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium text-sm hover:opacity-95 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none shadow-md shadow-blue-500/10 cursor-pointer transition-all"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>{language === "malayalam" ? "ചുരുക്കുന്നു..." : "Condensing..."}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>{language === "malayalam" ? "സമ്മറി തയാറാക്കുക" : "Generate Summary"}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Error container */}
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
              <ListCollapse className="w-6 h-6 text-indigo-500 animate-pulse" />
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-lg text-gray-800 dark:text-white">
              {language === "malayalam" ? "സമ്മറി തയ്യാറാക്കുന്നു..." : "Structuring Summary Highlight..."}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mt-1">
              {language === "malayalam"
                ? "നിങ്ങളുടെ വലിയ പഠന ഭാഗങ്ങളിൽ നിന്നും പ്രധാന ആശയങ്ങളെ ലാമ അരിച്ചെടുക്കുകയാണ്."
                : "Groq will process, rank sentences, identify main theses, and extract bullet summaries."}
            </p>
          </div>
        </div>
      )}

      {/* Results output */}
      {!loading && summaryOutput && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/50 overflow-hidden"
        >
          {/* Output Toolbar */}
          <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/80 border-b border-gray-100 dark:border-gray-700/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ListCollapse className="w-4 h-4 text-emerald-500" />
              <span className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 tracking-wider">
                {language === "malayalam" ? "ലഭ്യമായ സമ്മറി" : "Compiled Summary Output"}
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
                    <span>Copy summary</span>
                  </>
                )}
              </button>

              <button
                onClick={handleSaveSummary}
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
                  exportSummaryToPDF({
                    id: "temp",
                    originalText: text.trim(),
                    targetLength,
                    language,
                    summary: summaryOutput,
                    createdAt: new Date().toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric"
                    })
                  });
                }}
                className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 flex items-center gap-1.5 text-xs text-nowrap cursor-pointer transition-all"
                title="Download Summary PDF"
              >
                <Download className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>Download PDF</span>
              </button>
            </div>
          </div>

          <div className="p-6 md:p-8">
            <article 
              className="markdown-content text-gray-800 dark:text-gray-200 break-words"
              dangerouslySetInnerHTML={{ __html: parseMarkdown(summaryOutput) }}
            />
          </div>
        </motion.div>
      )}

      {/* Info card */}
      {!loading && !summaryOutput && (
        <div className="bg-gradient-to-br from-indigo-50/50 to-blue-50/20 dark:from-violet-950/10 dark:to-blue-950/10 border border-indigo-100/40 dark:border-indigo-900/10 p-6 rounded-xl flex items-start gap-4">
          <ListCollapse className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
              {language === "malayalam" ? "വേഗത്തിൽ പ്രധാനികൾ" : "Speed Read & Condense Essays"}
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              {language === "malayalam"
                ? "വലിയ ഭാഗങ്ങൾ വായിച്ചുതീർക്കാൻ ബുദ്ധിമുട്ടുന്നവർക്കായി സമയം കളയാതെ കാര്യങ്ങൾ തരംതിരിച്ചു നൽകാൻ ഈ റീഡിങ് ഫീച്ചർ ഉപയോഗിക്കാം."
                : "Save dozens of study hours by pasting entire articles. Get high quality structured bullet frameworks instantly."}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
