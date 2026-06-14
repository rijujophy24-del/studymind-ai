import React, { useState } from "react";
import { HelpCircle, Sparkles, CheckCircle2, XCircle, AlertCircle, RefreshCw, Award, ArrowRight, Save, Eye } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { QuizQuestion, SavedQuiz } from "../types";

interface QuizProps {
  language: "english" | "malayalam";
  onSaveQuiz: (savedQuiz: SavedQuiz) => void;
}

export default function Quiz({ language, onSaveQuiz }: QuizProps) {
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState("Medium");
  const [count, setCount] = useState(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quizList, setQuizList] = useState<QuizQuestion[]>([]);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setLoading(true);
    setError(null);
    setQuizList([]);
    setSelectedAnswers({});
    setQuizSubmitted(false);
    setSaved(false);

    try {
      const response = await fetch("/api/generate-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: topic.trim(),
          difficulty,
          count,
          language
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to generate quiz");
      }

      if (data.quiz && Array.isArray(data.quiz)) {
        setQuizList(data.quiz);
      } else {
        throw new Error("Invalid format returned by the AI.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to communicate with API server.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (qIdx: number, option: string) => {
    if (quizSubmitted) return;
    setSelectedAnswers((prev) => ({ ...prev, [qIdx]: option }));
  };

  const getScore = () => {
    let score = 0;
    quizList.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctAnswer) {
        score++;
      }
    });
    return score;
  };

  const handleSaveQuiz = () => {
    if (quizList.length === 0) return;
    const finalScore = {
      correct: getScore(),
      total: quizList.length
    };
    const newSaved: SavedQuiz = {
      id: crypto.randomUUID(),
      topic: topic.trim(),
      difficulty,
      language,
      questions: quizList,
      score: finalScore,
      createdAt: new Date().toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric"
      })
    };
    onSaveQuiz(newSaved);
    setSaved(true);
  };

  return (
    <div id="quiz-module" className="space-y-6">
      {/* Parameter Block */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 text-white flex items-center justify-center shadow-md shadow-blue-500/10">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              {language === "malayalam" ? "എം.സി.ക്യു ക്വിസ്" : "Smart MCQ Quiz Generator"}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {language === "malayalam"
                ? "വിഷയം നൽകി ഏത് സമയട്ടും സ്വയം വിലയിരുത്താൻ സാധിക്കുന്ന ചോദ്യങ്ങൾ നിർമ്മിക്കുക."
                : "Create direct multiple-choice tests with comprehensive automated grading and reviews."}
            </p>
          </div>
        </div>

        <form onSubmit={handleGenerate} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
                {language === "malayalam" ? "ക്വിസ് വിഷയം എന്ത്?" : "Quiz Topic"}
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder={
                  language === "malayalam"
                    ? "ഉദാഹരണത്തിന്: ഇന്ത്യൻ ഭരണഘടന, ഗ്രാവിറ്റി, സയൻസ്"
                    : "e.g., Photosynthesis, Python basics, World War II..."
                }
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm transition-all"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
                  {language === "malayalam" ? "ബുദ്ധിമുട്ട്" : "Difficulty"}
                </label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full px-3 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm cursor-pointer transition-all"
                >
                  <option value="Easy">{language === "malayalam" ? "ലളിതം" : "Easy"}</option>
                  <option value="Medium">{language === "malayalam" ? "ഇടത്തരം" : "Medium"}</option>
                  <option value="Hard">{language === "malayalam" ? "കഠിനം" : "Hard"}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
                  {language === "malayalam" ? "ചോദ്യങ്ങൾ" : "Questions"}
                </label>
                <select
                  value={count}
                  onChange={(e) => setCount(Number(e.target.value))}
                  className="w-full px-3 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm cursor-pointer transition-all"
                >
                  {[3, 5, 8, 10].map((num) => (
                    <option key={num} value={num}>
                      {num}
                    </option>
                  ))}
                </select>
              </div>
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
                  <span>{language === "malayalam" ? "ചോദ്യങ്ങൾ തയ്യാറാക്കുന്നു..." : "Structuring Quiz..."}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>{language === "malayalam" ? "ക്വിസ് ആരംഭിക്കുക" : "Generate Core Quiz"}</span>
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

      {/* Loading Spinner */}
      {loading && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-16 shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-16 h-16 border-4 border-slate-100 dark:border-slate-900/35 rounded-full animate-spin border-t-blue-600 dark:border-t-blue-450 flex items-center justify-center">
            <HelpCircle className="w-6 h-6 text-blue-500 animate-pulse" />
          </div>
          <div>
            <h3 className="font-semibold text-lg text-slate-800 dark:text-white">
              {language === "malayalam" ? "ക്വിസ് ജനറേറ്റ് ചെയ്യുന്നു" : "Generating Evaluative Test..."}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mt-1">
              {language === "malayalam"
                ? "നിങ്ങളുടെ സിലബസിന് തികച്ചും അനുയോജ്യമായ ചോദ്യങ്ങളാണ് ലാമ തയ്യാറാക്കുന്നത്."
                : "Developing distractor answers, establishing explanations, and packing custom datasets."}
            </p>
          </div>
        </div>
      )}

      {/* Interactive Quiz container */}
      {!loading && quizList.length > 0 && (
        <div className="space-y-6">
          {/* Result Block */}
          {quizSubmitted && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gradient-to-r from-blue-500/15 via-indigo-500/10 to-transparent p-6 rounded-2xl border border-blue-500/20 flex flex-col md:flex-row items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-600 text-white rounded-xl">
                  <Award className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    {language === "malayalam" ? "ക്വിസ് പൂർത്തിയായി!" : "Assessment Concluded!"}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    {language === "malayalam"
                      ? `നിങ്ങൾക്ക് ലഭിച്ച സ്കോർ: ${getScore()} / ${quizList.length}`
                      : `You scored ${getScore()} out of ${quizList.length} correctly.`}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleSaveQuiz}
                  disabled={saved}
                  className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-xs transition-all ${
                    saved
                      ? "bg-emerald-600 text-white"
                      : "bg-blue-600 hover:bg-blue-700 text-white"
                  }`}
                >
                  <Save className="w-4 h-4" />
                  <span>{saved ? (language === "malayalam" ? "റിപ്പോർട്ട് സൂക്ഷിച്ചു!" : "Report Saved!") : (language === "malayalam" ? "റിപ്പോർട്ട് സൂക്ഷിക്കുക" : "Save Report")}</span>
                </button>
              </div>
            </motion.div>
          )}

          {/* Questions list */}
          <div className="space-y-4">
            {quizList.map((q, qIdx) => {
              const isCorrect = selectedAnswers[qIdx] === q.correctAnswer;
              const hasAnswered = selectedAnswers[qIdx] !== undefined;

              return (
                <div
                  key={qIdx}
                  className={`bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border transition-all ${
                    quizSubmitted
                      ? isCorrect
                        ? "border-emerald-500/45 bg-emerald-50/5 dark:bg-emerald-950/5"
                        : "border-red-500/45 bg-red-50/5 dark:bg-red-950/5"
                      : "border-slate-200 dark:border-slate-800"
                  }`}
                >
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                    {language === "malayalam" ? `ചോദ്യം ${qIdx + 1}` : `Question ${qIdx + 1}`}
                  </span>
                  
                  <h3 className="text-base font-bold text-slate-900 dark:text-white leading-relaxed mb-4">
                    {q.question}
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                    {q.options.map((option, optIdx) => {
                      const isSelected = selectedAnswers[qIdx] === option;
                      const isCorrectOpt = q.correctAnswer === option;

                      let optStyle = "border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-850";
                      
                      if (isSelected) {
                        optStyle = "ring-2 ring-blue-500 border-blue-500 bg-blue-50/50 dark:bg-blue-950/20 text-slate-900 dark:text-white";
                      }

                      if (quizSubmitted) {
                        if (isCorrectOpt) {
                           optStyle = "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-400 border-emerald-500 ring-1 ring-emerald-500";
                        } else if (isSelected && !isCorrectOpt) {
                          optStyle = "bg-red-100 dark:bg-red-950/40 text-red-800 dark:text-red-400 border-red-500 ring-1 ring-red-500";
                        } else {
                          optStyle = "opacity-50 border-slate-100 dark:border-slate-900 text-slate-500";
                        }
                      }

                      return (
                        <button
                          key={optIdx}
                          type="button"
                          onClick={() => handleSelectOption(qIdx, option)}
                          disabled={quizSubmitted}
                          className={`px-4 py-3 rounded-xl border text-sm font-medium text-left flex items-start justify-between gap-3 transition-all ${optStyle} ${!quizSubmitted ? "cursor-pointer" : ""}`}
                        >
                          <span>{option}</span>
                          {quizSubmitted && isCorrectOpt && <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />}
                          {quizSubmitted && isSelected && !isCorrectOpt && <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />}
                        </button>
                      );
                    })}
                  </div>

                  {/* Individual explanation reveal */}
                  {quizSubmitted && (
                    <div className="p-4 bg-slate-50 dark:bg-slate-950/50 rounded-xl border border-slate-200/50 dark:border-slate-800/80 mt-4 text-xs md:text-sm text-slate-650 dark:text-slate-400 leading-relaxed">
                      <div className="flex gap-2 mb-1.5 font-bold text-slate-700 dark:text-slate-305">
                        <Eye className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        <span>{language === "malayalam" ? "പഠന വിശദീകരണം" : "Explanation"}</span>
                      </div>
                      <p>{q.explanation}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Submit Action */}
          {!quizSubmitted && (
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setQuizSubmitted(true)}
                disabled={Object.keys(selectedAnswers).length < quizList.length}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:opacity-95 disabled:opacity-55 disabled:pointer-events-none active:scale-[0.98] shadow-md shadow-blue-500/12 transition-all cursor-pointer"
              >
                <span>{language === "malayalam" ? "അവസാന അവലോകനം കാണുക" : "Submit & Auto Grade"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Intro card */}
      {!loading && quizList.length === 0 && (
        <div className="bg-gradient-to-br from-blue-50/50 to-indigo-50/25 dark:from-slate-900/40 dark:to-slate-900/10 border border-blue-100/50 dark:border-slate-800 p-6 rounded-2xl flex items-start gap-4">
          <HelpCircle className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              {language === "malayalam" ? "നോളജ് അസ്സസ്സ്മെന്റ്സ്" : "Bespoke Academic Assessment"}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {language === "malayalam"
                ? "നിങ്ങളുടെ അറിവിൻ്റെ ആഴം അളക്കാൻ ലാമ ക്വിസ് പ്രയോജനപ്പെടുത്താം. ഓരോ തെറ്റായ ഓപ്ഷനും തിരഞ്ഞെടുക്കുമ്പോഴും അത് തെറ്റാകാനുള്ള കാരണവും തിരുത്തലുകളും വ്യക്തമായി മനസ്സിലാക്കി തരും."
                : "Our MCQ framework scores answers instantly. Read generated rationales for correct/failed choices to solidify memory schemas perfectly."}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
