import React, { useState } from "react";
import { Layers, Sparkles, Copy, Check, Save, RotateCcw, ChevronLeft, ChevronRight, RefreshCw, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Flashcard, SavedFlashcardDeck } from "../types";

interface FlashcardsProps {
  language: "english" | "malayalam";
  onSaveDeck: (deck: SavedFlashcardDeck) => void;
}

export default function Flashcards({ language, onSaveDeck }: FlashcardsProps) {
  const [topic, setTopic] = useState("");
  const [count, setCount] = useState(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deck, setDeck] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setLoading(true);
    setError(null);
    setDeck([]);
    setCurrentIndex(0);
    setIsFlipped(false);
    setSaved(false);

    try {
      const response = await fetch("/api/generate-flashcards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: topic.trim(),
          count,
          language
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to generate flashcards");
      }

      if (data.flashcards && Array.isArray(data.flashcards)) {
        setDeck(data.flashcards);
      } else {
        throw new Error("Invalid output format returned by AI.");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred while generating flashcards.");
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % deck.length);
    }, 100);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + deck.length) % deck.length);
    }, 100);
  };

  const handleSaveDeck = () => {
    if (deck.length === 0) return;
    const newDeck: SavedFlashcardDeck = {
      id: crypto.randomUUID(),
      topic: topic.trim(),
      language,
      cards: deck,
      createdAt: new Date().toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric"
      })
    };
    onSaveDeck(newDeck);
    setSaved(true);
  };

  return (
    <div id="flashcards-module" className="space-y-6">
      {/* Parameter Block */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 text-white flex items-center justify-center shadow-md shadow-blue-500/10">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              {language === "malayalam" ? "ഫ്ലാഷ്കാർഡ് മേക്കർ" : "Adaptive Flashcard Maker"}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {language === "malayalam"
                ? "ശരിയായ ഉത്തരങ്ങൾ ഓർത്തെടുക്കാൻ സഹായിക്കുന്ന ഫ്ലാറ്റുകൾ ഉണ്ടാക്കുക."
                : "Create bite-sized question and answer triggers to bolster active recall studies."}
            </p>
          </div>
        </div>

        <form onSubmit={handleGenerate} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
                {language === "malayalam" ? "വിഷയം നൽകുക" : "Flashcard Topic"}
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder={
                  language === "malayalam"
                    ? "ഉദാഹരണത്തിന്: ഇൻപുട്ട് ഡിവൈസുകൾ, മനുഷ്യാവയവങ്ങൾ, യുദ്ധങ്ങൾ"
                    : "e.g., Computer Memory, Mitosis, French Revolution..."
                }
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
                {language === "malayalam" ? "എണ്ണം" : "Card Count"}
              </label>
              <select
                value={count}
                onChange={(e) => setCount(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm cursor-pointer transition-all"
              >
                {[3, 5, 8, 10, 15].map((num) => (
                  <option key={num} value={num}>
                    {num} {language === "malayalam" ? "കാർഡുകൾ" : "Cards"}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={loading || !topic.trim()}
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-sm tracking-wide hover:opacity-95 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none shadow-lg shadow-blue-500/15 cursor-pointer transition-all"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>{language === "malayalam" ? "വായിക്കുന്നു..." : "Assembling..."}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>{language === "malayalam" ? "കാർഡുകൾ നിർമ്മിക്കുക" : "Generate Flashcards"}</span>
                </>
              )}
            </button>
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

      {/* Spinner card */}
      {loading && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-16 shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-center space-y-4">
          <div className="skew-y-3 relative w-16 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl shadow-lg flex items-center justify-center">
            <Layers className="w-8 h-8 text-white animate-bounce" />
          </div>
          <div>
            <h3 className="font-semibold text-lg text-slate-800 dark:text-white">
              {language === "malayalam" ? "തയ്യാറാക്കുന്നു..." : "Creating Flashcards..."}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mt-1">
              {language === "malayalam"
                ? "ലാമ 3.3 നിങ്ങളുടെ വിഷയത്തിലെ പ്രധാന ഭാഗങ്ങൾ കണ്ടെത്തുകയാണ്."
                : "Structuring term highlights into beautiful active-recall study flashcards..."}
            </p>
          </div>
        </div>
      )}

      {/* Main Flashcard Stage */}
      {!loading && deck.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">
              {language === "malayalam" ? "കാർഡുകൾ" : "Card"} {currentIndex + 1} / {deck.length}
            </span>

            <button
              onClick={handleSaveDeck}
              disabled={saved}
              className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs transition-all ${
                saved
                  ? "bg-emerald-50 dark:bg-emerald-950/25 border-emerald-200 text-emerald-600 dark:text-emerald-400"
                  : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-850"
              }`}
            >
              {saved ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>{language === "malayalam" ? "സൂക്ഷിച്ചു!" : "Deck Saved!"}</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>{language === "malayalam" ? "ഡെക്ക് സേവ് ചെയ്യുക" : "Save Deck to Library"}</span>
                </>
              )}
            </button>
          </div>

          {/* Interactive Card Canvas */}
          <div 
            onClick={() => setIsFlipped(!isFlipped)}
            className="group relative cursor-pointer h-72 w-full perspective-1000 select-none"
          >
            {/* Flippable Card body */}
            <div 
              style={{ transformStyle: "preserve-3d" }}
              className={`relative h-full w-full duration-500 ease-out transition-transform rounded-3xl shadow-md border ${
                isFlipped 
                  ? "transform rotate-y-180 border-violet-200 dark:border-violet-800 bg-violet-50/10 dark:bg-violet-950/10" 
                  : "border-gray-150 dark:border-gray-750 bg-white dark:bg-gray-800"
              }`}
            >
              {/* Front side */}
              <div 
                style={{ backfaceVisibility: "hidden" }}
                className="absolute inset-0 p-6 md:p-8 flex flex-col justify-between"
              >
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2 py-1 rounded-md uppercase tracking-wider">
                    {language === "malayalam" ? "ചോദ്യം" : "Question"}
                  </span>
                  <RotateCcw className="w-4 h-4 text-gray-400 group-hover:rotate-45 transition-transform duration-300" />
                </div>
                
                <div className="text-center py-2">
                  <p className="text-lg md:text-xl font-bold text-gray-800 dark:text-white leading-relaxed">
                    {deck[currentIndex].question}
                  </p>
                </div>

                <div className="text-center">
                  <p className="text-xs text-gray-400 dark:text-gray-500 italic">
                    {language === "malayalam" ? "ഉത്തരം കാണാൻ ക്ലിക്ക് ചെയ്യുക" : "Click anywhere to flip and reveal answer"}
                  </p>
                </div>
              </div>

              {/* Back side */}
              <div 
                style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
                className="absolute inset-x-0 inset-y-0 p-6 md:p-8 flex flex-col justify-between"
              >
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 px-2 py-1 rounded-md uppercase tracking-wider">
                    {language === "malayalam" ? "ഉത്തരം" : "Answer"}
                  </span>
                  <RotateCcw className="w-4 h-4 text-gray-400 group-hover:-rotate-45 transition-transform duration-300" />
                </div>

                <div className="text-center py-2 max-h-40 overflow-y-auto px-2">
                  <p className="text-base md:text-lg font-medium text-gray-700 dark:text-gray-200 leading-relaxed">
                    {deck[currentIndex].answer}
                  </p>
                </div>

                <div className="text-center">
                  <p className="text-xs text-purple-500 dark:text-purple-400 italic">
                    {language === "malayalam" ? "ചോദ്യത്തിലേക്ക് തിരിച്ചു പോകാൻ ക്ലിക്ക് ചെയ്യുക" : "Click anywhere to return to question"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-center gap-6 pt-2">
            <button
              onClick={handlePrev}
              className="p-3 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 shadow-sm cursor-pointer transition-all active:scale-90"
              title="Previous card"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <button
              onClick={() => setIsFlipped(!isFlipped)}
              className="px-6 py-2 rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-650 text-gray-800 dark:text-gray-200 text-xs font-semibold cursor-pointer transition-all"
            >
              Flip Card
            </button>

            <button
              onClick={handleNext}
              className="p-3 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 shadow-sm cursor-pointer transition-all active:scale-90"
              title="Next card"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Info message */}
      {!loading && deck.length === 0 && (
        <div className="bg-gradient-to-br from-indigo-50/50 to-blue-50/20 dark:from-violet-950/10 dark:to-blue-950/10 border border-indigo-100/40 dark:border-indigo-900/10 p-6 rounded-xl flex items-start gap-4">
          <Layers className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
              {language === "malayalam" ? "കാർഡുകൾ മറിച്ചു പഠിക്കാം (Active Learning)" : "Master Concepts with Spatial Repetitions"}
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              {language === "malayalam"
                ? "ഫ്ലാഷ്കാർഡുകൾ ഉപയോഗിച്ചുള്ള പഠനരീതി കൂടുതൽ വിവരങ്ങൾ വേഗത്തിൽ തലച്ചോറിൽ സൂക്ഷിക്കാൻ സഹായിക്കുന്നു. ചോദ്യം കണ്ടയുടനെ മനസ്സിനുള്ളിൽ ഉത്തരം ഉറപ്പിച്ച ശേഷം കാർഡ് മറിച്ചു നോക്കൂ."
                : "Active recall study loops build long-term memory. Prompt Llama to produce card triggers, and drill yourself repeatedly for high exams retention!"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
