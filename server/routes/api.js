import { Router } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';

const router = Router();

// Helper to get Google Gemini Client
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY is not defined in server env.');
  return new GoogleGenerativeAI(apiKey);
};

// Helper to get OpenAI Client
const getOpenAIClient = () => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY is not defined in server env.');
  return new OpenAI({ apiKey });
};

// --- POST: GENERATE GREETINGS ---
router.post('/generate-greetings', async (req, res) => {
  const { occasion, tone, recipient, sender, details, language, useEmojis, length, provider } = req.body;
  const targetLanguage = 
    language === 'hi' ? 'Hindi' : 
    language === 'es' ? 'Spanish' : 
    language === 'fr' ? 'French' : 
    language === 'de' ? 'German' : 
    language === 'te' ? 'Telugu' : 
    'English';

  const prompt = `Write THREE distinct variations of a personalized greeting card message.
Occasion: ${occasion}
Tone: ${tone}
Recipient Name: ${recipient || 'Dear Friend'}
Sender Name: ${sender || 'Sender'}
Details: ${details || 'None'}
Language: ${targetLanguage}
Length: Strict ${length} length (short: ~50 words, medium: ~100 words, long: ~150 words).
Emoji Preference: ${useEmojis ? 'Include appropriate emojis' : 'Do NOT include any emojis'}

Instructions:
- Output exactly THREE options.
- Separate each option with the delimiter string "---GREETING-OPTION-SPLIT---".
- Do not output any intro, outro, headers (like "Option 1") or number markers. Just raw cards separated by the delimiter.`;

  try {
    let resultText = '';
    
    if (provider === 'gemini' || (!provider && process.env.GEMINI_API_KEY)) {
      const ai = getGeminiClient();
      const model = ai.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const response = await model.generateContent(prompt);
      resultText = response.response.text();
    } else if (provider === 'openai' || process.env.OPENAI_API_KEY) {
      const openai = getOpenAIClient();
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are an expert greeting card writer. Generate exactly 3 distinct variations separated by "---GREETING-OPTION-SPLIT---" without list numbers or header commentary.' },
          { role: 'user', content: prompt }
        ]
      });
      resultText = response.choices[0]?.message?.content || '';
    } else {
      return res.status(400).json({ error: 'No live AI API key configured on server.' });
    }

    const suggestions = resultText
      .split('---GREETING-OPTION-SPLIT---')
      .map(p => p.trim())
      .filter(p => p.length > 5)
      .slice(0, 3);

    res.json({ suggestions });
  } catch (error) {
    console.error('Server card generation failed:', error);
    res.status(500).json({ error: 'Failed to generate greetings via LLM', details: error.message });
  }
});

// --- POST: REWRITE GREETING ---
router.post('/rewrite', async (req, res) => {
  const { message, instruction, provider } = req.body;
  const prompt = `Rewrite the following greeting card message according to this instruction: "${instruction}".\n\nOriginal Message:\n${message}\n\nOutput only the final rewritten message with no greetings, introductions, or markdown quotes.`;

  try {
    let rewrittenText = '';
    if (provider === 'gemini' || (!provider && process.env.GEMINI_API_KEY)) {
      const ai = getGeminiClient();
      const model = ai.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const response = await model.generateContent(prompt);
      rewrittenText = response.response.text();
    } else if (provider === 'openai' || process.env.OPENAI_API_KEY) {
      const openai = getOpenAIClient();
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }]
      });
      rewrittenText = response.choices[0]?.message?.content || '';
    } else {
      return res.status(400).json({ error: 'No live AI API key configured on server.' });
    }

    res.json({ message: rewrittenText.trim() });
  } catch (error) {
    console.error('Server rewrite failed:', error);
    res.status(500).json({ error: 'Failed to rewrite message', details: error.message });
  }
});

// --- POST: GENERATE GIFT RECOMMENDATIONS ---
router.post('/generate-gifts', async (req, res) => {
  const { occasion, recipient, details, provider } = req.body;
  const prompt = `Based on this occasion: "${occasion}" and details about the recipient "${recipient}": "${details}", suggest exactly 3-4 personalized gift ideas.
Return the suggestions in a strict JSON array format. Do not write markdown tags (like \`\`\`json). Just return the raw JSON array.
Each object in the array must have:
- "title": Name of the gift
- "description": Why this is a good fit
- "priceEstimate": Estimated price range (e.g. "$25 - $40")
- "category": Must be one of "Books" | "Flowers" | "Experiences" | "Tech" | "Keepsakes" | "Other"`;

  try {
    let responseText = '';
    if (provider === 'gemini' || (!provider && process.env.GEMINI_API_KEY)) {
      const ai = getGeminiClient();
      const model = ai.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const response = await model.generateContent(prompt);
      responseText = response.response.text();
    } else if (provider === 'openai' || process.env.OPENAI_API_KEY) {
      const openai = getOpenAIClient();
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }]
      });
      responseText = response.choices[0]?.message?.content || '';
    } else {
      return res.status(400).json({ error: 'No live AI API key configured on server.' });
    }

    const cleaned = responseText.replace(/```json|```/gi, '').trim();
    const gifts = JSON.parse(cleaned);
    res.json({ gifts });
  } catch (error) {
    console.error('Server gifts generation failed:', error);
    res.status(500).json({ error: 'Failed to parse gift recommendations', details: error.message });
  }
});

export default router;
