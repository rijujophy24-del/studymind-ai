import React, { useState, useEffect } from "react";
import {
  GraduationCap,
  Sparkles,
  BookOpen,
  Layers,
  HelpCircle,
  MessageSquare,
  Smile,
  ListCollapse,
  FolderHeart,
  Sun,
  Moon,
  Menu,
  X,
  Globe,
  AlertTriangle,
  Compass,
  FileSpreadsheet
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import {
  Tab,
  Language,
  SavedNote,
  SavedFlashcardDeck,
  SavedQuiz,
  SavedDoubt,
  SavedSimpleExplanation,
  SavedSummary
} from "./types";

// Import modules
import SmartNotes from "./components/SmartNotes";
import Flashcards from "./components/Flashcards";
import Quiz from "./components/Quiz";
import DoubtSolver from "./components/DoubtSolver";
import SimpleExplainer from "./components/SimpleExplainer";
import SummaryGenerator from "./components/SummaryGenerator";
import Library from "./components/Library";

export default function App() {
  // Navigation & Language
  const [activeTab, setActiveTab] = useState<Tab>("notes");
  const [language, setLanguage] = useState<Language>("english");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Theme support
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    const saved = localStorage.getItem("studymind-theme");
    return saved === "dark" ? "dark" : "light";
  });

  // App API Verification
  const [hasGroqKey, setHasGroqKey] = useState<boolean | null>(null);

  // Local Storage Saved States
  const [savedNotes, setSavedNotes] = useState<SavedNote[]>(() => {
    return JSON.parse(localStorage.getItem("studymind-notes") || "[]");
  });
  const [savedDecks, setSavedDecks] = useState<SavedFlashcardDeck[]>(() => {
    return JSON.parse(localStorage.getItem("studymind-decks") || "[]");
  });
  const [savedQuizzes, setSavedQuizzes] = useState<SavedQuiz[]>(() => {
    return JSON.parse(localStorage.getItem("studymind-quizzes") || "[]");
  });
  const [savedDoubts, setSavedDoubts] = useState<SavedDoubt[]>(() => {
    return JSON.parse(localStorage.getItem("studymind-doubts") || "[]");
  });
  const [savedExplanations, setSavedExplanations] = useState<SavedSimpleExplanation[]>(() => {
    return JSON.parse(localStorage.getItem("studymind-explanations") || "[]");
  });
  const [savedSummaries, setSavedSummaries] = useState<SavedSummary[]>(() => {
    return JSON.parse(localStorage.getItem("studymind-summaries") || "[]");
  });

  // Write changes to disk on compile
  useEffect(() => {
    localStorage.setItem("studymind-notes", JSON.stringify(savedNotes));
  }, [savedNotes]);

  useEffect(() => {
    localStorage.setItem("studymind-decks", JSON.stringify(savedDecks));
  }, [savedDecks]);

  useEffect(() => {
    localStorage.setItem("studymind-quizzes", JSON.stringify(savedQuizzes));
  }, [savedQuizzes]);

  useEffect(() => {
    localStorage.setItem("studymind-doubts", JSON.stringify(savedDoubts));
  }, [savedDoubts]);

  useEffect(() => {
    localStorage.setItem("studymind-explanations", JSON.stringify(savedExplanations));
  }, [savedExplanations]);

  useEffect(() => {
    localStorage.setItem("studymind-summaries", JSON.stringify(savedSummaries));
  }, [savedSummaries]);

  // Handle active theme toggling with tailwind .dark class
  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("studymind-theme", theme);
  }, [theme]);

  // Config checking on start
  useEffect(() => {
    fetch("/api/config-check")
      .then((res) => res.json())
      .then((data) => {
        setHasGroqKey(!!data.hasGroqKey);
      })
      .catch((err) => {
        console.error("Health check failure:", err);
        setHasGroqKey(false);
      });
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  // State setters
  const handleSaveNote = (note: SavedNote) => {
    setSavedNotes((prev) => [note, ...prev]);
  };
  const handleSaveDeck = (deck: SavedFlashcardDeck) => {
    setSavedDecks((prev) => [deck, ...prev]);
  };
  const handleSaveQuiz = (quiz: SavedQuiz) => {
    setSavedQuizzes((prev) => [quiz, ...prev]);
  };
  const handleSaveDoubt = (doubt: SavedDoubt) => {
    setSavedDoubts((prev) => [doubt, ...prev]);
  };
  const handleSaveExplanation = (exp: SavedSimpleExplanation) => {
    setSavedExplanations((prev) => [exp, ...prev]);
  };
  const handleSaveSummary = (sum: SavedSummary) => {
    setSavedSummaries((prev) => [sum, ...prev]);
  };

  // State removers
  const handleDeleteNote = (id: string) => {
    setSavedNotes((prev) => prev.filter((item) => item.id !== id));
  };
  const handleDeleteDeck = (id: string) => {
    setSavedDecks((prev) => prev.filter((item) => item.id !== id));
  };
  const handleDeleteQuiz = (id: string) => {
    setSavedQuizzes((prev) => prev.filter((item) => item.id !== id));
  };
  const handleDeleteDoubt = (id: string) => {
    setSavedDoubts((prev) => prev.filter((item) => item.id !== id));
  };
  const handleDeleteExplanation = (id: string) => {
    setSavedExplanations((prev) => prev.filter((item) => item.id !== id));
  };
  const handleDeleteSummary = (id: string) => {
    setSavedSummaries((prev) => prev.filter((item) => item.id !== id));
  };

  const navItems = [
    { id: "notes", name: language === "malayalam" ? "സ്മാർട്ട് നോട്ട്സ്" : "Smart Notes", description: "Generate concise outlines", icon: BookOpen },
    { id: "flashcards", name: language === "malayalam" ? "ഫ്ലാഷ്കാർഡ്സ്" : "Flashcard Maker", description: "Automated Q&A cards", icon: Layers },
    { id: "quiz", name: language === "malayalam" ? "എം.സി.ക്യു ക്വിസ്" : "MCQ Quiz", description: "Test core knowledge", icon: HelpCircle },
    { id: "doubt", name: language === "malayalam" ? "സംശയം ചോദിക്കാം" : "AI Doubt Solver", description: "Instant feedback lookup", icon: MessageSquare },
    { id: "explain", name: language === "malayalam" ? "ലളിത വിശദീകരണം" : "Simple Explainer", description: "ELI5 concept coaching", icon: Smile },
    { id: "summary", name: language === "malayalam" ? "സമ്മറി ജനറേറ്റർ" : "Summary Generator", description: "Outlines complex papers", icon: ListCollapse },
  ] as const;

  const libraryItemCount =
    savedNotes.length +
    savedDecks.length +
    savedQuizzes.length +
    savedDoubts.length +
    savedExplanations.length +
    savedSummaries.length;

  return (
    <div className="flex min-h-screen bg-[#f8fafc] dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 transition-colors duration-300">
      
      {/* 1. OFF-CANVAS SIDEBAR DESIGN FOR DESKTOP */}
      <aside className="hidden lg:flex flex-col w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 shrink-0 sticky top-0 h-screen transition-colors duration-300">
        
        {/* Sidebar Brand identity */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-md shadow-blue-500/10 flex items-center justify-center">
            <GraduationCap className="w-5.5 h-5.5" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
              StudyMind AI
            </h1>
            <p className="text-[9px] font-semibold text-slate-400 dark:text-slate-500 tracking-wider uppercase mt-0.5">
              Groq LLaMA 3.3 Workspace
            </p>
          </div>
        </div>

        {/* Feature Navigation Links */}
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          <p className="px-3 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 select-none">
            {language === "malayalam" ? "ഫീച്ചറുകൾ" : "Study Features"}
          </p>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-left cursor-pointer transition-all ${
                  isActive
                    ? "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-semibold shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40"
                }`}
              >
                <Icon className={`w-4.5 h-4.5 shrink-0 ${isActive ? "text-blue-600 dark:text-blue-400" : "text-slate-400"}`} />
                <div>
                  <div className="text-xs font-semibold">{item.name}</div>
                  <div className="text-[9px] text-slate-400 dark:text-slate-500 line-clamp-1 mt-0.5">
                    {item.description}
                  </div>
                </div>
              </button>
            );
          })}

          <div className="border-t border-slate-100 dark:border-slate-800 pt-4 mt-3">
            <button
              onClick={() => setActiveTab("library")}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl cursor-pointer transition-all ${
                activeTab === "library"
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold shadow-md shadow-blue-500/10"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40"
              }`}
            >
              <div className="flex items-center gap-3">
                <FolderHeart className={`w-4.5 h-4.5 shrink-0 ${activeTab === "library" ? "text-white" : "text-slate-400"}`} />
                <span className="text-xs font-semibold">{language === "malayalam" ? "എന്റെ ലൈബ്രറി" : "My Study Library"}</span>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${activeTab === "library" ? "bg-white text-blue-750" : "bg-slate-150 dark:bg-slate-800 text-slate-500 dark:text-slate-400"}`}>
                {libraryItemCount}
              </span>
            </button>
          </div>
        </nav>

        {/* Dynamic Model and Status Indicator inside Sidebar footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800">
          <div className="p-4 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-md shadow-blue-500/10">
            <p className="text-[10px] font-semibold uppercase tracking-wider mb-1.5 opacity-80">
              {language === "malayalam" ? "മോഡൽ ലേബൽ" : "Current Model"}
            </p>
            <p className="text-sm font-medium flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              llama-3.3-70b
            </p>
            <p className="text-[10px] mt-1 opacity-75">
              {language === "malayalam" ? "വേഗതയേറിയ പഠന സഹായി" : "Versatile Study Mode"}
            </p>
          </div>
        </div>
      </aside>

      {/* 2. MAIN HUB SPACE */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Dynamic Global Top Bar */}
        <header className="sticky top-0 z-25 h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 flex items-center justify-between transition-colors duration-300">
          <div className="flex items-center gap-3">
            {/* Hamburger Trigger for Mobile - Upgraded to stick out with premium styling */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden flex items-center gap-2.5 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-650 text-white font-bold text-sm tracking-wider shadow-lg shadow-blue-500/25 hover:scale-[1.05] active:scale-[0.95] transition-all cursor-pointer mr-1 relative overflow-hidden group"
              title="Open Navigation"
            >
              <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-purple-650 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
              <Menu className="w-5 h-5 relative z-10 animate-pulse" />
              <span className="relative z-10 tracking-widest text-xs font-black font-sans uppercase">
                {language === "malayalam" ? "മെനു" : "Navigation"}
              </span>
            </button>

            {/* Mobile Brand indicator */}
            <div className="lg:hidden flex items-center gap-2">
              <span className="text-lg font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                StudyMind AI
              </span>
            </div>
            
            <div className="hidden lg:flex items-center gap-3">
              <span className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide capitalize">
                {activeTab === "notes"
                  ? (language === "malayalam" ? "സ്മാർട്ട് നോട്ട്സ്" : "Smart Notes Generator")
                  : activeTab === "flashcards"
                  ? (language === "malayalam" ? "ഫ്ലാഷ്കാർഡ്സ്" : "Flashcards Designer")
                  : activeTab === "quiz"
                  ? (language === "malayalam" ? "ക്വിസ് നിലവറ" : "MCQ Assessment Tracker")
                  : activeTab === "doubt"
                  ? (language === "malayalam" ? "സംശയം ചോദിക്കാം" : "AI Doubt Solver")
                  : activeTab === "explain"
                  ? (language === "malayalam" ? "ലളിത വിശദീകരണം" : "ELI5 Concept Coach")
                  : activeTab === "summary"
                  ? (language === "malayalam" ? "സമ്മറി ജനറേറ്റർ" : "Summary Outliner")
                  : (language === "malayalam" ? "എന്റെ ലൈബ്രറി" : "Personal Workspace Library")}
              </span>
              <span className="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold rounded uppercase tracking-wide border border-emerald-200/50 dark:border-emerald-900/30">
                Connected
              </span>
            </div>
          </div>

          {/* Bilingual & Darkmode Toolsets */}
          <div className="flex items-center gap-3">
            
            {/* Bilingual selection */}
            <div className="bg-slate-100 dark:bg-slate-850 p-1 rounded-xl flex items-center gap-0.5 border border-slate-200/60 dark:border-slate-800">
              <Globe className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0 ml-1.5 mr-1" />
              <button
                onClick={() => setLanguage("english")}
                className={`px-2 py-0.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                  language === "english"
                    ? "bg-white dark:bg-slate-750 text-blue-600 dark:text-blue-400 shadow-xs"
                    : "text-slate-500 dark:text-slate-400 hover:opacity-80"
                }`}
              >
                Eng
              </button>
              <button
                onClick={() => setLanguage("malayalam")}
                className={`px-2 py-0.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                  language === "malayalam"
                    ? "bg-white dark:bg-slate-750 text-blue-600 dark:text-blue-400 shadow-xs"
                    : "text-slate-500 dark:text-slate-400 hover:opacity-80"
                }`}
              >
                മലയാളം
              </button>
            </div>
          </div>
        </header>

        {/* Global Key warning inside app viewport */}
        {hasGroqKey === false && (
          <div className="m-6 mb-0 p-4 bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 rounded-2xl flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs">
              <h4 className="font-bold">Missing Private Groq API Credentials</h4>
              <p className="leading-relaxed">
                StudyMind uses <strong>llama-3.3-70b-versatile</strong> to fetch notes, MCQs, and doubts. Please add the secret variable <strong>GROQ_API_KEY</strong> with your personal Groq token in the <strong>Secrets Panel</strong> inside Google AI Studio's user settings (accessible from the top bar), then restart.
              </p>
            </div>
          </div>
        )}

        {/* Vantages canvas */}
        <main className="flex-1 p-6 md:p-8 max-w-4xl w-full mx-auto space-y-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab + language}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === "notes" && (
                <SmartNotes
                  language={language}
                  onSaveNote={handleSaveNote}
                  savedNotes={savedNotes}
                />
              )}

              {activeTab === "flashcards" && (
                <Flashcards language={language} onSaveDeck={handleSaveDeck} />
              )}

              {activeTab === "quiz" && (
                <Quiz language={language} onSaveQuiz={handleSaveQuiz} />
              )}

              {activeTab === "doubt" && (
                <DoubtSolver
                  language={language}
                  onSaveDoubt={handleSaveDoubt}
                  savedDoubts={savedDoubts}
                />
              )}

              {activeTab === "explain" && (
                <SimpleExplainer
                  language={language}
                  onSaveExplanation={handleSaveExplanation}
                />
              )}

              {activeTab === "summary" && (
                <SummaryGenerator
                  language={language}
                  onSaveSummary={handleSaveSummary}
                />
              )}

              {activeTab === "library" && (
                <Library
                  language={language}
                  savedNotes={savedNotes}
                  savedDecks={savedDecks}
                  savedQuizzes={savedQuizzes}
                  savedDoubts={savedDoubts}
                  savedExplanations={savedExplanations}
                  savedSummaries={savedSummaries}
                  onDeleteNote={handleDeleteNote}
                  onDeleteDeck={handleDeleteDeck}
                  onDeleteQuiz={handleDeleteQuiz}
                  onDeleteDoubt={handleDeleteDoubt}
                  onDeleteExplanation={handleDeleteExplanation}
                  onDeleteSummary={handleDeleteSummary}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* 3. MOBILE BURGER DRAWER overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.45 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black z-30 lg:hidden"
            />

            {/* Sidebar Box drawer */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25 }}
              className="fixed inset-y-0 left-0 w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 z-40 lg:hidden p-5 flex flex-col justify-between shadow-2xl"
            >
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-md shadow-blue-500/10 flex items-center justify-center animate-spin-slow">
                      <GraduationCap className="w-5.5 h-5.5" />
                    </div>
                    <div>
                      <span className="font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent text-base">
                        StudyMind AI
                      </span>
                      <p className="text-[8px] font-semibold text-slate-400 dark:text-slate-500 tracking-wider uppercase mt-0.5">
                        Groq LLaMA Workspace
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 cursor-pointer transition-all"
                    title="Close"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-1.5">
                  <p className="px-3 text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 select-none">
                    {language === "malayalam" ? "ഫീച്ചറുകൾ" : "Study Features"}
                  </p>

                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveTab(item.id);
                          setMobileMenuOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-left cursor-pointer transition-all ${
                          isActive
                            ? "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-bold shadow-xs border border-blue-100/10 dark:border-blue-900/10"
                            : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40"
                        }`}
                      >
                        <Icon className={`w-4.5 h-4.5 shrink-0 ${isActive ? "text-blue-600 dark:text-blue-400" : "text-slate-400"}`} />
                        <div>
                          <div className="text-xs font-semibold">{item.name}</div>
                          <div className="text-[10px] text-slate-400 dark:text-slate-500 line-clamp-1 mt-0.5">
                            {item.description}
                          </div>
                        </div>
                      </button>
                    );
                  })}

                  <div className="border-t border-slate-100 dark:border-slate-800 pt-4 mt-3">
                    <button
                      onClick={() => {
                        setActiveTab("library");
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl cursor-pointer transition-all ${
                        activeTab === "library"
                          ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold shadow-md shadow-blue-500/10"
                          : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <FolderHeart className={`w-4.5 h-4.5 shrink-0 ${activeTab === "library" ? "text-white" : "text-slate-400"}`} />
                        <span className="text-xs font-semibold">{language === "malayalam" ? "എന്റെ ലൈബ്രറി" : "My Study Library"}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${activeTab === "library" ? "bg-white text-blue-700" : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"}`}>
                        {libraryItemCount}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="text-center text-[10px] text-slate-400 dark:text-slate-500 pt-4 border-t border-slate-100 dark:border-slate-800">
                StudyMind AI • Groq LLaMA 3.3
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
