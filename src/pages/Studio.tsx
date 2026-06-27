import React, { useState, useRef, useEffect } from 'react';
import { db } from '../services/supabase';
import { generateGreetings, rewriteGreeting, translateGreeting } from '../services/ai';
import { generateGiftRecommendations } from '../services/giftRecs';
import { exportToPng, exportToPdf } from '../utils/cardExport';
import html2canvas from 'html2canvas';
import { GreetingCard, CardStyle, CardData, GiftRecommendation, ApiConfig } from '../types';
import { 
  Sparkles, Palette, Image, ArrowLeft, RefreshCw, Star, 
  Copy, FileText, Printer, ChevronRight, Edit2, Check, X,
  AlignLeft, AlignCenter, AlignRight, FileDown, Eye, UploadCloud,
  ChevronLeft, Gift, Trash2, Smartphone, Monitor, Heart, FolderHeart, Share2
} from 'lucide-react';

// Options Constants
const OCCASIONS = [
  'Birthday', 'Anniversary', 'Wedding', 'Graduation', 'Congratulations', 
  'Thank You', 'New Baby', 'Get Well Soon', 'Retirement', 'Festivals', 
  'Corporate Events', 'Employee Appreciation', 'Friendship Day', 'Valentine\'s Day', 
  'Mother\'s Day', 'Father\'s Day', 'Custom Occasion'
];

const TONES = [
  'Heartfelt', 'Funny', 'Romantic', 'Professional', 'Inspirational', 
  'Emotional', 'Formal', 'Friendly', 'Motivational', 'Luxury', 'Minimalistic'
];

const LANGUAGES = [
  { code: 'en', name: 'English (EN)' },
  { code: 'es', name: 'Español (ES)' },
  { code: 'fr', name: 'Français (FR)' },
  { code: 'de', name: 'Deutsch (DE)' },
  { code: 'hi', name: 'हिन्दी (HI)' },
  { code: 'te', name: 'తెలుగు (TE)' }
];

const FONTS = [
  { id: 'font-serif', name: 'Playfair Serif', class: "'Playfair Display', Georgia, serif" },
  { id: 'font-sans', name: 'Plus Jakarta Sans', class: "'Plus Jakarta Sans', sans-serif" },
  { id: 'font-cursive', name: 'Caveat Cursive', class: "'Caveat', cursive" },
  { id: 'font-elegant', name: 'Great Vibes', class: "'Great Vibes', cursive" },
  { id: 'font-header', name: 'Cinzel Classical', class: "'Cinzel', serif" },
  { id: 'font-poppins', name: 'Poppins', class: "'Poppins', sans-serif" },
  { id: 'font-lora', name: 'Lora', class: "'Lora', serif" },
  { id: 'font-montserrat', name: 'Montserrat', class: "'Montserrat', sans-serif" },
  { id: 'font-dancing', name: 'Dancing Script', class: "'Dancing Script', cursive" },
  { id: 'font-sacramento', name: 'Sacramento Light', class: "'Sacramento', cursive" },
  { id: 'font-garamond', name: 'EB Garamond Classic', class: "'EB Garamond', serif" },
  { id: 'font-outfit', name: 'Outfit Modern', class: "'Outfit', sans-serif" }
];

const STICKER_LIST = [
  '🌸', '✨', '🎈', '🎉', '🎂', '❤️', '🍾', '🎓', '🧸', '🌳', '🌟', '💼',
  '💌', '🎁', '🌹', '🌈', '🔥', '👑', '🦋', '🐈', '🐶', '🍕', '🍰', '💍',
  '✈️', '🏝️', '🍀', '💡', '🥂', '🔮', '🎻'
];

const THEMES = [
  { id: 'sakura', name: 'Sakura Pink', bg: 'repeating-linear-gradient(90deg, rgba(209,92,114,0.01) 0px, rgba(209,92,114,0.01) 1px, transparent 1px, transparent 6px), repeating-linear-gradient(0deg, rgba(209,92,114,0.01) 0px, rgba(209,92,114,0.01) 1px, transparent 1px, transparent 6px), linear-gradient(135deg, #fff5f6 0%, #ffe3e7 100%)', text: '#5f2d37', accent: '#d15c72' },
  { id: 'midnight', name: 'Midnight Gold', bg: 'repeating-linear-gradient(45deg, rgba(224,169,109,0.02) 0px, rgba(224,169,109,0.02) 1px, transparent 1px, transparent 16px), linear-gradient(135deg, #0b0f19 0%, #161f30 100%)', text: '#f4ede2', accent: '#e0a96d' },
  { id: 'gold', name: 'Warm Gold', bg: 'repeating-linear-gradient(90deg, rgba(197,160,89,0.02) 0px, rgba(197,160,89,0.02) 1px, transparent 1px, transparent 5px), repeating-linear-gradient(0deg, rgba(197,160,89,0.02) 0px, rgba(197,160,89,0.02) 1px, transparent 1px, transparent 5px), linear-gradient(135deg, #fdfbf7 0%, #f4eae1 100%)', text: '#2c251e', accent: '#c5a059' },
  { id: 'teal', name: 'Retro Teal', bg: 'repeating-linear-gradient(-45deg, rgba(26,188,156,0.02) 0px, rgba(26,188,156,0.02) 1.5px, transparent 1.5px, transparent 12px), linear-gradient(135deg, #f2fbf9 0%, #d1f2eb 100%)', text: '#0e3a38', accent: '#1abc9c' },
  { id: 'slate', name: 'Minimalist Slate', bg: 'repeating-linear-gradient(90deg, rgba(99,102,245,0.01) 0px, rgba(99,102,245,0.01) 1px, transparent 1px, transparent 20px), repeating-linear-gradient(0deg, rgba(99,102,245,0.01) 0px, rgba(99,102,245,0.01) 1px, transparent 1px, transparent 20px), linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)', text: '#0f172a', accent: '#4f46e5' },
  { id: 'lavender', name: 'Lavender Dream', bg: 'repeating-linear-gradient(45deg, rgba(139,92,246,0.015) 0px, rgba(139,92,246,0.015) 1px, transparent 1px, transparent 8px), repeating-linear-gradient(-45deg, rgba(139,92,246,0.015) 0px, rgba(139,92,246,0.015) 1px, transparent 1px, transparent 8px), linear-gradient(135deg, #f9f5ff 0%, #f3e8ff 100%)', text: '#3b0764', accent: '#8b5cf6' },
  { id: 'ocean', name: 'Ocean Breeze', bg: 'repeating-linear-gradient(0deg, rgba(2,132,199,0.015) 0px, rgba(2,132,199,0.015) 1.5px, transparent 1.5px, transparent 10px), linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)', text: '#0369a1', accent: '#0284c7' },
  { id: 'forest', name: 'Forest Green', bg: 'repeating-linear-gradient(45deg, rgba(52,211,153,0.015) 0px, rgba(52,211,153,0.015) 1px, transparent 1px, transparent 24px), linear-gradient(135deg, #092c22 0%, #031510 100%)', text: '#f4ede2', accent: '#34d399' },
  { id: 'purple', name: 'Royal Purple', bg: 'repeating-linear-gradient(60deg, rgba(192,132,252,0.02) 0px, rgba(192,132,252,0.02) 1px, transparent 1px, transparent 16px), linear-gradient(135deg, #220b38 0%, #0c0217 100%)', text: '#f8fafc', accent: '#c084fc' },
  { id: 'sunset', name: 'Sunset Glow', bg: 'repeating-linear-gradient(90deg, rgba(249,115,22,0.01) 0px, rgba(249,115,22,0.01) 2px, transparent 2px, transparent 18px), linear-gradient(135deg, #fffcf9 0%, #fdf0e2 100%)', text: '#5f1a07', accent: '#f97316' },
  { id: 'blush', name: 'Blush Floral', bg: 'repeating-linear-gradient(0deg, rgba(236,72,153,0.015) 0px, rgba(236,72,153,0.015) 1px, transparent 1px, transparent 12px), linear-gradient(135deg, #fff5f7 0%, #ffe4e9 100%)', text: '#701a2f', accent: '#ec4899' },
  { id: 'cream', name: 'Cream Classic', bg: 'repeating-linear-gradient(90deg, rgba(135,120,100,0.03) 0px, rgba(135,120,100,0.03) 1px, transparent 1px, transparent 4px), repeating-linear-gradient(0deg, rgba(135,120,100,0.03) 0px, rgba(135,120,100,0.03) 1px, transparent 1px, transparent 4px), linear-gradient(135deg, #fbfaf7 0%, #f4f0e6 100%)', text: '#2b261f', accent: '#877864' }
];

interface StudioProps {
  initialCard?: GreetingCard | null;
  onNavigateToDashboard: () => void;
  apiConfig: ApiConfig;
  initialTab?: 'generator' | 'designer' | 'memory' | 'saved' | 'favorites';
}

export const Studio: React.FC<StudioProps> = ({ initialCard, onNavigateToDashboard, apiConfig, initialTab = 'generator' }) => {
  // --- Workspace Tabs ---
  const [activeTab, setActiveTab] = useState<'generator' | 'designer' | 'memory' | 'saved' | 'favorites'>('generator');

  // Sync active tab from parent navigation
  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);
  
  // --- Saved/Favorite Cards States ---
  const [currentCardId, setCurrentCardId] = useState<string | null>(null);
  const [savedCards, setSavedCards] = useState<GreetingCard[]>([]);
  
  // --- Form & AI State ---
  const [formData, setFormData] = useState<CardData>({
    occasion: 'Birthday',
    customOccasionText: '',
    tone: 'Heartfelt',
    recipient: '',
    sender: '',
    details: '',
    language: 'en',
    useEmojis: true
  });
  
  const [lengthPreference, setLengthPreference] = useState<'short' | 'medium' | 'long'>('medium');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [activeMessage, setActiveMessage] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [rewritePrompt, setRewritePrompt] = useState('');
  const [translateLang, setTranslateLang] = useState('es');
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState('');
  
  // --- Designer State ---
  const [currentThemeId, setCurrentThemeId] = useState<string>('sakura');
  const [styleData, setStyleData] = useState<CardStyle>({
    theme: 'sakura',
    backgroundColor: THEMES[0].bg,
    textColor: THEMES[0].text,
    accentColor: THEMES[0].accent,
    fontFamily: FONTS[0].class,
    cursiveFontFamily: FONTS[2].class,
    headerFontFamily: FONTS[4].class,
    textAlignment: 'center',
    stickers: []
  });

  const [cardSide, setCardSide] = useState<'front' | 'back'>('front');
  const [previewSize, setPreviewSize] = useState<'desktop' | 'mobile'>('desktop');
  const [customLogo, setCustomLogo] = useState<string | null>(null);
  
  // --- Back Card Settings ---
  const [backMessage, setBackMessage] = useState('Handcrafted with love by CardCrafter Studio');
  
  // --- Memory Card State ---
  const [memoryImage, setMemoryImage] = useState<string | null>(null);
  const [memoryContext, setMemoryContext] = useState('');
  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false);
  const [giftRecs, setGiftRecs] = useState<GiftRecommendation[]>([]);

  // Load Initial Card (For editing or loading favorites)
  useEffect(() => {
    if (initialCard) {
      setCurrentCardId(initialCard.id);
      setFormData(initialCard.formData);
      setActiveMessage(initialCard.message);
      setSuggestions(initialCard.suggestions || []);
      setCurrentThemeId(initialCard.style.theme);
      setStyleData(initialCard.style);
      if (initialCard.style.logoUrl) {
        setCustomLogo(initialCard.style.logoUrl);
      } else {
        setCustomLogo(null);
      }
      if (initialCard.memoryImage) {
        setMemoryImage(initialCard.memoryImage);
      } else {
        setMemoryImage(null);
      }
    } else {
      setCurrentCardId(null);
      setMemoryImage(null);
    }
  }, [initialCard]);

  const fetchSavedCards = async () => {
    try {
      const cards = await db.getCards();
      setSavedCards(cards);
    } catch (err) {
      console.error('Failed to load saved cards:', err);
    }
  };

  useEffect(() => {
    fetchSavedCards();
  }, []);

  // Sync design variables on theme change
  const handleThemeChange = (themeId: CardStyle['theme']) => {
    setCurrentThemeId(themeId);
    const selected = THEMES.find(t => t.id === themeId) || THEMES[0];
    setStyleData(prev => ({
      ...prev,
      theme: themeId,
      backgroundColor: selected.bg,
      textColor: selected.text,
      accentColor: selected.accent
    }));
  };

  // --- AI ACTIONS ---
  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsGenerating(true);
    setSuggestions([]);
    
    try {
      const results = await generateGreetings(
        { ...formData, length: lengthPreference },
        apiConfig
      );
      setSuggestions(results);
      setActiveMessage(results[0]);
      await db.logActivity('generate', `Generated greetings for ${formData.recipient || 'friend'}`);
    } catch (err) {
      console.error(err);
      alert('Error generating greeting. Check your API configuration.');
    } finally {
      setIsGenerating(false);
    }
  };



  const handleRewrite = async () => {
    if (!rewritePrompt.trim()) return;
    setIsGenerating(true);
    try {
      const result = await rewriteGreeting(activeMessage, rewritePrompt, apiConfig);
      setActiveMessage(result);
      setRewritePrompt('');
      await db.logActivity('generate', 'Altered greeting card layout using AI rewrite');
    } catch (error) {
      alert('Rewrite action failed.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleTranslate = async () => {
    setIsGenerating(true);
    try {
      const result = await translateGreeting(activeMessage, translateLang, apiConfig);
      setActiveMessage(result);
      await db.logActivity('generate', `Translated card into ${translateLang.toUpperCase()}`);
    } catch (error) {
      alert('Translation failed.');
    } finally {
      setIsGenerating(false);
    }
  };

  // --- SAVE CARD ---
  const handleSaveCard = async () => {
    if (!activeMessage) {
      alert('Generate or write a message first.');
      return;
    }
    try {
      const isAlreadyFavorite = savedCards.find(c => c.id === currentCardId)?.isFavorite || false;
      const saved = await db.saveCard({
        id: currentCardId || undefined,
        message: activeMessage,
        suggestions,
        formData,
        style: {
          ...styleData,
          logoUrl: customLogo || undefined
        },
        memoryImage: memoryImage || undefined,
        isFavorite: isAlreadyFavorite,
        isDraft: true
      });
      setCurrentCardId(saved.id);
      await fetchSavedCards();
      alert('Card layout saved as draft!');
    } catch (error) {
      alert('Failed to save card.');
    }
  };

  const handleFavoriteCard = async () => {
    if (!activeMessage) {
      alert('Generate or write a message first.');
      return;
    }
    try {
      const isAlreadyFavorite = savedCards.find(c => c.id === currentCardId)?.isFavorite || false;
      const isDraftStatus = savedCards.find(c => c.id === currentCardId)?.isDraft || false;
      const saved = await db.saveCard({
        id: currentCardId || undefined,
        message: activeMessage,
        suggestions,
        formData,
        style: {
          ...styleData,
          logoUrl: customLogo || undefined
        },
        memoryImage: memoryImage || undefined,
        isFavorite: !isAlreadyFavorite,
        isDraft: isDraftStatus
      });
      setCurrentCardId(saved.id);
      await fetchSavedCards();
      if (!isAlreadyFavorite) {
        alert('Card added to Favorites!');
      } else {
        alert('Card removed from Favorites.');
      }
    } catch (error) {
      alert('Failed to update favorite status.');
    }
  };

  const handleLoadSavedCard = (card: GreetingCard) => {
    setCurrentCardId(card.id);
    setFormData(card.formData);
    setActiveMessage(card.message);
    setSuggestions(card.suggestions || []);
    setCurrentThemeId(card.style.theme);
    setStyleData(card.style);
    if (card.style.logoUrl) {
      setCustomLogo(card.style.logoUrl);
    } else {
      setCustomLogo(null);
    }
    if (card.memoryImage) {
      setMemoryImage(card.memoryImage);
    } else {
      setMemoryImage(null);
    }
    // Switch back to AI copywriter tab so they can see the editing options
    setActiveTab('generator');
  };

  const handleDeleteSavedCard = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this card?')) {
      try {
        await db.deleteCard(id);
        if (currentCardId === id) {
          setCurrentCardId(null);
        }
        await fetchSavedCards();
      } catch (err) {
        alert('Failed to delete card.');
      }
    }
  };

  const handleShare = async () => {
    const element = document.getElementById('greeting-card-canvas');
    if (!element) {
      alert('Card canvas not found.');
      return;
    }

    try {
      // 1. Hide edit overlays temporarily
      const indicators = element.querySelectorAll('.card-hover-edit-indicator, .card-editor-overlay');
      indicators.forEach(el => (el as HTMLElement).style.display = 'none');

      // 2. Render canvas using html2canvas
      const canvas = await html2canvas(element, {
        scale: 2, // Scale of 2 is perfect for mobile sharing size and speed
        useCORS: true,
        backgroundColor: null,
        logging: false
      });

      // 3. Restore hidden elements
      indicators.forEach(el => (el as HTMLElement).style.display = '');

      // 4. Convert canvas to blob
      canvas.toBlob(async (blob) => {
        if (!blob) {
          alert('Failed to generate card image.');
          return;
        }

        // 5. Create a File object
        const fileName = `${formData.occasion || 'Greeting'}_Card.png`;
        const file = new File([blob], fileName, { type: 'image/png' });

        // 6. Share data with file!
        const shareData = {
          files: [file],
          title: `${formData.occasion} Greeting Card`,
          text: `Check out this custom greeting card sent via AI Greeting Card Studio!`
        };

        // Check if Web Share API with files is supported
        if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
          try {
            await navigator.share(shareData);
            await db.logActivity('share', `Shared greeting card image for ${formData.recipient}`);
          } catch (err) {
            if ((err as Error).name !== 'AbortError') {
              console.error('Sharing image failed:', err);
              await shareAsTextFallback();
            }
          }
        } else {
          // Fallback: Copy image to clipboard as PNG!
          try {
            const item = new ClipboardItem({ 'image/png': blob });
            await navigator.clipboard.write([item]);
            alert('Greeting card image copied to clipboard! You can paste/share it directly inside WhatsApp or any other app.');
          } catch (clipboardErr) {
            // Second fallback: Download PNG
            const dataUrl = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.download = fileName;
            link.href = dataUrl;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            alert('Your card image has been downloaded. You can upload it to share on social media.');
          }
        }
      }, 'image/png');

    } catch (error) {
      console.error('Error generating card image for sharing:', error);
      alert('Error sharing card.');
    }
  };

  const shareAsTextFallback = async () => {
    const textData = {
      title: `${formData.occasion} Greeting Card`,
      text: `Here is a custom greeting card message generated for ${formData.recipient || 'you'}:\n\n"${activeMessage}"\n\n- Sent via AI Greeting Card Studio`,
      url: window.location.href
    };
    if (navigator.share && navigator.canShare && navigator.canShare(textData)) {
      try {
        await navigator.share(textData);
      } catch (err) {
        // Ignore AbortError
      }
    } else {
      try {
        await navigator.clipboard.writeText(`${textData.text}\n\nLink: ${textData.url}`);
        alert('Card text copied to clipboard!');
      } catch (e) {
        alert('Failed to copy to clipboard.');
      }
    }
  };

  // --- IMAGE ANALYSIS FOR MEMORY CARDS ---
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setMemoryImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyzeMemory = async () => {
    if (!memoryImage) return;
    setIsAnalyzingImage(true);
    setGiftRecs([]);

    try {
      // Simulate image analysis API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const parsedOccasion = formData.occasion;
      const textDetails = memoryContext || 'A warm outdoor gathering with happy smiles.';
      
      // Auto-update details form
      setFormData(prev => ({
        ...prev,
        details: `Memory: ${textDetails}.`
      }));

      // Generate card message
      const results = await generateGreetings(
        {
          ...formData,
          details: textDetails,
          length: 'medium'
        },
        apiConfig
      );
      setSuggestions(results);
      setActiveMessage(results[0]);

      // Generate gift lists
      const gifts = await generateGiftRecommendations(
        parsedOccasion,
        formData.recipient || 'Dear Friend',
        textDetails,
        apiConfig
      );
      setGiftRecs(gifts);
      await db.logActivity('generate', 'Uploaded and analyzed photo memory for smart recommendations');
    } catch (error) {
      console.error(error);
      alert('AI analysis failed.');
    } finally {
      setIsAnalyzingImage(false);
    }
  };

  // --- EXPORT TRIGGERS ---
  const handleDownloadPNG = async () => {
    if (!activeMessage) return;
    const ok = await exportToPng('greeting-card-canvas', `${formData.occasion}_Card`);
    if (ok) await db.logActivity('export_png', `Exported card for ${formData.recipient} as PNG`);
  };

  const handleDownloadPDF = async () => {
    if (!activeMessage) return;
    const ok = await exportToPdf('greeting-card-canvas', `${formData.occasion}_Card`);
    if (ok) await db.logActivity('export_pdf', `Exported card for ${formData.recipient} as PDF`);
  };

  // --- LOGO UPLOADER ---
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCustomLogo(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const selectedTheme = THEMES.find(t => t.id === currentThemeId) || THEMES[0];

  return (
    <div className="bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 min-h-screen">
      
      {/* Studio Header */}
      <header className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-900 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <button 
            onClick={onNavigateToDashboard}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-xl font-extrabold">Creative Studio Workspace</h1>
            <p className="text-xs text-slate-400 font-medium">Design premium greeting templates & memory cards</p>
          </div>
        </div>

        {/* Global Save Actions */}
        <div className="flex items-center gap-2">
          {/* Header Save actions removed as requested - now located directly below the card preview */}
        </div>
      </header>

      {/* Main Studio Body Grid */}
      <main className="max-w-7xl mx-auto p-4 md:p-6 grid lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Generator / Designer / Memory Tabs (Span 7) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Tab Selector buttons */}
          <div className="flex overflow-x-auto whitespace-nowrap scrollbar-none bg-gray-100 dark:bg-slate-900 p-1.5 rounded-lg border border-gray-200/50 dark:border-gray-800/80 gap-1.5">
            <button
              onClick={() => setActiveTab('generator')}
              className={`flex-1 min-w-[110px] flex items-center justify-center gap-1.5 py-2.5 rounded-md text-xs font-bold transition-all ${activeTab === 'generator' ? 'bg-white dark:bg-slate-850 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
            >
              <Sparkles size={14} />
              AI Copywriter
            </button>
            <button
              onClick={() => setActiveTab('designer')}
              className={`flex-1 min-w-[115px] flex items-center justify-center gap-1.5 py-2.5 rounded-md text-xs font-bold transition-all ${activeTab === 'designer' ? 'bg-white dark:bg-slate-850 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
            >
              <Palette size={14} />
              Visual Designer
            </button>
            <button
              onClick={() => setActiveTab('memory')}
              className={`flex-1 min-w-[125px] flex items-center justify-center gap-1.5 py-2.5 rounded-md text-xs font-bold transition-all ${activeTab === 'memory' ? 'bg-white dark:bg-slate-850 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
            >
              <Image size={14} />
              AI Memory Cards
            </button>
            <button
              onClick={() => setActiveTab('saved')}
              className={`flex-1 min-w-[110px] flex items-center justify-center gap-1.5 py-2.5 rounded-md text-xs font-bold transition-all ${activeTab === 'saved' ? 'bg-white dark:bg-slate-850 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
            >
              <FolderHeart size={14} />
              Saved Cards
            </button>
            <button
              onClick={() => setActiveTab('favorites')}
              className={`flex-1 min-w-[95px] flex items-center justify-center gap-1.5 py-2.5 rounded-md text-xs font-bold transition-all ${activeTab === 'favorites' ? 'bg-white dark:bg-slate-850 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
            >
              <Heart size={14} />
              Favorites
            </button>
          </div>

          {/* TAB 1: AI GENERATOR FORM */}
          {activeTab === 'generator' && (
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm space-y-6">
              <h3 className="text-lg font-bold">Configure Greeting Card Prompts</h3>
              
              <form onSubmit={handleGenerate} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400">Occasion</label>
                    <select
                      value={formData.occasion}
                      onChange={(e) => setFormData(prev => ({ ...prev, occasion: e.target.value }))}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-lg p-2.5 text-sm outline-none"
                    >
                      {OCCASIONS.map(occ => <option key={occ} value={occ}>{occ}</option>)}
                    </select>
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400">Tone</label>
                    <select
                      value={formData.tone}
                      onChange={(e) => setFormData(prev => ({ ...prev, tone: e.target.value }))}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-lg p-2.5 text-sm outline-none"
                    >
                      {TONES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                </div>

                {formData.occasion === 'Custom Occasion' && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400">Specify Custom Occasion</label>
                    <input
                      type="text"
                      value={formData.customOccasionText}
                      onChange={(e) => setFormData(prev => ({ ...prev, customOccasionText: e.target.value }))}
                      placeholder="e.g. Housewarming, Job Promotion"
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-lg p-2.5 text-sm outline-none"
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400">Recipient Name</label>
                    <input
                      type="text"
                      value={formData.recipient}
                      onChange={(e) => setFormData(prev => ({ ...prev, recipient: e.target.value }))}
                      placeholder="Sarah"
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-lg p-2.5 text-sm outline-none"
                    />
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400">Sender Name</label>
                    <input
                      type="text"
                      value={formData.sender}
                      onChange={(e) => setFormData(prev => ({ ...prev, sender: e.target.value }))}
                      placeholder="Alex"
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-lg p-2.5 text-sm outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400">Personal Details & Memories</label>
                  <textarea
                    value={formData.details}
                    onChange={(e) => setFormData(prev => ({ ...prev, details: e.target.value }))}
                    placeholder="e.g. Mention that she turned 25, loves reading mystery novels, and recently completed her master's degree."
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-lg p-2.5 text-sm outline-none"
                    rows={3}
                  />
                </div>

                <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                  <div className="flex gap-4">
                    <div className="flex items-center gap-1.5">
                      <label className="text-xs font-bold text-slate-400">Length:</label>
                      <select
                        value={lengthPreference}
                        onChange={(e) => setLengthPreference(e.target.value as any)}
                        className="bg-transparent text-xs font-bold text-indigo-500 border border-indigo-200 rounded p-1 outline-none"
                      >
                        <option value="short">Short</option>
                        <option value="medium">Medium</option>
                        <option value="long">Long</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <label className="text-xs font-bold text-slate-400">Language:</label>
                      <select
                        value={formData.language}
                        onChange={(e) => setFormData(prev => ({ ...prev, language: e.target.value }))}
                        className="bg-transparent text-xs font-bold text-indigo-500 border border-indigo-200 rounded p-1 outline-none"
                      >
                        {LANGUAGES.map(lang => <option key={lang.code} value={lang.code}>{lang.name}</option>)}
                      </select>
                    </div>
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.useEmojis}
                      onChange={(e) => setFormData(prev => ({ ...prev, useEmojis: e.target.checked }))}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                    />
                    <span className="text-xs font-bold text-slate-500">Include Emojis</span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isGenerating}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold rounded-lg shadow-md hover:shadow-lg flex items-center justify-center gap-2 transition-all text-sm"
                >
                  {isGenerating ? <RefreshCw className="animate-spin" size={16} /> : <Sparkles size={16} />}
                  {isGenerating ? 'Generating suggestions...' : 'Generate 3 AI Suggestions'}
                </button>
              </form>

              {/* Suggestions Panel */}
              {suggestions.length > 0 && (
                <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                  <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Generated Message Options</h4>
                  <div className="space-y-3">
                    {suggestions.map((option, idx) => (
                      <div
                        key={idx}
                        onClick={() => {
                          setActiveMessage(option);
                          db.logActivity('generate', `Loaded suggestion option ${idx + 1}`);
                        }}
                        className={`p-4 rounded-lg border text-sm transition-all cursor-pointer ${activeMessage === option ? 'border-indigo-500 bg-indigo-50/20 dark:bg-indigo-950/10' : 'border-gray-200 dark:border-gray-800 hover:border-gray-400 bg-slate-50/50 dark:bg-slate-900/50'}`}
                      >
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">Suggestion {idx + 1}</span>
                          {activeMessage === option && <Check size={14} className="text-indigo-600 dark:text-indigo-400" />}
                        </div>
                        <p className="line-clamp-3 leading-relaxed whitespace-pre-line text-slate-600 dark:text-slate-300 font-serif">
                          {option}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: VISUAL DESIGNER */}
          {activeTab === 'designer' && (
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm space-y-6">
              <h3 className="text-lg font-bold">Customize Visual Aesthetics</h3>
              
              {/* Theme selection list */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Visual Themes</label>
                <div className="grid grid-cols-2 md:grid-cols-6 gap-2.5">
                  {THEMES.map(theme => (
                    <button
                      key={theme.id}
                      onClick={() => handleThemeChange(theme.id)}
                      className={`p-2 rounded-xl border text-[10px] font-bold text-center transition-all flex flex-col items-center justify-between relative ${currentThemeId === theme.id ? 'border-indigo-600 dark:border-indigo-500 shadow-sm ring-1 ring-indigo-500 bg-indigo-50/5' : 'border-gray-200 dark:border-gray-800 hover:bg-slate-50 dark:hover:bg-slate-800 bg-white dark:bg-slate-900'}`}
                    >
                      <div className="relative w-full h-12 mb-1.5">
                        <div 
                          className="w-full h-full rounded-lg border border-black/5 dark:border-white/5 bg-center bg-cover shadow-sm" 
                          style={{ 
                            background: theme.bg
                          }} 
                        />
                        {currentThemeId === theme.id && (
                          <div className="absolute -top-1 -right-1 z-10 w-4 h-4 bg-indigo-600 dark:bg-indigo-500 text-white rounded-full flex items-center justify-center shadow-md">
                            <Check size={10} strokeWidth={3} />
                          </div>
                        )}
                      </div>
                      <span className="truncate w-full block text-slate-700 dark:text-slate-350">{theme.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-6 pt-4 border-t border-gray-100 dark:border-gray-800">
                {/* Font picking dropdown */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Primary Font Family</label>
                  <select
                    value={styleData.fontFamily}
                    onChange={(e) => setStyleData(prev => ({ ...prev, fontFamily: e.target.value }))}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-lg p-2.5 text-sm outline-none font-semibold"
                  >
                    {FONTS.map(f => <option key={f.id} value={f.class}>{f.name}</option>)}
                  </select>
                </div>

                {/* Text alignment options */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Text Alignment</label>
                  <div className="flex bg-slate-50 dark:bg-slate-800 p-1 border border-gray-250 dark:border-gray-700 rounded-lg">
                    {(['left', 'center', 'right'] as const).map(align => (
                      <button
                        key={align}
                        type="button"
                        onClick={() => setStyleData(prev => ({ ...prev, textAlignment: align }))}
                        className={`flex-1 py-1.5 rounded flex items-center justify-center transition-all ${styleData.textAlignment === align ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-500' : 'text-slate-400 hover:text-slate-600'}`}
                      >
                        {align === 'left' && <AlignLeft size={16} />}
                        {align === 'center' && <AlignCenter size={16} />}
                        {align === 'right' && <AlignRight size={16} />}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Stickers / Emojis overlay */}
              <div className="space-y-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Emoji Decors</label>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setStyleData(prev => ({ ...prev, stickers: [] }))}
                    className={`text-xs font-semibold px-3.5 py-2 rounded-full border transition-all flex items-center gap-1.5 ${styleData.stickers.length === 0 ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600' : 'border-gray-200 dark:border-gray-800 hover:bg-slate-50 dark:hover:bg-slate-800 bg-white dark:bg-slate-900 text-slate-500'}`}
                  >
                    <svg className={`w-3.5 h-3.5 ${styleData.stickers.length === 0 ? 'text-indigo-600' : 'text-slate-400'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <path d="m4.9 4.9 14.2 14.2" />
                    </svg>
                    None
                  </button>
                  {STICKER_LIST.map(sticker => {
                    const isSelected = styleData.stickers.includes(sticker);
                    return (
                      <button
                        key={sticker}
                        onClick={() => {
                          const list = isSelected 
                            ? styleData.stickers.filter(s => s !== sticker) 
                            : [...styleData.stickers, sticker];
                          setStyleData(prev => ({ ...prev, stickers: list }));
                        }}
                        className={`w-9 h-9 rounded-full border text-base flex items-center justify-center transition-all hover:scale-110 ${isSelected ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-650' : 'border-gray-200 dark:border-gray-800 hover:bg-slate-50 dark:hover:bg-slate-800 bg-white dark:bg-slate-900'}`}
                      >
                        {sticker}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Corporate branding / logo uploader */}
              <div className="space-y-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Branding (Corporate Logo)</label>
                <div className="flex items-center gap-4">
                  {customLogo && (
                    <div className="relative w-16 h-16 rounded border border-gray-200 p-1 bg-white">
                      <img src={customLogo} alt="Logo" className="w-full h-full object-contain" />
                      <button 
                        onClick={() => setCustomLogo(null)}
                        className="absolute -top-1.5 -right-1.5 p-0.5 bg-pink-600 hover:bg-pink-700 text-white rounded-full transition-colors"
                      >
                        <X size={10} />
                      </button>
                    </div>
                  )}
                  <label className="flex items-center gap-2 px-3 py-2 border border-gray-250 dark:border-gray-700 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg cursor-pointer text-xs font-bold text-slate-500 transition-colors">
                    <UploadCloud size={14} />
                    Upload Brand Logo
                    <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                  </label>
                </div>
              </div>

              {/* Back cover details */}
              <div className="space-y-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Card Back Stamp Text</label>
                <input
                  type="text"
                  value={backMessage}
                  onChange={(e) => setBackMessage(e.target.value)}
                  placeholder="Designed with love by CardCrafter Studio"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-lg p-2.5 text-sm outline-none"
                />
              </div>
            </div>
          )}

          {/* TAB 3: AI MEMORY CARDS */}
          {activeTab === 'memory' && (
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm space-y-6">
              <div>
                <h3 className="text-lg font-bold">Memory Card AI Generator</h3>
                <p className="text-xs text-slate-400 font-semibold mt-1">
                  Upload a photo of a memory. The AI will compose personal greetings and compile gift suggestions.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Drag Drop Image area */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Snap a Memory Photo</label>
                  <div className="border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-xl flex flex-col items-center justify-center p-6 h-[200px] text-center bg-slate-50/50 dark:bg-slate-900/50 relative overflow-hidden">
                    {memoryImage ? (
                      <>
                        <img src={memoryImage} alt="Memory" className="absolute inset-0 w-full h-full object-cover" />
                        <button
                          onClick={() => setMemoryImage(null)}
                          className="absolute top-2 right-2 p-1.5 bg-slate-900/60 hover:bg-slate-900 text-white rounded-full transition-colors"
                        >
                          <X size={14} />
                        </button>
                      </>
                    ) : (
                      <label className="cursor-pointer flex flex-col items-center justify-center">
                        <UploadCloud size={32} className="text-slate-400 mb-2 animate-bounce" />
                        <span className="text-xs font-bold text-indigo-500">Upload Image File</span>
                        <span className="text-[10px] text-slate-400 mt-1">PNG, JPG, or WEBP up to 5MB</span>
                        <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                      </label>
                    )}
                  </div>
                </div>

                {/* Form fields & trigger */}
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Recipient Name</label>
                    <input
                      type="text"
                      value={formData.recipient}
                      onChange={(e) => setFormData(prev => ({ ...prev, recipient: e.target.value }))}
                      placeholder="e.g. Grandma"
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-gray-250 dark:border-gray-700 rounded-lg p-2.5 text-xs outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Describe the Memory</label>
                    <textarea
                      value={memoryContext}
                      onChange={(e) => setMemoryContext(e.target.value)}
                      placeholder="Grandma blowing candles on her 80th birthday surrounded by kids..."
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-gray-250 dark:border-gray-700 rounded-lg p-2.5 text-xs outline-none"
                      rows={3}
                    />
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleAnalyzeMemory}
                disabled={!memoryImage || isAnalyzingImage}
                className="w-full py-3 bg-pink-600 hover:bg-pink-700 disabled:opacity-50 text-white font-bold rounded-lg shadow-md hover:shadow-lg flex items-center justify-center gap-2 transition-all text-sm"
              >
                {isAnalyzingImage ? <RefreshCw className="animate-spin" size={16} /> : <Sparkles size={16} />}
                {isAnalyzingImage ? 'Analyzing Memory...' : 'Analyze & Generate Memory Card'}
              </button>

              {/* Gift Suggestions list */}
              {giftRecs.length > 0 && (
                <div className="space-y-4 pt-6 border-t border-gray-100 dark:border-gray-800">
                  <h4 className="text-sm font-bold text-pink-600 uppercase tracking-wider flex items-center gap-1.5">
                    <Gift size={16} />
                    AI Gift Recommendations
                  </h4>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {giftRecs.map((gift) => (
                      <div key={gift.id} className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-gray-100 dark:border-gray-800 flex flex-col justify-between space-y-2">
                        <div className="space-y-1">
                          <div className="flex justify-between items-start gap-1">
                            <h5 className="font-extrabold text-xs text-slate-800 dark:text-slate-100">{gift.title}</h5>
                            <span className="px-1.5 py-0.5 bg-pink-50 dark:bg-pink-950/50 text-pink-500 rounded text-[9px] font-black">{gift.priceEstimate}</span>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">{gift.description}</p>
                        </div>
                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Category: {gift.category}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: SAVED CARDS */}
          {activeTab === 'saved' && (
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm space-y-6">
              <div>
                <h3 className="text-lg font-bold">Your Saved Cards</h3>
                <p className="text-xs text-slate-400 font-medium mt-1">
                  Manage and retrieve your drafted card layouts.
                </p>
              </div>

              {savedCards.filter(c => c.isDraft).length === 0 ? (
                <div className="text-center py-12 border border-dashed border-gray-200 dark:border-gray-800 rounded-xl">
                  <FolderHeart className="mx-auto text-slate-350 dark:text-slate-650 mb-3 opacity-60" size={36} />
                  <p className="text-sm font-semibold text-slate-500">No saved drafts found</p>
                  <p className="text-xs text-slate-400 mt-1">Generate a card and click "Save Draft" under the preview.</p>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-4">
                  {savedCards.filter(c => c.isDraft).map((card) => (
                    <div 
                      key={card.id} 
                      className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col justify-between hover:border-indigo-400 dark:hover:border-indigo-500 transition-all group relative"
                    >
                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between items-start">
                          <span className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 text-[10px] font-black rounded uppercase tracking-wider">
                            {card.formData.occasion}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium">
                            {new Date(card.updatedAt).toLocaleDateString()}
                          </span>
                        </div>
                        <h4 className="font-extrabold text-xs text-slate-800 dark:text-slate-200">
                          For: {card.formData.recipient || 'Someone'} {card.formData.sender ? `(From: ${card.formData.sender})` : ''}
                        </h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed whitespace-pre-line font-serif">
                          {card.message}
                        </p>
                      </div>

                      <div className="flex gap-2 pt-3 border-t border-gray-100 dark:border-gray-800">
                        <button
                          onClick={() => handleLoadSavedCard(card)}
                          className="flex-1 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold rounded transition-colors"
                        >
                          Load in Studio
                        </button>
                        <button
                          onClick={() => handleDeleteSavedCard(card.id)}
                          className="px-2.5 py-1.5 border border-red-200 dark:border-red-950 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded transition-colors"
                          title="Delete Card"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: FAVORITES */}
          {activeTab === 'favorites' && (
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm space-y-6">
              <div>
                <h3 className="text-lg font-bold">Favorite Greetings</h3>
                <p className="text-xs text-slate-400 font-medium mt-1">
                  Access your favorited layouts and text compositions.
                </p>
              </div>

              {savedCards.filter(c => c.isFavorite).length === 0 ? (
                <div className="text-center py-12 border border-dashed border-gray-200 dark:border-gray-800 rounded-xl">
                  <Star className="mx-auto text-slate-350 dark:text-slate-650 mb-3 opacity-60" size={36} />
                  <p className="text-sm font-semibold text-slate-500">No favorites found</p>
                  <p className="text-xs text-slate-400 mt-1">Mark a card as favorite by clicking the heart button under the preview.</p>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-4">
                  {savedCards.filter(c => c.isFavorite).map((card) => (
                    <div 
                      key={card.id} 
                      className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col justify-between hover:border-pink-400 dark:hover:border-pink-500 transition-all group relative"
                    >
                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between items-start">
                          <span className="px-2 py-0.5 bg-pink-50 dark:bg-pink-950/40 text-pink-600 dark:text-pink-400 text-[10px] font-black rounded uppercase tracking-wider">
                            {card.formData.occasion}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium">
                            {new Date(card.updatedAt).toLocaleDateString()}
                          </span>
                        </div>
                        <h4 className="font-extrabold text-xs text-slate-800 dark:text-slate-200">
                          For: {card.formData.recipient || 'Someone'} {card.formData.sender ? `(From: ${card.formData.sender})` : ''}
                        </h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed whitespace-pre-line font-serif">
                          {card.message}
                        </p>
                      </div>

                      <div className="flex gap-2 pt-3 border-t border-gray-100 dark:border-gray-800">
                        <button
                          onClick={() => handleLoadSavedCard(card)}
                          className="flex-1 py-1.5 bg-pink-600 hover:bg-pink-700 text-white text-[11px] font-bold rounded transition-colors"
                        >
                          Load in Studio
                        </button>
                        <button
                          onClick={() => handleDeleteSavedCard(card.id)}
                          className="px-2.5 py-1.5 border border-red-200 dark:border-red-950 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded transition-colors"
                          title="Delete Card"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* AI Helper Utilities (Translate/Rewrite) - Displays only if message is present */}
          {activeMessage && (
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm space-y-6">
              <h3 className="text-lg font-bold">Smart AI Enhancements</h3>
              
              <div className="grid sm:grid-cols-2 gap-6">
                {/* AI Translation block */}
                <div className="space-y-3">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Translate Card Language</label>
                  <div className="flex gap-2">
                    <select
                      value={translateLang}
                      onChange={(e) => setTranslateLang(e.target.value)}
                      className="flex-1 bg-slate-50 dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-lg p-2 text-xs font-semibold outline-none"
                    >
                      {LANGUAGES.map(lang => <option key={lang.code} value={lang.code}>{lang.name}</option>)}
                    </select>
                    <button
                      onClick={handleTranslate}
                      disabled={isGenerating}
                      className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-colors"
                    >
                      Translate
                    </button>
                  </div>
                </div>

                {/* AI instruction rewrite block */}
                <div className="space-y-3">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Rewrite with Instructions</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={rewritePrompt}
                      onChange={(e) => setRewritePrompt(e.target.value)}
                      placeholder="e.g. Make it funnier, shorten it..."
                      className="flex-1 bg-slate-50 dark:bg-slate-800 border border-gray-250 dark:border-gray-750 rounded-lg p-2 text-xs outline-none"
                    />
                    <button
                      onClick={handleRewrite}
                      disabled={!rewritePrompt.trim() || isGenerating}
                      className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-colors disabled:opacity-50"
                    >
                      Rewrite
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Live Card Canvas & Actions (Span 5) */}
        <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
          
          {/* Card Control bar: Desktop/Mobile toggler, Front/Back flipper */}
          <div className="flex justify-between items-center bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-800 p-3 rounded-xl shadow-sm">
            <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800 p-0.5 rounded-lg border border-gray-250/20">
              <button
                onClick={() => setPreviewSize('desktop')}
                className={`p-1.5 rounded transition-colors ${previewSize === 'desktop' ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-500' : 'text-slate-400'}`}
                title="Desktop Layout"
              >
                <Monitor size={15} />
              </button>
              <button
                onClick={() => setPreviewSize('mobile')}
                className={`p-1.5 rounded transition-colors ${previewSize === 'mobile' ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-500' : 'text-slate-400'}`}
                title="Mobile View"
              >
                <Smartphone size={15} />
              </button>
            </div>

            <button
              onClick={() => setCardSide(prev => prev === 'front' ? 'back' : 'front')}
              className="px-3 py-1.5 border border-indigo-200 text-indigo-600 dark:text-indigo-400 text-xs font-bold rounded-lg hover:bg-indigo-50/50 transition-colors"
            >
              Flip Card: {cardSide === 'front' ? 'Back View' : 'Front View'}
            </button>
          </div>

          {/* 3D Animated Flip Card Container */}
          <div 
            className="flex justify-center" 
            style={{ 
              perspective: '1000px',
              width: '100%'
            }}
          >
            <div 
              className="transition-transform duration-500"
              style={{
                transformStyle: 'preserve-3d',
                transform: cardSide === 'back' ? 'rotateY(180deg)' : 'rotateY(0deg)',
                width: '100%',
                maxWidth: previewSize === 'mobile' ? '320px' : '400px',
                aspectRatio: '5/7',
                position: 'relative'
              }}
            >
              {/* CARD FRONT SIDE */}
              <div 
                id="greeting-card-canvas"
                className="w-full h-full rounded-2xl p-6 md:p-8 flex flex-col justify-between border shadow-2xl relative overflow-hidden"
                style={{
                  background: styleData.backgroundColor,
                  color: styleData.textColor,
                  fontFamily: styleData.fontFamily,
                  borderColor: styleData.accentColor + '50',
                  backfaceVisibility: 'hidden',
                  position: 'absolute',
                  top: 0,
                  left: 0
                }}
              >
                {/* Logo and Stickers */}
                <div className="flex justify-between items-start z-10">
                  {customLogo ? (
                    <img src={customLogo} alt="Brand" className="h-8 object-contain" />
                  ) : <div className="w-1" />}
                  
                  <div className="flex gap-1">
                    {styleData.stickers.map((sticker, i) => (
                      <span key={i} className="text-xl animate-bounce" style={{ animationDelay: `${i * 150}ms` }}>{sticker}</span>
                    ))}
                  </div>
                </div>

                {/* Card Header title */}
                <div className="text-center z-10 my-2">
                  <h3 
                    className="font-bold uppercase tracking-wider" 
                    style={{ 
                      color: styleData.accentColor,
                      fontFamily: styleData.headerFontFamily,
                      fontSize: '1.2rem'
                    }}
                  >
                    {formData.occasion === 'Custom Occasion' ? formData.customOccasionText : formData.occasion}
                  </h3>
                  {/* Heart Divider */}
                  <div className="flex items-center justify-center gap-2.5 mt-2">
                    <span className="w-10 h-[1px]" style={{ backgroundColor: styleData.accentColor, opacity: 0.5 }} />
                    <span className="text-xs" style={{ color: styleData.accentColor }}>♥</span>
                    <span className="w-10 h-[1px]" style={{ backgroundColor: styleData.accentColor, opacity: 0.5 }} />
                  </div>
                </div>

                {/* Uploaded Memory Photo */}
                {memoryImage && (
                  <div className="z-10 my-2 px-4 flex justify-center">
                    <div className="relative w-full max-h-[140px] rounded-lg overflow-hidden border border-black/5 dark:border-white/10 shadow-sm bg-black/5">
                      <img 
                        src={memoryImage} 
                        alt="Memory preview" 
                        className="w-full h-[140px] object-cover" 
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setMemoryImage(null);
                        }}
                        className="absolute top-1.5 right-1.5 p-1 bg-black/60 hover:bg-black/80 text-white rounded-full transition-all"
                        title="Remove Photo"
                      >
                        <X size={10} />
                      </button>
                    </div>
                  </div>
                )}

                {/* Card Message Body */}
                <div className="flex-1 flex flex-col justify-center my-4 z-10 overflow-y-auto">
                  {isGenerating ? (
                    <div className="space-y-3 animate-pulse">
                      <div className="h-4 bg-gray-200/50 dark:bg-slate-700/50 rounded w-3/4" />
                      <div className="h-4 bg-gray-200/50 dark:bg-slate-700/50 rounded" />
                      <div className="h-4 bg-gray-200/50 dark:bg-slate-700/50 rounded w-5/6" />
                      <div className="h-4 bg-gray-200/50 dark:bg-slate-700/50 rounded w-2/3" />
                    </div>
                  ) : isEditing ? (
                    <div className="space-y-2">
                      <textarea
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="w-full bg-white/95 text-slate-800 text-sm border border-indigo-400 rounded p-2 focus:outline-none resize-none font-sans"
                        rows={6}
                      />
                      <div className="flex justify-end gap-1.5">
                        <button 
                          onClick={() => {
                            setActiveMessage(editText);
                            setIsEditing(false);
                            db.logActivity('generate', 'Manually edited greeting message');
                          }}
                          className="px-2.5 py-1 bg-indigo-600 text-white rounded text-[10px] font-black"
                        >
                          Save
                        </button>
                        <button 
                          onClick={() => setIsEditing(false)}
                          className="px-2.5 py-1 bg-slate-200 text-slate-700 rounded text-[10px] font-black"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div 
                      onClick={() => {
                        setEditText(activeMessage);
                        setIsEditing(true);
                      }}
                      className="cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 p-2 rounded transition-colors group relative"
                      style={{ textAlign: styleData.textAlignment }}
                    >
                      <p className="whitespace-pre-line text-sm leading-relaxed font-serif">
                        {activeMessage || 'Generate a greeting using the Copywriter panel on the left.'}
                      </p>
                      <span className="absolute bottom-1 right-1 opacity-0 group-hover:opacity-100 flex items-center gap-0.5 text-[9px] bg-slate-800/80 text-white px-1 py-0.5 rounded transition-all">
                        <Edit2 size={8} /> Click to Edit
                      </span>
                    </div>
                  )}
                </div>

                {/* Card Signature Footer */}
                {formData.sender && !isGenerating && !isEditing && (
                  <div 
                    className="text-right z-10 mt-2 font-medium" 
                    style={{ 
                      fontFamily: styleData.cursiveFontFamily,
                      fontSize: '1.6rem',
                      color: styleData.accentColor 
                    }}
                  >
                    — {formData.sender}
                  </div>
                )}

                {/* Visual Theme Decor overlays */}
                {currentThemeId === 'sakura' && (
                  <>
                    <div className="absolute inset-0 border-[6px] border-pink-100/30 pointer-events-none rounded-2xl" />
                    <svg className="absolute top-0 right-0 w-28 h-28 text-pink-300/30 pointer-events-none" viewBox="0 0 100 100" fill="currentColor">
                      <path d="M80,20 C85,15 95,15 95,25 C95,35 85,35 80,30 C75,35 65,35 65,25 C65,15 75,15 80,20 Z" />
                      <path d="M60,40 C63,36 70,36 70,42 C70,48 63,48 60,45 C57,48 50,48 50,42 C50,36 57,36 60,40 Z" opacity="0.8" />
                      <path d="M100,0 Q70,20 50,50 T10,80" fill="none" stroke="#5f2d37" strokeWidth="1" opacity="0.2" />
                    </svg>
                    <svg className="absolute bottom-0 left-0 w-28 h-28 text-pink-300/30 pointer-events-none rotate-180" viewBox="0 0 100 100" fill="currentColor">
                      <path d="M80,20 C85,15 95,15 95,25 C95,35 85,35 80,30 C75,35 65,35 65,25 C65,15 75,15 80,20 Z" />
                      <path d="M60,40 C63,36 70,36 70,42 C70,48 63,48 60,45 C57,48 50,48 50,42 C50,36 57,36 60,40 Z" opacity="0.8" />
                      <path d="M100,0 Q70,20 50,50 T10,80" fill="none" stroke="#5f2d37" strokeWidth="1" opacity="0.2" />
                    </svg>
                  </>
                )}
                {currentThemeId === 'midnight' && (
                  <>
                    <div className="absolute inset-4 border border-amber-500/10 pointer-events-none rounded-xl" />
                    <svg className="absolute top-2 right-2 w-10 h-10 text-amber-500/20 pointer-events-none" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M0,100 L100,100 L100,0 M15,100 L100,100 L100,15 M30,100 L100,100 L100,30" />
                    </svg>
                    <svg className="absolute bottom-2 left-2 w-10 h-10 text-amber-500/20 pointer-events-none rotate-180" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M0,100 L100,100 L100,0 M15,100 L100,100 L100,15 M30,100 L100,100 L100,30" />
                    </svg>
                  </>
                )}
                {currentThemeId === 'gold' && (
                  <>
                    <div className="absolute inset-3.5 border border-amber-700/10 pointer-events-none rounded-xl" />
                    <div className="absolute inset-5 border border-amber-700/5 pointer-events-none rounded-lg" />
                  </>
                )}
                {currentThemeId === 'teal' && (
                  <>
                    <svg className="absolute top-0 right-0 w-24 h-24 text-teal-600/5 pointer-events-none" viewBox="0 0 100 100" fill="currentColor">
                      <circle cx="100" cy="0" r="80" />
                      <circle cx="100" cy="0" r="50" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.3" />
                    </svg>
                    <svg className="absolute bottom-0 left-0 w-24 h-24 text-teal-600/5 pointer-events-none rotate-180" viewBox="0 0 100 100" fill="currentColor">
                      <circle cx="100" cy="0" r="80" />
                      <circle cx="100" cy="0" r="50" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.3" />
                    </svg>
                  </>
                )}
                {currentThemeId === 'slate' && (
                  <>
                    <div className="absolute inset-4 border border-slate-300/40 pointer-events-none rounded-xl" />
                    <div className="absolute top-4 left-4 w-4 h-4 border-t border-l border-indigo-500/45 pointer-events-none" />
                    <div className="absolute top-4 right-4 w-4 h-4 border-t border-r border-indigo-500/45 pointer-events-none" />
                    <div className="absolute bottom-4 left-4 w-4 h-4 border-b border-l border-indigo-500/45 pointer-events-none" />
                    <div className="absolute bottom-4 right-4 w-4 h-4 border-b border-r border-indigo-500/45 pointer-events-none" />
                  </>
                )}
                {currentThemeId === 'lavender' && (
                  <>
                    <svg className="absolute top-0 right-0 w-24 h-24 text-violet-400/20 pointer-events-none" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M100,0 Q60,30 40,70" />
                      <path d="M80,15 C70,15 65,25 70,30 C75,35 85,25 80,15 Z" fill="currentColor" />
                      <path d="M60,35 C50,35 45,45 50,50 C55,55 65,45 60,35 Z" fill="currentColor" />
                    </svg>
                    <svg className="absolute bottom-0 left-0 w-24 h-24 text-violet-400/20 pointer-events-none rotate-180" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M100,0 Q60,30 40,70" />
                      <path d="M80,15 C70,15 65,25 70,30 C75,35 85,25 80,15 Z" fill="currentColor" />
                      <path d="M60,35 C50,35 45,45 50,50 C55,55 65,45 60,35 Z" fill="currentColor" />
                    </svg>
                  </>
                )}
                {currentThemeId === 'ocean' && (
                  <svg className="absolute bottom-0 left-0 right-0 h-16 w-full text-sky-400/10 pointer-events-none" viewBox="0 0 1440 320" fill="currentColor" preserveAspectRatio="none">
                    <path d="M0,160 L48,176C96,192,192,224,288,213.3C384,203,480,149,576,149.3C672,149,768,203,864,229.3C960,256,1056,256,1152,224C1248,192,1344,128,1392,96L1440,64L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z" />
                  </svg>
                )}
                {currentThemeId === 'forest' && (
                  <>
                    <div className="absolute inset-4 border border-emerald-500/10 pointer-events-none rounded-xl" />
                    <svg className="absolute top-2 right-2 w-8 h-8 text-emerald-500/20 pointer-events-none" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M100,0 L0,0 M100,0 L100,100 M80,20 L20,20 M80,20 L80,80" />
                    </svg>
                    <svg className="absolute bottom-2 left-2 w-8 h-8 text-emerald-500/20 pointer-events-none rotate-180" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M100,0 L0,0 M100,0 L100,100 M80,20 L20,20 M80,20 L80,80" />
                    </svg>
                  </>
                )}
                {currentThemeId === 'purple' && (
                  <>
                    <div className="absolute inset-5 border border-purple-500/10 pointer-events-none rounded-lg" />
                    <svg className="absolute top-3 right-3 w-6 h-6 text-purple-400/30 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                      <path d="M12,0 L14,8 L22,12 L14,16 L12,24 L10,16 L2,12 L10,8 Z" fill="currentColor" />
                    </svg>
                    <svg className="absolute bottom-3 left-3 w-6 h-6 text-purple-400/30 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                      <path d="M12,0 L14,8 L22,12 L14,16 L12,24 L10,16 L2,12 L10,8 Z" fill="currentColor" />
                    </svg>
                  </>
                )}
                {currentThemeId === 'sunset' && (
                  <svg className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-24 text-orange-400/10 pointer-events-none" viewBox="0 0 100 50" fill="none" stroke="currentColor" strokeWidth="1">
                    <circle cx="50" cy="0" r="45" />
                    <circle cx="50" cy="0" r="35" />
                    <circle cx="50" cy="0" r="25" />
                  </svg>
                )}
                {currentThemeId === 'blush' && (
                  <>
                    <svg className="absolute top-0 right-0 w-24 h-24 text-rose-400/10 pointer-events-none" viewBox="0 0 100 100" fill="currentColor">
                      <path d="M100,0 C90,10 90,20 100,30 C90,40 90,50 100,60 C80,50 70,30 100,0 Z" />
                    </svg>
                    <svg className="absolute bottom-0 left-0 w-24 h-24 text-rose-400/10 pointer-events-none rotate-180" viewBox="0 0 100 100" fill="currentColor">
                      <path d="M100,0 C90,10 90,20 100,30 C90,40 90,50 100,60 C80,50 70,30 100,0 Z" />
                    </svg>
                  </>
                )}
                {currentThemeId === 'cream' && (
                  <>
                    <div className="absolute inset-3.5 border border-stone-400/15 pointer-events-none" />
                    <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-stone-400/20 pointer-events-none" />
                    <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-stone-400/20 pointer-events-none" />
                    <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-stone-400/20 pointer-events-none" />
                    <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-stone-400/20 pointer-events-none" />
                  </>
                )}
              </div>

              {/* CARD BACK SIDE */}
              <div 
                className="w-full h-full rounded-2xl p-8 flex flex-col justify-center items-center border shadow-2xl overflow-hidden"
                style={{
                  background: styleData.backgroundColor,
                  color: styleData.textColor,
                  fontFamily: styleData.fontFamily,
                  borderColor: styleData.accentColor + '50',
                  transform: 'rotateY(180deg)',
                  backfaceVisibility: 'hidden',
                  position: 'absolute',
                  top: 0,
                  left: 0
                }}
              >
                {/* Elegant back stamps */}
                <div className="text-center space-y-3 z-10">
                  <div 
                    className="w-10 h-10 mx-auto rounded-full border border-gray-300 dark:border-gray-700 flex items-center justify-center"
                    style={{ color: styleData.accentColor }}
                  >
                    <Sparkles size={16} />
                  </div>
                  <p className="text-xs font-semibold uppercase tracking-wider">{formData.occasion} Edition</p>
                  <p className="text-[10px] text-slate-450 font-medium max-w-[200px] leading-relaxed">
                    {backMessage}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Save & Favorite actions row */}
          {activeMessage && (
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleSaveCard}
                className="flex items-center justify-center gap-2 py-3 px-4 bg-indigo-650 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all text-xs"
              >
                <FolderHeart size={15} />
                Save Draft
              </button>
              <button
                onClick={handleFavoriteCard}
                className={`flex items-center justify-center gap-2 py-3 px-4 font-bold rounded-xl shadow-md hover:shadow-lg transition-all text-xs ${
                  savedCards.find(c => c.id === currentCardId)?.isFavorite
                    ? 'bg-pink-600 hover:bg-pink-700 text-white'
                    : 'bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800 border border-pink-200 dark:border-pink-950 text-pink-600 dark:text-pink-400'
                }`}
              >
                <Heart 
                  size={15} 
                  fill={savedCards.find(c => c.id === currentCardId)?.isFavorite ? 'currentColor' : 'none'} 
                />
                {savedCards.find(c => c.id === currentCardId)?.isFavorite ? 'Favorited' : 'Favorite'}
              </button>
            </div>
          )}

          {/* Export & share buttons */}
          {activeMessage && (
            <div className="p-5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">Export Options</h4>
              
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleShare}
                  className="flex items-center justify-center gap-1.5 py-2 border border-gray-200 dark:border-gray-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold rounded-lg transition-colors"
                >
                  <Share2 size={14} />
                  Share Card
                </button>
                <button
                  onClick={handleDownloadPDF}
                  className="flex items-center justify-center gap-1.5 py-2 border border-gray-200 dark:border-gray-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold rounded-lg transition-colors"
                >
                  <FileText size={14} />
                  Download PDF
                </button>
              </div>

              <button
                onClick={() => window.print()}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-colors"
              >
                <Printer size={14} />
                Open Print Dialogue
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
export default Studio;
