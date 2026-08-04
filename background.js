console.log("Background Loaded");

// Initialize storage on first install
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get(['appLog', 'appCounts'], (res) => {
    if (!res.appLog) chrome.storage.local.set({ appLog: [] });
    if (!res.appCounts) chrome.storage.local.set({ appCounts: { ba: 0, qa: 0, dev: 0 } });
  });
});

// Listen for log messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "log_application") {
    const { profile, company, jd } = request;
    console.log(`📝 Received log for profile: ${profile}, company: ${company}`);
    
    chrome.storage.local.get(['appLog', 'appCounts'], (res) => {
      let log = res.appLog || [];
      let counts = res.appCounts || { ba: 0, qa: 0, dev: 0 };
      
      // Add new entry
      log.push({
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString(),
        profile: profile,
        company: company || "Unknown Company",
        url: sender.tab ? sender.tab.url : "Unknown URL",
        jd: (jd || "").substring(0, 3000)
      });
      
      // Increment counter
      if (counts[profile] !== undefined) {
        counts[profile] += 1;
        console.log(`✅ Incremented ${profile} to ${counts[profile]}`);
      } else {
        console.warn(`⚠️ Unknown profile: "${profile}" – initializing to 1`);
        counts[profile] = 1;
      }
      
      // Save back
      chrome.storage.local.set({ appLog: log, appCounts: counts }, () => {
        console.log(`✅ Saved log. Counts:`, counts);
        sendResponse({ status: "logged" });
      });
    });
    return true; // keep channel open for async response
  }
});