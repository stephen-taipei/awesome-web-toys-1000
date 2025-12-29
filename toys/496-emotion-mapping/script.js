const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const textInput = document.getElementById('textInput');
const analyzeBtn = document.getElementById('analyzeBtn');
const infoEl = document.getElementById('info');

const emotions = {
    joy: { keywords: ['開心', '快樂', '高興', '喜歡', '愛', '好', '棒', '讚', '美'], color: '#f1c40f', icon: '😊' },
    sadness: { keywords: ['難過', '傷心', '哭', '悲', '失望', '可惜', '遺憾'], color: '#3498db', icon: '😢' },
    anger: { keywords: ['生氣', '憤怒', '討厭', '煩', '氣', '怒', '恨'], color: '#e74c3c', icon: '😠' },
    fear: { keywords: ['害怕', '恐懼', '擔心', '緊張', '焦慮', '怕'], color: '#9b59b6', icon: '😨' },
    surprise: { keywords: ['驚訝', '意外', '沒想到', '天啊', '哇', '震驚'], color: '#e67e22', icon: '😲' },
    neutral: { keywords: [], color: '#95a5a6', icon: '😐' }
};

function analyzeEmotions(text) {
    const results = {};
    let total = 0;

    Object.keys(emotions).forEach(emotion => {
        if (emotion === 'neutral') return;
        const count = emotions[emotion].keywords.reduce((acc, kw) => {
            const regex = new RegExp(kw, 'g');
            const matches = text.match(regex);
            return acc + (matches ? matches.length : 0);
        }, 0);
        results[emotion] = count;
        total += count;
    });

    if (total === 0) {
        results.neutral = 1;
        total = 1;
    }

    // Convert to percentages
    Object.keys(results).forEach(key => {
        results[key] = results[key] / total;
    });

    return results;
}

function draw(emotionScores) {
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const cx = canvas.width / 2;
    const cy = 120;
    const radius = 80;

    // Draw emotion wheel
    let startAngle = -Math.PI / 2;
    const emotionList = Object.entries(emotionScores).filter(([_, v]) => v > 0);

    emotionList.forEach(([emotion, value]) => {
        const endAngle = startAngle + value * Math.PI * 2;

        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, radius, startAngle, endAngle);
        ctx.closePath();
        ctx.fillStyle = emotions[emotion].color;
        ctx.fill();

        // Label
        const midAngle = (startAngle + endAngle) / 2;
        const labelR = radius * 0.65;
        const labelX = cx + Math.cos(midAngle) * labelR;
        const labelY = cy + Math.sin(midAngle) * labelR;

        if (value > 0.1) {
            ctx.font = '20px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(emotions[emotion].icon, labelX, labelY + 8);
        }

        startAngle = endAngle;
    });

    // Draw emotion bars
    const barY = 210;
    const barWidth = 280;
    const barHeight = 15;
    let currentX = (canvas.width - barWidth) / 2;

    emotionList.forEach(([emotion, value]) => {
        const width = value * barWidth;
        ctx.fillStyle = emotions[emotion].color;
        ctx.fillRect(currentX, barY, width, barHeight);
        currentX += width;
    });

    // Legend
    const legendY = 245;
    let legendX = 30;
    Object.entries(emotions).forEach(([emotion, data]) => {
        if (emotion === 'neutral') return;
        ctx.fillStyle = data.color;
        ctx.fillRect(legendX, legendY, 12, 12);
        ctx.fillStyle = '#333';
        ctx.font = '9px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(data.icon, legendX + 16, legendY + 10);
        legendX += 55;
    });
}

function analyze() {
    const text = textInput.value.trim() || '今天真的很開心，但也有點擔心明天的考試';
    const scores = analyzeEmotions(text);
    draw(scores);

    const dominant = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];
    const emotionName = {
        joy: '喜悅', sadness: '悲傷', anger: '憤怒',
        fear: '恐懼', surprise: '驚訝', neutral: '中性'
    };
    infoEl.textContent = `主要情緒: ${emotionName[dominant[0]]} (${(dominant[1] * 100).toFixed(0)}%)`;
}

analyzeBtn.addEventListener('click', analyze);
textInput.value = '今天真的很開心，但也有點擔心明天的考試';
analyze();
