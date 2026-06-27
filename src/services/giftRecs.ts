import { GiftRecommendation, ApiConfig } from '../types';

export async function generateGiftRecommendations(
  occasion: string,
  recipient: string,
  details: string,
  apiConfig: ApiConfig
): Promise<GiftRecommendation[]> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 300));

  if (apiConfig && apiConfig.provider !== 'mock' && apiConfig.apiKey) {
    try {
      const prompt = `Based on this occasion: "${occasion}" and details about the recipient "${recipient}": "${details}", suggest exactly 3-4 personalized gift ideas.
Return the suggestions in a strict JSON array format. Do not write markdown tags (like \`\`\`json). Just return the raw JSON array.
Each object in the array must have:
- "title": Name of the gift
- "description": Why this is a good fit
- "priceEstimate": Estimated price range (e.g. "$25 - $40")
- "category": Must be one of "Books" | "Flowers" | "Experiences" | "Tech" | "Keepsakes" | "Other"`;

      const responseText = await callAiForGifts(apiConfig, prompt);
      const cleaned = responseText.replace(/```json|```/gi, '').trim();
      const parsed = JSON.parse(cleaned);
      if (Array.isArray(parsed)) {
        return parsed.map((item, index) => ({
          id: 'gift_api_' + index + '_' + Date.now(),
          ...item
        }));
      }
    } catch (error) {
      console.error('API gift recommendation failed, falling back to mock recommender', error);
    }
  }

  // Fallback / Mock gift recommendations based on keywords in details
  return getMockRecommendations(occasion, details);
}

async function callAiForGifts(apiConfig: ApiConfig, prompt: string): Promise<string> {
  if (apiConfig.provider === 'gemini') {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiConfig.apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: 500, temperature: 0.7 }
      })
    });
    if (!response.ok) throw new Error('Gemini gift fetch failed');
    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || '[]';
  } else {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiConfig.apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 400,
        temperature: 0.7
      })
    });
    if (!response.ok) throw new Error('OpenAI gift fetch failed');
    const data = await response.json();
    return data.choices?.[0]?.message?.content || '[]';
  }
}

function getMockRecommendations(occasion: string, details: string): GiftRecommendation[] {
  const lowercaseDetails = details.toLowerCase();
  const lowercaseOccasion = occasion.toLowerCase();

  const results: GiftRecommendation[] = [];

  // Match details keywords
  if (lowercaseDetails.includes('read') || lowercaseDetails.includes('book')) {
    results.push({
      id: 'mock_g1',
      title: 'Premium Leather Bookmark & Classic Mystery Book',
      description: 'A beautifully crafted leather bookmark paired with a highly rated suspense or mystery novel.',
      priceEstimate: '$25 - $35',
      category: 'Books'
    });
  }

  if (lowercaseDetails.includes('golf') || lowercaseDetails.includes('sport')) {
    results.push({
      id: 'mock_g2',
      title: 'Personalized Custom Golf Balls',
      description: 'A set of premium golf balls customized with initials or a memorable date.',
      priceEstimate: '$30 - $45',
      category: 'Tech'
    });
  }

  if (lowercaseDetails.includes('hike') || lowercaseDetails.includes('nature') || lowercaseDetails.includes('outdoor')) {
    results.push({
      id: 'mock_g3',
      title: 'Insulated Double-Walled Hiking Flask',
      description: 'A rugged, high-performance thermos to keep drinks piping hot or ice-cold on trails.',
      priceEstimate: '$35 - $50',
      category: 'Experiences'
    });
  }

  if (lowercaseDetails.includes('coffee') || lowercaseDetails.includes('tea') || lowercaseDetails.includes('drink')) {
    results.push({
      id: 'mock_g4',
      title: 'Artisanal Loose Tea / Single-Origin Coffee Gift Box',
      description: 'A curated selection of premium organic tea tins or gourmet coffee beans with a ceramic tasting mug.',
      priceEstimate: '$30 - $40',
      category: 'Keepsakes'
    });
  }

  // Fallbacks by Occasion if no keywords matched
  if (results.length === 0) {
    if (lowercaseOccasion.includes('birthday')) {
      results.push(
        {
          id: 'b1',
          title: 'Gourmet Chocolate & Treat Gift Basket',
          description: 'A selection of fine dark chocolates, truffles, and glazed nuts to celebrate their day.',
          priceEstimate: '$35 - $60',
          category: 'Keepsakes'
        },
        {
          id: 'b2',
          title: 'Premium Scented Soy Candle Set',
          description: 'Hand-poured candles with relaxing lavender and amber scents to create a cozy home atmosphere.',
          priceEstimate: '$20 - $35',
          category: 'Keepsakes'
        }
      );
    } else if (lowercaseOccasion.includes('anniversary') || lowercaseOccasion.includes('wedding')) {
      results.push(
        {
          id: 'a1',
          title: 'Engraved Milestone Photo Frame',
          description: 'A double-frame personalized with their names and marriage date to cherish their memories.',
          priceEstimate: '$30 - $45',
          category: 'Keepsakes'
        },
        {
          id: 'a2',
          title: 'Couples Cooking Class Experience Voucher',
          description: 'A fun, interactive virtual or local culinary workshop to build delicious memories together.',
          priceEstimate: '$80 - $120',
          category: 'Experiences'
        }
      );
    } else if (lowercaseOccasion.includes('thank')) {
      results.push(
        {
          id: 't1',
          title: 'Curated Dried Flower Bouquet',
          description: 'An elegant, long-lasting arrangement of dried flowers that requires no watering.',
          priceEstimate: '$35 - $50',
          category: 'Flowers'
        },
        {
          id: 't2',
          title: 'A Handwritten Calligraphy Appreciation Letter',
          description: 'A beautifully formatted calligraphed thank you scroll that expresses deep gratitude.',
          priceEstimate: '$15 - $25',
          category: 'Keepsakes'
        }
      );
    } else {
      results.push(
        {
          id: 'd1',
          title: 'Custom Curated Gift Card Box',
          description: 'An elegant gift folder carrying a premium card and voucher for their favorite local shop.',
          priceEstimate: '$50 - $100',
          category: 'Other'
        },
        {
          id: 'd2',
          title: 'Self-watering Indoor Ceramic Plant Pot',
          description: 'A sleek ceramic planter that automatically keeps houseplants hydrated. Perfect for any desk or home.',
          priceEstimate: '$25 - $38',
          category: 'Keepsakes'
        }
      );
    }
  }

  // Ensure we always have at least 3 gift ideas
  if (results.length < 3) {
    results.push({
      id: 'default_extra',
      title: 'Handcrafted Soy Candle & Relaxing Bath Salts',
      description: 'An organic, lavender-scented gift set designed for a relaxing, warm self-care evening.',
      priceEstimate: '$25 - $35',
      category: 'Keepsakes'
    });
  }

  return results.slice(0, 4);
}
