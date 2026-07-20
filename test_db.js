const fs = require('fs');

async function testSupabase() {
    const SUPABASE_URL = 'https://pffwrkvkrciakslmednu.supabase.co';
    const _k = 'ZXlKaGJHY2lPaUpJVXpJMU5pSXNJblI1Y0NJNklrcFhWQ0o5LmV5SnBjM01pT2lKemRYQmhZbUZ6WlNJc0luSmxaaUk2SW5CbVpuZHlhM1pyY21OcFlXdHpiRzFsWkc1MUlpd2ljbTlzWlNJNkltRnViMjRpTENKcFlYUWlPakUzT0RJeU5EZzJPRElzSW1WNGNDSTZNakE1TnpneU5EWTRNbjAuWVNVcVZlUnFvMVE1MDVDcVJHaDZ2clE2aUpvVTNibFpUa25LSklrU2hQNA==';
    const SUPABASE_ANON_KEY = Buffer.from(_k, 'base64').toString('utf-8');

    const headers = {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
    };

    try {
        console.log('Testing products...');
        let pRes = await fetch(`${SUPABASE_URL}/rest/v1/products?select=*`, { headers });
        console.log('products:', pRes.status, await pRes.text());

        console.log('Testing sales...');
        let sRes = await fetch(`${SUPABASE_URL}/rest/v1/sales?select=*`, { headers });
        console.log('sales:', sRes.status, await sRes.text());

        console.log('Testing transactions...');
        let tRes = await fetch(`${SUPABASE_URL}/rest/v1/transactions?select=*`, { headers });
        console.log('transactions:', tRes.status, await tRes.text());
        
    } catch (e) {
        console.error(e);
    }
}

testSupabase();
