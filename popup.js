let selectedProfile = "dev";

// Load total counts and today's counts
function loadCounts() {
  chrome.storage.local.get(['appCounts', 'appLog'], (res) => {
    const counts = res.appCounts || { ba: 0, qa: 0, dev: 0 };
    document.getElementById('countBa').textContent = counts.ba;
    document.getElementById('countQa').textContent = counts.qa;
    document.getElementById('countDev').textContent = counts.dev;

    // Compute today's counts from appLog
    const today = new Date().toISOString().split('T')[0];
    const log = res.appLog || [];
    const todayLog = log.filter(entry => entry.date === today);
    const todayCounts = { ba: 0, qa: 0, dev: 0 };
    todayLog.forEach(entry => {
      if (entry.profile === 'ba') todayCounts.ba++;
      else if (entry.profile === 'qa') todayCounts.qa++;
      else if (entry.profile === 'dev') todayCounts.dev++;
    });
    document.getElementById('todayBa').textContent = todayCounts.ba;
    document.getElementById('todayQa').textContent = todayCounts.qa;
    document.getElementById('todayDev').textContent = todayCounts.dev;
  });
}
loadCounts();

// Profile button logic
const profileButtons = document.querySelectorAll('.profile-btn');
profileButtons.forEach(btn => {
  btn.addEventListener('click', function() {
    profileButtons.forEach(b => b.classList.remove('active'));
    this.classList.add('active');
    if (this.id === 'baBtn') selectedProfile = 'ba';
    else if (this.id === 'qaBtn') selectedProfile = 'qa';
    else if (this.id === 'devBtn') selectedProfile = 'dev';
  });
});

document.getElementById("scanBtn").addEventListener("click", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  chrome.tabs.sendMessage(tab.id, {
    action: "scan",
    profile: selectedProfile
  });
  setTimeout(loadCounts, 3000);
});

document.getElementById("exportBtn").addEventListener("click", () => {
  chrome.storage.local.get(['appLog'], (res) => {
    const log = res.appLog || [];
    if (log.length === 0) {
      alert("No applications logged yet!");
      return;
    }
    
    let csv = "Date,Time,Profile,Company,URL,JD\n";
    log.forEach(entry => {
      const escape = (str) => {
        if (!str) return '';
        return `"${str.replace(/"/g, '""')}"`;
      };
      csv += `${entry.date},${entry.time},${entry.profile},${escape(entry.company)},${escape(entry.url)},${escape(entry.jd)}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "job_applications_log.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  });
});

// Reset data
document.getElementById("resetBtn").addEventListener("click", () => {
  if (confirm("Are you sure you want to delete all application logs and counters? This cannot be undone.")) {
    chrome.storage.local.remove(['appLog', 'appCounts'], () => {
      loadCounts();
      console.log("🗑 Data reset complete.");
      alert("All data has been reset.");
    });
  }
});

// Open Dashboard
document.getElementById("dashboardBtn").addEventListener("click", () => {
  chrome.tabs.create({ url: chrome.runtime.getURL("dashboard.html") });
});