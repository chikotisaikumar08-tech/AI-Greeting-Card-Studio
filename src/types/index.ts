export type Occasion =
  | 'Birthday'
  | 'Anniversary'
  | 'Wedding'
  | 'Graduation'
  | 'Congratulations'
  | 'Thank You'
  | 'New Baby'
  | 'Get Well Soon'
  | 'Retirement'
  | 'Festivals'
  | 'Corporate Events'
  | 'Employee Appreciation'
  | 'Friendship Day'
  | 'Valentine\'s Day'
  | 'Mother\'s Day'
  | 'Father\'s Day'
  | 'Custom Occasion';

export type Tone =
  | 'Heartfelt'
  | 'Funny'
  | 'Romantic'
  | 'Professional'
  | 'Inspirational'
  | 'Emotional'
  | 'Formal'
  | 'Friendly'
  | 'Motivational'
  | 'Luxury'
  | 'Minimalistic';

export interface CardStyle {
  theme: string;
  backgroundColor: string;
  textColor: string;
  accentColor: string;
  fontFamily: string;
  cursiveFontFamily: string;
  headerFontFamily: string;
  textAlignment: 'left' | 'center' | 'right';
  stickers: string[]; // Emojis or small graphic classes
  logoUrl?: string; // Optional company logo for corporate cards
}

export interface CardData {
  occasion: string;
  customOccasionText?: string;
  tone: string;
  recipient: string;
  sender: string;
  details: string;
  language: string;
  useEmojis: boolean;
}

export interface GreetingCard {
  id: string;
  userId?: string;
  message: string;
  suggestions: string[]; // Store the 3 suggestions generated
  formData: CardData;
  style: CardStyle;
  isFavorite: boolean;
  isDraft: boolean;
  createdAt: string;
  updatedAt: string;
  shareableLink?: string;
  memoryImage?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  fullName?: string;
  avatarUrl?: string;
  subscription: 'free' | 'premium' | 'enterprise';
  createdAt: string;
}

export interface GiftRecommendation {
  id: string;
  title: string;
  description: string;
  priceEstimate: string;
  category: 'Books' | 'Flowers' | 'Experiences' | 'Tech' | 'Keepsakes' | 'Other';
  purchaseUrl?: string;
}

export interface MemoryCardData {
  id: string;
  imageUrl: string; // Base64 or URL
  eventDetails: string;
  occasion: string;
  recipient: string;
  sender: string;
  generatedGreeting: string;
  giftRecommendations: GiftRecommendation[];
}

export interface AnalyticsSummary {
  totalGreetings: number;
  savedGreetings: number;
  favoritesCount: number;
  occasionsBreakdown: Record<string, number>;
  tonesBreakdown: Record<string, number>;
  recentActivity: ActivityLog[];
}

export interface ActivityLog {
  id: string;
  type: 'generate' | 'favorite' | 'export_pdf' | 'export_png' | 'share' | 'login';
  description: string;
  timestamp: string;
}

export interface ApiConfig {
  provider: 'mock' | 'gemini' | 'openai';
  apiKey: string;
}
