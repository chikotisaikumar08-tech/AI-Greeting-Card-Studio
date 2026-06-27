-- Database schema for AI Greeting Card Studio

-- Create Profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    mobile TEXT,
    subscription TEXT DEFAULT 'free' CHECK (subscription IN ('free', 'premium', 'enterprise')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access for profiles"
    ON public.profiles FOR SELECT
    USING (true);

CREATE POLICY "Allow public insert/update access for profiles"
    ON public.profiles FOR ALL
    USING (true);

-- Create Cards table
CREATE TABLE IF NOT EXISTS public.cards (
    id TEXT PRIMARY KEY,
    user_email TEXT REFERENCES public.profiles(email) ON DELETE CASCADE,
    message TEXT NOT NULL,
    suggestions JSONB DEFAULT '[]'::JSONB,
    form_data JSONB NOT NULL,
    style JSONB NOT NULL,
    is_favorite BOOLEAN DEFAULT false,
    is_draft BOOLEAN DEFAULT false,
    shareable_link TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for Cards
ALTER TABLE public.cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access for cards"
    ON public.cards FOR SELECT
    USING (true);

CREATE POLICY "Allow public write access for cards"
    ON public.cards FOR ALL
    USING (true);

-- Create Activity Logs table
CREATE TABLE IF NOT EXISTS public.activity_logs (
    id TEXT PRIMARY KEY,
    user_email TEXT REFERENCES public.profiles(email) ON DELETE CASCADE,
    type TEXT NOT NULL,
    description TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for Activity Logs
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access for activity logs"
    ON public.activity_logs FOR SELECT
    USING (true);

CREATE POLICY "Allow public write access for activity logs"
    ON public.activity_logs FOR ALL
    USING (true);
