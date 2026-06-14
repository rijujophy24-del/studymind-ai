import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  app.use(express.json());
  const PORT = 3000;

  // Groq client builder
  function getGroqClient(): OpenAI {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      throw new Error("GROQ_API_KEY is missing. Please add GROQ_API_KEY in the Secrets/Settings panel.");
    }
    return new OpenAI({
      apiKey: apiKey,
      baseURL: "https://api.groq.com/openai/v1",
    });
  }

  // API Route - Health/Config Check
  app.get("/api/config-check", (req, res) => {
    res.json({
      hasGroqKey: !!process.env.GROQ_API_KEY,
    });
  });

  // Helper to handle AI responses
  async function callGroq(messages: any[], responseFormat?: { type: "json_object" }) {
    const client = getGroqClient();
    const response = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: messages,
      temperature: 0.7,
      response_format: responseFormat,
    });
    return response.choices[0].message.content;
  }

  // 1. Smart Notes Generator
  app.post("/api/generate-notes", async (req, res) => {
    try {
      const { topic, detailLevel, language } = req.body;
      if (!topic) {
        return res.status(400).json({ error: "Topic is required" });
      }

      const langPrompt = language === "malayalam" 
        ? "Please generate the entire response in Malayalam language (using Malayalam script, explaining terms clearly)." 
        : "Please generate the response in English.";

      const prompt = `You are an elite academic AI tutor. Generate comprehensive and clear study notes for the topic: "${topic}".
Detail Level: ${detailLevel || "intermediate"} (choose depth accordingly: short/intermediate/detailed).
${langPrompt}

Structure the notes professionally with:
- A brief introduction or core definition
- Core principles and main ideas explained clearly
- Key terminology or equations (if applicable)
- Real-world examples or intuitive analogies
- Summary and critical takeaways

Use clean Markdown formatting, with elegant headers, sub-bullet points, and code blocks if appropriate. Keep it highly educational and engaging for active recall.`;

      const responseText = await callGroq([
        { role: "system", content: "You are an expert tutor creating study materials in Markdown." },
        { role: "user", content: prompt }
      ]);

      res.json({ notes: responseText });
    } catch (err: any) {
      console.error("Notes Error:", err);
      res.status(500).json({ error: err.message || "Failed to generate notes." });
    }
  });

  // 2. Flashcard Maker
  app.post("/api/generate-flashcards", async (req, res) => {
    try {
      const { topic, count, language } = req.body;
      if (!topic) {
        return res.status(400).json({ error: "Topic is required" });
      }

      const cardCount = Math.min(Math.max(Number(count) || 5, 3), 15);
      const langPrompt = language === "malayalam"
        ? "Create the flashcard questions and answers in Malayalam. You can add brief English terminology in brackets next to Malayalam terms for clarity."
        : "Create the flashcard questions and answers in English.";

      const systemPrompt = `You are an AI study assistant. Generate a list of standard educational flashcard question-and-answer pairs based on the given topic.
You MUST respond with a raw JSON object using this exact structure:
{
  "flashcards": [
    {
      "question": "The question text, concise and testing a single key concept",
      "answer": "The core answer details, clear and educational"
    }
  ]
}
Do not add any preamble, markdown blocks (like \`\`\`json), or conversational filler. Return only valid parseable JSON.`;

      const userPrompt = `Generate ${cardCount} flashcards for the topic: "${topic}".
${langPrompt}`;

      const responseText = await callGroq([
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ]);

      if (!responseText) {
        throw new Error("Empty response from AI service.");
      }

      const cleanJSONText = responseText.trim().replace(/^```json\s*/i, "").replace(/```$/, "").trim();
      const parsed = JSON.parse(cleanJSONText);
      res.json(parsed);
    } catch (err: any) {
      console.error("Flashcards Error:", err);
      res.status(500).json({ error: err.message || "Failed to generate flashcards. Please try again." });
    }
  });

  // 3. MCQ Quiz
  app.post("/api/generate-quiz", async (req, res) => {
    try {
      const { topic, difficulty, count, language } = req.body;
      if (!topic) {
        return res.status(400).json({ error: "Topic is required" });
      }

      const qCount = Math.min(Math.max(Number(count) || 5, 3), 10);
      const langPrompt = language === "malayalam"
        ? "The quiz questions, options, correct answers, and explanations MUST be written in Malayalam script. English keywords can be provided in parentheses next to Malayalam words."
        : "The quiz questions, options, correct answer, and explanations MUST be written in English.";

      const systemPrompt = `You are a professional test developer. Create a multiple-choice quiz about the given topic.
You MUST respond with a raw JSON object matching this exact structure:
{
  "quiz": [
    {
      "question": "The question text",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": "The exact string from options array that is correct",
      "explanation": "A helpful explanation of why this answer is correct and why other options are incorrect"
    }
  ]
}
Make sure exactly one option matches the correctAnswer string perfectly.
Do not add any preamble or markdown blocks. Return only correct parseable JSON.`;

      const userPrompt = `Generate a quiz with ${qCount} multiple-choice questions on "${topic}".
Difficulty: ${difficulty || "Medium"}.
${langPrompt}`;

      const responseText = await callGroq([
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ]);

      if (!responseText) {
        throw new Error("Empty response from AI service.");
      }

      const cleanJSONText = responseText.trim().replace(/^```json\s*/i, "").replace(/```$/, "").trim();
      const parsed = JSON.parse(cleanJSONText);
      res.json(parsed);
    } catch (err: any) {
      console.error("Quiz Error:", err);
      res.status(500).json({ error: err.message || "Failed to generate quiz. Please retry." });
    }
  });

  // 4. Doubt Solver
  app.post("/api/solve-doubt", async (req, res) => {
    try {
      const { question, context, language } = req.body;
      if (!question) {
        return res.status(400).json({ error: "Question/Doubt is required" });
      }

      const langPrompt = language === "malayalam"
        ? "Please answer the student's doubt directly and extensively in Malayalam script."
        : "Please answer the student's doubt clearly in English.";

      const prompt = `You are a patient, encouraging, and brilliant private tutor. A student is asking a doubt regarding a academic topic.
${context ? `Here is the current topic context or text: "${context}"` : ""}
Doubt / Question: "${question}"

${langPrompt}

Structure your answer professionally with:
- **Direct Answer**: Clear, high-level resolution to the query.
- **Detailed Explanation**: Walkthrough of the concepts step-by-step.
- **Illustrative Example**: Propose a simple, intuitive every-day example.
- **Keep in Mind**: A quick study tip or pitfall to avoid.

Use clean Markdown formatting.`;

      const responseText = await callGroq([
        { role: "system", content: "You are a helpful academic tutor helping students troubleshoot complex topics." },
        { role: "user", content: prompt }
      ]);

      res.json({ answer: responseText });
    } catch (err: any) {
      console.error("Doubt Solver Error:", err);
      res.status(500).json({ error: err.message || "Failed to solve doubt." });
    }
  });

  // 5. Simple Explainer (ELI5)
  app.post("/api/explain-simple", async (req, res) => {
    try {
      const { topic, language } = req.body;
      if (!topic) {
        return res.status(400).json({ error: "Topic/Concept is required" });
      }

      const langPrompt = language === "malayalam"
        ? "Explain the topic like you are speaking to a 10-year-old child in Malayalam (use friendly, extremely basic, easy-to-understand words)."
        : "Explain the topic like I am a 10-year-old child (ELI5) in English. Use simple vocabulary, analogies, and short relatable examples.";

      const prompt = `Explain the following concept like the student is 10 years old (ELI5): "${topic}".
${langPrompt}

Keep the tone encouraging, super simple, and free of dense jargon. Break down any complex elements with ultra-simple everyday analogies (e.g., comparing computers to post offices, gravity to glue, or magnets to holding hands). Include a bulleted "Cool things to remember" list at the end. Use Markdown formatting.`;

      const responseText = await callGroq([
        { role: "system", content: "You are a teacher who creates intuitive, memorable, kid-friendly explanations for complex subjects." },
        { role: "user", content: prompt }
      ]);

      res.json({ explanation: responseText });
    } catch (err: any) {
      console.error("Simple Explainer Error:", err);
      res.status(500).json({ error: err.message || "Failed to simplify topic." });
    }
  });

  // 6. Summary Generator
  app.post("/api/generate-summary", async (req, res) => {
    try {
      const { text, targetLength, language } = req.body;
      if (!text) {
        return res.status(400).json({ error: "Text to summarize is required" });
      }

      const langPrompt = language === "malayalam"
        ? "Generate the summary and key-takeaways in Malayalam script."
        : "Generate the summary and key-takeaways in English.";

      const lengthPrompt = targetLength === "short" 
        ? "Keep it very brief (under 150 words)." 
        : targetLength === "detailed" 
          ? "Provide a comprehensive digest (approx. 450 words)."
          : "Provide a balanced outline (approx. 250 words).";

      const prompt = `Analyze and summarize the following passage:
"${text}"

Length guidance: ${lengthPrompt}
Language parameter: ${langPrompt}

Structure your response with:
- **Core Thesis**: One-sentence high-level summary of the entire passage.
- **Executive Summary**: A concise, highly unified paragraph.
- **Key Takeaways**: 3-6 bullet points highlighting the vital details and facts mentioned.

Apply clean markdown formatting.`;

      const responseText = await callGroq([
        { role: "system", content: "You are an expert speed-reader and summarizer." },
        { role: "user", content: prompt }
      ]);

      res.json({ summary: responseText });
    } catch (err: any) {
      console.error("Summary Error:", err);
      res.status(500).json({ error: err.message || "Failed to generate summary." });
    }
  });

  // Vite development integration
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
