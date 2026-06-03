const db = require('../database/db');

const getDashboardStats = (req, res) => {
  const userId = req.user.id;
  
  db.all('SELECT * FROM posts WHERE user_id = ?', [userId], (err, rows) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    
    let totalPosts = rows.length;
    let positiveCount = 0;
    let negativeCount = 0;
    let neutralCount = 0;
    let platforms = {};
    let totalFakeScore = 0;

    rows.forEach(post => {
      if (post.sentiment === 'Positive') positiveCount++;
      else if (post.sentiment === 'Negative') negativeCount++;
      else neutralCount++;

      totalFakeScore += (post.fake_score || 0);

      const p = post.platform || 'Unknown';
      platforms[p] = (platforms[p] || 0) + 1;
    });

    let activePlatform = 'None';
    let maxPlat = 0;
    for (const [p, count] of Object.entries(platforms)) {
      if (count > maxPlat) {
        maxPlat = count;
        activePlatform = p;
      }
    }

    const avgFakeScore = totalPosts > 0 ? (totalFakeScore / totalPosts).toFixed(1) : 0;
    
    // Convert counts to percentages
    const posPct = totalPosts > 0 ? ((positiveCount / totalPosts) * 100).toFixed(1) : 0;
    const negPct = totalPosts > 0 ? ((negativeCount / totalPosts) * 100).toFixed(1) : 0;
    const neuPct = totalPosts > 0 ? ((neutralCount / totalPosts) * 100).toFixed(1) : 0;

    // Fake trend data for charts
    const trendData = [
      { name: 'Mon', positive: Math.floor(Math.random()*50), negative: Math.floor(Math.random()*30) },
      { name: 'Tue', positive: Math.floor(Math.random()*50), negative: Math.floor(Math.random()*30) },
      { name: 'Wed', positive: Math.floor(Math.random()*50), negative: Math.floor(Math.random()*30) },
      { name: 'Thu', positive: Math.floor(Math.random()*50), negative: Math.floor(Math.random()*30) },
      { name: 'Fri', positive: Math.floor(Math.random()*50), negative: Math.floor(Math.random()*30) },
      { name: 'Sat', positive: Math.floor(Math.random()*50), negative: Math.floor(Math.random()*30) },
      { name: 'Sun', positive: positiveCount, negative: negativeCount }
    ];

    res.json({
      totalPosts,
      positivePct: posPct,
      negativePct: negPct,
      neutralPct: neuPct,
      activePlatform,
      avgFakeScore,
      trendData,
      rawCounts: { positiveCount, negativeCount, neutralCount }
    });
  });
};

module.exports = { getDashboardStats };
