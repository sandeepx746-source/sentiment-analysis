// SentimentIQ Dashboard Main Script

let currentTopicData = null;
let currentFilter = '';
let currentCommentPage = 1;
const commentsPerPage = 8;

let sentimentPieChartInstance = null;
let timelineChartInstance = null;

// Initialize Dashboard
async function initDashboard() {
  const user = getUser();
  if (user) {
    document.getElementById('usernameBadge').textContent = user.username;
  }

  // Load sidebar recent analyses & trending suggestions
  await loadDashboardData();
}

// Load Recent & Trending Topics
async function loadDashboardData() {
  try {
    const token = localStorage.getItem('access_token');
    const response = await fetch('/api/dashboard', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (response.ok) {
      const data = await response.json();
      renderSidebar(data.recent_analyses);
      renderTrendingPills(data.trending_topics);
    }
  } catch (err) {
    console.error('Failed to load dashboard data:', err);
  }
}

// Render Sidebar List
function renderSidebar(analyses) {
  const container = document.getElementById('recentSidebarList');
  if (!container) return;

  container.innerHTML = '';
  if (!analyses || analyses.length === 0) {
    container.innerHTML = '<div style="color: var(--muted); font-size: 0.8rem; padding: 0 12px;">No search history</div>';
    return;
  }

  // Get unique topics
  const seen = new Set();
  const uniqueAnalyses = analyses.filter(item => {
    const k = item.topic.toLowerCase();
    return seen.has(k) ? false : seen.add(k);
  });

  uniqueAnalyses.slice(0, 5).forEach(item => {
    const link = document.createElement('a');
    link.href = '#';
    link.className = 'sidebar-link';
    link.innerHTML = `<span class="s-icon">#</span> ${item.topic}`;
    link.onclick = (e) => {
      e.preventDefault();
      document.getElementById('topicSearchInput').value = item.topic;
      performAnalysis();
    };
    container.appendChild(link);
  });
}

// Render Trending Pills
function renderTrendingPills(topics) {
  const container = document.getElementById('trendingPills');
  if (!container) return;

  container.innerHTML = '';
  // Shuffle/select 6 random trending topics
  const shuffled = topics.sort(() => 0.5 - Math.random()).slice(0, 6);
  shuffled.forEach(topic => {
    const pill = document.createElement('div');
    pill.className = 'trend-pill';
    pill.textContent = `# ${topic}`;
    pill.onclick = () => {
      document.getElementById('topicSearchInput').value = topic;
      performAnalysis();
    };
    container.appendChild(pill);
  });
}

// Perform Analysis
async function performAnalysis() {
  const input = document.getElementById('topicSearchInput');
  const topic = input.value.trim();

  if (!topic) {
    showToast('Please enter a topic to analyze', 'warning');
    return;
  }

  // UI States
  const emptyState = document.getElementById('dashboardEmptyState');
  const loadingState = document.getElementById('dashboardLoadingState');
  const resultsArea = document.getElementById('resultsArea');
  const analyzeBtn = document.getElementById('analyzeBtn');
  const spinner = document.getElementById('analyzeSpinner');

  emptyState.classList.add('hidden');
  resultsArea.classList.add('hidden');
  loadingState.classList.remove('hidden');
  analyzeBtn.disabled = true;
  spinner.classList.remove('hidden');

  try {
    const token = localStorage.getItem('access_token');
    const response = await fetch(`/api/analyze?q=${encodeURIComponent(topic)}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const data = await response.json();

    if (response.ok) {
      currentTopicData = data;
      currentFilter = '';
      currentCommentPage = 1;
      
      // Update UI with results
      renderResults(data);

      resultsArea.classList.remove('hidden');
      // Load recent history sidebar update
      await loadDashboardData();
    } else {
      showToast(data.error || 'Failed to analyze topic', 'error');
      emptyState.classList.remove('hidden');
    }
  } catch (err) {
    console.error(err);
    showToast('An error occurred while analyzing', 'error');
    emptyState.classList.remove('hidden');
  } finally {
    loadingState.classList.add('hidden');
    analyzeBtn.disabled = false;
    spinner.classList.add('hidden');
  }
}

// Render Results
function renderResults(data) {
  // Set Topic Header Title
  document.getElementById('analyzedTopicTitle').textContent = `Mood Analysis: ${data.topic}`;

  // KPI Numbers
  document.getElementById('kpiPositive').textContent = `${data.positive_pct}%`;
  document.getElementById('kpiNegative').textContent = `${data.negative_pct}%`;
  document.getElementById('kpiNeutral').textContent = `${data.neutral_pct}%`;
  document.getElementById('kpiEngagement').textContent = `${data.engagement_rate}%`;
  document.getElementById('kpiTotal').textContent = data.total;

  // Animate Virality Card Number
  animateNumber('kpiVirality', 0, data.virality_score, 1000);

  // Dominant Mood badge mapping
  const dominantMoodBadge = document.getElementById('dominantMoodBadge');
  const emojiMap = {
    'happy': { emoji: '😊', label: 'Positive/Happy', class: 'badge-positive' },
    'excited': { emoji: '😍', label: 'Highly Excited', class: 'badge-positive' },
    'sad': { emoji: '😢', label: 'Sad/Disappointed', class: 'badge-negative' },
    'angry': { emoji: '😡', label: 'Highly Critical/Angry', class: 'badge-danger' },
    'neutral': { emoji: '😐', label: 'Neutral/Indifferent', class: 'badge-neutral' }
  };
  const moodInfo = emojiMap[data.dominant_emotion] || emojiMap['neutral'];
  dominantMoodBadge.textContent = `${moodInfo.emoji} ${moodInfo.label}`;
  dominantMoodBadge.className = `badge ${moodInfo.class}`;

  // 1️⃣ Mood Meter
  renderMoodMeter(data);

  // 2️⃣ Virality Score Display
  renderViralityScore(data.virality_score);

  // 3️⃣ AI Insights
  renderInsights(data.insights);

  // 4️⃣ Word Cloud
  renderWordCloud(data.keywords);

  // 5️⃣ Chart.js Visualizations
  renderCharts(data);

  // 6️⃣ Live Comments
  renderComments();
}

// Animate Number helper
function animateNumber(elementId, start, end, duration) {
  const obj = document.getElementById(elementId);
  if (!obj) return;
  
  let startTimestamp = null;
  const step = (timestamp) => {
    if (!startTimestamp) startTimestamp = timestamp;
    const progress = Math.min((timestamp - startTimestamp) / duration, 1);
    obj.textContent = Math.floor(progress * (end - start) + start);
    if (progress < 1) {
      window.requestAnimationFrame(step);
    }
  };
  window.requestAnimationFrame(step);
}

// Render Mood Meter
function renderMoodMeter(data) {
  const ring = document.getElementById('moodRingFill');
  const emojiDisplay = document.getElementById('moodMeterEmoji');
  const pctDisplay = document.getElementById('moodMeterPct');
  const labelDisplay = document.getElementById('moodMeterLabel');
  const emotionsList = document.getElementById('moodEmotionsList');

  // Percentage of positive + excited emotions
  const positiveEngagement = data.positive_pct;
  pctDisplay.textContent = `${positiveEngagement}%`;

  // Calculate SVG stroke dash offset (circumference of r=70 is 440)
  const offset = 440 - (440 * positiveEngagement) / 100;
  ring.style.strokeDashoffset = offset;

  // Determine dominant mood display details
  const emojiMap = {
    'happy': { emoji: '😊', label: 'Happy', color: 'var(--success)' },
    'excited': { emoji: '😍', label: 'Excited', color: 'var(--primary)' },
    'sad': { emoji: '😢', label: 'Sad', color: 'var(--muted)' },
    'angry': { emoji: '😡', label: 'Angry', color: 'var(--danger)' },
    'neutral': { emoji: '😐', label: 'Neutral', color: 'var(--warning)' }
  };
  
  const currentMood = emojiMap[data.dominant_emotion] || emojiMap['neutral'];
  emojiDisplay.textContent = currentMood.emoji;
  labelDisplay.textContent = currentMood.label;
  ring.style.stroke = currentMood.color;

  // Emotions List breakdown
  emotionsList.innerHTML = '';
  const totalEmotionsCount = Object.values(data.emotions).reduce((a, b) => a + b, 0);

  Object.entries(data.emotions).forEach(([emotion, count]) => {
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

// Render Virality Score Card
function renderViralityScore(score) {
  const number = document.getElementById('viralityNumber');
  const barFill = document.getElementById('viralityBarFill');
  const statement = document.getElementById('viralityStatement');
  const trendDesc = document.getElementById('viralityTrendDesc');

  number.textContent = score;
  barFill.style.width = `${score}%`;

  if (score >= 80) {
    statement.textContent = '🔥 Extreme Virality Event';
    trendDesc.textContent = 'Topic is exploding in social feeds with exceptional interaction volume.';
  } else if (score >= 60) {
    statement.textContent = '📈 High Virality Trend';
    trendDesc.textContent = 'Steady expansion of positive sentiment sharing across major communities.';
  } else if (score >= 40) {
    statement.textContent = '📊 Moderate Virality';
    trendDesc.textContent = 'Content is maintaining average user engagement and interest curves.';
  } else {
    statement.textContent = '😐 Low Public Virality';
    trendDesc.textContent = 'Niche topic or quiet conversation with standard baseline traffic.';
  }
}

// Render AI Insights
function renderInsights(insights) {
  const grid = document.getElementById('insightsGrid');
  grid.innerHTML = '';

  if (!insights || insights.length === 0) {
    grid.innerHTML = '<div style="color: var(--muted);">No insights generated</div>';
    return;
  }

  insights.forEach((insight, idx) => {
    const card = document.createElement('div');
    card.className = 'insight-card';
    card.style.animationDelay = `${idx * 0.08}s`;
    card.innerHTML = `
      <div class="insight-icon">${insight.icon}</div>
      <div class="insight-text">${insight.text}</div>
    `;
    grid.appendChild(card);
  });
}

// Render Word Cloud
function renderWordCloud(keywords) {
  const cloud = document.getElementById('wordCloud');
  cloud.innerHTML = '';

  if (!keywords || keywords.length === 0) {
    cloud.innerHTML = '<div style="color: var(--muted);">No trending keywords found</div>';
    return;
  }

  keywords.forEach(kw => {
    const span = document.createElement('span');
    span.className = `word-tag ${kw.sentiment}`;
    span.textContent = kw.word;
    span.style.fontSize = `${kw.size}px`;
    span.style.opacity = Math.max(0.4, kw.count / keywords[0].count);
    cloud.appendChild(span);
  });
}

// Render Chart.js
function renderCharts(data) {
  // 1. Sentiment Pie Chart
  if (sentimentPieChartInstance) sentimentPieChartInstance.destroy();
  const pieCtx = document.getElementById('sentimentPieChart').getContext('2d');
  sentimentPieChartInstance = new Chart(pieCtx, {
    type: 'doughnut',
    data: {
      labels: ['Positive', 'Negative', 'Neutral'],
      datasets: [{
        data: [data.positive_pct, data.negative_pct, data.neutral_pct],
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
          labels: { color: '#f8fafc', font: { family: 'Inter', size: 12 } }
        }
      },
      cutout: '65%'
    }
  });

  // 2. Timeline Line Chart
  if (timelineChartInstance) timelineChartInstance.destroy();
  const lineCtx = document.getElementById('timelineLineChart').getContext('2d');
  
  const labels = data.timeline.map(t => t.day);
  const posData = data.timeline.map(t => t.positive);
  const negData = data.timeline.map(t => t.negative);
  
  timelineChartInstance = new Chart(lineCtx, {
    type: 'line',
    data: {
      labels: labels,
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
        x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } },
        y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' }, min: 0, max: 100 }
      },
      plugins: {
        legend: {
          position: 'bottom',
          labels: { color: '#f8fafc' }
        }
      }
    }
  });
}

// Render Comments Table
function renderComments() {
  const tableBody = document.getElementById('commentsTableBody');
  const searchVal = document.getElementById('commentSearch').value.toLowerCase();
  
  let comments = currentTopicData.comments;

  // Filter comments
  if (currentFilter) {
    comments = comments.filter(c => c.sentiment === currentFilter);
  }
  if (searchVal) {
    comments = comments.filter(c => c.text.toLowerCase().includes(searchVal));
  }

  tableBody.innerHTML = '';

  if (comments.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="3" class="text-center" style="color: var(--muted); padding: 24px;">
          No matching comments found
        </td>
      </tr>
    `;
    document.getElementById('commentsPagination').innerHTML = '';
    return;
  }

  // Paginate
  const totalPages = Math.ceil(comments.length / commentsPerPage);
  const startIdx = (currentCommentPage - 1) * commentsPerPage;
  const pageComments = comments.slice(startIdx, startIdx + commentsPerPage);

  pageComments.forEach(comment => {
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

  // Render Pagination Buttons
  renderPagination(totalPages);
}

// Render Pagination controls
function renderPagination(totalPages) {
  const container = document.getElementById('commentsPagination');
  container.innerHTML = '';

  if (totalPages <= 1) return;

  const prevBtn = document.createElement('button');
  prevBtn.className = 'page-btn';
  prevBtn.textContent = '◀';
  prevBtn.disabled = currentCommentPage === 1;
  prevBtn.onclick = () => {
    currentCommentPage--;
    renderComments();
  };
  container.appendChild(prevBtn);

  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement('button');
    btn.className = `page-btn ${currentCommentPage === i ? 'active' : ''}`;
    btn.textContent = i;
    btn.onclick = () => {
      currentCommentPage = i;
      renderComments();
    };
    container.appendChild(btn);
  }

  const nextBtn = document.createElement('button');
  nextBtn.className = 'page-btn';
  nextBtn.textContent = '▶';
  nextBtn.disabled = currentCommentPage === totalPages;
  nextBtn.onclick = () => {
    currentCommentPage++;
    renderComments();
  };
  container.appendChild(nextBtn);
}

// Filter comments by chip
function setCommentFilter(sentiment) {
  currentFilter = sentiment;
  currentCommentPage = 1;

  // Update chips active state
  const chips = document.querySelectorAll('.filter-chip');
  chips.forEach(chip => chip.classList.remove('active'));

  if (sentiment === '') {
    document.getElementById('chipAll').classList.add('active');
  } else if (sentiment === 'positive') {
    document.getElementById('chipPositive').classList.add('active');
  } else if (sentiment === 'negative') {
    document.getElementById('chipNegative').classList.add('active');
  } else if (sentiment === 'neutral') {
    document.getElementById('chipNeutral').classList.add('active');
  }

  renderComments();
}

function filterComments() {
  currentCommentPage = 1;
  renderComments();
}

// Escape HTML helper
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
