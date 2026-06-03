const API_URL = 'http://127.0.0.1:5000/api';

document.addEventListener('DOMContentLoaded', () => {
    initParticles();
    fetchDashboardStats();
    fetchSocialFeed('Twitter');

    // Live Analysis Input
    let debounceTimer;
    const liveInput = document.getElementById('live-analyze-input');
    const banner = document.getElementById('realtime-banner');
    const bannerText = document.getElementById('banner-text');
    const bannerLabel = document.getElementById('banner-label');
    const bannerScore = document.getElementById('banner-score');
    const bannerSpam = document.getElementById('banner-spam');

    liveInput.addEventListener('input', (e) => {
        clearTimeout(debounceTimer);
        const text = e.target.value.trim();
        
        if (text.length === 0) {
            banner.classList.add('hidden');
            return;
        }

        banner.classList.remove('hidden');
        bannerText.textContent = 'Analyzing...';
        bannerLabel.textContent = '--';
        bannerLabel.style.color = 'white';
        bannerSpam.classList.add('hidden');

        debounceTimer = setTimeout(() => {
            analyzeText(text);
        }, 500); // 500ms debounce
    });

    // Social Feed Platform Switcher
    const platformBtns = document.querySelectorAll('.platform-selector button');
    platformBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            platformBtns.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            fetchSocialFeed(e.target.dataset.platform);
        });
    });

    // Drag and Drop CSV
    setupDragAndDrop();
});

function initParticles() {
    // Simple particle generation for background effect using vanilla JS
    const container = document.getElementById('particles-js');
    for (let i = 0; i < 50; i++) {
        let p = document.createElement('div');
        p.style.position = 'absolute';
        p.style.width = Math.random() * 3 + 'px';
        p.style.height = p.style.width;
        p.style.background = 'rgba(69, 162, 158, ' + (Math.random() * 0.5 + 0.1) + ')';
        p.style.borderRadius = '50%';
        p.style.left = Math.random() * 100 + 'vw';
        p.style.top = Math.random() * 100 + 'vh';
        p.style.boxShadow = '0 0 10px rgba(69, 162, 158, 0.8)';
        
        // Simple GSAP float animation
        gsap.to(p, {
            y: `-${Math.random() * 100 + 50}px`,
            x: `${(Math.random() - 0.5) * 50}px`,
            duration: Math.random() * 10 + 10,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut"
        });
        
        container.appendChild(p);
    }
}

async function analyzeText(text) {
    try {
        const response = await fetch(`${API_URL}/analyze`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text })
        });
        const data = await response.json();
        
        const bannerText = document.getElementById('banner-text');
        const bannerLabel = document.getElementById('banner-label');
        const bannerScore = document.getElementById('banner-score');
        const bannerSpam = document.getElementById('banner-spam');

        bannerText.textContent = `"${text.length > 50 ? text.substring(0, 50) + '...' : text}"`;
        bannerLabel.textContent = data.sentiment.label;
        bannerScore.textContent = `Confidence: ${(data.sentiment.score * 100).toFixed(1)}%`;

        if (data.sentiment.label.includes('Positive')) {
            bannerLabel.style.color = 'var(--neon-green)';
        } else if (data.sentiment.label.includes('Negative')) {
            bannerLabel.style.color = 'var(--neon-red)';
        } else {
            bannerLabel.style.color = 'var(--text-secondary)';
        }

        if (data.spam_analysis.is_fake) {
            bannerSpam.classList.remove('hidden');
        } else {
            bannerSpam.classList.add('hidden');
        }

        // Add a subtle flash animation
        gsap.fromTo('#realtime-banner', 
            {boxShadow: '0 0 20px rgba(255,255,255,0.5)'}, 
            {boxShadow: '0 8px 32px 0 rgba(0,0,0,0.37)', duration: 0.5}
        );

    } catch (error) {
        console.error("Error analyzing text:", error);
    }
}

async function fetchDashboardStats() {
    try {
        const response = await fetch(`${API_URL}/dashboard_stats`);
        const data = await response.json();
        
        // Animate numbers up
        animateValue('total-posts', 0, data.total_posts, 1500);
        document.getElementById('stat-positive').textContent = data.positive_pct + '%';
        document.getElementById('stat-negative').textContent = data.negative_pct + '%';
        
        if (data.top_hashtags && data.top_hashtags.length > 0) {
            document.getElementById('stat-trend').textContent = '#' + data.top_hashtags[0].hashtag;
        }

        // Trigger chart updates (defined in charts.js)
        if (window.updateCharts) {
            window.updateCharts(data);
        }

    } catch (error) {
        console.error("Error fetching stats:", error);
    }
}

async function fetchSocialFeed(platform) {
    const feedContainer = document.getElementById('live-feed');
    feedContainer.innerHTML = '<div class="feed-placeholder">Loading social data... <i class="fa-solid fa-circle-notch fa-spin"></i></div>';
    
    try {
        const response = await fetch(`${API_URL}/social_fetch?platform=${platform}&query=AI`);
        const data = await response.json();
        
        feedContainer.innerHTML = '';
        data.data.forEach((item, index) => {
            const div = document.createElement('div');
            div.className = 'feed-item';
            div.style.opacity = 0;
            div.style.transform = 'translateX(20px)';
            
            let iconColor = item.sentiment.label.includes('Positive') ? 'var(--neon-green)' : 
                            (item.sentiment.label.includes('Negative') ? 'var(--neon-red)' : 'gray');

            div.innerHTML = `
                <div class="feed-item-header">
                    <span><i class="fa-brands fa-${platform.toLowerCase()}" style="color:var(--neon-blue)"></i> @${item.username}</span>
                    <span style="color:${iconColor}">${item.sentiment.label}</span>
                </div>
                <div class="feed-item-text">${item.text}</div>
            `;
            feedContainer.appendChild(div);
            
            // Stagger animation
            gsap.to(div, {opacity: 1, x: 0, duration: 0.4, delay: index * 0.1});
        });
        
    } catch (error) {
        console.error("Error fetching feed:", error);
        feedContainer.innerHTML = '<div class="feed-placeholder" style="color:red">Failed to load data.</div>';
    }
}

function animateValue(id, start, end, duration) {
    const obj = document.getElementById(id);
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        obj.innerHTML = Math.floor(progress * (end - start) + start).toLocaleString();
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}

function setupDragAndDrop() {
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('csv-upload');
    const statusDiv = document.getElementById('upload-status');

    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.style.borderColor = 'var(--neon-blue)';
        dropZone.style.background = 'rgba(69, 162, 158, 0.1)';
    });

    dropZone.addEventListener('dragleave', (e) => {
        e.preventDefault();
        dropZone.style.borderColor = 'var(--glass-border)';
        dropZone.style.background = 'transparent';
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.style.borderColor = 'var(--glass-border)';
        dropZone.style.background = 'transparent';
        
        if (e.dataTransfer.files.length) {
            handleFileUpload(e.dataTransfer.files[0]);
        }
    });

    fileInput.addEventListener('change', () => {
        if (fileInput.files.length) {
            handleFileUpload(fileInput.files[0]);
        }
    });

    async function handleFileUpload(file) {
        if (!file.name.endsWith('.csv')) {
            statusDiv.innerHTML = '<span style="color:var(--neon-red)">Please upload a valid CSV file.</span>';
            return;
        }

        statusDiv.innerHTML = '<span style="color:var(--neon-blue)"><i class="fa-solid fa-spinner fa-spin"></i> Uploading & Analyzing...</span>';
        
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch(`${API_URL}/upload_csv`, {
                method: 'POST',
                body: formData
            });
            const data = await response.json();
            
            if (data.error) {
                statusDiv.innerHTML = `<span style="color:var(--neon-red)">Error: ${data.error}</span>`;
            } else {
                statusDiv.innerHTML = `<span style="color:var(--neon-green)">Success! Analyzed ${data.summary.total} rows. ${data.summary.positive_pct}% Positive.</span>`;
                // Optionally trigger a dashboard refresh here
            }
        } catch (error) {
            statusDiv.innerHTML = '<span style="color:var(--neon-red)">Upload failed. Backend might be down.</span>';
        }
    }
}
