// SentimentIQ Topic Battle Mode Controller

let battleChartInstance = null;

async function initCompare() {
  const user = getUser();
  if (user) {
    document.getElementById('usernameBadge').textContent = user.username;
  }

  // Load sidebar recent analyses
  await loadSidebarData();
}

async function loadSidebarData() {
  try {
    const token = localStorage.getItem('access_token');
    const response = await fetch('/api/dashboard', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (response.ok) {
      const data = await response.json();
      renderSidebar(data.recent_analyses);
    }
  } catch (err) {
    console.error('Failed to load dashboard data:', err);
  }
}

function renderSidebar(analyses) {
  const container = document.getElementById('recentSidebarList');
  if (!container) return;

  container.innerHTML = '';
  if (!analyses || analyses.length === 0) {
    container.innerHTML = '<div style="color: var(--muted); font-size: 0.8rem; padding: 0 12px;">No search history</div>';
    return;
  }

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
      // On compare page, we can set Topic A or Topic B
      const currentA = document.getElementById('topicA').value.trim();
      if (!currentA) {
        document.getElementById('topicA').value = item.topic;
      } else {
        document.getElementById('topicB').value = item.topic;
      }
    };
    container.appendChild(link);
  });
}

// Perform Head to Head Battle Analysis
async function performBattle() {
  const topicAInput = document.getElementById('topicA');
  const topicBInput = document.getElementById('topicB');
  const topicA = topicAInput.value.trim();
  const topicB = topicBInput.value.trim();

  if (!topicA || !topicB) {
    showToast('Please enter both topics to compare', 'warning');
    return;
  }

  if (topicA.toLowerCase() === topicB.toLowerCase()) {
    showToast('Please enter two different topics to compare', 'warning');
    return;
  }

  // UI States
  const emptyState = document.getElementById('battleEmptyState');
  const loadingState = document.getElementById('battleLoadingState');
  const resultsArea = document.getElementById('battleResultsArea');
  const battleBtn = document.getElementById('battleBtn');
  const spinner = document.getElementById('battleSpinner');

  emptyState.classList.add('hidden');
  resultsArea.classList.add('hidden');
  loadingState.classList.remove('hidden');
  battleBtn.disabled = true;
  spinner.classList.remove('hidden');

  try {
    const token = localStorage.getItem('access_token');
    const response = await fetch(`/api/compare?a=${encodeURIComponent(topicA)}&b=${encodeURIComponent(topicB)}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const data = await response.json();

    if (response.ok) {
      renderBattleResults(data);
      resultsArea.classList.remove('hidden');
      await loadSidebarData();
    } else {
      showToast(data.error || 'Failed to compare topics', 'error');
      emptyState.classList.remove('hidden');
    }
  } catch (err) {
    console.error(err);
    showToast('An error occurred during comparison', 'error');
    emptyState.classList.remove('hidden');
  } finally {
    loadingState.classList.add('hidden');
    battleBtn.disabled = false;
    spinner.classList.add('hidden');
  }
}

// Render Battle Results
function renderBattleResults(data) {
  const tA = data.topic_a;
  const tB = data.topic_b;
  const comp = data.comparison;

  // Winner Banner
  document.getElementById('winnerTitle').textContent = `🏆 ${comp.overall_winner} Wins Public Opinion`;
  document.getElementById('winnerSub').textContent = comp.summary;

  // Topic A Labels
  document.getElementById('labelTopicA').textContent = tA.topic;
  document.getElementById('posValA').textContent = `${tA.positive_pct}%`;
  document.getElementById('virValA').textContent = `${tA.virality_score}/100`;
  document.getElementById('engValA').textContent = `${tA.engagement_rate}%`;
  document.getElementById('compValA').textContent = tA.avg_compound.toFixed(2);

  // Topic B Labels
  document.getElementById('labelTopicB').textContent = tB.topic;
  document.getElementById('posValB').textContent = `${tB.positive_pct}%`;
  document.getElementById('virValB').textContent = `${tB.virality_score}/100`;
  document.getElementById('engValB').textContent = `${tB.engagement_rate}%`;
  document.getElementById('compValB').textContent = tB.avg_compound.toFixed(2);

  // Progress Bar Widths (trigger with reflow to animate)
  setTimeout(() => {
    document.getElementById('posBarA').style.width = `${tA.positive_pct}%`;
    document.getElementById('virBarA').style.width = `${tA.virality_score}%`;
    document.getElementById('engBarA').style.width = `${Math.min(100, tA.engagement_rate * 5)}%`; // Scaled for display
    document.getElementById('compBarA').style.width = `${Math.max(0, (tA.avg_compound + 1) * 50)}%`; // Map -1 to 1 to 0% to 100%

    document.getElementById('posBarB').style.width = `${tB.positive_pct}%`;
    document.getElementById('virBarB').style.width = `${tB.virality_score}%`;
    document.getElementById('engBarB').style.width = `${Math.min(100, tB.engagement_rate * 5)}%`;
    document.getElementById('compBarB').style.width = `${Math.max(0, (tB.avg_compound + 1) * 50)}%`;
  }, 100);

  // AI Battle Insights list
  const insightsList = document.getElementById('battleInsightsList');
  insightsList.innerHTML = '';
  comp.insights.forEach((insight, idx) => {
    const card = document.createElement('div');
    card.className = 'insight-card animate-in';
    card.style.animationDelay = `${idx * 0.08}s`;
    card.innerHTML = `
      <div class="insight-icon">⚔️</div>
      <div class="insight-text">${insight}</div>
    `;
    insightsList.appendChild(card);
  });

  // Comparative Double Bar Chart.js
  if (battleChartInstance) battleChartInstance.destroy();
  const ctx = document.getElementById('battleSentimentChart').getContext('2d');
  battleChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Positive %', 'Negative %', 'Neutral %', 'Virality Score'],
      datasets: [
        {
          label: tA.topic,
          data: [tA.positive_pct, tA.negative_pct, tA.neutral_pct, tA.virality_score],
          backgroundColor: '#6366f1',
          borderColor: '#4f46e5',
          borderWidth: 1
        },
        {
          label: tB.topic,
          data: [tB.positive_pct, tB.negative_pct, tB.neutral_pct, tB.virality_score],
          backgroundColor: '#8b5cf6',
          borderColor: '#7c3aed',
          borderWidth: 1
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
