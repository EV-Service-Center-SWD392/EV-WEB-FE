import { createClient } from '@supabase/supabase-js';

// Dựa vào connection string, project ID là: sxevedgnmakrccaqsdfq
// Supabase URL format: https://{PROJECT_ID}.supabase.co
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://sxevedgnmakrccaqsdfq.supabase.co';


// Anon key cần lấy từ Supabase Dashboard → Settings → API
// ⚠️ QUAN TRỌNG: Phải vào dashboard để lấy anon key chính xác!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseAnonKey) {
    console.error('❌ SUPABASE_ANON_KEY chưa được config!');
    console.error('📋 Hướng dẫn:');
    console.error('1. Vào: https://supabase.com/dashboard/project/sxevedgnmakrccaqsdfq/settings/api');
    console.error('2. Copy "anon public" key');
    console.error('3. Thêm vào .env.local: NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key_here');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
