const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn('⚠️  Supabase 환경변수가 설정되지 않았습니다. .env 파일을 확인하세요.');
}

// 클라이언트용 (RLS 적용)
const supabase = createClient(supabaseUrl || '', supabaseKey || '');

// 서버용 (RLS 우회 - 관리 작업용)
const supabaseAdmin = supabaseServiceKey
  ? createClient(supabaseUrl || '', supabaseServiceKey)
  : supabase;

module.exports = { supabase, supabaseAdmin };
