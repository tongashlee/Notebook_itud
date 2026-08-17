const { createClient } = require('@supabase/supabase-js');
const SUPABASE_URL = 'https://pffwrkvkrciakslmednu.supabase.co';
const _k = 'ZXlKaGJHY2lPaUpJVXpJMU5pSXNJblI1Y0NJNklrcFhWQ0o5LmV5SnBjM01pT2lKemRYQmhZbUZ6WlNJc0luSmxaaUk2SW5CbVpuZHlhM1pyY21OcFlXdHpiRzFsWkc1MUlpd2ljbTlzWlNJNkltRnViMjRpTENKcFlYUWlPakUzT0RJeU5EZzJPRElzSW1WNGNDSTZNakE1TnpneU5EWTRNbjAuWVNVcVZlUnFvMVE1MDVDcVJHaDZ2clE2aUpvVTNibFpUa25LSklrU2hQNA==';
const SUPABASE_ANON_KEY = atob(_k);
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function test() {
    const { data: prods } = await supabaseClient.from('products').select('id').limit(1);
    if (!prods || prods.length === 0) { console.log('No products found'); return; }
    
    let saleData = {
        invoice_id: 'INV-TEST999',
        date: '2026-08-13',
        product_id: prods[0].id,
        product_name: 'Acer Nitro 5',
        qty: 1,
        sub_total: 4500,
        total_cost: 3000,
        profit: 1500,
        shipping_cost: 0,
        vat: 0,
        grand_total: 4500,
        cus_name: 'Warakorn',
        address: 'อุดร',
        deposit_amount: 4500,
        deposit_remaining: 0,
        payment_method: 'CASH',
        status: 'COMPLETED'
    };
    const { data, error } = await supabaseClient.from('sales').insert([saleData]);
    console.log(error || 'Sale Success');
    
    // Cleanup
    await supabaseClient.from('sales').delete().eq('invoice_id', 'INV-TEST999');
}
test();