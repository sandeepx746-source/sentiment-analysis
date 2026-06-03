// SentimentIQ Social Accounts & Analytics Controller

let activePlatform = '';
let connectedAccounts = [];
let selectedPlatform = '';

// Main comment pagination details
let socialComments = [];
let socialFilter = '';
let socialSearch = '';
let socialPage = 1;
const socialPerPage = 8;

// Charts instances
let socialPieChart = null;
let socialActivityChartInstance = null;
let socialEngagementChartInstance = null;
let socialTimelineChartInstance = null;

// ==========================================
// 1. Connection Page Logic
// ==========================================
async function initConnectPage() {
  const user = getUser();
  if (user) {
    document.getElementById('usernameBadge').textContent = user.username;
  }
  
  await fetchConnectedAccounts();
  loadSidebar();
}

async function fetchConnectedAccounts() {
  try {
    const token = localStorage.getItem('access_token');
    const response = await fetch('/api/social-dashboard', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (response.ok) {
      const data = await response.json();
      connectedAccounts = data.connected_accounts || [];
      updatePlatformCards();
    }
  } catch (err) {
    console.error('Failed to load accounts:', err);
  }
}

function updatePlatformCards() {
  const platforms = ['instagram', 'twitter', 'youtube', 'reddit'];
  
  // Reset all
  platforms.forEach(p => {
    const statusText = document.getElementById(`status${capitalize(p)}`);
    const btn = document.getElementById(`btn${capitalize(p)}`);
    const card = document.getElementById(`card${capitalize(p)}`);
    
    if (statusText && btn && card) {
      statusText.textContent = 'Not Connected';
      statusText.className = 'platform-status';
      btn.textContent = 'Connect Account';
      btn.className = 'btn btn-outline platform-btn';
      card.style.borderColor = 'rgba(255, 255, 255, 0.08)';
    }
  });

  // Apply connected status
  connectedAccounts.forEach(account => {
    const p = account.platform;
    const statusText = document.getElementById(`status${capitalize(p)}`);
    const btn = document.getElementById(`btn${capitalize(p)}`);
    const card = document.getElementById(`card${capitalize(p)}`);

    if (statusText && btn && card) {
      statusText.textContent = `Connected (@${account.handle})`;
      statusText.className = 'platform-status connected';
      btn.textContent = 'Manage Analytics';
      btn.className = 'btn btn-primary platform-btn';
      card.style.borderColor = 'var(--p-color)';
    }
  });
}

function openConnectModal(platform) {
  activePlatform = platform;
  
  // Icon and label mappings
  const platformIcons = { instagram: '📸', twitter: '🐦', youtube: '🎥', reddit: '👽' };
  const icon = platformIcons[platform] || '📸';
  
  document.getElementById('modalPlatformIcon').textContent = icon;
  document.getElementById('modalPlatformSubtitle').textContent = `Authorize SentimentIQ access for ${capitalize(platform)}`;
  
  const existing = connectedAccounts.find(a => a.platform === platform);
  document.getElementById('accountHandle').value = existing ? existing.handle : '';

  const overlay = document.getElementById('connectModalOverlay');
  overlay.classList.add('active');
}

function closeConnectModal() {
  const overlay = document.getElementById('connectModalOverlay');
  overlay.classList.remove('active');
  document.getElementById('accountHandle').value = '';
}

async function submitConnection() {
  const handleInput = document.getElementById('accountHandle');
  const handle = handleInput.value.trim();

  if (!handle) {
    showToast('Please enter an account username/handle', 'warning');
    return;
  }

  const allowBtn = document.getElementById('modalAllowBtn');
  const spinner = document.getElementById('modalSpinner');

  allowBtn.disabled = true;
  spinner.classList.remove('hidden');
  allowBtn.querySelector('span').textContent = 'Connecting...';

  try {
    const token = localStorage.getItem('access_token');
    const response = await fetch('/api/connect-account', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` 
      },
      body: JSON.stringify({ platform: activePlatform, handle })
    });

    const data = await response.json();

    if (response.ok) {
      showToast(data.message, 'success');
      closeConnectModal();
      setTimeout(() => {
        window.location.href = `/social-dashboard?platform=${activePlatform}`;
      }, 1200);
    } else {
      showToast(data.error || 'Failed to connect account', 'error');
      allowBtn.disabled = false;
      spinner.classList.add('hidden');
      allowBtn.querySelector('span').textContent = 'Allow Access';
    }
  } catch (err) {
    console.error(err);
    showToast('Connection failed. Please try again.', 'error');
    allowBtn.disabled = false;
    spinner.classList.add('hidden');
    allowBtn.querySelector('span').textContent = 'Allow Access';
  }
}

// ==========================================
// 2. Social Analytics Dashboard Logic
// ==========================================
async function initSocialDashboardPage() {
  const user = getUser();
  if (user) {
    document.getElementById('usernameBadge').textContent = user.username;
  }
  
  // Extract platform from query params
  const urlParams = new URLSearchParams(window.location.search);
  selectedPlatform = urlParams.get('platform') || '';

  await loadSocialDashboard();
  loadSidebar();
}

async function loadSocialDashboard() {
  const loading = document.getElementById('socialAnalyticsLoadingState');
  const empty = document.getElementById('socialAnalyticsEmptyState');
  const content = document.getElementById('socialAnalyticsContent');

  loading.classList.remove('hidden');
  empty.classList.add('hidden');
  content.classList.add('hidden');

  try {
    const token = localStorage.getItem('access_token');
    const url = selectedPlatform ? `/api/social-dashboard?platform=${selectedPlatform}` : '/api/social-dashboard';
    const response = await fetch(url, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const data = await response.json();

    if (response.ok) {
      if (!data.connected_accounts || data.connected_accounts.length === 0) {
        empty.classList.remove('hidden');
        loading.classList.add('hidden');
        return;
      }

      connectedAccounts = data.connected_accounts;
      selectedPlatform = data.current_account.platform;

      renderTabs();
      renderSocialDashboard(data);
      
      content.classList.remove('hidden');
    } else {
      showToast(data.error || 'Could not load analytics metrics', 'error');
      empty.classList.remove('hidden');
    }
  } catch (err) {
    console.error(err);
    showToast('An error occurred loading social dashboard', 'error');
    empty.classList.remove('hidden');
  } finally {
    loading.classList.add('hidden');
  }
}

function renderTabs() {
  const container = document.getElementById('activeSocialTabs');
  if (!container) return;

  container.innerHTML = '';
  const platformIcons = { instagram: '📸', twitter: '🐦', youtube: '🎥', reddit: '👽' };

  connectedAccounts.forEach(account => {
    const tab = document.createElement('button');
    const isActive = account.platform === selectedPlatform;
    tab.className = `filter-chip ${isActive ? 'active' : ''}`;
    
    const icon = platformIcons[account.platform] || '📸';
    tab.innerHTML = `${icon} ${account.handle}`;
    
    tab.onclick = () => {
      selectedPlatform = account.platform;
      // Change URL param without full reload
      window.history.pushState({}, '', `/social-dashboard?platform=${selectedPlatform}`);
      loadSocialDashboard();
    };
    
    container.appendChild(tab);
  });
  
  // Add a Connect New tab button
  const addBtn = document.createElement('button');
  addBtn.className = 'filter-chip';
  addBtn.style.borderStyle = 'dashed';
  addBtn.innerHTML = `➕ Link Channel`;
  addBtn.onclick = () => { window.location.href = '/connect'; };
  container.appendChild(addBtn);
}

function renderSocialDashboard(data) {
  const acc = data.current_account;
  const metrics = data.metrics;
  const breakdown = data.sentiment_breakdown;

  // Title Headers
  const platformIcons = { instagram: '📸', twitter: '🐦', youtube: '🎥', reddit: '👽' };
  document.getElementById('activeAccountPlatformIcon').textContent = platformIcons[acc.platform] || '📸';
  document.getElementById('activeAccountHandle').textContent = `@${acc.handle}`;

  // Followers Label mapping (YouTube uses Subscribers, Reddit uses Members)
  const fLabel = document.getElementById('kpiFollowersLabel');
  if (acc.platform === 'youtube') fLabel.textContent = 'Subscribers';
  else if (acc.platform === 'reddit') fLabel.textContent = 'Members';
  else fLabel.textContent = 'Followers';

  // KPI Numbers
  document.getElementById('kpiFollowers').textContent = formatNumber(metrics.followers);
  document.getElementById('kpiLikes').textContent = formatNumber(metrics.likes);
  document.getElementById('kpiViews').textContent = formatNumber(metrics.views);
  document.getElementById('kpiComments').textContent = formatNumber(metrics.comments);
  document.getElementById('kpiSocialEngagement').textContent = `${metrics.engagement_rate}%`;

  animateNumber('kpiSocialVirality', 0, metrics.virality_score, 1000);

  // Dominant Mood badge details
  const emojiMap = {
    'happy': { emoji: '😊', label: 'Positive Audience Mood', class: 'badge-positive' },
    'excited': { emoji: '😍', label: 'Highly Excited Audience', class: 'badge-positive' },
    'sad': { emoji: '😢', label: 'Critical / Disappointed', class: 'badge-negative' },
    'angry': { emoji: '😡', label: 'Highly Critical / Angry', class: 'badge-danger' },
    'neutral': { emoji: '😐', label: 'Balanced Audience Mood', class: 'badge-neutral' }
  };
  const moodInfo = emojiMap[breakdown.dominant_emotion] || emojiMap['neutral'];
  const dominantMoodBadge = document.getElementById('activeAccountDominantMood');
  dominantMoodBadge.textContent = `${moodInfo.emoji} ${moodInfo.label}`;
  dominantMoodBadge.className = `badge ${moodInfo.class}`;

  // 1. Audience Mood Meter
  renderAudienceMoodMeter(breakdown);

  // 2. AI Insights
  renderSocialInsights(data.insights);

  // 3. Word Cloud
  renderSocialWordCloud(data.keywords);

  // 4. Chart.js Graphs
  renderSocialCharts(breakdown, data.timeline);

  // 5. Paginated Comments
  fetchSocialComments();
}

function renderAudienceMoodMeter(breakdown) {
  const ring = document.getElementById('socialMoodRingFill');
  const emojiDisplay = document.getElementById('socialMoodMeterEmoji');
  const pctDisplay = document.getElementById('socialMoodMeterPct');
  const labelDisplay = document.getElementById('socialMoodMeterLabel');
  const emotionsList = document.getElementById('socialMoodEmotionsList');

  const positiveEngagement = breakdown.positive_pct;
  pctDisplay.textContent = `${positiveEngagement}%`;

  const offset = 440 - (440 * positiveEngagement) / 100;
  ring.style.strokeDashoffset = offset;

  const emojiMap = {
    'happy': { emoji: '😊', label: 'Happy', color: 'var(--success)' },
    'excited': { emoji: '😍', label: 'Excited', color: 'var(--primary)' },
    'sad': { emoji: '😢', label: 'Sad', color: 'var(--muted)' },
    'angry': { emoji: '😡', label: 'Angry', color: 'var(--danger)' },
    'neutral': { emoji: '😐', label: 'Neutral', color: 'var(--warning)' }
  };
  
  const currentMood = emojiMap[breakdown.dominant_emotion] || emojiMap['neutral'];
  emojiDisplay.textContent = currentMood.emoji;
  labelDisplay.textContent = currentMood.label;
  ring.style.stroke = currentMood.color;

  // Breakdown emotions pills
  emotionsList.innerHTML = '';
  const totalEmotionsCount = Object.values(breakdown.emotions).reduce((a, b) => a + b, 0);

  Object.entries(breakdown.emotions).forEach(([emotion, count]) => {
    const emotionPct = totalEmotionsCount > 0 ? Math.round((count / totalEmotionsCount) * 100) : 0;
    const item = emojiMap[emotion] || emojiMap['neutral'];
    const pill = document.createElement('div');
    pill.className = 'emotion-pill';
    pill.innerHTML = `
      <span class="e-emoji">${item.emoji}</span>
      <span>${item.label}</span>
      <span class="e-count">${emotionPct}%</span>
    `;
    emotionsList.appendChild(pill);
  });
}

function renderSocialInsights(insights) {
  const container = document.getElementById('socialInsightsList');
  container.innerHTML = '';
  
  if (!insights || insights.length === 0) {
    container.innerHTML = '<div style="color: var(--muted); padding: 12px;">No insights sync loaded.</div>';
    return;
  }

  insights.forEach((insight, idx) => {
    const card = document.createElement('div');
    card.className = 'insight-card animate-in';
    card.style.animationDelay = `${idx * 0.08}s`;
    
    // Choose icons
    const icons = ['💡', '🔥', '⚠️', '📈'];
    const icon = icons[idx % icons.length];

    card.innerHTML = `
      <div class="insight-icon">${icon}</div>
      <div class="insight-text">${insight.insight_text}</div>
    `;
    container.appendChild(card);
  });
}

function renderSocialWordCloud(keywords) {
  const cloud = document.getElementById('socialWordCloud');
  cloud.innerHTML = '';

  if (!keywords || keywords.length === 0) {
    cloud.innerHTML = '<div style="color: var(--muted);">No keywords compiled.</div>';
    return;
  }

  keywords.forEach(kw => {
    const span = document.createElement('span');
    span.className = `word-tag ${kw.sentiment}`;
    span.textContent = kw.word;
    span.style.fontSize = `${kw.size}px`;
    cloud.appendChild(span);
  });
}

function renderSocialCharts(breakdown, timeline) {
  const textClr = '#f8fafc';
  const gridClr = 'rgba(255,255,255,0.05)';

  // 1. Doughnut Chart
  if (socialPieChart) socialPieChart.destroy();
  const pieCtx = document.getElementById('socialSentimentPieChart').getContext('2d');
  socialPieChart = new Chart(pieCtx, {
    type: 'doughnut',
    data: {
      labels: ['Positive %', 'Negative %', 'Neutral %'],
      datasets: [{
        data: [breakdown.positive_pct, breakdown.negative_pct, breakdown.neutral_pct],
        backgroundColor: ['#22c55e', '#ef4444', '#64748b'],
        borderWidth: 2,
        borderColor: '#111827'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: { color: textClr, font: { family: 'Inter', size: 12 } }
        }
      },
      cutout: '65%'
    }
  });

  // Timeline variables mapping
  const daysLabels = timeline.map(t => t.day);
  const likesData = timeline.map(t => t.likes);
  const growthData = timeline.map(t => t.likes_growth);
  const engagementData = timeline.map(t => t.engagement);
  const posData = timeline.map(t => t.positive);
  const negData = timeline.map(t => t.negative);

  // 2. Likes Growth & Activity Chart
  if (socialActivityChartInstance) socialActivityChartInstance.destroy();
  const actCtx = document.getElementById('socialActivityChart').getContext('2d');
  socialActivityChartInstance = new Chart(actCtx, {
    type: 'line',
    data: {
      labels: daysLabels,
      datasets: [
        {
          label: 'Daily Likes',
          data: likesData,
          borderColor: '#a5b4fc',
          backgroundColor: 'rgba(165,180,252,0.1)',
          yAxisID: 'y',
          tension: 0.3,
          fill: true
        },
        {
          label: 'Cumulative Growth',
          data: growthData,
          borderColor: '#6366f1',
          borderDash: [5, 5],
          yAxisID: 'y1',
          tension: 0.3
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: { grid: { color: gridClr }, ticks: { color: '#94a3b8' } },
        y: { type: 'linear', display: true, position: 'left', grid: { color: gridClr }, ticks: { color: '#94a3b8' } },
        y1: { type: 'linear', display: true, position: 'right', grid: { drawOnChartArea: false }, ticks: { color: '#94a3b8' } }
      },
      plugins: { legend: { labels: { color: textClr } } }
    }
  });

  // 3. Engagement Chart
  if (socialEngagementChartInstance) socialEngagementChartInstance.destroy();
  const engCtx = document.getElementById('socialEngagementChart').getContext('2d');
  socialEngagementChartInstance = new Chart(engCtx, {
    type: 'bar',
    data: {
      labels: daysLabels,
      datasets: [{
        label: 'Engagement Rate %',
        data: engagementData,
        backgroundColor: 'rgba(56, 189, 248, 0.4)',
        borderColor: '#38bdf8',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: { grid: { color: gridClr }, ticks: { color: '#94a3b8' } },
        y: { grid: { color: gridClr }, ticks: { color: '#94a3b8' }, min: 0 }
      },
      plugins: { legend: { labels: { color: textClr } } }
    }
  });

  // 4. Mood Timeline Chart
  if (socialTimelineChartInstance) socialTimelineChartInstance.destroy();
  const timeCtx = document.getElementById('socialMoodTimelineChart').getContext('2d');
  socialTimelineChartInstance = new Chart(timeCtx, {
    type: 'line',
    data: {
      labels: daysLabels,
      datasets: [
        {
          label: 'Positive Trend %',
          data: posData,
          borderColor: '#22c55e',
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          fill: true,
          tension: 0.4
        },
        {
          label: 'Negative Trend %',
          data: negData,
          borderColor: '#ef4444',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          fill: true,
          tension: 0.4
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: { grid: { color: gridClr }, ticks: { color: '#94a3b8' } },
        y: { grid: { color: gridClr }, ticks: { color: '#94a3b8' }, min: 0, max: 100 }
      },
      plugins: { legend: { labels: { color: textClr } } }
    }
  });
}

// ==========================================
// 3. Comments Intelligence Feed
// ==========================================
async function fetchSocialComments() {
  const token = localStorage.getItem('access_token');
  const url = `/api/social-comments?platform=${selectedPlatform}&page=${socialPage}&per_page=${socialPerPage}&sentiment=${socialFilter}&search=${encodeURIComponent(socialSearch)}`;

  try {
    const response = await fetch(url, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (response.ok) {
      const data = await response.json();
      renderSocialComments(data.comments, data.pages);
    }
  } catch (err) {
    console.error('Comments fetching failed:', err);
  }
}

function renderSocialComments(comments, totalPages) {
  const tableBody = document.getElementById('socialCommentsTableBody');
  tableBody.innerHTML = '';

  if (!comments || comments.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="3" class="text-center" style="color: var(--muted); padding: 24px;">
          No matching comments found in feed database.
        </td>
      </tr>
    `;
    document.getElementById('socialCommentsPagination').innerHTML = '';
    return;
  }

  comments.forEach(comment => {
    const row = document.createElement('tr');
    
    let badgeClass = 'badge-neutral';
    let moodLabel = '😐 Neutral';
    if (comment.sentiment === 'positive') {
      badgeClass = 'badge-positive';
      moodLabel = '😊 Positive';
    } else if (comment.sentiment === 'negative') {
      badgeClass = 'badge-negative';
      moodLabel = '😡 Negative';
    }

    row.innerHTML = `
      <td>${escapeHTML(comment.text)}</td>
      <td><span class="badge ${badgeClass}">${moodLabel}</span></td>
      <td style="text-align: right; font-weight: 600; color: ${comment.score >= 0.05 ? 'var(--success)' : comment.score <= -0.05 ? 'var(--danger)' : 'var(--muted)'}">
        ${comment.score.toFixed(2)}
      </td>
    `;
    tableBody.appendChild(row);
  });

  renderSocialPagination(totalPages);
}

function renderSocialPagination(totalPages) {
  const container = document.getElementById('socialCommentsPagination');
  container.innerHTML = '';

  if (totalPages <= 1) return;

  const prevBtn = document.createElement('button');
  prevBtn.className = 'page-btn';
  prevBtn.textContent = '◀';
  prevBtn.disabled = socialPage === 1;
  prevBtn.onclick = () => {
    socialPage--;
    fetchSocialComments();
  };
  container.appendChild(prevBtn);

  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement('button');
    btn.className = `page-btn ${socialPage === i ? 'active' : ''}`;
    btn.textContent = i;
    btn.onclick = () => {
      socialPage = i;
      fetchSocialComments();
    };
    container.appendChild(btn);
  }

  const nextBtn = document.createElement('button');
  nextBtn.className = 'page-btn';
  nextBtn.textContent = '▶';
  nextBtn.disabled = socialPage === totalPages;
  nextBtn.onclick = () => {
    socialPage++;
    fetchSocialComments();
  };
  container.appendChild(nextBtn);
}

function setSocialCommentFilter(sentiment) {
  socialFilter = sentiment;
  socialPage = 1;

  // Active state update
  const chips = document.querySelectorAll('.filter-chip');
  chips.forEach(c => {
    if (c.id && c.id.startsWith('socialChip')) {
      c.classList.remove('active');
    }
  });

  if (sentiment === '') document.getElementById('socialChipAll').classList.add('active');
  else if (sentiment === 'positive') document.getElementById('socialChipPositive').classList.add('active');
  else if (sentiment === 'negative') document.getElementById('socialChipNegative').classList.add('active');
  else if (sentiment === 'neutral') document.getElementById('socialChipNeutral').classList.add('active');

  fetchSocialComments();
}

function filterSocialComments() {
  socialSearch = document.getElementById('socialCommentSearch').value.trim();
  socialPage = 1;
  fetchSocialComments();
}

// ==========================================
// 4. Sidebar loader
// ==========================================
async function loadSidebar() {
  try {
    const token = localStorage.getItem('access_token');
    const response = await fetch('/api/dashboard', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (response.ok) {
      const data = await response.json();
      renderSidebarList(data.recent_analyses);
    }
  } catch (err) {}
}

function renderSidebarList(analyses) {
  const container = document.getElementById('recentSidebarList');
  if (!container) return;

  container.innerHTML = '';
  if (!analyses || analyses.length === 0) {
    container.innerHTML = '<div style="color: var(--muted); font-size: 0.8rem; padding: 0 12px;">No search history</div>';
    return;
  }

  const seen = new Set();
  const unique = analyses.filter(item => {
    const k = item.topic.toLowerCase();
    return seen.has(k) ? false : seen.add(k);
  });

  unique.slice(0, 5).forEach(item => {
    const link = document.createElement('a');
    link.href = `/dashboard?q=${encodeURIComponent(item.topic)}`;
    link.className = 'sidebar-link';
    link.innerHTML = `<span class="s-icon">#</span> ${item.topic}`;
    container.appendChild(link);
  });
}

// Helpers
function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function formatNumber(num) {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num;
}

function escapeHTML(str) {
  return str.replace(/[&<>'"]/g, 
    tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag)
  );
}
