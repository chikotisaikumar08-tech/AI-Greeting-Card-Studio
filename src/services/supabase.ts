import { createClient } from '@supabase/supabase-js';
import { GreetingCard, UserProfile, ActivityLog, AnalyticsSummary } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

class SupabaseService {
  public isLiveSupabase = false;

  constructor() {
    if (supabase) {
      this.isLiveSupabase = true;
      console.log('AI Greeting Card Studio: Live Supabase connection enabled.');
    } else {
      console.log('AI Greeting Card Studio: running in Mock / Offline-First local storage mode.');
      this.initMockDatabase();
    }
  }

  // --- MOCK DATABASE INIT ---
  private initMockDatabase() {
    if (!localStorage.getItem('studio_cards')) {
      const initialCards: GreetingCard[] = [
        {
          id: 'card_1',
          message: "Dear Sarah,\n\nHappy 25th Birthday! 🎂 On this beautiful day, I want to take a moment to celebrate you and the wonderful light you bring into this world. Your warmth, empathy, and constant support mean more to me than words can say. May the year ahead wrap you in happiness, bring you peace of mind, and lead you to exciting new paths. You deserve the absolute best today and every single day!\n\nWarmest wishes,\nAlex",
          suggestions: [],
          formData: {
            occasion: 'Birthday',
            tone: 'Heartfelt',
            recipient: 'Sarah',
            sender: 'Alex',
            details: 'She loves reading mystery books and is turning 25 today.',
            language: 'en',
            useEmojis: true
          },
          style: {
            theme: 'sakura',
            backgroundColor: 'linear-gradient(135deg, #fff5f6 0%, #ffeef2 100%)',
            textColor: '#5f2d37',
            accentColor: '#d15c72',
            fontFamily: "'Playfair Display', Georgia, serif",
            cursiveFontFamily: "'Caveat', cursive",
            headerFontFamily: "'Playfair Display', Georgia, serif",
            textAlignment: 'left',
            stickers: ['🎂', '🌸']
          },
          isFavorite: true,
          isDraft: false,
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
          updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString()
        },
        {
          id: 'card_2',
          message: "Jonathan,\n\nCongratulations on your well-deserved promotion to Senior Product Manager! 🚀 Leading the software launch with such dedication and focus has truly paid off. Your ability to steer the team through challenges while maintaining quality is inspiring. Wishing you continued growth and success in this new chapter!\n\nWarmly,\nHR Team",
          suggestions: [],
          formData: {
            occasion: 'Congratulations',
            tone: 'Professional',
            recipient: 'Jonathan',
            sender: 'HR Team',
            details: 'Promoted to Senior Product Manager after leading the software launch.',
            language: 'en',
            useEmojis: false
          },
          style: {
            theme: 'slate',
            backgroundColor: '#ffffff',
            textColor: '#0f172a',
            accentColor: '#6366f1',
            fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            cursiveFontFamily: "'Caveat', cursive",
            headerFontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            textAlignment: 'center',
            stickers: []
          },
          isFavorite: false,
          isDraft: false,
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
          updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString()
        }
      ];
      localStorage.setItem('studio_cards', JSON.stringify(initialCards));
    }

    if (!localStorage.getItem('studio_activity_logs')) {
      const initialLogs: ActivityLog[] = [
        {
          id: 'log_1',
          type: 'login',
          description: 'Logged into AI Greeting Card Studio',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString()
        },
        {
          id: 'log_2',
          type: 'generate',
          description: 'Generated Birthday greeting message for Sarah',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString()
        },
        {
          id: 'log_3',
          type: 'favorite',
          description: 'Added birthday card to favorites',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 1.9).toISOString()
        }
      ];
      localStorage.setItem('studio_activity_logs', JSON.stringify(initialLogs));
    }
  }

  // --- PROFILE API ---
  async getProfile(): Promise<UserProfile | null> {
    const profile = localStorage.getItem('studio_profile');
    if (!profile) return null;
    const parsedLocal = JSON.parse(profile);

    if (this.isLiveSupabase && supabase) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('email', parsedLocal.email)
          .maybeSingle();

        if (data && !error) {
          const synced = { ...parsedLocal, fullName: data.full_name || parsedLocal.fullName, mobile: data.mobile || parsedLocal.mobile, subscription: data.subscription || parsedLocal.subscription };
          localStorage.setItem('studio_profile', JSON.stringify(synced));
          return synced;
        }
      } catch (err) {
        console.warn('Supabase profile fetch failed, using local storage:', err);
      }
    }
    return parsedLocal;
  }

  async updateProfile(profile: Partial<UserProfile>): Promise<UserProfile> {
    const current = await this.getProfile();
    const updated = { ...current, ...profile } as UserProfile;
    localStorage.setItem('studio_profile', JSON.stringify(updated));

    if (this.isLiveSupabase && supabase && current) {
      try {
        await supabase
          .from('profiles')
          .upsert({
            id: current.id,
            email: current.email,
            full_name: updated.fullName,
            mobile: updated.mobile,
            subscription: updated.subscription || 'free',
            created_at: current.createdAt || new Date().toISOString()
          });
      } catch (err) {
        console.warn('Supabase profile update failed:', err);
      }
    }
    await this.logActivity('login', `Updated profile settings: ${profile.fullName || 'User details'}`);
    return updated;
  }

  // --- CARDS API ---
  async getCards(): Promise<GreetingCard[]> {
    const localProfile = localStorage.getItem('studio_profile');
    const email = localProfile ? JSON.parse(localProfile).email : '';

    if (this.isLiveSupabase && supabase && email) {
      try {
        const { data, error } = await supabase
          .from('cards')
          .select('*')
          .eq('user_email', email)
          .order('created_at', { ascending: false });

        if (data && !error) {
          const mappedCards = data.map((item: any) => ({
            id: item.id,
            message: item.message,
            suggestions: typeof item.suggestions === 'string' ? JSON.parse(item.suggestions) : item.suggestions,
            formData: typeof item.form_data === 'string' ? JSON.parse(item.form_data) : item.form_data,
            style: typeof item.style === 'string' ? JSON.parse(item.style) : item.style,
            isFavorite: item.is_favorite,
            isDraft: item.is_draft,
            createdAt: item.created_at,
            updatedAt: item.updated_at
          }));
          localStorage.setItem('studio_cards', JSON.stringify(mappedCards));
          return mappedCards;
        }
      } catch (err) {
        console.warn('Supabase cards fetch failed, using local storage:', err);
      }
    }

    const cards = localStorage.getItem('studio_cards');
    return cards ? JSON.parse(cards) : [];
  }

  async saveCard(card: Omit<GreetingCard, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): Promise<GreetingCard> {
    const localProfile = localStorage.getItem('studio_profile');
    const email = localProfile ? JSON.parse(localProfile).email : '';
    const now = new Date().toISOString();
    const cards = await this.getCards();

    let savedCard: GreetingCard;

    if (card.id) {
      const index = cards.findIndex(c => c.id === card.id);
      if (index !== -1) {
        savedCard = {
          ...cards[index],
          ...card,
          id: card.id,
          updatedAt: now
        };
        cards[index] = savedCard;
      } else {
        savedCard = {
          ...card,
          id: card.id,
          createdAt: now,
          updatedAt: now
        } as GreetingCard;
        cards.unshift(savedCard);
      }
    } else {
      savedCard = {
        ...card,
        id: 'card_' + Date.now() + Math.random().toString(36).substring(2, 9),
        createdAt: now,
        updatedAt: now
      };
      cards.unshift(savedCard);
    }

    localStorage.setItem('studio_cards', JSON.stringify(cards));

    if (this.isLiveSupabase && supabase && email) {
      try {
        await supabase
          .from('cards')
          .upsert({
            id: savedCard.id,
            user_email: email,
            message: savedCard.message,
            suggestions: savedCard.suggestions,
            form_data: savedCard.formData,
            style: savedCard.style,
            is_favorite: savedCard.isFavorite,
            is_draft: savedCard.isDraft,
            created_at: savedCard.createdAt,
            updated_at: savedCard.updatedAt
          });
      } catch (err) {
        console.warn('Supabase saveCard failed:', err);
      }
    }

    await this.logActivity(card.isDraft ? 'generate' : 'favorite', `Saved greeting card for ${card.formData.recipient}`);
    return savedCard;
  }

  async deleteCard(id: string): Promise<boolean> {
    const cards = await this.getCards();
    const filtered = cards.filter(c => c.id !== id);
    localStorage.setItem('studio_cards', JSON.stringify(filtered));

    if (this.isLiveSupabase && supabase) {
      try {
        await supabase
          .from('cards')
          .delete()
          .eq('id', id);
      } catch (err) {
        console.warn('Supabase deleteCard failed:', err);
      }
    }

    await this.logActivity('favorite', 'Deleted card from database');
    return true;
  }

  async toggleFavorite(id: string): Promise<GreetingCard | null> {
    const cards = await this.getCards();
    const index = cards.findIndex(c => c.id === id);
    if (index !== -1) {
      cards[index].isFavorite = !cards[index].isFavorite;
      cards[index].updatedAt = new Date().toISOString();
      localStorage.setItem('studio_cards', JSON.stringify(cards));
      
      const card = cards[index];

      if (this.isLiveSupabase && supabase) {
        try {
          await supabase
            .from('cards')
            .update({ is_favorite: card.isFavorite, updated_at: card.updatedAt })
            .eq('id', id);
        } catch (err) {
          console.warn('Supabase toggleFavorite failed:', err);
        }
      }

      await this.logActivity(
        'favorite', 
        card.isFavorite ? `Added card ${id} to Favorites` : `Removed card ${id} from Favorites`
      );
      return card;
    }
    return null;
  }

  // --- ACTIVITY LOGS ---
  async getActivityLogs(): Promise<ActivityLog[]> {
    const localProfile = localStorage.getItem('studio_profile');
    const email = localProfile ? JSON.parse(localProfile).email : '';

    if (this.isLiveSupabase && supabase && email) {
      try {
        const { data, error } = await supabase
          .from('activity_logs')
          .select('*')
          .eq('user_email', email)
          .order('timestamp', { ascending: false })
          .limit(50);

        if (data && !error) {
          localStorage.setItem('studio_activity_logs', JSON.stringify(data));
          return data;
        }
      } catch (err) {
        console.warn('Supabase activity logs fetch failed:', err);
      }
    }

    const logs = localStorage.getItem('studio_activity_logs');
    return logs ? JSON.parse(logs) : [];
  }

  async logActivity(type: ActivityLog['type'], description: string): Promise<ActivityLog> {
    const localProfile = localStorage.getItem('studio_profile');
    const email = localProfile ? JSON.parse(localProfile).email : '';

    const newLog: ActivityLog = {
      id: 'log_' + Date.now() + Math.random().toString(36).substring(2, 9),
      type,
      description,
      timestamp: new Date().toISOString()
    };

    const logs = await this.getActivityLogs();
    logs.unshift(newLog);
    localStorage.setItem('studio_activity_logs', JSON.stringify(logs.slice(0, 50)));

    if (this.isLiveSupabase && supabase && email) {
      try {
        await supabase
          .from('activity_logs')
          .insert({
            id: newLog.id,
            user_email: email,
            type: newLog.type,
            description: newLog.description,
            timestamp: newLog.timestamp
          });
      } catch (err) {
        console.warn('Supabase logActivity failed:', err);
      }
    }

    return newLog;
  }

  // --- ANALYTICS ---
  async getAnalytics(): Promise<AnalyticsSummary> {
    const cards = await this.getCards();
    const logs = await this.getActivityLogs();
    
    const favoritesCount = cards.filter(c => c.isFavorite).length;
    const savedGreetings = cards.filter(c => !c.isDraft).length;
    
    const occasionsBreakdown: Record<string, number> = {};
    const tonesBreakdown: Record<string, number> = {};

    cards.forEach(c => {
      const occ = c.formData.occasion;
      const tone = c.formData.tone;
      occasionsBreakdown[occ] = (occasionsBreakdown[occ] || 0) + 1;
      tonesBreakdown[tone] = (tonesBreakdown[tone] || 0) + 1;
    });

    return {
      totalGreetings: cards.length,
      savedGreetings,
      favoritesCount,
      occasionsBreakdown,
      tonesBreakdown,
      recentActivity: logs.slice(0, 8)
    };
  }
}

export const db = new SupabaseService();
export default db;
