import React, { useState } from "react";
import { FolderHeart, BookOpen, Layers, HelpCircle, MessageSquare, Smile, ListCollapse, Trash2, Calendar, FileText, ChevronRight, Eye, Copy, Check, Download } from "lucide-react";
import { SavedNote, SavedFlashcardDeck, SavedQuiz, SavedDoubt, SavedSimpleExplanation, SavedSummary } from "../types";
import {
  exportNoteToPDF,
  exportSummaryToPDF,
  exportExplanationToPDF,
  exportDoubtToPDF,
  exportDeckToPDF,
  exportQuizToPDF
} from "../utils/pdfExport";

interface LibraryProps {
  language: "english" | "malayalam";
  savedNotes: SavedNote[];
  savedDecks: SavedFlashcardDeck[];
  savedQuizzes: SavedQuiz[];
  savedDoubts: SavedDoubt[];
  savedExplanations: SavedSimpleExplanation[];
  savedSummaries: SavedSummary[];
  onDeleteNote: (id: string) => void;
  onDeleteDeck: (id: string) => void;
  onDeleteQuiz: (id: string) => void;
  onDeleteDoubt: (id: string) => void;
  onDeleteExplanation: (id: string) => void;
  onDeleteSummary: (id: string) => void;
}

export default function Library({
  language,
  savedNotes,
  savedDecks,
  savedQuizzes,
  savedDoubts,
  savedExplanations,
  savedSummaries,
  onDeleteNote,
  onDeleteDeck,
  onDeleteQuiz,
  onDeleteDoubt,
  onDeleteExplanation,
  onDeleteSummary
}: LibraryProps) {
  const [activeSubTab, setActiveSubTab] = useState<"notes" | "decks" | "quizzes" | "doubts" | "explanations" | "summaries">("notes");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const parseMarkdownSimple = (text: string) => {
    if (!text) return "";
    let html = text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    html = html.replace(/^### (.*?)$/gm, "<h3 class='text-sm font-bold text-violet-700 dark:text-violet-300 mt-3 mb-1'>$1</h3>");
    html = html.replace(/^## (.*?)$/gm, "<h2 class='text-base font-bold text-violet-800 dark:text-violet-200 mt-4 mb-2 border-b border-gray-150 pb-1'>$1</h2>");
    html = html.replace(/^# (.*?)$/gm, "<h1 class='text-lg font-extrabold text-violet-900 dark:text-violet-100 mt-5 mb-3'>$1</h1>");
    html = html.replace(/\*\*(.*?)\*\*/g, "<strong class='font-semibold text-gray-900 dark:text-white'>$1</strong>");
    html = html.replace(/```([\s\S]*?)```/g, "<pre class='bg-gray-950 text-gray-200 p-4 rounded-lg overflow-x-auto my-3 font-mono text-xs border border-gray-800'><code>$1</code></pre>");
    html = html.replace(/`(.*?)`/g, "<code class='bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300 px-1 py-0.5 rounded font-mono text-xs'>$1</code>");
    html = html.replace(/^\s*-\s+(.*?)$/gm, "<li class='text-gray-700 dark:text-gray-300 ml-5 list-disc my-1'>$1</li>");

    const lines = html.split("\n");
    const processedLines = lines.map(line => {
      if (line.trim() === "") return "";
      if (line.startsWith("<h") || line.startsWith("<li") || line.startsWith("<pre")) {
        return line;
      }
      return `<p class="my-1.5 text-xs md:text-sm text-gray-700 dark:text-gray-300 leading-relaxed">${line}</p>`;
    });

    return processedLines.join("\n");
  };

  const subTabs = [
    { id: "notes", name: language === "malayalam" ? "കുറിപ്പുകൾ" : "Notes", count: savedNotes.length, icon: BookOpen },
    { id: "decks", name: language === "malayalam" ? "ഫ്ലാഷ്കാർഡ്സ്" : "Flashcards", count: savedDecks.length, icon: Layers },
    { id: "quizzes", name: language === "malayalam" ? "ക്വിസ്സുകൾ" : "Quizzes", count: savedQuizzes.length, icon: HelpCircle },
    { id: "doubts", name: language === "malayalam" ? "സംശയങ്ങൾ" : "Doubts", count: savedDoubts.length, icon: MessageSquare },
    { id: "explanations", name: language === "malayalam" ? "എക്സ്പ്ലനേഷൻ" : "ELI5 Explains", count: savedExplanations.length, icon: Smile },
    { id: "summaries", name: language === "malayalam" ? "സമ്മറികൾ" : "Summaries", count: savedSummaries.length, icon: ListCollapse },
  ] as const;

  const totalItems = savedNotes.length + savedDecks.length + savedQuizzes.length + savedDoubts.length + savedExplanations.length + savedSummaries.length;

  return (
    <div id="library-workspace" className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700/50">
        <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 text-white">
              <FolderHeart className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {language === "malayalam" ? "നിങ്ങളുടെ സ്റ്റഡി ലൈബ്രറി" : "Personal Study Library"}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {language === "malayalam"
                  ? `നിങ്ങൾ ഉണ്ടാക്കിയ വിവരങ്ങൾ ഇവിടെ ഭദ്രമായിരിക്കും. (ആകെ ഐറ്റംസ്: ${totalItems})`
                  : `Review and manage everything you have generated in StudyMind AI. (Total items: ${totalItems})`}
              </p>
            </div>
          </div>
        </div>

        {/* Sub Navigation pills */}
        <div className="flex flex-wrap gap-2 border-b border-gray-100 dark:border-gray-700/60 pb-4">
          {subTabs.map((subTab) => {
            const Icon = subTab.icon;
            const isActive = activeSubTab === subTab.id;
            return (
              <button
                key={subTab.id}
                onClick={() => setActiveSubTab(subTab.id as any)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                  isActive
                    ? "bg-violet-600 text-white shadow-sm"
                    : "bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-850"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{subTab.name}</span>
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${isActive ? "bg-white/20 text-white" : "bg-gray-200 dark:bg-gray-800 text-gray-500 dark:text-gray-400"}`}>
                  {subTab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid List content container */}
      <div className="space-y-4">
        {activeSubTab === "notes" && (
          <div className="space-y-4">
            {savedNotes.length === 0 ? (
              <NoItemsMessage text={language === "malayalam" ? "സേവ് ചെയ്ത വിവരങ്ങൾ ഒന്നും തന്നെ ലഭ്യമല്ല." : "No study notes saved yet. Go to Notes Generator to create some!"} />
            ) : (
              savedNotes.map((note) => (
                <div key={note.id} className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-750/70 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-gray-50 dark:border-gray-750 pb-3 flex-wrap gap-2">
                    <div>
                      <h3 className="text-base font-bold text-gray-900 dark:text-white capitalize">{note.topic}</h3>
                      <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Created on {note.createdAt}</span>
                        <span className="bullet text-gray-300">•</span>
                        <span className="capitalize">{note.detailLevel} depth</span>
                        <span className="bullet text-gray-300">•</span>
                        <span className="uppercase">{note.language}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => exportNoteToPDF(note)}
                        className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-750 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/20 cursor-pointer transition-all"
                        title="Download PDF"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleCopyText(note.id, note.content)}
                        className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-750 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-all"
                        title="Copy content"
                      >
                        {copiedId === note.id ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => onDeleteNote(note.id)}
                        className="p-1.5 rounded-lg border border-red-200 dark:border-red-900/30 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 cursor-pointer transition-all"
                        title="Delete note"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="markdown-content text-sm text-gray-750 dark:text-gray-200 max-h-96 overflow-y-auto pr-2" dangerouslySetInnerHTML={{ __html: parseMarkdownSimple(note.content) }} />
                </div>
              ))
            )}
          </div>
        )}

        {activeSubTab === "decks" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {savedDecks.length === 0 ? (
              <div className="col-span-full">
                <NoItemsMessage text={language === "malayalam" ? "സേവ് ചെയ്ത ഡെക്കുകൾ ഒന്നും തന്നെ ലഭ്യമല്ല." : "No flashcard decks saved yet. Go to Flashcard Maker to create some!"} />
              </div>
            ) : (
              savedDecks.map((deck) => (
                <div key={deck.id} className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-750/75 shadow-sm flex flex-col justify-between space-y-4">
                  <div className="flex items-start justify-between border-b border-gray-50 dark:border-gray-750 pb-3 gap-2">
                    <div>
                      <h3 className="text-base font-bold text-gray-900 dark:text-white capitalize">{deck.topic}</h3>
                      <p className="text-xs text-gray-400 mt-1">
                        {deck.cards.length} flashcards • {deck.language.toUpperCase()}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => exportDeckToPDF(deck)}
                        className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/20 cursor-pointer transition-all"
                        title="Download Flashcards PDF"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDeleteDeck(deck.id)}
                        className="p-1.5 rounded-lg border border-red-200 dark:border-red-900/30 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 cursor-pointer transition-all"
                        title="Delete deck"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Miniature deck preview */}
                  <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                    {deck.cards.map((card, idx) => (
                      <div key={idx} className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-100 dark:border-gray-800/60 text-xs">
                        <div className="font-bold text-gray-800 dark:text-gray-200">Q: {card.question}</div>
                        <div className="text-gray-500 dark:text-gray-450 mt-1 italic font-medium">A: {card.answer}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeSubTab === "quizzes" && (
          <div className="space-y-4">
            {savedQuizzes.length === 0 ? (
              <NoItemsMessage text={language === "malayalam" ? "സേവ് ചെയ്ത ക്വിസ്സുകൾ ഒന്നും തന്നെ ലഭ്യമല്ല." : "No quizzes saved yet. Check your knowledge in MCQ Quiz tab first!"} />
            ) : (
              savedQuizzes.map((quiz) => (
                <div key={quiz.id} className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-750/75 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-gray-50 dark:border-gray-750 pb-3 flex-wrap gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-gray-900 dark:text-white capitalize">{quiz.topic}</h3>
                        <span className="px-2 py-0.5 rounded bg-violet-100 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300 text-[10px] font-bold">
                          {quiz.difficulty}
                        </span>
                      </div>
                      <div className="text-xs text-gray-400 mt-0.5">
                        Taken on {quiz.createdAt} • {quiz.questions.length} questions
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {quiz.score && (
                        <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2.5 py-1 rounded-lg">
                          Score: {quiz.score.correct} / {quiz.score.total} ({Math.round((quiz.score.correct/quiz.score.total)*100)}%)
                        </span>
                      )}
                      <button
                        onClick={() => exportQuizToPDF(quiz)}
                        className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-750 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/20 cursor-pointer transition-all"
                        title="Download Quiz Solutions PDF"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDeleteQuiz(quiz.id)}
                        className="p-1.5 rounded-lg border border-red-200 dark:border-red-900/30 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 cursor-pointer transition-all"
                        title="Delete quiz"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Quiz questions outline */}
                  <div className="space-y-3 max-h-72 overflow-y-auto pr-2">
                    {quiz.questions.map((q, idx) => (
                      <div key={idx} className="p-3 bg-gray-50/60 dark:bg-gray-900/30 rounded-xl border border-gray-100 dark:border-gray-800/40 text-xs text-gray-700 dark:text-gray-300">
                        <span className="font-semibold block mb-1 text-gray-900 dark:text-white">Q{idx+1}: {q.question}</span>
                        <div className="text-emerald-600 dark:text-emerald-400 font-semibold">Correct: {q.correctAnswer}</div>
                        <div className="text-[11px] text-gray-450 mt-1 italic">{q.explanation}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeSubTab === "doubts" && (
          <div className="space-y-4">
            {savedDoubts.length === 0 ? (
              <NoItemsMessage text={language === "malayalam" ? "സംശയ നിവാരണങ്ങൾ ഒന്നും തന്നെ ലഭ്യമല്ല." : "No resolved doubts saved here. Ask questions inside Doubt Solver!"} />
            ) : (
              savedDoubts.map((doubt) => (
                <div key={doubt.id} className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-750/75 shadow-sm space-y-4">
                  <div className="flex items-start justify-between border-b border-gray-50 dark:border-gray-750 pb-3 gap-2">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-violet-600 px-1.5 py-0.5 rounded bg-violet-50 dark:bg-transparent">Question Answered</span>
                      <h3 className="text-base font-bold text-gray-900 dark:text-white mt-1">"{doubt.question}"</h3>
                      {doubt.context && (
                        <p className="text-xs text-gray-400 italic line-clamp-1 max-w-xl">
                          Context: {doubt.context}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => exportDoubtToPDF(doubt)}
                        className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-750 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/20 cursor-pointer transition-all"
                        title="Download PDF"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleCopyText(doubt.id, doubt.answer)}
                        className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-750 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                      >
                        {copiedId === doubt.id ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => onDeleteDoubt(doubt.id)}
                        className="p-1.5 rounded-lg border border-red-200 dark:border-red-900/30 text-red-500 hover:bg-red-55 dark:hover:bg-red-950/20 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="markdown-content text-sm text-gray-750 dark:text-gray-250 max-h-80 overflow-y-auto pr-1" dangerouslySetInnerHTML={{ __html: parseMarkdownSimple(doubt.answer) }} />
                </div>
              ))
            )}
          </div>
        )}

        {activeSubTab === "explanations" && (
          <div className="space-y-4">
            {savedExplanations.length === 0 ? (
              <NoItemsMessage text={language === "malayalam" ? "ലളിതമായ രൂപങ്ങൾ ഒന്നും തന്നെ ലഭ്യമല്ല." : "No simple explanations compiled. Use Simple Explainer first!"} />
            ) : (
              savedExplanations.map((exp) => (
                <div key={exp.id} className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-750/75 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-gray-50 dark:border-gray-750 pb-3 gap-2">
                    <div>
                      <h3 className="text-base font-bold text-gray-900 dark:text-white capitalize">{exp.topic} (ELI5)</h3>
                      <span className="text-xs text-gray-400">Created on {exp.createdAt}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => exportExplanationToPDF(exp)}
                        className="p-1.5 rounded-lg border border-gray-100 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/20 cursor-pointer transition-all"
                        title="Download PDF"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleCopyText(exp.id, exp.explanation)}
                        className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                      >
                        {copiedId === exp.id ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => onDeleteExplanation(exp.id)}
                        className="p-1.5 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="markdown-content text-sm text-gray-750 dark:text-gray-250 max-h-80 overflow-y-auto pr-1" dangerouslySetInnerHTML={{ __html: parseMarkdownSimple(exp.explanation) }} />
                </div>
              ))
            )}
          </div>
        )}

        {activeSubTab === "summaries" && (
          <div className="space-y-4">
            {savedSummaries.length === 0 ? (
              <NoItemsMessage text={language === "malayalam" ? "സേവ് ചെയ്ത സമ്മറികൾ ഒന്നും തന്നെ ലഭ്യമല്ല." : "No text summaries saved yet. Use Summary Generator to write outlines!"} />
            ) : (
              savedSummaries.map((sum) => (
                <div key={sum.id} className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-750/75 shadow-sm space-y-4">
                  <div className="flex items-start justify-between border-b border-gray-50 dark:border-gray-750 pb-3 gap-2">
                    <div>
                      <h3 className="text-base font-bold text-gray-900 dark:text-white truncate max-w-sm capitalize">
                        Summary Output Details
                      </h3>
                      <p className="text-xs text-gray-400 mt-1">
                        Original text length: {sum.originalText.length} characters • Depth: {sum.targetLength}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => exportSummaryToPDF(sum)}
                        className="p-1.5 rounded-lg border border-gray-100 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/20 cursor-pointer transition-all"
                        title="Download PDF"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleCopyText(sum.id, sum.summary)}
                        className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                      >
                        {copiedId === sum.id ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => onDeleteSummary(sum.id)}
                        className="p-1.5 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="markdown-content text-sm text-gray-750 dark:text-gray-250 max-h-80 overflow-y-auto pr-1" dangerouslySetInnerHTML={{ __html: parseMarkdownSimple(sum.summary) }} />
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function NoItemsMessage({ text }: { text: string }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 text-center border border-gray-100 dark:border-gray-750/60 shadow-sm flex flex-col items-center justify-center space-y-3">
      <div className="p-3 bg-violet-50 dark:bg-violet-950/30 rounded-full text-violet-500">
        <FolderHeart className="w-7 h-7" />
      </div>
      <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 max-w-sm leading-relaxed">
        {text}
      </p>
    </div>
  );
}
