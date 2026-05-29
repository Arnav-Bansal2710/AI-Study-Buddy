const Groq = require('groq-sdk');
require('dotenv').config();

const summarize = async (text) => {
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  console.log('📡 Calling Groq API...');

  const response = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      {
        role: 'system',
        content: 'You are a helpful study assistant. Summarize study notes clearly and concisely.'
      },
      {
        role: 'user',
        content: `Summarize these study notes in simple, clear language under 200 words:\n\n${text.substring(0, 3000)}`
      }
    ],
    max_tokens: 400,
  });

  return response.choices[0].message.content;
};

const generateFlashcards = async(text)=>{
  const groq = new Groq({apiKey:process.env.GROQ_API_KEY});

  const response = await groq.chat.completions.create({
    model:'llama-3.3-70b-versatile',
    messages: [
      {
        role:'system',
        content:'You are a study assistant. Return ONLY valid JSON. No explanation, no markdown, no extra text.'
      },
      {
        role:'user',
        content:`Generate 8 flashcards from these study notes.
        Return ONLY a JSON array like this:
        [
          {"question": "What is...?", "answer": "It is..."},
          {"question": "Define...?", "answer": "..."}
        ]
        Study notes:
        ${text.substring(0, 3000)}
        `
      }
    ],
    max_tokens:1000,
  });

  const raw = response.choices[0].message.content;

  // Clean response and parse JSON
  const cleaned = raw.replace(/```json|```/g, '').trim();
  const flashcards = JSON.parse(cleaned);
  return flashcards;
};

const generateQuiz = async(text)=>{
  const groq = new Groq({apiKey:process.env.GROQ_API_KEY});

  const response = await groq.chat.completions.create({
    model:'llama-3.3-70b-versatile',
    messages : [
      {
        role:'system',
        content:'You are a study assistant. Return ONLY valid JSON. No explanation, no markdown, no extra text.'
      },
      {
        role:'user',
        content:`Generate 5 multiple choice questions from these study notes.
        Return ONLY a JSON array like this:
        [
          {
            "question": "What is...?",
            "option_a": "...",
            "option_b": "...",
            "option_c": "...",
            "option_d": "...",
            "correct_option": "a"
          }
        ]

        Study notes:
        ${text.substring(0, 3000)}
        `
      }
    ],
    max_tokens:1500,
  });

  const raw = response.choices[0].message.content;
  const cleaned = raw.replace(/```json|```/g, '').trim();
  const quiz = JSON.parse(cleaned);
  return quiz;
};


module.exports = { summarize , generateFlashcards , generateQuiz};