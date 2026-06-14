import React, { useState } from "react";
import { BookOpen, Sparkles, Copy, Check, Save, FileText, AlertCircle, RefreshCw, Download } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { SavedNote } from "../types";
import { exportNoteToPDF } from "../utils/pdfExport";

interface SmartNotesProps {
  language: "english" | "malayalam";
  onSaveNote: (note: SavedNote) => void;
  savedNotes: SavedNote[];
}

export default function SmartNotes({ language, onSaveNote, savedNotes }: SmartNotesProps) {
  const [topic, setTopic] = useState("");
  const [depth, setDepth] = useState("intermediate");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedNotes, setGeneratedNotes] = useState("");
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  // Simple Markdown parsing helper to avoid external package weight 
  // and give structured HTML nicely within security guidelines
  const parseMarkdown = (text: string) => {
    if (!text) return "";
    
    // Safely encode html characters
    let html = text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    // Headings
    html = html.replace(/^### (.*?)$/gm, "<h3 class='text-lg font-bold text-violet-700 dark:text-violet-300 mt-4 mb-2'>$1</h3>");
    html = html.replace(/^## (.*?)$/gm, "<h2 class='text-xl font-bold text-violet-800 dark:text-violet-200 mt-5 mb-3 border-b border-violet-100 dark:border-violet-800/50 pb-1'>$1</h2>");
    html = html.replace(/^# (.*?)$/gm, "<h1 class='text-2xl font-extrabold text-violet-900 dark:text-violet-100 mt-6 mb-4'>$1</h1>");

    // Bold
    html = html.replace(/\*\*(.*?)\*\*/g, "<strong class='font-semibold text-gray-900 dark:text-white'>$1</strong>");

    // Code blocks
    html = html.replace(/```([\s\S]*?)```/g, "<pre class='bg-gray-950 text-gray-200 p-4 rounded-lg overflow-x-auto my-4 font-mono text-sm leading-relaxed border border-gray-800'><code>$1</code></pre>");

    // Inline code
    html = html.replace(/`(.*?)`/g, "<code class='bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300 px-1.5 py-0.5 rounded font-mono text-xs border border-violet-100 dark:border-violet-900/40'>$1</code>");

    // Blockquotes
    html = html.replace(/^> (.*?)$/gm, "<blockquote class='border-l-4 border-violet-500 bg-violet-50/50 dark:bg-violet-950/20 pl-4 py-2 pr-2 my-4 italic text-gray-700 dark:text-gray-300 rounded-r-md'>$1</blockquote>");

    // Unordered lists
    html = html.replace(/^\s*-\s+(.*?)$/gm, "<li class='text-gray-700 dark:text-gray-300 ml-5 list-disc my-1.5'>$1</li>");

    // Paragraphs fallback
    const lines = html.split("\n");
    const processedLines = lines.map(line => {
      if (line.trim() === "") return "";
      if (line.startsWith("<h") || line.startsWith("<li") || line.startsWith("<pre") || line.startsWith("<blockquote") || line.startsWith("</pre") || line.startsWith("</blockquote")) {
        return line;
      }
      return `<p class="my-2.5 text-gray-700 dark:text-gray-300 leading-relaxed">${line}</p>`;
    });

    return processedLines.join("\n");
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setLoading(true);
    setError(null);
    setGeneratedNotes("");
    setCopied(false);
    setSaved(false);

    try {
      const response = await fetch("/api/generate-notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: topic.trim(),
          detailLevel: depth,
          language
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Something went wrong while generating notes");
      }

      setGeneratedNotes(data.notes || "");
    } catch (err: any) {
      setError(err.message || "Failed to communicate with Groq AI API");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!generatedNotes) return;
    navigator.clipboard.writeText(generatedNotes);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = () => {
    if (!generatedNotes) return;
    const newNote: SavedNote = {
      id: crypto.randomUUID(),
      topic: topic.trim(),
      detailLevel: depth,
      language,
      content: generatedNotes,
      createdAt: new Date().toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric"
      })
    };
    onSaveNote(newNote);
    setSaved(true);
  };

  return (
    <div id="smart-notes-module" className="space-y-6">
      {/* Input Header Panel */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 transition-all">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 text-white flex items-center justify-center shadow-md shadow-blue-500/10">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white transition-colors">
              {language === "malayalam" ? "സ്മാർട്ട് നോട്ട്സ് ജനറേറ്റർ" : "Smart Notes Generator"}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {language === "malayalam"
                ? "ഏത് വിഷയത്തെക്കുറിച്ചും വൃത്തിയുള്ള വിശദമായ പഠന കുറിപ്പുകൾ തൽക്ഷണം നിർമ്മിക്കുക."
                : "Instantly compile deeply structured study notes, references, and insights for any topic."}
            </p>
          </div>
        </div>

        <form onSubmit={handleGenerate} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
              {language === "malayalam" ? "പഠന വിഷയം നൽകുക" : "Enter Topic or Content"}
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder={
                language === "malayalam"
                  ? "ഉദാഹരണത്തിന്: പ്രകാശസംശ്ലേഷണം, ജൈവവൈവിധ്യം, പ്രപഞ്ചം"
                  : "e.g., Photosynthesis Process and Stages, Newton's Laws..."
              }
              className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm transition-all"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
                {language === "malayalam" ? "കുറിപ്പുകളുടെ വ്യാപ്തി" : "Detail Level"}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {["short", "intermediate", "detailed"].map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setDepth(lvl)}
                    className={`py-2 px-3 rounded-lg text-xs font-medium border capitalize transition-all cursor-pointer ${
                      depth === lvl
                        ? "bg-blue-50 dark:bg-blue-950/40 border-blue-500 text-blue-600 dark:text-blue-400"
                        : "border-slate-250 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                    }`}
                  >
                    {lvl === "short" ? (language === "malayalam" ? "ചെറിയത്" : "Short") : lvl === "intermediate" ? (language === "malayalam" ? "ഇടത്തരം" : "Medium") : (language === "malayalam" ? "വിശദമായത്" : "Detailed")}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                disabled={loading || !topic.trim()}
                className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-sm tracking-wide disabled:opacity-50 disabled:pointer-events-none hover:opacity-95 active:scale-[0.98] shadow-lg shadow-blue-500/15 cursor-pointer transition-all"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>{language === "malayalam" ? "തയ്യാറാക്കുന്നു..." : "Writing Notes..."}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>{language === "malayalam" ? "നോട്ടു തയ്യാറാക്കുക" : "Generate Notes"}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Error Message */}
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
              <p className="font-semibold">Generation Failed</p>
              <p>{error}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results Workspace */}
      {loading && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-center space-y-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-slate-100 dark:border-slate-900/40 rounded-full animate-spin border-t-blue-600 dark:border-t-blue-400"></div>
            <Sparkles className="w-6 h-6 text-blue-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
          </div>
          <div>
            <h3 className="font-semibold text-lg text-slate-800 dark:text-white">
              {language === "malayalam" ? "AI നോട്ട്സ് തയ്യാറാക്കുന്നു" : "Drafting Academic Notes..."}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mt-1">
              {language === "malayalam"
                ? "ഞങ്ങളുടെ എക്സ്പെർട്ട് മോഡൽ വിഷയം വിശകലനം ചെയ്തു മികച്ച റെഫറൻസുകൾ തയ്യാറാക്കുകയാണ്."
                : "Groq LLaMA models are processing and formatting clean, logical revision structures..."}
            </p>
          </div>
        </div>
      )}

      {!loading && generatedNotes && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden"
        >
          {/* Output Toolbar */}
          <div className="px-6 py-4 bg-slate-55/70 dark:bg-slate-850 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider">
                {language === "malayalam" ? "തയ്യാറാക്കിയ വിഷയം" : "AI Generated Output"}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-600 dark:text-slate-300 flex items-center gap-1.5 text-xs text-nowrap cursor-pointer hover:text-slate-800 dark:hover:text-white shadow-xs transition-all"
                title="Copy markdown text"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="text-emerald-500 font-semibold">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Notes</span>
                  </>
                )}
              </button>

              <button
                onClick={handleSave}
                disabled={saved}
                className={`px-3 py-1.5 rounded-lg border flex items-center gap-1.5 text-xs text-nowrap cursor-pointer transition-all ${
                  saved
                    ? "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 text-emerald-600 dark:text-emerald-400"
                    : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-600 dark:text-slate-300 shadow-xs hover:text-slate-850"
                }`}
              >
                {saved ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span className="font-semibold">Saved!</span>
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
                  exportNoteToPDF({
                    id: "temp",
                    topic: topic.trim() || "Generated Note",
                    detailLevel: depth,
                    language,
                    content: generatedNotes,
                    createdAt: new Date().toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric"
                    })
                  });
                }}
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-600 dark:text-slate-300 flex items-center gap-1.5 text-xs text-nowrap cursor-pointer hover:text-slate-800 dark:hover:text-white shadow-xs transition-all"
                title="Download notes as PDF"
              >
                <Download className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>Download PDF</span>
              </button>
            </div>
          </div>

          {/* Rendered Notes Markup */}
          <div className="p-6 md:p-8">
            <article 
              className="markdown-content text-slate-800 dark:text-slate-200 break-words"
              dangerouslySetInnerHTML={{ __html: parseMarkdown(generatedNotes) }}
            />
          </div>
        </motion.div>
      )}

      {/* Suggestive Start */}
      {!loading && !generatedNotes && (
        <div className="bg-gradient-to-br from-blue-50/50 to-indigo-50/25 dark:from-slate-900/40 dark:to-slate-900/10 border border-blue-100/50 dark:border-slate-800 p-6 rounded-2xl flex items-start gap-4 shadow-xs">
          <Sparkles className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              {language === "malayalam" ? "ഡബിൾ പവർ ലാംഗ്വേജ് പിന്തുണ" : "Active Recalls with Bilingual Support"}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {language === "malayalam"
                ? "പഠന വിഷയങ്ങൾ മലയാളത്തിലേക്ക് മാറ്റി ചിട്ടപ്പെടുത്തിയാൽ ആശയങ്ങൾ കൂടുതൽ ഹൃദ്യമായി മനസ്സിലാക്കാൻ സാധിക്കും. മുകളിലുള്ള ബട്ടൺ ക്ലിക്ക് ചെയ്തു എപ്പോൾ വേണമെങ്കിലും ഭാഷ മാറ്റാവുന്നതാണ്."
                : "Easily switch study language inside the top panel anytime. Perfect for bilingual studies or Malayalam language-medium students looking for complex topics parsed clearly."}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
