const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const infoEl = document.getElementById('info');

function analyzeImage(img) {
    // Create temporary canvas for analysis
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    const size = 100; // Sample size
    tempCanvas.width = size;
    tempCanvas.height = size;
    tempCtx.drawImage(img, 0, 0, size, size);

    const imageData = tempCtx.getImageData(0, 0, size, size);
    const data = imageData.data;

    // Initialize histograms
    const redHist = new Array(256).fill(0);
    const greenHist = new Array(256).fill(0);
    const blueHist = new Array(256).fill(0);
    const brightnessHist = new Array(256).fill(0);

    let totalR = 0, totalG = 0, totalB = 0;
    const colorCounts = {};

    for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const brightness = Math.round((r + g + b) / 3);

        redHist[r]++;
        greenHist[g]++;
        blueHist[b]++;
        brightnessHist[brightness]++;

        totalR += r;
        totalG += g;
        totalB += b;

        // Quantize color for palette
        const qr = Math.round(r / 64) * 64;
        const qg = Math.round(g / 64) * 64;
        const qb = Math.round(b / 64) * 64;
        const key = `${qr},${qg},${qb}`;
        colorCounts[key] = (colorCounts[key] || 0) + 1;
    }

    const pixelCount = data.length / 4;
    const avgR = Math.round(totalR / pixelCount);
    const avgG = Math.round(totalG / pixelCount);
    const avgB = Math.round(totalB / pixelCount);

    // Get top colors
    const topColors = Object.entries(colorCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6)
        .map(([color, count]) => ({
            color: `rgb(${color})`,
            percent: (count / pixelCount * 100).toFixed(1)
        }));

    return { redHist, greenHist, blueHist, brightnessHist, avgR, avgG, avgB, topColors };
}

function drawStats(stats) {
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw RGB histogram
    const histHeight = 80;
    const histWidth = 200;
    const histX = 20;
    const histY = 20;

    const maxVal = Math.max(
        ...stats.redHist, ...stats.greenHist, ...stats.blueHist
    );

    // Draw histograms with transparency
    ['red', 'green', 'blue'].forEach((channel, idx) => {
        const hist = stats[channel + 'Hist'];
        const color = channel === 'red' ? '#ff4444' : channel === 'green' ? '#44ff44' : '#4444ff';

        ctx.beginPath();
        for (let i = 0; i < 256; i++) {
            const x = histX + (i / 255) * histWidth;
            const h = (hist[i] / maxVal) * histHeight;
            if (i === 0) ctx.moveTo(x, histY + histHeight);
            ctx.lineTo(x, histY + histHeight - h);
        }
        ctx.lineTo(histX + histWidth, histY + histHeight);
        ctx.closePath();
        ctx.fillStyle = color + '44';
        ctx.fill();
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        ctx.stroke();
    });

    ctx.fillStyle = '#fff';
    ctx.font = '10px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('RGB 直方圖', histX, histY + histHeight + 15);

    // Average color
    const avgX = 240;
    ctx.fillStyle = `rgb(${stats.avgR}, ${stats.avgG}, ${stats.avgB})`;
    ctx.fillRect(avgX, histY, 100, 50);
    ctx.strokeStyle = '#fff';
    ctx.strokeRect(avgX, histY, 100, 50);
    ctx.fillStyle = '#fff';
    ctx.font = '9px Arial';
    ctx.fillText('平均色', avgX, histY + 65);
    ctx.fillText(`R:${stats.avgR} G:${stats.avgG} B:${stats.avgB}`, avgX, histY + 78);

    // Color palette
    const paletteY = 130;
    ctx.fillStyle = '#fff';
    ctx.font = '10px Arial';
    ctx.fillText('主要色彩', 20, paletteY);

    stats.topColors.forEach((c, i) => {
        const x = 20 + (i % 3) * 115;
        const y = paletteY + 10 + Math.floor(i / 3) * 40;

        ctx.fillStyle = c.color;
        ctx.fillRect(x, y, 30, 30);
        ctx.strokeStyle = '#fff';
        ctx.strokeRect(x, y, 30, 30);

        ctx.fillStyle = '#fff';
        ctx.font = '9px Arial';
        ctx.fillText(`${c.percent}%`, x + 35, y + 20);
    });
}

function handleImage(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
            const stats = analyzeImage(img);
            drawStats(stats);
            infoEl.textContent = `平均亮度: ${Math.round((stats.avgR + stats.avgG + stats.avgB) / 3)}`;
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

// Generate demo image
function generateDemoStats() {
    const stats = {
        redHist: Array.from({ length: 256 }, (_, i) => Math.exp(-((i - 150) ** 2) / 2000) * 50 + Math.random() * 10),
        greenHist: Array.from({ length: 256 }, (_, i) => Math.exp(-((i - 100) ** 2) / 2000) * 60 + Math.random() * 10),
        blueHist: Array.from({ length: 256 }, (_, i) => Math.exp(-((i - 80) ** 2) / 2000) * 40 + Math.random() * 10),
        avgR: 150, avgG: 100, avgB: 80,
        topColors: [
            { color: 'rgb(192, 128, 64)', percent: '25.3' },
            { color: 'rgb(128, 64, 64)', percent: '18.7' },
            { color: 'rgb(192, 192, 128)', percent: '15.2' },
            { color: 'rgb(64, 64, 64)', percent: '12.8' },
            { color: 'rgb(128, 128, 192)', percent: '10.5' },
            { color: 'rgb(255, 192, 128)', percent: '8.1' }
        ]
    };
    drawStats(stats);
}

uploadArea.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', (e) => {
    if (e.target.files.length) handleImage(e.target.files[0]);
});

uploadArea.addEventListener('dragover', (e) => e.preventDefault());
uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    if (e.dataTransfer.files.length) handleImage(e.dataTransfer.files[0]);
});

generateDemoStats();
