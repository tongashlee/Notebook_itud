// config.js
// Supabase Configuration
// Note: The Anon Key is designed to be safe for public client-side use. 
// However, to truly secure your database, you MUST configure Row Level Security (RLS) policies in your Supabase dashboard.

const SUPABASE_URL = 'https://pffwrkvkrciakslmednu.supabase.co';

// Key obfuscated to hide it from casual inspection in the HTML source.
// Again, this is not true security - please enable RLS.
const _k = 'ZXlKaGJHY2lPaUpJVXpJMU5pSXNJblI1Y0NJNklrcFhWQ0o5LmV5SnBjM01pT2lKemRYQmhZbUZ6WlNJc0luSmxaaUk2SW5CbVpuZHlhM1pyY21OcFlXdHpiRzFsWkc1MUlpd2ljbTlzWlNJNkltRnViMjRpTENKcFlYUWlPakUzT0RJeU5EZzJPRElzSW1WNGNDSTZNakE1TnpneU5EWTRNbjAuWVNVcVZlUnFvMVE1MDVDcVJHaDZ2clE2aUpvVTNibFpUa25LSklrU2hQNA==';

const SUPABASE_ANON_KEY = atob(_k);
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
