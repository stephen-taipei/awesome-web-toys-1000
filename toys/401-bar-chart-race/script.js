const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const yearEl = document.getElementById('year');

const companies = [
    { name: 'Apple', color: '#a8a8a8', values: [274, 294, 365, 383, 394] },
    { name: 'Google', color: '#4285f4', values: [182, 257, 282, 307, 339] },
    { name: 'Microsoft', color: '#00a4ef', values: [143, 168, 198, 230, 280] },
    { name: 'Amazon', color: '#ff9900', values: [280, 386, 469, 513, 575] },
    { name: 'Tesla', color: '#cc0000', values: [21, 81, 669, 768, 735] },
    { name: 'Meta', color: '#1877f2', values: [585, 778, 922, 512, 890] }
];

const years = [2020, 2021, 2022, 2023, 2024];
let currentFrame = 0;
let isPlaying = false;
let animationId = null;

const BAR_HEIGHT = 35;
const GAP = 10;
const MAX_BARS = 5;

function interpolate(start, end, t) {
    return start + (end - start) * t;
}

function getDataAtFrame(frame) {
    const yearIndex = Math.floor(frame / 60);
    const t = (frame % 60) / 60;

    if (yearIndex >= years.length - 1) {
        return companies.map(c => ({
            name: c.name,
            color: c.color,
            value: c.values[years.length - 1]
        }));
    }

    return companies.map(c => ({
        name: c.name,
        color: c.color,
        value: interpolate(c.values[yearIndex], c.values[yearIndex + 1], t)
    }));
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const data = getDataAtFrame(currentFrame);
    const sorted = [...data].sort((a, b) => b.value - a.value).slice(0, MAX_BARS);
    const maxValue = Math.max(...sorted.map(d => d.value));

    const yearIndex = Math.floor(currentFrame / 60);
    const t = (currentFrame % 60) / 60;
    const displayYear = yearIndex < years.length - 1
        ? Math.floor(interpolate(years[yearIndex], years[yearIndex + 1], t))
        : years[years.length - 1];
    yearEl.textContent = displayYear;

    sorted.forEach((item, i) => {
        const y = 20 + i * (BAR_HEIGHT + GAP);
        const barWidth = (item.value / maxValue) * (canvas.width - 120);

        // Bar
        ctx.fillStyle = item.color;
        ctx.beginPath();
        ctx.roundRect(80, y, barWidth, BAR_HEIGHT, 5);
        ctx.fill();

        // Name
        ctx.fillStyle = '#fff';
        ctx.font = '12px Arial';
        ctx.textAlign = 'right';
        ctx.fillText(item.name, 75, y + BAR_HEIGHT / 2 + 4);

        // Value
        ctx.textAlign = 'left';
        ctx.fillText(Math.round(item.value) + 'B', 85 + barWidth, y + BAR_HEIGHT / 2 + 4);
    });
}

function animate() {
    if (!isPlaying) return;

    currentFrame++;
    if (currentFrame >= (years.length - 1) * 60) {
        currentFrame = (years.length - 1) * 60;
        isPlaying = false;
        document.getElementById('playBtn').textContent = '▶️ 播放';
    }

    draw();
    animationId = requestAnimationFrame(animate);
}

document.getElementById('playBtn').addEventListener('click', () => {
    if (isPlaying) {
        isPlaying = false;
        document.getElementById('playBtn').textContent = '▶️ 播放';
    } else {
        if (currentFrame >= (years.length - 1) * 60) {
            currentFrame = 0;
        }
        isPlaying = true;
        document.getElementById('playBtn').textContent = '⏸️ 暫停';
        animate();
    }
});

document.getElementById('resetBtn').addEventListener('click', () => {
    isPlaying = false;
    currentFrame = 0;
    document.getElementById('playBtn').textContent = '▶️ 播放';
    draw();
});

draw();
