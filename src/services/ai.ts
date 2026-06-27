import { MOCK_TEMPLATES } from './mockTemplates';
import { CardData, ApiConfig } from '../types';

interface GenerationParams extends CardData {
  length: 'short' | 'medium' | 'long';
}

export async function generateGreetings(
  params: GenerationParams,
  apiConfig: ApiConfig
): Promise<string[]> {
  // Simulate API delay (500ms - 1000ms)
  await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 400));

  if (apiConfig && apiConfig.provider !== 'mock' && apiConfig.apiKey) {
    try {
      if (apiConfig.provider === 'gemini') {
        return await generateWithGemini(apiConfig.apiKey, params);
      } else if (apiConfig.provider === 'openai') {
        return await generateWithOpenAI(apiConfig.apiKey, params);
      }
    } catch (error) {
      console.error(`AI Service API error (${apiConfig.provider}):`, error);
      // Fallback to mock generation if the live API fails
    }
  }

  // Fallback / Default: Mock Template-Based Generation (returns 3 variations)
  return generateMockSuggestions(params);
}

// --- REWRITE GREETING ---
export async function rewriteGreeting(
  message: string,
  instruction: string,
  apiConfig: ApiConfig
): Promise<string> {
  await new Promise(resolve => setTimeout(resolve, 600));

  if (apiConfig && apiConfig.provider !== 'mock' && apiConfig.apiKey) {
    try {
      const prompt = `Rewrite the following greeting card message according to this instruction: "${instruction}".\n\nOriginal Message:\n${message}\n\nOutput only the final rewritten message with no greetings, introductions, or markdown quotes.`;
      
      if (apiConfig.provider === 'gemini') {
        return await callGeminiDirect(apiConfig.apiKey, prompt);
      } else if (apiConfig.provider === 'openai') {
        return await callOpenAiDirect(apiConfig.apiKey, prompt);
      }
    } catch (error) {
      console.error('API rewrite failed, using mock client fallback', error);
    }
  }

  // Mock Rewrite Fallback
  const lowercaseInstr = instruction.toLowerCase();
  if (lowercaseInstr.includes('shorter') || lowercaseInstr.includes('cut')) {
    return message.split('\n\n').slice(0, Math.max(1, message.split('\n\n').length - 1)).join('\n\n') + '\n\nWith love!';
  } else if (lowercaseInstr.includes('longer') || lowercaseInstr.includes('expand')) {
    return message.replace('\n\nWarmest', '\n\nYou make the world a much brighter place, and I am so grateful to share these milestones with you. Wishing you endless laughter and joy.\n\nWarmest');
  } else if (lowercaseInstr.includes('funny') || lowercaseInstr.includes('joke')) {
    return `🎉 Quick update: you're officially another year older (and hopefully wiser, but let's not push our luck!). \n\n${message}`;
  }
  return `${message}\n\n(Tailored: ${instruction})`;
}

// --- TRANSLATE GREETING ---
export async function translateGreeting(
  message: string,
  targetLang: string,
  apiConfig: ApiConfig
): Promise<string> {
  await new Promise(resolve => setTimeout(resolve, 600));

  if (apiConfig && apiConfig.provider !== 'mock' && apiConfig.apiKey) {
    try {
      const languageNames: Record<string, string> = { en: 'English', es: 'Spanish', fr: 'French', de: 'German', hi: 'Hindi', te: 'Telugu' };
      const langName = languageNames[targetLang] || 'English';
      const prompt = `Translate this greeting card message into ${langName}.\n\nMessage:\n${message}\n\nProvide only the translated greeting, maintaining card lines and layout. No commentary.`;

      if (apiConfig.provider === 'gemini') {
        return await callGeminiDirect(apiConfig.apiKey, prompt);
      } else if (apiConfig.provider === 'openai') {
        return await callOpenAiDirect(apiConfig.apiKey, prompt);
      }
    } catch (error) {
      console.error('API translation failed, using mock client fallback', error);
    }
  }

  // Mock translation dictionary
  const translations: Record<string, Record<string, string>> = {
    es: {
      'Dear': 'Querido/a',
      'Happy Birthday': 'Feliz Cumpleaños',
      'Congratulations': 'Felicitaciones',
      'Thank you': 'Gracias',
      'Best wishes': 'Mis mejores deseos',
    },
    fr: {
      'Dear': 'Cher/Chère',
      'Happy Birthday': 'Joyeux Anniversaire',
      'Congratulations': 'Félicitations',
      'Thank you': 'Merci',
      'Best wishes': 'Meilleurs vœux',
    },
    de: {
      'Dear': 'Liebe/r',
      'Happy Birthday': 'Herzlichen Glückwunsch zum Geburtstag',
      'Congratulations': 'Herzlichen Glückwunsch',
      'Thank you': 'Danke',
      'Best wishes': 'Beste Wünsche',
    },
    hi: {
      'Dear': 'प्रिय',
      'Happy Birthday': 'जन्मदिन की शुभकामनाएं',
      'Congratulations': 'बधाई हो',
      'Thank you': 'धन्यवाद',
      'Best wishes': 'शुभकामनाएं',
    }
  };

  const dict = translations[targetLang];
  if (!dict) return message;

  // Simple stub translate
  let translated = message;
  Object.entries(dict).forEach(([key, val]) => {
    const regex = new RegExp(key, 'gi');
    translated = translated.replace(regex, val);
  });

  return `${translated}\n\n[Translated to ${targetLang.toUpperCase()}]`;
}

// --- GEMINI CORE API CALL ---
async function generateWithGemini(apiKey: string, params: GenerationParams): Promise<string[]> {
  const languageNames: Record<string, string> = { en: 'English', es: 'Spanish', fr: 'French', de: 'German', hi: 'Hindi', te: 'Telugu' };
  const targetLanguage = languageNames[params.language] || 'English';
  
  const prompt = `Write THREE distinct variations of a personalized greeting card message.
Occasion: ${params.occasion}
Tone: ${params.tone}
Recipient Name: ${params.recipient || 'Dear Friend'}
Sender Name: ${params.sender || 'Sender'}
Details: ${params.details || 'None'}
Language: ${targetLanguage}
Length Preference: Strict ${params.length} length (short: ~50 words, medium: ~100 words, long: ~150 words).
Emoji Preference: ${params.useEmojis ? 'Include appropriate emojis' : 'Do NOT include any emojis'}

Instructions:
- Output exactly THREE options.
- Separate each option with the delimiter string "---GREETING-OPTION-SPLIT---".
- Do not output any intro, outro, headers (like "Option 1") or number markers. Just raw cards separated by the delimiter.`;

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { maxOutputTokens: 1000, temperature: 0.7 }
    })
  });

  if (!response.ok) {
    throw new Error(`Gemini API returned status ${response.status}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  
  return parseOptions(text);
}

// --- OPENAI CORE API CALL ---
async function generateWithOpenAI(apiKey: string, params: GenerationParams): Promise<string[]> {
  const languageNames: Record<string, string> = { en: 'English', es: 'Spanish', fr: 'French', de: 'German', hi: 'Hindi', te: 'Telugu' };
  const targetLanguage = languageNames[params.language] || 'English';
  
  const prompt = `Write THREE distinct variations of a personalized greeting card message.
Occasion: ${params.occasion}
Tone: ${params.tone}
Recipient: ${params.recipient || 'Dear Friend'}
Sender: ${params.sender || 'Sender'}
Details: ${params.details || 'None'}
Language: ${targetLanguage}
Length: ${params.length} length (~60 to 140 words).
Emojis: ${params.useEmojis ? 'Include emojis' : 'No emojis'}`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an expert creative greeting card writer. Generate exactly THREE distinct message options. Separate them using the string delimiter "---GREETING-OPTION-SPLIT---". Do not output option labels, numbers, or headers.'
        },
        { role: 'user', content: prompt }
      ],
      max_tokens: 800,
      temperature: 0.7
    })
  });

  if (!response.ok) {
    throw new Error(`OpenAI API returned status ${response.status}`);
  }

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content || '';
  
  return parseOptions(text);
}

// Direct single prompt callers for utilities
async function callGeminiDirect(apiKey: string, prompt: string): Promise<string> {
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { maxOutputTokens: 400, temperature: 0.6 }
    })
  });
  if (!response.ok) throw new Error('Gemini call failed');
  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
}

async function callOpenAiDirect(apiKey: string, prompt: string): Promise<string> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 300,
      temperature: 0.6
    })
  });
  if (!response.ok) throw new Error('OpenAI call failed');
  const data = await response.json();
  return data.choices?.[0]?.message?.content?.trim() || '';
}

function parseOptions(text: string): string[] {
  let parts = text.split('---GREETING-OPTION-SPLIT---');
  if (parts.length < 2) {
    // Attempt fallback split regexes if GPT ignored format instructions
    parts = text.split(/\n\d+\.\s+|\nOption \d+:?/gi);
  }
  return parts
    .map(p => p.trim())
    .filter(p => p.length > 5)
    .slice(0, 3);
}

// --- MOCK SUGGESTIONS GENERATOR ---
function generateMockSuggestions(params: GenerationParams): string[] {
  const normalizedOccasion = params.occasion.toLowerCase().replace(/\s+/g, '_');
  const normalizedTone = params.tone.toLowerCase();

  const langTemplates = MOCK_TEMPLATES[params.language] || MOCK_TEMPLATES['en'];
  const occasionData = langTemplates[normalizedOccasion] || langTemplates['custom_occasion'] || langTemplates['birthday'];
  const toneTemplates = occasionData[normalizedTone] || occasionData['heartfelt'] || langTemplates['birthday']['heartfelt'];

  // Shuffling the template pool to guarantee new order on regeneration
  const shuffledTemplates = [...toneTemplates].sort(() => Math.random() - 0.5);

  const blessings = [
    "May this special season bring you closer to all your dreams and fill your heart with absolute peace.",
    "Wishing you a day as bright as your beautiful smile and a year filled with wonderful surprises.",
    "Here's to celebrating you today and wishing you endless happiness, laughter, and success.",
    "May your path ahead be paved with sweet memories, good health, and the warmest of moments.",
    "Sending you happy thoughts, creative inspirations, and many more blessings to come!"
  ];

  const suggestions: string[] = [];
  const rName = params.recipient.trim() || 'there';
  const sName = params.sender.trim() || 'Someone who cares';

  // Get up to 3 different template options
  const count = Math.min(3, shuffledTemplates.length);
  for (let i = 0; i < count; i++) {
    let template = shuffledTemplates[i];
    let msg = template
      .replace(/{recipient}/g, rName)
      .replace(/{sender}/g, sName);

    // Apply length adjustments
    if (params.length === 'short') {
      const sentences = msg.split(/[.!?]/);
      msg = sentences.slice(0, Math.min(3, sentences.length)).join('. ') + '.\n\nWarmly,\n' + sName;
    } else if (params.length === 'long') {
      msg = msg.replace('\n\nWarmly', '\n\nI hope this milestone is filled with unforgettable memories and beautiful milestones. May all your dreams continue to grow and manifest in the coming years.\n\nWarmly');
    }

    // Insert a randomized blessing to make the regenerated card feel entirely new
    const randomBlessing = blessings[Math.floor(Math.random() * blessings.length)];
    if (msg.includes('\n\nWarmly')) {
      msg = msg.replace('\n\nWarmly', `\n\n${randomBlessing}\n\nWarmly`);
    } else if (msg.includes('\n\nWith love')) {
      msg = msg.replace('\n\nWith love', `\n\n${randomBlessing}\n\nWith love`);
    }

    if (params.details.trim()) {
      msg = injectDetailsOffline(msg, params.details.trim(), params.language);
    } else {
      msg = msg.replace(/{details}\s*/g, '');
    }

    if (!params.useEmojis) {
      msg = stripEmojisOffline(msg);
    }

    suggestions.push(msg);
  }

  // Ensure we always return exactly 3 variations
  while (suggestions.length < 3) {
    const randomBlessing = blessings[Math.floor(Math.random() * blessings.length)];
    suggestions.push(`Dear ${rName},\n\nWishing you a wonderful and pleasant ${params.occasion}! ${randomBlessing}\n\nWith best regards,\n${sName}`);
  }

  return suggestions;
}

function injectDetailsOffline(message: string, details: string, language: string): string {
  if (message.includes('{details}')) {
    return message.replace(/{details}/g, details);
  }
  const detailConnectors: Record<string, string[]> = {
    en: [
      ` Knowing that ${details}, it makes this moment even more special.`,
      ` I hope you get to enjoy plenty of time for ${details} as well.`,
      ` It's so wonderful to hear that ${details}, and I wish you the very best!`
    ],
    es: [
      ` Sabiendo que ${details}, hace que este momento sea aún más especial.`,
      ` Espero que también tengas tiempo para disfrutar de ${details}.`
    ]
  };
  const connectors = detailConnectors[language] || detailConnectors['en'];
  const connector = connectors[Math.floor(Math.random() * connectors.length)];
  return message.trim() + connector;
}

function stripEmojisOffline(text: string): string {
  return text.replace(/[\u{1F300}-\u{1F9FF}]|[\u{2700}-\u{27BF}]|[\u{1F600}-\u{1F64F}]|[\u{1F680}-\u{1F6FF}]|[\u{2600}-\u{26FF}]|[\u{1F1E6}-\u{1F1FF}]|[\u{1F900}-\u{1F9FF}]/gu, '').trim();
}
