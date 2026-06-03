// Chart.js Configuration

let sentimentPieChart;
let trendLineChart;

// Setup Chart Default Theme
Chart.defaults.color = '#c5c6c7';
Chart.defaults.font.family = "'Inter', sans-serif";
Chart.defaults.plugins.tooltip.backgroundColor = 'rgba(11, 12, 16, 0.9)';
Chart.defaults.plugins.tooltip.titleColor = '#45a29e';
Chart.defaults.plugins.tooltip.borderColor = '#45a29e';
Chart.defaults.plugins.tooltip.borderWidth = 1;

document.addEventListener('DOMContentLoaded', () => {
    initCharts();
});

function initCharts() {
    // 1. Sentiment Pie Chart
    const pieCtx = document.getElementById('sentimentPieChart').getContext('2d');
    
    sentimentPieChart = new Chart(pieCtx, {
        type: 'doughnut',
        data: {
            labels: ['Positive', 'Neutral', 'Negative'],
            datasets: [{
                data: [33, 34, 33], // Default mock data
                backgroundColor: [
                    'rgba(102, 252, 241, 0.8)', // Neon green-ish blue
                    'rgba(197, 108, 235, 0.6)', // Neon purple
                    'rgba(255, 75, 75, 0.8)'    // Neon red
                ],
                borderColor: '#0b0c10',
                borderWidth: 2,
                hoverOffset: 10
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '70%',
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: '#ffffff',
                        padding: 20
                    }
                }
            },
            animation: {
                animateScale: true,
                animateRotate: true,
                duration: 2000,
                easing: 'easeOutQuart'
            }
        }
    });

    // 2. Trend Line Chart
    const lineCtx = document.getElementById('trendLineChart').getContext('2d');
    
    // Create gradient
    let gradient = lineCtx.createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, 'rgba(69, 162, 158, 0.5)');
    gradient.addColorStop(1, 'rgba(69, 162, 158, 0.0)');

    trendLineChart = new Chart(lineCtx, {
        type: 'line',
        data: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [{
                label: 'Engagement Volume',
                data: [1200, 1900, 3000, 5000, 4200, 3800, 4500], // Mock Data
                borderColor: '#45a29e',
                borderWidth: 3,
                backgroundColor: gradient,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#c56ceb',
                pointBorderColor: '#ffffff',
                pointHoverBackgroundColor: '#ffffff',
                pointHoverBorderColor: '#c56ceb',
                pointRadius: 4,
                pointHoverRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.05)',
                        drawBorder: false,
                    },
                    beginAtZero: true
                },
                x: {
                    grid: {
                        display: false,
                        drawBorder: false,
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            },
            animation: {
                y: {
                    duration: 2000,
                    easing: 'easeInOutElastic'
                }
            }
        }
    });
}

// Global function to be called from script.js when data arrives
window.updateCharts = function(data) {
    if (sentimentPieChart) {
        sentimentPieChart.data.datasets[0].data = [
            data.positive_pct, 
            data.neutral_pct, 
            data.negative_pct
        ];
        sentimentPieChart.update();
    }
};
