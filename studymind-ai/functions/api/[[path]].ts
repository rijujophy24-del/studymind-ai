interface Env {
  GROQ_API_KEY: string;
}

// Low-overhead chat completion fetch client directly targeting the Groq endpoint
async function callGroq(apiKey: string, messages: any[], responseFormat?: { type: "json_object" }) {
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: messages,
      temperature: 0.7,
      response_format: responseFormat
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Groq API error (Status ${response.status}): ${errText}`);
  }

  const data = (await response.json()) as any;
  return data.choices[0].message.content;
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  const url = new URL(request.url);
  const path = url.pathname;
  const method = request.method;

  // Configure high-compatibility API CORS headers for Cloudflare Pages
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json"
  };

  // Preflight request handling
  if (method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const apiKey = env.GROQ_API_KEY;

  try {
    // 1. Config and secret environment verification
    if (path === "/api/config-check" && method === "GET") {
      return new Response(JSON.stringify({ hasGroqKey: !!apiKey }), {
        headers: corsHeaders
      });
    }

    if (!apiKey) {
      return new Response(
        JSON.stringify({
          error: "GROQ_API_KEY is missing in Cloudflare environment bindings. Please configure it in your Cloudflare Pages Settings."
        }),
        { status: 500, headers: corsHeaders }
      );
    }

    // Parse incoming request payload
    let body: any = {};
    if (method === "POST") {
      body = await request.json();
    }

    // 2. Smart Notes Generation
    if (path === "/api/generate-notes" && method === "POST") {
      const { topic, detailLevel, language } = body;
      if (!topic) {
        return new Response(JSON.stringify({ error: "Topic is required" }), { status: 400, headers: corsHeaders });
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

      const responseText = await callGroq(apiKey, [
        { role: "system", content: "You are an expert tutor creating study materials in Markdown." },
        { role: "user", content: prompt }
      ]);

      return new Response(JSON.stringify({ notes: responseText }), { headers: corsHeaders });
    }

    // 3. Educational Flashcard Deck Generation
    if (path === "/api/generate-flashcards" && method === "POST") {
      const { topic, count, language } = body;
      if (!topic) {
        return new Response(JSON.stringify({ error: "Topic is required" }), { status: 400, headers: corsHeaders });
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

      const responseText = await callGroq(apiKey, [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ]);

      if (!responseText) {
        throw new Error("Empty response from Groq AI service.");
      }

      const cleanJSONText = responseText.trim().replace(/^```json\s*/i, "").replace(/```$/, "").trim();
      const parsed = JSON.parse(cleanJSONText);
      return new Response(JSON.stringify(parsed), { headers: corsHeaders });
    }

    // 4. Interactive Quiz / Assessment Generation
    if (path === "/api/generate-quiz" && method === "POST") {
      const { topic, difficulty, count, language } = body;
      if (!topic) {
        return new Response(JSON.stringify({ error: "Topic is required" }), { status: 400, headers: corsHeaders });
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

      const responseText = await callGroq(apiKey, [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ]);

      if (!responseText) {
        throw new Error("Empty response from Groq AI service.");
      }

      const cleanJSONText = responseText.trim().replace(/^```json\s*/i, "").replace(/```$/, "").trim();
      const parsed = JSON.parse(cleanJSONText);
      return new Response(JSON.stringify(parsed), { headers: corsHeaders });
    }

    // 5. Doubt Solver / Tutorial System
    if (path === "/api/solve-doubt" && method === "POST") {
      const { question, context, language } = body;
      if (!question) {
        return new Response(JSON.stringify({ error: "Question/Doubt is required" }), { status: 400, headers: corsHeaders });
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

      const responseText = await callGroq(apiKey, [
        { role: "system", content: "You are a helpful academic tutor helping students troubleshoot complex topics." },
        { role: "user", content: prompt }
      ]);

      return new Response(JSON.stringify({ answer: responseText }), { headers: corsHeaders });
    }

    // 6. Simple Explainer (Explain Like I'm 5)
    if (path === "/api/explain-simple" && method === "POST") {
      const { topic, language } = body;
      if (!topic) {
        return new Response(JSON.stringify({ error: "Topic/Concept is required" }), { status: 400, headers: corsHeaders });
      }

      const langPrompt = language === "malayalam"
        ? "Explain the topic like you are speaking to a 10-year-old child in Malayalam (use friendly, extremely basic, easy-to-understand words)."
        : "Explain the topic like I am a 10-year-old child (ELI5) in English. Use simple vocabulary, analogies, and short relatable examples.";

      const prompt = `Explain the following concept like the student is 10 years old (ELI5): "${topic}".
${langPrompt}

Keep the tone encouraging, super simple, and free of dense jargon. Break down any complex elements with ultra-simple everyday analogies (e.g., comparing computers to post offices, gravity to glue, or magnets to holding hands). Include a bulleted "Cool things to remember" list at the end. Use Markdown formatting.`;

      const responseText = await callGroq(apiKey, [
        { role: "system", content: "You are a teacher who creates intuitive, memorable, kid-friendly explanations for complex subjects." },
        { role: "user", content: prompt }
      ]);

      return new Response(JSON.stringify({ explanation: responseText }), { headers: corsHeaders });
    }

    // 7. Passage Summary and Outline Digest
    if (path === "/api/generate-summary" && method === "POST") {
      const { text, targetLength, language } = body;
      if (!text) {
        return new Response(JSON.stringify({ error: "Text to summarize is required" }), { status: 400, headers: corsHeaders });
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

      const responseText = await callGroq(apiKey, [
        { role: "system", content: "You are an expert speed-reader and summarizer." },
        { role: "user", content: prompt }
      ]);

      return new Response(JSON.stringify({ summary: responseText }), { headers: corsHeaders });
    }

    // Fallback 404 Route for unsupported endpoints under /api
    return new Response(
      JSON.stringify({ error: `Route not supported: ${method} ${path}` }),
      { status: 404, headers: corsHeaders }
    );

  } catch (err: any) {
    console.error("Cloudflare Worker Execution Error:", err);
    return new Response(
      JSON.stringify({ error: err.message || "Failed to process edge function" }),
      { status: 500, headers: corsHeaders }
    );
  }
};
