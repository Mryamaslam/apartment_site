// Supabase client configuration
const SUPABASE_URL = 'https://sektognkqfxoesxjcsms.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_FhH4JbhF5ha0T13mcHXA2Q_DAriiqtR';

if (!window.supabase) {
    console.error('Supabase JS library not loaded. Please ensure @supabase/supabase-js is included before this script.');
}

const supabaseClient = window.supabase
    ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    : null;

window.supabaseClient = supabaseClient;


