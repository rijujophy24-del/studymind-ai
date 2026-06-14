import { SavedNote, SavedSummary, SavedSimpleExplanation, SavedDoubt, SavedQuiz, SavedFlashcardDeck } from "../types";

// Unified helper to parse Markdown into beautifully styled HTML for PDF printout
function parseMarkdownToHtml(text: string): string {
  if (!text) return "";

  // Safely escape basic characters
  let html = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // Headings
  html = html.replace(/^### (.*?)$/gm, "<h3 style='font-size: 14pt; font-weight: 700; color: #4338ca; margin-top: 18px; margin-bottom: 8px;'>$1</h3>");
  html = html.replace(/^## (.*?)$/gm, "<h2 style='font-size: 16pt; font-weight: 700; color: #1e1b4b; margin-top: 24px; margin-bottom: 12px; border-bottom: 2px solid #f1f5f9; padding-bottom: 4px;'>$1</h2>");
  html = html.replace(/^# (.*?)$/gm, "<h1 style='font-size: 20pt; font-weight: 800; color: #161445; margin-top: 28px; margin-bottom: 16px;'>$1</h1>");

  // Bold
  html = html.replace(/\*\*(.*?)\*\*/g, "<strong style='font-weight: 700; color: #0f172a;'>$1</strong>");

  // Code blocks
  html = html.replace(/```([\s\S]*?)```/g, "<pre style='background: #0f172a; color: #e2e8f0; padding: 12px 16px; border-radius: 8px; font-family: \"JetBrains Mono\", Courier, monospace; font-size: 10pt; line-height: 1.5; margin: 16px 0; overflow-x: auto; white-space: pre-wrap; word-break: break-all;'><code>$1</code></pre>");

  // Inline code
  html = html.replace(/`(.*?)`/g, "<code style='font-family: \"JetBrains Mono\", monospace; font-size: 10pt; background: #f1f5f9; color: #2563eb; padding: 2px 6px; border-radius: 4px; border: 1px solid #e2e8f0;'>$1</code>");

  // Blockquotes
  html = html.replace(/^> (.*?)$/gm, "<blockquote style='border-left: 4px solid #8b5cf6; background: #f5f3ff; font-style: italic; color: #5b21b6; padding: 10px 16px; margin: 16px 0; border-radius: 0 8px 8px 0;'>$1</blockquote>");

  // Unordered lists
  html = html.replace(/^\s*-\s+(.*?)$/gm, "<li style='font-size: 11pt; color: #334155; margin-bottom: 6px; margin-left: 20px; list-style-type: disc;'>$1</li>");

  // Paragraphs fallback
  const lines = html.split("\n");
  const processedLines = lines.map(line => {
    const trimmed = line.trim();
    if (trimmed === "") return "";
    if (trimmed.startsWith("<h") || trimmed.startsWith("<li") || trimmed.startsWith("<pre") || trimmed.startsWith("<blockquote") || trimmed.startsWith("</pre") || trimmed.startsWith("</blockquote")) {
      return line;
    }
    return `<p style="font-size: 11.5pt; color: #334155; line-height: 1.6; margin-top: 0; margin-bottom: 12px; text-align: justify;">${line}</p>`;
  });

  return processedLines.join("\n");
}

interface ExportOptions {
  title: string;
  metadata: { label: string; value: string }[];
  contentHtml: string;
}

// Spawns the high-fidelity iframe and triggers native Save as PDF print flow
function triggerIframePrint(options: ExportOptions) {
  const iframe = document.createElement("iframe");
  
  // Invisible element
  iframe.style.position = "fixed";
  iframe.style.right = "0";
  iframe.style.bottom = "0";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "0";
  iframe.style.zIndex = "-9999";
  
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document || iframe.contentDocument;
  if (!doc) {
    console.error("Could not obtain iframe document context");
    return;
  }

  const metaRowsHtml = options.metadata
    .map(m => `
      <div class="meta-item">
        <span class="meta-label">${m.label}:</span>
        <span class="meta-value">${m.value}</span>
      </div>
    `)
    .join("");

  const fullPrintHtml = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <title>${options.title}</title>
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
      <style>
        @page {
          size: A4;
          margin: 20mm 15mm 20mm 15mm;
        }
        body {
          font-family: 'Inter', -apple-system, sans-serif;
          color: #1e293b;
          background: #ffffff;
          line-height: 1.6;
          padding: 0;
          margin: 0;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        
        /* Premium Academic Header */
        .header {
          border-bottom: 2px solid #e2e8f0;
          padding-bottom: 16px;
          margin-bottom: 24px;
        }
        .header-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }
        .brand {
          font-size: 16pt;
          font-weight: 800;
          color: #2563eb;
          letter-spacing: -0.5px;
        }
        .doc-type {
          font-size: 10pt;
          font-weight: 600;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .main-title {
          font-size: 22pt;
          font-weight: 800;
          color: #0f172a;
          margin: 8px 0;
          line-height: 1.2;
          text-transform: capitalize;
        }
        
        /* Metadata Pill Bar */
        .meta-container {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          padding: 10px 16px;
          margin-top: 12px;
        }
        .meta-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 9.5pt;
        }
        .meta-label {
          color: #64748b;
          font-weight: 600;
          text-transform: uppercase;
          font-size: 8pt;
          letter-spacing: 0.5px;
        }
        .meta-value {
          color: #334155;
          font-weight: 500;
        }
        
        /* Flashcards Study grid layout */
        .flashcards-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
          margin: 20px 0;
          page-break-inside: avoid;
        }
        .flashcard-print-box {
          border: 1.5px dashed #cbd5e1;
          border-radius: 12px;
          padding: 16px;
          background: #fafafa;
          page-break-inside: avoid;
        }
        .flashcard-q {
          font-size: 11pt;
          font-weight: 700;
          color: #1e293b;
          border-bottom: 1px solid #e2e8f0;
          padding-bottom: 8px;
          margin-bottom: 8px;
        }
        .flashcard-a {
          font-size: 10.5pt;
          font-style: italic;
          color: #475569;
        }
        
        /* Quiz layouts */
        .quiz-item-box {
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 16px;
          margin-bottom: 16px;
          background: #ffffff;
          page-break-inside: avoid;
        }
        .quiz-question-title {
          font-size: 12pt;
          font-weight: 700;
          color: #0f172a;
          margin-bottom: 10px;
        }
        .quiz-option {
          font-size: 10.5pt;
          margin: 4px 0;
          padding: 6px 12px;
          background: #f8fafc;
          border-radius: 6px;
          border: 1px solid #f1f5f9;
        }
        .quiz-correct-answer {
          margin-top: 10px;
          font-size: 10.5pt;
          font-weight: 600;
          color: #16a34a;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .quiz-explanation-text {
          font-size: 9.5pt;
          color: #64748b;
          font-style: italic;
          margin-top: 4px;
        }

        /* Footer info */
        .print-footer {
          margin-top: 48px;
          border-top: 1px solid #e2e8f0;
          padding-top: 12px;
          text-align: center;
          font-size: 8.5pt;
          color: #94a3b8;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="header-top">
          <span class="brand">StudyMind AI</span>
          <span class="doc-type">Self-Study Companion</span>
        </div>
        <h1 class="main-title">${options.title}</h1>
        <div class="meta-container">
          ${metaRowsHtml}
        </div>
      </div>
      
      <div class="main-print-content">
        ${options.contentHtml}
      </div>

      <div class="print-footer">
        Generated & exported via StudyMind AI • Groq LLaMA 3.3 Workspace • All Rights Reserved.
      </div>
    </body>
    </html>
  `;

  doc.open();
  doc.write(fullPrintHtml);
  doc.close();

  // Focus and trigger printing directly
  setTimeout(() => {
    iframe.contentWindow?.focus();
    iframe.contentWindow?.print();
    // Clean up
    setTimeout(() => {
      document.body.removeChild(iframe);
    }, 2000);
  }, 600);
}

// 1. Export Notes
export function exportNoteToPDF(note: SavedNote) {
  triggerIframePrint({
    title: note.topic,
    metadata: [
      { label: "Topic", value: note.topic },
      { label: "Depth Level", value: note.detailLevel },
      { label: "Language", value: note.language },
      { label: "Saved On", value: note.createdAt }
    ],
    contentHtml: parseMarkdownToHtml(note.content)
  });
}

// 2. Export Summary
export function exportSummaryToPDF(sum: SavedSummary) {
  triggerIframePrint({
    title: "Document Summary Outline",
    metadata: [
      { label: "Length", value: sum.targetLength },
      { label: "Original Size", value: `${sum.originalText.length} chars` },
      { label: "Language", value: sum.language },
      { label: "Saved On", value: sum.createdAt }
    ],
    contentHtml: `
      <h2 style='font-size: 14pt; font-weight: 700; color: #1e1b4b; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-bottom: 12px;'>Original Text Extract</h2>
      <p style='font-size: 10pt; color: #64748b; font-style: italic; background: #f8fafc; padding: 12px; border-radius: 8px; margin-bottom: 24px; line-height: 1.5;'>
        ${sum.originalText.slice(0, 320)}${sum.originalText.length > 320 ? "..." : ""}
      </p>
      
      <h2 style='font-size: 14pt; font-weight: 700; color: #1e1b4b; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-bottom: 12px;'>Comprehensive Summary Outline</h2>
      ${parseMarkdownToHtml(sum.summary)}
    `
  });
}

// 3. Export ELI5 Explanation
export function exportExplanationToPDF(exp: SavedSimpleExplanation) {
  triggerIframePrint({
    title: exp.topic,
    metadata: [
      { label: "Study Concept", value: exp.topic },
      { label: "Format", value: "Simple Explanation (ELI5)" },
      { label: "Language", value: exp.language },
      { label: "Saved On", value: exp.createdAt }
    ],
    contentHtml: `
      <h2 style='font-size: 14pt; font-weight: 700; color: #1e1b4b; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-bottom: 12px;'>Simplified Conceptual Breakdown</h2>
      ${parseMarkdownToHtml(exp.explanation)}
    `
  });
}

// 4. Export Solved Doubt
export function exportDoubtToPDF(doubt: SavedDoubt) {
  triggerIframePrint({
    title: `Doubt Solver: ${doubt.question}`,
    metadata: [
      { label: "Question", value: doubt.question },
      { label: "Language", value: doubt.language },
      { label: "Resolved On", value: doubt.createdAt }
    ],
    contentHtml: `
      ${doubt.context ? `
        <h2 style='font-size: 13pt; font-weight: 700; color: #64748b; margin-bottom: 8px;'>Problem Context</h2>
        <div style='background: #f8fafc; border: 1px solid #e2e8f0; padding: 12px 16px; border-radius: 8px; font-size: 10pt; color: #475569; margin-bottom: 20px; font-style: italic;'>
          ${doubt.context}
        </div>
      ` : ""}
      
      <h2 style='font-size: 14pt; font-weight: 700; color: #1e1b4b; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-bottom: 12px;'>AI Doubt Solver Explanation</h2>
      ${parseMarkdownToHtml(doubt.answer)}
    `
  });
}

// 5. Export Flashcard Deck
export function exportDeckToPDF(deck: SavedFlashcardDeck) {
  const cardsHtml = deck.cards
    .map((card, index) => `
      <div class="flashcard-print-box">
        <div class="flashcard-q">
          <strong>Card #${index + 1}:</strong> ${card.question}
        </div>
        <div class="flashcard-a">
          <strong>Answer:</strong> ${card.answer}
        </div>
      </div>
    `)
    .join("");

  triggerIframePrint({
    title: `${deck.topic} Flashcards`,
    metadata: [
      { label: "Deck Topic", value: deck.topic },
      { label: "Cards Count", value: `${deck.cards.length} Flashcards` },
      { label: "Language", value: deck.language },
      { label: "Exported", value: deck.createdAt }
    ],
    contentHtml: `
      <p style="font-size: 11pt; color: #64748b; margin-bottom: 20px;">
        Cut or fold along the dashed lines to make active recall study cards.
      </p>
      <div class="flashcards-grid">
        ${cardsHtml}
      </div>
    `
  });
}

// 6. Export Quiz Review Sheet
export function exportQuizToPDF(quiz: SavedQuiz) {
  const questionsHtml = quiz.questions
    .map((q, index) => {
      const optionsHtml = q.options
        .map(opt => `<div class="quiz-option">${opt}</div>`)
        .join("");

      return `
        <div class="quiz-item-box">
          <div class="quiz-question-title">
            Question ${index + 1}: ${q.question}
          </div>
          <div class="options-container" style="margin-left: 10px; margin-bottom: 10px;">
            ${optionsHtml}
          </div>
          <div class="quiz-correct-answer">
            ✓ Correct Answer: ${q.correctAnswer}
          </div>
          ${q.explanation ? `
            <div class="quiz-explanation-text">
              <strong>Explanation:</strong> ${q.explanation}
            </div>
          ` : ""}
        </div>
      `;
    })
    .join("");

  const scoreLabel = quiz.score 
    ? `${quiz.score.correct} / ${quiz.score.total} (${Math.round((quiz.score.correct / quiz.score.total) * 100)}%)`
    : "Self-Review Format";

  triggerIframePrint({
    title: `${quiz.topic} Quiz Review`,
    metadata: [
      { label: "Quiz Topic", value: quiz.topic },
      { label: "Difficulty", value: quiz.difficulty },
      { label: "Questions", value: `${quiz.questions.length} Items` },
      { label: "Score Achieved", value: scoreLabel }
    ],
    contentHtml: `
      <h2 style='font-size: 14pt; font-weight: 700; color: #1e1b4b; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin: 20px 0 16px 0;'>Mcq Questions & Correct Solutions</h2>
      <div class="quiz-list-container">
        ${questionsHtml}
      </div>
    `
  });
}
