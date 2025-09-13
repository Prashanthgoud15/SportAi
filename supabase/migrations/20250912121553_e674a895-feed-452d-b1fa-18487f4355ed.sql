-- Create enum types for roles and sports
CREATE TYPE public.user_role AS ENUM ('athlete', 'coach', 'admin');
CREATE TYPE public.sport_type AS ENUM ('cricket', 'football', 'basketball', 'athletics', 'swimming', 'badminton', 'tennis', 'volleyball', 'hockey', 'other');
CREATE TYPE public.gender AS ENUM ('male', 'female', 'other');

-- Create profiles table for extended user information
CREATE TABLE public.profiles (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    role public.user_role NOT NULL DEFAULT 'athlete',
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    date_of_birth DATE,
    gender public.gender,
    state TEXT,
    district TEXT,
    village_city TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create athletes table for athlete-specific data
CREATE TABLE public.athletes (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    primary_sport public.sport_type NOT NULL,
    secondary_sports public.sport_type[],
    height_cm INTEGER,
    weight_kg DECIMAL(5,2),
    experience_years INTEGER DEFAULT 0,
    preferred_position TEXT,
    achievements TEXT[],
    medical_conditions TEXT[],
    emergency_contact_name TEXT,
    emergency_contact_phone TEXT,
    coach_id UUID REFERENCES public.profiles(user_id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create coaches table for coach-specific data
CREATE TABLE public.coaches (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    specialization public.sport_type[] NOT NULL,
    certifications TEXT[],
    experience_years INTEGER DEFAULT 0,
    coaching_philosophy TEXT,
    languages TEXT[] DEFAULT ARRAY['English'],
    max_athletes INTEGER DEFAULT 20,
    is_verified BOOLEAN DEFAULT false,
    rating DECIMAL(3,2) DEFAULT 0.00,
    total_reviews INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create videos table for video uploads
CREATE TABLE public.videos (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    athlete_id UUID NOT NULL REFERENCES public.athletes(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    video_url TEXT NOT NULL,
    video_type TEXT NOT NULL, -- 'sprint', 'strength', 'technique', 'endurance'
    sport_type public.sport_type NOT NULL,
    duration_seconds INTEGER,
    file_size_mb DECIMAL(10,2),
    upload_status TEXT DEFAULT 'uploaded',
    is_analyzed BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create assessments table for AI analysis results
CREATE TABLE public.assessments (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    video_id UUID NOT NULL REFERENCES public.videos(id) ON DELETE CASCADE,
    athlete_id UUID NOT NULL REFERENCES public.athletes(id) ON DELETE CASCADE,
    overall_score DECIMAL(5,2) NOT NULL,
    technique_score DECIMAL(5,2),
    speed_score DECIMAL(5,2),
    power_score DECIMAL(5,2),
    endurance_score DECIMAL(5,2),
    flexibility_score DECIMAL(5,2),
    strengths TEXT[],
    weaknesses TEXT[],
    recommendations TEXT[],
    detailed_feedback TEXT,
    ai_confidence DECIMAL(5,2),
    analysis_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create training_plans table for AI-generated training plans
CREATE TABLE public.training_plans (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    athlete_id UUID NOT NULL REFERENCES public.athletes(id) ON DELETE CASCADE,
    coach_id UUID REFERENCES public.coaches(user_id),
    title TEXT NOT NULL,
    description TEXT,
    sport_type public.sport_type NOT NULL,
    duration_weeks INTEGER DEFAULT 8,
    difficulty_level INTEGER CHECK (difficulty_level >= 1 AND difficulty_level <= 5),
    goals TEXT[],
    plan_data JSONB NOT NULL, -- Contains structured training plan
    is_active BOOLEAN DEFAULT true,
    progress_percentage DECIMAL(5,2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create goals table for athlete goals and progress
CREATE TABLE public.goals (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    athlete_id UUID NOT NULL REFERENCES public.athletes(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    target_value DECIMAL(10,2),
    current_value DECIMAL(10,2) DEFAULT 0,
    unit TEXT, -- 'seconds', 'meters', 'kg', 'percentage', etc.
    target_date DATE,
    is_completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMP WITH TIME ZONE,
    category TEXT, -- 'performance', 'fitness', 'technique', 'weight'
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create messages table for coach-athlete communication
CREATE TABLE public.messages (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    recipient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    athlete_id UUID REFERENCES public.athletes(id) ON DELETE CASCADE,
    subject TEXT,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    message_type TEXT DEFAULT 'general', -- 'general', 'feedback', 'plan_update', 'assessment'
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.athletes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coaches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles table
CREATE POLICY "Users can view their own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for athletes table
CREATE POLICY "Athletes can view their own data" ON public.athletes
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Athletes can update their own data" ON public.athletes
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Athletes can insert their own data" ON public.athletes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Coaches can view their assigned athletes" ON public.athletes
    FOR SELECT USING (
        coach_id = auth.uid() OR 
        EXISTS (SELECT 1 FROM public.coaches WHERE user_id = auth.uid())
    );

-- Create RLS policies for coaches table
CREATE POLICY "Coaches can view their own data" ON public.coaches
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Coaches can update their own data" ON public.coaches
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Coaches can insert their own data" ON public.coaches
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for videos table
CREATE POLICY "Athletes can manage their own videos" ON public.videos
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.athletes WHERE id = videos.athlete_id AND user_id = auth.uid())
    );

CREATE POLICY "Coaches can view videos of their athletes" ON public.videos
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.athletes 
            WHERE id = videos.athlete_id AND coach_id = auth.uid()
        )
    );

-- Create RLS policies for assessments table
CREATE POLICY "Athletes can view their own assessments" ON public.assessments
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.athletes WHERE id = assessments.athlete_id AND user_id = auth.uid())
    );

CREATE POLICY "Coaches can view assessments of their athletes" ON public.assessments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.athletes 
            WHERE id = assessments.athlete_id AND coach_id = auth.uid()
        )
    );

-- Create RLS policies for training_plans table
CREATE POLICY "Athletes can view their training plans" ON public.training_plans
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.athletes WHERE id = training_plans.athlete_id AND user_id = auth.uid())
    );

CREATE POLICY "Coaches can manage training plans for their athletes" ON public.training_plans
    FOR ALL USING (
        coach_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.athletes 
            WHERE id = training_plans.athlete_id AND coach_id = auth.uid()
        )
    );

-- Create RLS policies for goals table
CREATE POLICY "Athletes can manage their own goals" ON public.goals
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.athletes WHERE id = goals.athlete_id AND user_id = auth.uid())
    );

CREATE POLICY "Coaches can view goals of their athletes" ON public.goals
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.athletes 
            WHERE id = goals.athlete_id AND coach_id = auth.uid()
        )
    );

-- Create RLS policies for messages table
CREATE POLICY "Users can view their messages" ON public.messages
    FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

CREATE POLICY "Users can send messages" ON public.messages
    FOR INSERT WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update their received messages" ON public.messages
    FOR UPDATE USING (auth.uid() = recipient_id);

-- Create indexes for better performance
CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_athletes_user_id ON public.athletes(user_id);
CREATE INDEX idx_athletes_coach_id ON public.athletes(coach_id);
CREATE INDEX idx_athletes_sport ON public.athletes(primary_sport);
CREATE INDEX idx_coaches_user_id ON public.coaches(user_id);
CREATE INDEX idx_videos_athlete_id ON public.videos(athlete_id);
CREATE INDEX idx_assessments_athlete_id ON public.assessments(athlete_id);
CREATE INDEX idx_assessments_video_id ON public.assessments(video_id);
CREATE INDEX idx_training_plans_athlete_id ON public.training_plans(athlete_id);
CREATE INDEX idx_goals_athlete_id ON public.goals(athlete_id);
CREATE INDEX idx_messages_sender_recipient ON public.messages(sender_id, recipient_id);

-- Create storage bucket for video uploads
INSERT INTO storage.buckets (id, name, public) VALUES ('videos', 'videos', false);

-- Create storage policies for videos bucket
CREATE POLICY "Athletes can upload their own videos" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'videos' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Athletes can view their own videos" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'videos' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Coaches can view videos of their athletes" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'videos' AND
        EXISTS (
            SELECT 1 FROM public.athletes 
            WHERE user_id::text = (storage.foldername(name))[1] 
            AND coach_id = auth.uid()
        )
    );

-- Create function to automatically create profile after user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (user_id, full_name, email, role)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
        NEW.email,
        COALESCE((NEW.raw_user_meta_data->>'role')::public.user_role, 'athlete')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for automatic profile creation
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at columns
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

CREATE TRIGGER update_athletes_updated_at BEFORE UPDATE ON public.athletes
    FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

CREATE TRIGGER update_coaches_updated_at BEFORE UPDATE ON public.coaches
    FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

CREATE TRIGGER update_videos_updated_at BEFORE UPDATE ON public.videos
    FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

CREATE TRIGGER update_training_plans_updated_at BEFORE UPDATE ON public.training_plans
    FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

CREATE TRIGGER update_goals_updated_at BEFORE UPDATE ON public.goals
    FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();