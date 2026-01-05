-- ==============================================
-- Mini App Generator Database Schema
-- Supabase PostgreSQL
-- ==============================================

-- 1. 사용자 프로필 테이블 (Supabase Auth 확장)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    nickname VARCHAR(50),
    apps_created INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS 정책
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

-- 사용자 생성 시 자동으로 프로필 생성하는 함수
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, nickname)
    VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'nickname');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 트리거
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================
-- 2. 생성된 앱 테이블
-- ==============================================
CREATE TABLE IF NOT EXISTS public.generated_apps (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,

    -- 앱 정보
    title VARCHAR(100) NOT NULL,
    description TEXT,
    app_type VARCHAR(50) DEFAULT 'custom',

    -- 생성된 코드
    html_code TEXT NOT NULL,
    css_code TEXT,
    js_code TEXT,

    -- 메타데이터
    original_prompt TEXT,
    quality_score INTEGER DEFAULT 0,
    current_version VARCHAR(20) DEFAULT '1.0.0',

    -- 타임스탬프
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_apps_user_id ON public.generated_apps(user_id);
CREATE INDEX IF NOT EXISTS idx_apps_created_at ON public.generated_apps(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_apps_type ON public.generated_apps(app_type);

-- RLS 정책
ALTER TABLE public.generated_apps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own apps" ON public.generated_apps
    FOR ALL USING (auth.uid() = user_id);

-- ==============================================
-- 3. 대화 세션 테이블
-- ==============================================
CREATE TABLE IF NOT EXISTS public.chat_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,

    -- 세션 상태
    stage VARCHAR(20) DEFAULT 'initial',
    requirements JSONB DEFAULT '{}',
    conversation_history JSONB DEFAULT '[]',

    -- 관련 앱 (생성된 경우)
    related_app_id UUID REFERENCES public.generated_apps(id) ON DELETE SET NULL,

    -- 타임스탬프
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '24 hours')
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_sessions_user ON public.chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON public.chat_sessions(expires_at);

-- RLS 정책
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own sessions" ON public.chat_sessions
    FOR ALL USING (auth.uid() = user_id);

-- ==============================================
-- 4. 버전 히스토리 테이블 (Phase 3)
-- ==============================================
CREATE TABLE IF NOT EXISTS public.app_versions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    app_id UUID REFERENCES public.generated_apps(id) ON DELETE CASCADE NOT NULL,

    version VARCHAR(20) NOT NULL,
    html_code TEXT NOT NULL,
    css_code TEXT,
    js_code TEXT,

    modification_prompt TEXT,
    change_summary TEXT,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    CONSTRAINT unique_app_version UNIQUE (app_id, version)
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_versions_app_id ON public.app_versions(app_id);

-- RLS 정책
ALTER TABLE public.app_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own app versions" ON public.app_versions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.generated_apps
            WHERE id = app_versions.app_id AND user_id = auth.uid()
        )
    );

-- ==============================================
-- 5. 자동 업데이트 트리거
-- ==============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_updated_at_users ON public.users;
CREATE TRIGGER set_updated_at_users
    BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_apps ON public.generated_apps;
CREATE TRIGGER set_updated_at_apps
    BEFORE UPDATE ON public.generated_apps
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_sessions ON public.chat_sessions;
CREATE TRIGGER set_updated_at_sessions
    BEFORE UPDATE ON public.chat_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ==============================================
-- 6. 앱 생성 카운트 증가 함수
-- ==============================================
CREATE OR REPLACE FUNCTION increment_user_apps()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.users
    SET apps_created = apps_created + 1
    WHERE id = NEW.user_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_app_created ON public.generated_apps;
CREATE TRIGGER on_app_created
    AFTER INSERT ON public.generated_apps
    FOR EACH ROW EXECUTE FUNCTION increment_user_apps();
