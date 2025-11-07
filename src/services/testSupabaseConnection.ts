/**
 * Test Supabase Connection
 * 
 * Script này để test xem Supabase đã config đúng chưa
 * Chạy trong browser console hoặc trong component
 */

import { supabase } from '@/lib/supabase';

/**
 * Test 1: Kiểm tra connection cơ bản
 */
export async function testSupabaseConnection() {
    console.log('🧪 Testing Supabase connection...');

    try {
        // Test query đơn giản
        const { data, error } = await supabase
            .from('Bookings')
            .select('count')
            .limit(1);

        if (error) {
            console.error('❌ Connection failed:', error.message);
            console.error('📋 Possible reasons:');
            console.error('   1. Anon key chưa đúng');
            console.error('   2. Table name sai (Bookings vs bookings)');
            console.error('   3. RLS policy chặn query');
            return false;
        }

        console.log('✅ Connection successful!');
        console.log('📊 Response:', data);
        return true;
    } catch (err) {
        console.error('❌ Unexpected error:', err);
        return false;
    }
}

/**
 * Test 2: Kiểm tra có lấy được bookings không
 */
export async function testGetBookings() {
    console.log('🧪 Testing get bookings...');

    try {
        const { data, error } = await supabase
            .from('Bookings')
            .select('*')
            .limit(5);

        if (error) {
            console.error('❌ Query failed:', error.message);
            return null;
        }

        console.log('✅ Query successful!');
        console.log('📊 Sample data:', data);
        console.log(`📈 Found ${data?.length || 0} bookings`);
        return data;
    } catch (err) {
        console.error('❌ Unexpected error:', err);
        return null;
    }
}

/**
 * Test 3: List tất cả tables trong database
 */
export async function listTables() {
    console.log('🧪 Listing all tables...');

    try {
        // Query từ information_schema
        const { data, error } = await supabase
            .from('information_schema.tables')
            .select('table_name')
            .eq('table_schema', 'public');

        if (error) {
            console.warn('⚠️  Cannot list tables (might need permission)');
            console.warn('   Try manually: https://supabase.com/dashboard/project/sxevedgnmakrccaqsdfq/editor');
            return null;
        }

        console.log('✅ Tables found:', data);
        return data;
    } catch (err) {
        console.warn('⚠️  Cannot list tables');
        return null;
    }
}

/**
 * Test 4: Kiểm tra env variables
 */
export function checkEnvVariables() {
    console.log('🧪 Checking environment variables...');

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    console.log('NEXT_PUBLIC_SUPABASE_URL:', url ? '✅ Set' : '❌ Missing');
    console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', key ? '✅ Set' : '❌ Missing');

    if (!url || !key) {
        console.error('❌ Environment variables missing!');
        console.error('📋 Check .env.local file');
        return false;
    }

    console.log('✅ All env variables set!');
    return true;
}

/**
 * Chạy tất cả tests
 */
export async function runAllTests() {
    console.log('\n🚀 Running Supabase Connection Tests...\n');

    // Test 1: Env variables
    console.log('──────────────────────────────────');
    const envOk = checkEnvVariables();

    if (!envOk) {
        console.error('\n❌ Tests stopped: Env variables not configured');
        return;
    }

    // Test 2: Connection
    console.log('\n──────────────────────────────────');
    const connectionOk = await testSupabaseConnection();

    if (!connectionOk) {
        console.error('\n❌ Tests stopped: Connection failed');
        return;
    }

    // Test 3: Get data
    console.log('\n──────────────────────────────────');
    await testGetBookings();

    // Test 4: List tables (optional)
    console.log('\n──────────────────────────────────');
    await listTables();

    console.log('\n──────────────────────────────────');
    console.log('✅ All tests completed!\n');
}

/**
 * 🎯 CÁCH DÙNG:
 * 
 * 1. Trong browser console:
 *    import { runAllTests } from '@/services/testSupabaseConnection';
 *    runAllTests();
 * 
 * 2. Hoặc add vào component:
 *    useEffect(() => {
 *        runAllTests();
 *    }, []);
 * 
 * 3. Hoặc tạo button test:
 *    <Button onClick={runAllTests}>Test Connection</Button>
 */

export default {
    testSupabaseConnection,
    testGetBookings,
    listTables,
    checkEnvVariables,
    runAllTests,
};
