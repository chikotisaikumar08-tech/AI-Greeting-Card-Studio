/**
 * Message Generator Service
 * 
 * This module handles the core business logic of generating greeting card messages.
 * It features a robust Mock Generator that outputs natural, high-quality, human-written messages (80-150 words)
 * across various occasions, tones, and languages.
 * 
 * It also includes pre-configured integration stubs for Gemini and OpenAI APIs,
 * allowing developers to plug in an active LLM API key with minimal code changes.
 */

// Localized greetings database for the Mock AI
import { MOCK_TEMPLATES } from './mockTemplates';

/**
 * Main generation function
 * @param {Object} params
 * @param {string} params.occasion - Selected occasion
 * @param {string} params.tone - Selected tone
 * @param {string} params.recipient - Recipient name (optional)
 * @param {string} params.sender - Sender name (optional)
 * @param {string} params.details - Custom details (optional)
 * @param {string} params.language - Language (en, es, fr, de, hi)
 * @param {boolean} params.useEmojis - Toggle emojis
 * @param {Object} apiConfig - Optional configuration for live API
 * @param {string} apiConfig.provider - 'gemini' | 'openai' | 'mock'
 * @param {string} apiConfig.apiKey - API Key
 * @returns {Promise<string>} Generated message
 */
export async function generateGreeting({
  occasion,
  tone,
  recipient = '',
  sender = '',
  details = '',
  language = 'en',
  useEmojis = true,
  apiConfig = { provider: 'mock', apiKey: '' }
}) {
  // Simulate network delay for realistic UX (500ms to 1200ms)
  await new Promise(resolve => setTimeout(resolve, 600 + Math.random() * 600));

  if (apiConfig && apiConfig.provider !== 'mock' && apiConfig.apiKey) {
    try {
      if (apiConfig.provider === 'gemini') {
        return await generateWithGemini(apiConfig.apiKey, { occasion, tone, recipient, sender, details, language, useEmojis });
      } else if (apiConfig.provider === 'openai') {
        return await generateWithOpenAI(apiConfig.apiKey, { occasion, tone, recipient, sender, details, language, useEmojis });
      }
    } catch (error) {
      console.error(`Error generating with live API (${apiConfig.provider}):`, error);
      // Fallback to mock generation if the live API fails
    }
  }

  // Default: Mock Generation
  return generateMockMessage({ occasion, tone, recipient, sender, details, language, useEmojis });
}

/**
 * Mock generation logic using template matrices
 */
function generateMockMessage({ occasion, tone, recipient, sender, details, language, useEmojis }) {
  const normalizedOccasion = occasion.toLowerCase().replace(/\s+/g, '_');
  const normalizedTone = tone.toLowerCase();

  // Retrieve templates for language
  const langTemplates = MOCK_TEMPLATES[language] || MOCK_TEMPLATES['en'];
  
  // Find templates for specific occasion, fallback to custom_occasion or birthday
  const occasionData = langTemplates[normalizedOccasion] || langTemplates['custom_occasion'] || langTemplates['birthday'];
  
  // Find specific tone, fallback to heartfelt
  const toneTemplates = occasionData[normalizedTone] || occasionData['heartfelt'] || langTemplates['birthday']['heartfelt'];

  // Select a random template from the available ones
  const randomIndex = Math.floor(Math.random() * toneTemplates.length);
  let template = toneTemplates[randomIndex];

  // Prepare names
  const rName = recipient.trim() || getDefaultName('recipient', language);
  const sName = sender.trim() || getDefaultName('sender', language);

  // Substitute main placeholders
  let message = template
    .replace(/{recipient}/g, rName)
    .replace(/{sender}/g, sName);

  // Integrate details into the message naturally if provided
  if (details.trim()) {
    message = injectDetails(message, details.trim(), language);
  } else {
    // Remove any details placeholders if they exist
    message = message.replace(/{details}\s*/g, '');
  }

  // Handle emojis
  if (!useEmojis) {
    // Regular expression to strip typical emojis
    message = stripEmojis(message);
  }

  return message;
}

/**
 * Inject custom details into the greeting message in a human-sounding way
 */
function injectDetails(message, details, language) {
  // Custom templates usually have a {details} placeholder. If not, append it naturally.
  if (message.includes('{details}')) {
    return message.replace(/{details}/g, details);
  }

  const detailConnectors = {
    en: [
      ` Knowing that ${details}, it makes this moment even more special.`,
      ` I hope you get to enjoy plenty of time for ${details} as well.`,
      ` It's so wonderful to hear that ${details}, and I wish you the very best with that!`
    ],
    es: [
      ` Sabiendo que ${details}, hace que este momento sea aún más especial.`,
      ` Espero que también tengas tiempo para disfrutar de ${details}.`,
      ` ¡Es genial saber que ${details}, y te deseo lo mejor con eso!`
    ],
    fr: [
      ` Sachant que ${details}, cela rend ce moment encore plus spécial.`,
      ` J'espère que vous aurez également le temps de profiter de ${details}.`,
      ` C'est tellement formidable d'apprendre que ${details}, et je vous souhaite le meilleur pour cela !`
    ],
    de: [
      ` Da ich weiß, dass ${details}, macht dies diesen Moment noch besonderer.`,
      ` Ich hoffe, du findest auch genügend Zeit für ${details}.`,
      ` Es ist wunderbar zu hören, dass ${details}, und ich wünsche dir dabei das Allerbeste!`
    ],
    hi: [
      ` यह जानकर कि ${details}, यह क्षण और भी खास बन जाता है।`,
      ` आशा है कि आपको ${details} के लिए भी भरपूर समय मिलेगा।`,
      ` यह सुनकर बहुत अच्छा लगा कि ${details}, और मैं इसके लिए आपको शुभकामनाएं देता हूं!`
    ]
  };

  const connectors = detailConnectors[language] || detailConnectors['en'];
  const connector = connectors[Math.floor(Math.random() * connectors.length)];
  
  // Find a good place to insert - usually before the final signature/closings.
  // We'll search for common signature prefixes or just append before the last sentence.
  const signaturePrefixes = {
    en: 'Warmest wishes,',
    es: 'Con todo mi cariño,',
    fr: 'Avec toute mon affection,',
    de: 'Herzliche Grüße,',
    hi: 'शुभकामनाओं सहित,'
  };
  
  const prefix = signaturePrefixes[language] || signaturePrefixes['en'];
  if (message.includes(prefix)) {
    const parts = message.split(prefix);
    return parts[0].trim() + connector + "\n\n" + prefix + parts[1];
  }

  return message.trim() + connector;
}

function getDefaultName(type, language) {
  const defaults = {
    recipient: {
      en: 'there',
      es: 'ti',
      fr: 'toi',
      de: 'dich',
      hi: 'प्रिय'
    },
    sender: {
      en: 'Someone who cares',
      es: 'Alguien que te aprecia',
      fr: 'Quelqu\'un qui pense à toi',
      de: 'Jemand, der an dich denkt',
      hi: 'आपका शुभचिंतक'
    }
  };
  return defaults[type][language] || defaults[type]['en'];
}

function stripEmojis(text) {
  // Regex pattern for emojis
  return text.replace(/[\u{1F300}-\u{1F9FF}]|[\u{2700}-\u{27BF}]|[\u{1F600}-\u{1F64F}]|[\u{1F680}-\u{1F6FF}]|[\u{2600}-\u{26FF}]|[\u{1F1E6}-\u{1F1FF}]|[\u{1F900}-\u{1F9FF}]/gu, '').trim();
}

/**
 * ==========================================================
 * LIVE LLM INTEGRATION STUBS (Google Gemini & OpenAI)
 * ==========================================================
 * To use these:
 * 1. Import necessary client libraries or run fetch queries.
 * 2. Set provider to 'gemini' or 'openai' in the UI/App state configuration.
 * 3. Supply your API Key.
 */

async function generateWithGemini(apiKey, { occasion, tone, recipient, sender, details, language, useEmojis }) {
  const languageNames = { en: 'English', es: 'Spanish', fr: 'French', de: 'German', hi: 'Hindi' };
  const targetLanguage = languageNames[language] || 'English';

  const prompt = `Write a personalized greeting card message.
Occasion: ${occasion}
Tone: ${tone}
Recipient Name: ${recipient || 'Not specified (write in a way that feels natural, e.g. "Dear Friend")'}
Sender Name: ${sender || 'Not specified'}
Additional Details/Context: ${details || 'None'}
Language: ${targetLanguage}
Emoji Preference: ${useEmojis ? 'Include appropriate emojis' : 'Do NOT include any emojis'}

Instructions:
- Generate a heartfelt, natural-sounding, and human-like message.
- Keep the length strictly between 80 and 150 words.
- If Recipient and Sender names are provided, integrate them naturally.
- Structure it like a greeting card message (opening, body paragraphs, and closing/signature).
- Do NOT output any conversational prefix, suffix, or markers. Output ONLY the raw greeting card message itself.`;

  // We use standard fetch to make it zero-dependency and fast
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{
        parts: [{ text: prompt }]
      }],
      generationConfig: {
        maxOutputTokens: 500,
        temperature: 0.7,
      }
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gemini API returned error: ${response.status} - ${errText}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Invalid response structure from Gemini API');
  
  return text.trim();
}

async function generateWithOpenAI(apiKey, { occasion, tone, recipient, sender, details, language, useEmojis }) {
  const languageNames = { en: 'English', es: 'Spanish', fr: 'French', de: 'German', hi: 'Hindi' };
  const targetLanguage = languageNames[language] || 'English';

  const prompt = `Write a personalized greeting card message.
Occasion: ${occasion}
Tone: ${tone}
Recipient Name: ${recipient || 'Not specified'}
Sender Name: ${sender || 'Not specified'}
Additional Details/Context: ${details || 'None'}
Language: ${targetLanguage}
Emoji Preference: ${useEmojis ? 'Include appropriate emojis' : 'Do NOT include any emojis'}`;

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
          content: 'You are an expert, empathetic creative writer specializing in drafting human-like, warm, and natural greeting card messages. Keep responses between 80-150 words. Output ONLY the message itself with no extra conversational text or Markdown quotes.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 300,
      temperature: 0.7,
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`OpenAI API returned error: ${response.status} - ${errText}`);
  }

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content;
  if (!text) throw new Error('Invalid response structure from OpenAI API');
  
  return text.trim();
}
