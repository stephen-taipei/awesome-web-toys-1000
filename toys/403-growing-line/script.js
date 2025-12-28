const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const PADDING = 40;
const POINTS = 12;

let data = [];
let progress = 0;
let isPlaying = false;

function generateData() {
    data = [];
    let value = 50 + Math.random() * 30;
    for (let i = 0; i < POINTS; i++) {
        value += (Math.random() - 0.4) * 20;
        value = Math.max(10, Math.min(90, value));
        data.push(value);
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const chartWidth = canvas.width - PADDING * 2;
    const chartHeight = canvas.height - PADDING * 2;

    // Draw grid
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
        const y = PADDING + (chartHeight / 4) * i;
        ctx.beginPath();
        ctx.moveTo(PADDING, y);
        ctx.lineTo(canvas.width - PADDING, y);
        ctx.stroke();
    }

    // Draw axes labels
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.font = '10px Arial';
    ctx.textAlign = 'right';
    for (let i = 0; i <= 4; i++) {
        const y = PADDING + (chartHeight / 4) * i;
        ctx.fillText(100 - i * 25, PADDING - 5, y + 3);
    }

    // Draw months
    ctx.textAlign = 'center';
    const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
    for (let i = 0; i < POINTS; i++) {
        const x = PADDING + (chartWidth / (POINTS - 1)) * i;
        ctx.fillText(months[i], x, canvas.height - 15);
    }

    // Draw line up to progress
    const pointsToDraw = Math.floor(progress * POINTS);
    const partialProgress = (progress * POINTS) % 1;

    if (pointsToDraw > 0) {
        // Fill area
        ctx.beginPath();
        ctx.moveTo(PADDING, canvas.height - PADDING);
        for (let i = 0; i < pointsToDraw; i++) {
            const x = PADDING + (chartWidth / (POINTS - 1)) * i;
            const y = PADDING + chartHeight * (1 - data[i] / 100);
            ctx.lineTo(x, y);
        }
        if (pointsToDraw < POINTS && partialProgress > 0) {
            const prevX = PADDING + (chartWidth / (POINTS - 1)) * (pointsToDraw - 1);
            const nextX = PADDING + (chartWidth / (POINTS - 1)) * pointsToDraw;
            const prevY = PADDING + chartHeight * (1 - data[pointsToDraw - 1] / 100);
            const nextY = PADDING + chartHeight * (1 - data[pointsToDraw] / 100);
            ctx.lineTo(prevX + (nextX - prevX) * partialProgress, prevY + (nextY - prevY) * partialProgress);
        }
        ctx.lineTo(ctx.canvas.width - PADDING, canvas.height - PADDING);
        ctx.closePath();
        ctx.fillStyle = 'rgba(255,255,255,0.2)';
        ctx.fill();

        // Draw line
        ctx.beginPath();
        for (let i = 0; i < pointsToDraw; i++) {
            const x = PADDING + (chartWidth / (POINTS - 1)) * i;
            const y = PADDING + chartHeight * (1 - data[i] / 100);
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        if (pointsToDraw < POINTS && partialProgress > 0) {
            const prevX = PADDING + (chartWidth / (POINTS - 1)) * (pointsToDraw - 1);
            const nextX = PADDING + (chartWidth / (POINTS - 1)) * pointsToDraw;
            const prevY = PADDING + chartHeight * (1 - data[pointsToDraw - 1] / 100);
            const nextY = PADDING + chartHeight * (1 - data[pointsToDraw] / 100);
            ctx.lineTo(prevX + (nextX - prevX) * partialProgress, prevY + (nextY - prevY) * partialProgress);
        }
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Draw points
        for (let i = 0; i < pointsToDraw; i++) {
            const x = PADDING + (chartWidth / (POINTS - 1)) * i;
            const y = PADDING + chartHeight * (1 - data[i] / 100);
            ctx.beginPath();
            ctx.arc(x, y, 5, 0, Math.PI * 2);
            ctx.fillStyle = '#fff';
            ctx.fill();
        }
    }
}

function animate() {
    if (!isPlaying) return;

    progress += 0.02;
    if (progress >= 1) {
        progress = 1;
        isPlaying = false;
        document.getElementById('playBtn').textContent = '▶️ 播放';
    }

    draw();
    if (isPlaying) requestAnimationFrame(animate);
}

document.getElementById('playBtn').addEventListener('click', () => {
    if (isPlaying) {
        isPlaying = false;
        document.getElementById('playBtn').textContent = '▶️ 播放';
    } else {
        if (progress >= 1) progress = 0;
        isPlaying = true;
        document.getElementById('playBtn').textContent = '⏸️ 暫停';
        animate();
    }
});

document.getElementById('newData').addEventListener('click', () => {
    generateData();
    progress = 0;
    isPlaying = false;
    document.getElementById('playBtn').textContent = '▶️ 播放';
    draw();
});

generateData();
draw();
