const fs = require('fs');

async function testSimulate() {
    let html = fs.readFileSync('index.html', 'utf8');
    let match = html.match(/<script>([\s\S]*?)<\/script>/g);
    let js = match[1].replace('<script>', '').replace('</script>', '');
    
    // Replace the DOM related calls with mocks
    let mockPrefix = `
        const document = {
            getElementById: (id) => ({ value: '', innerText: '', innerHTML: '', className: '', classList: { remove: ()=>{}, add: ()=>{} }, style: {} }),
            querySelectorAll: () => ([]),
            createElement: () => ({ classList: {add: ()=>{}} })
        };
        const window = { innerWidth: 1024, Chart: function() { return { destroy: ()=>{} }; } };
        let salesChart = null;
        const Swal = { fire: (...args) => console.log('Swal:', args) };
        
        let globalProducts = [];
        let globalSales = [];
        let globalTransactions = [];
        
        function fmtMoney(num) { return Number(num).toFixed(2); }
        function formatDateToTH(d) { return d; }
        function getBrandByPid(id) { return 'Unknown'; }
        function getAllTransactions() { return globalTransactions; }
    `;
    
    // Get the render functions
    let renderDashboardStr = js.substring(js.indexOf('function renderDashboard() {'), js.indexOf('function renderViewProducts() {'));
    let renderManageStr = js.substring(js.indexOf('function renderManageProducts() {'), js.indexOf('function submitProduct('));
    let renderSalesTabStr = js.substring(js.indexOf('function renderSalesTab() {'), js.indexOf('async function submitSale('));
    let renderSavingsStr = js.substring(js.indexOf('function renderSavings() {'), js.indexOf('async function submitSaving('));
    
    // Read the data we just got
    const pData = JSON.parse(fs.readFileSync('p.json', 'utf8'));
    const sData = JSON.parse(fs.readFileSync('s.json', 'utf8'));
    const tData = JSON.parse(fs.readFileSync('t.json', 'utf8'));
    
    let runner = `
        ${mockPrefix}
        globalProducts = ${JSON.stringify(pData)}.map(p => ({ id: p.id, name: p.name, brand: p.brand, cost: Number(p.cost), actualPrice: Number(p.actual_price), stock: p.stock, updatedAt: p.updated_at, fbLink: p.fb_link || "" }));
        globalSales = ${JSON.stringify(sData)}.map(s => ({ receiptId: s.invoice_id, date: formatDateToTH(s.date), createdAt: s.created_at || s.date, productId: s.product_id, productName: s.product_name, qty: s.qty, totalCost: Number(s.total_cost), subTotal: Number(s.sub_total), profit: Number(s.profit), discount: Number(s.discount || 0), totalSales: Number(s.total_sales), cusName: s.cus_name, phone: s.phone, address: s.address, postalCode: s.postal_code, channel: s.channel, status: s.status, trackingNo: s.tracking_no, note: s.note, paymentMethod: s.payment_method }));
        globalTransactions = ${JSON.stringify(tData)}.map(t => ({ id: t.tx_id, date: formatDateToTH(t.date), type: t.type, category: t.category, amount: Number(t.amount), note: t.note, bank: t.bank }));
        
        try {
            ${renderDashboardStr}
            renderDashboard();
            console.log('renderDashboard OK');
            
            ${renderManageStr}
            renderManageProducts();
            console.log('renderManageProducts OK');
            
            ${renderSalesTabStr}
            renderSalesTab();
            console.log('renderSalesTab OK');
            
            ${renderSavingsStr}
            renderSavings();
            console.log('renderSavings OK');
            
        } catch(e) {
            console.error('CRASH:', e.message, e.stack);
        }
    `;
    
    fs.writeFileSync('runner.js', runner);
}

testSimulate();
