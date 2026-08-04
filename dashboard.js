let currentData = [];

// ============================================================
// CLOSE BUTTON
// ============================================================
document.getElementById('closeBtn').addEventListener('click', function() {
  if (chrome.tabs && chrome.tabs.getCurrent) {
    chrome.tabs.getCurrent((tab) => {
      if (tab) chrome.tabs.remove(tab.id);
    });
  } else {
    window.close();
  }
});

// ============================================================
// MAIN RENDER
// ============================================================
function renderDashboard() {
  console.log("📊 Rendering dashboard...");
  chrome.storage.local.get(['appLog'], (res) => {
    const log = res.appLog || [];
    console.log(`📊 Found ${log.length} entries.`);
    currentData = log;
    renderStats(log);
    renderTable(log);
    renderCharts(log);
  });
}

// ============================================================
// STATS
// ============================================================
function getToday() {
  return new Date().toISOString().split('T')[0];
}

function renderStats(log) {
  const total = log.length;
  const ba = log.filter(x => x.profile === 'ba').length;
  const qa = log.filter(x => x.profile === 'qa').length;
  const dev = log.filter(x => x.profile === 'dev').length;
  
  document.getElementById('totalCount').textContent = total;
  document.getElementById('totalBa').textContent = ba;
  document.getElementById('totalQa').textContent = qa;
  document.getElementById('totalDev').textContent = dev;

  const today = getToday();
  const todayLog = log.filter(entry => entry.date === today);
  const todayTotal = todayLog.length;
  const todayBa = todayLog.filter(x => x.profile === 'ba').length;
  const todayQa = todayLog.filter(x => x.profile === 'qa').length;
  const todayDev = todayLog.filter(x => x.profile === 'dev').length;
  
  document.getElementById('todayTotal').textContent = todayTotal;
  document.getElementById('todayBa').textContent = todayBa;
  document.getElementById('todayQa').textContent = todayQa;
  document.getElementById('todayDev').textContent = todayDev;
}

// ============================================================
// TABLE
// ============================================================
function renderTable(log) {
  const tbody = document.getElementById('tableBody');
  const empty = document.getElementById('emptyState');

  if (log.length === 0) {
    tbody.innerHTML = '';
    empty.style.display = 'block';
    return;
  }
  empty.style.display = 'none';

  tbody.innerHTML = log.map((entry, index) => {
    const profileClass = `badge-${entry.profile}`;
    const profileLabel = entry.profile.toUpperCase();
    
    const escape = (str) => {
      if (!str) return '';
      return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    };

    const safeCompany = escape(entry.company);
    const safeJD = escape(entry.jd);

    return `
      <tr data-index="${index}">
        <td>${entry.date}</td>
        <td>${entry.time}</td>
        <td><span class="badge ${profileClass}">${profileLabel}</span></td>
        <td><strong>${safeCompany}</strong></td>
        <td class="jd-cell">
          <div class="jd-text truncated" id="jd-${index}">${safeJD || '(No JD)'}</div>
          ${safeJD && safeJD.length > 150 ? `<button class="toggle-jd" data-index="${index}">Read more</button>` : ''}
        </td>
        <td>
          <button class="delete-btn" data-index="${index}">🗑 Delete</button>
        </td>
      </tr>
    `;
  }).join('');

  // Toggle JD
  document.querySelectorAll('.toggle-jd').forEach(btn => {
    btn.addEventListener('click', function() {
      const idx = this.dataset.index;
      const textDiv = document.getElementById(`jd-${idx}`);
      if (textDiv.classList.contains('truncated')) {
        textDiv.classList.remove('truncated');
        this.textContent = 'Read less';
      } else {
        textDiv.classList.add('truncated');
        this.textContent = 'Read more';
      }
    });
  });

  // Delete
  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const idx = parseInt(this.dataset.index);
      if (confirm('Delete this application entry?')) {
        deleteEntry(idx);
      }
    });
  });
}

function deleteEntry(index) {
  chrome.storage.local.get(['appLog', 'appCounts'], (res) => {
    let log = res.appLog || [];
    let counts = res.appCounts || { ba: 0, qa: 0, dev: 0 };
    
    const removed = log.splice(index, 1)[0];
    if (removed) {
      if (counts[removed.profile] !== undefined) {
        counts[removed.profile] = Math.max(0, counts[removed.profile] - 1);
      }
      chrome.storage.local.set({ appLog: log, appCounts: counts }, () => {
        renderDashboard();
      });
    }
  });
}

// ============================================================
// CSS CHARTS (No external libraries)
// ============================================================
function renderCharts(log) {
  // --- Daily bar chart (last 7 days) ---
  const today = new Date();
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().split('T')[0]);
  }

  // Compute max value for scaling
  let maxCount = 0;
  const baData = [], qaData = [], devData = [];
  days.forEach(date => {
    const dayLog = log.filter(entry => entry.date === date);
    baData.push(dayLog.filter(x => x.profile === 'ba').length);
    qaData.push(dayLog.filter(x => x.profile === 'qa').length);
    devData.push(dayLog.filter(x => x.profile === 'dev').length);
    const total = baData[baData.length-1] + qaData[qaData.length-1] + devData[devData.length-1];
    if (total > maxCount) maxCount = total;
  });
  // Ensure at least 1 for scaling
  if (maxCount === 0) maxCount = 1;

  const barContainer = document.getElementById('dailyBarChart');
  barContainer.innerHTML = '';
  for (let i = 0; i < days.length; i++) {
    const group = document.createElement('div');
    group.className = 'bar-group';
    
    // BA bar
    const baBar = document.createElement('div');
    baBar.className = 'bar';
    baBar.style.backgroundColor = '#3b82f6';
    baBar.style.height = (baData[i] / maxCount * 150 + 2) + 'px';
    group.appendChild(baBar);
    
    // QA bar
    const qaBar = document.createElement('div');
    qaBar.className = 'bar';
    qaBar.style.backgroundColor = '#8b5cf6';
    qaBar.style.height = (qaData[i] / maxCount * 150 + 2) + 'px';
    group.appendChild(qaBar);
    
    // Dev bar
    const devBar = document.createElement('div');
    devBar.className = 'bar';
    devBar.style.backgroundColor = '#10b981';
    devBar.style.height = (devData[i] / maxCount * 150 + 2) + 'px';
    group.appendChild(devBar);
    
    // Label
    const label = document.createElement('div');
    label.className = 'bar-label';
    label.textContent = days[i].slice(5); // show MM-DD
    group.appendChild(label);
    
    barContainer.appendChild(group);
  }

  // --- Pie chart (all-time distribution) ---
  const totalBA = log.filter(x => x.profile === 'ba').length;
  const totalQA = log.filter(x => x.profile === 'qa').length;
  const totalDEV = log.filter(x => x.profile === 'dev').length;
  const grandTotal = totalBA + totalQA + totalDEV;
  if (grandTotal === 0) {
    document.getElementById('pieChart').style.background = '#333';
    document.getElementById('pieChart').style.setProperty('--ba-pct', '0');
    document.getElementById('pieChart').style.setProperty('--qa-pct', '0');
    return;
  }
  const baPct = (totalBA / grandTotal) * 100;
  const qaPct = (totalQA / grandTotal) * 100;
  document.getElementById('pieChart').style.setProperty('--ba-pct', baPct + '%');
  document.getElementById('pieChart').style.setProperty('--qa-pct', qaPct + '%');
  // Update legend counts
  const legendItems = document.querySelectorAll('.pie-legend-item');
  legendItems[0].innerHTML = `<span class="pie-legend-color" style="background:#3b82f6;"></span> BA (${totalBA})`;
  legendItems[1].innerHTML = `<span class="pie-legend-color" style="background:#8b5cf6;"></span> QA (${totalQA})`;
  legendItems[2].innerHTML = `<span class="pie-legend-color" style="background:#10b981;"></span> Dev (${totalDEV})`;
}

// ============================================================
// FILTERS
// ============================================================
document.getElementById('searchInput').addEventListener('input', applyFilters);
document.getElementById('profileFilter').addEventListener('change', applyFilters);

function applyFilters() {
  const search = document.getElementById('searchInput').value.toLowerCase();
  const profile = document.getElementById('profileFilter').value;
  
  let filtered = currentData;
  if (profile !== 'all') {
    filtered = filtered.filter(x => x.profile === profile);
  }
  if (search.trim() !== '') {
    filtered = filtered.filter(x => 
      (x.company || '').toLowerCase().includes(search) || 
      (x.jd || '').toLowerCase().includes(search)
    );
  }
  renderTable(filtered);
  renderStats(filtered);
}

// ============================================================
// RESET
// ============================================================
document.getElementById('resetDataBtn').addEventListener('click', () => {
  if (confirm('Are you sure you want to delete ALL application data? This cannot be undone.')) {
    chrome.storage.local.remove(['appLog', 'appCounts'], () => {
      renderDashboard();
    });
  }
});

// ============================================================
// INITIAL LOAD
// ============================================================
document.addEventListener('DOMContentLoaded', function() {
  renderDashboard();
});