const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let width = 360, height = 450;
let time = 0;
let hasWind = false;
let season = 0;
let growthProgress = 1;
let isGrowing = false;

const seasons = [
    { name: 'spring', leafColor: '#90ee90', trunkColor: '#8b4513' },
    { name: 'summer', leafColor: '#228b22', trunkColor: '#654321' },
    { name: 'autumn', leafColor: '#ff6347', trunkColor: '#8b4513' },
    { name: 'winter', leafColor: null, trunkColor: '#4a3728' }
];

function init() {
    setupCanvas();

    document.getElementById('windBtn').addEventListener('click', toggleWind);
    document.getElementById('seasonBtn').addEventListener('click', changeSeason);
    document.getElementById('growBtn').addEventListener('click', startGrow);

    gameLoop();
}

function setupCanvas() {
    const wrapper = document.querySelector('.game-wrapper');
    width = Math.min(360, wrapper.clientWidth);
    height = width * 1.25;
    canvas.width = width;
    canvas.height = height;
}

function toggleWind() {
    hasWind = !hasWind;
    document.getElementById('windBtn').classList.toggle('active', hasWind);
}

function changeSeason() {
    season = (season + 1) % seasons.length;
}

function startGrow() {
    if (!isGrowing) {
        isGrowing = true;
        growthProgress = 0;
    }
}

function gameLoop() {
    time += 0.02;

    if (isGrowing) {
        growthProgress += 0.02;
        if (growthProgress >= 1) {
            growthProgress = 1;
            isGrowing = false;
        }
    }

    draw();
    requestAnimationFrame(gameLoop);
}

function draw() {
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, '#87ceeb');
    gradient.addColorStop(0.7, '#98fb98');
    gradient.addColorStop(1, '#8b4513');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    ctx.save();
    ctx.translate(width / 2, height * 0.85);
    drawBranch(height * 0.25 * growthProgress, 0, 10);
    ctx.restore();
}

function drawBranch(len, depth, thickness) {
    if (len < 4 || depth > 10) return;

    const currentSeason = seasons[season];
    const windOffset = hasWind ? Math.sin(time + depth * 0.5) * (depth * 0.02) : 0;

    ctx.strokeStyle = currentSeason.trunkColor;
    ctx.lineWidth = thickness;
    ctx.lineCap = 'round';

    ctx.beginPath();
    ctx.moveTo(0, 0);

    const endX = Math.sin(windOffset) * len;
    const endY = -len;

    ctx.quadraticCurveTo(
        Math.sin(windOffset * 2) * len * 0.3,
        -len * 0.5,
        endX,
        endY
    );
    ctx.stroke();

    ctx.translate(endX, endY);

    if (depth > 5 && currentSeason.leafColor) {
        drawLeaf(currentSeason.leafColor);
    }

    const branches = depth < 3 ? 2 : (Math.random() > 0.3 ? 2 : 1);
    const angleSpread = 0.4 + depth * 0.05;

    for (let i = 0; i < branches; i++) {
        ctx.save();

        let angle;
        if (branches === 2) {
            angle = (i === 0 ? -angleSpread : angleSpread) + windOffset;
        } else {
            angle = (Math.random() - 0.5) * angleSpread * 2 + windOffset;
        }

        ctx.rotate(angle);
        drawBranch(len * 0.7, depth + 1, thickness * 0.7);
        ctx.restore();
    }
}

function drawLeaf(color) {
    const leafSize = 4 + Math.random() * 4;
    const alpha = 0.6 + Math.random() * 0.4;

    ctx.fillStyle = color;
    ctx.globalAlpha = alpha;
    ctx.beginPath();
    ctx.ellipse(0, 0, leafSize, leafSize * 0.6, Math.random() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
}

document.addEventListener('DOMContentLoaded', init);
window.addEventListener('resize', setupCanvas);
