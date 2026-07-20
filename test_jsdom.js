const { JSDOM } = require('jsdom');
const fs = require('fs');

const html = fs.readFileSync('index.html', 'utf8');

const dom = new JSDOM(html, {
  runScripts: "dangerously",
  resources: "usable" // Allow it to load scripts if needed, though we don't have supabase locally
});

dom.window.addEventListener('error', (event) => {
  console.error("DOM ERROR:", event.error);
});

// We can intercept unhandled promise rejections
dom.window.addEventListener('unhandledrejection', (event) => {
  console.error("UNHANDLED PROMISE REJECTION:", event.reason);
});

setTimeout(() => {
  console.log("Checking if renderReportsTab exists...");
  if (typeof dom.window.renderReportsTab === 'function') {
      console.log("renderReportsTab exists, but maybe refreshAllData failed?");
  }
  
  // Try to click the tab
  let tabBtn = dom.window.document.querySelector('button[data-bs-target="#tab-history"]');
  if (tabBtn) {
      console.log("Found tab button, trying to click...");
      try {
          tabBtn.click();
          console.log("Clicked successfully.");
      } catch (e) {
          console.error("Error clicking:", e);
      }
  } else {
      console.log("Tab button not found!");
  }
  
}, 2000);
