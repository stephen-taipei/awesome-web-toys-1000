let canvas, ctx;
let mode = '1d';
let waveSpeed = 1;
let damping = 0.01;
let grid1D = [], prev1D = [];
let grid2D = [], prev2D = [];
const size1D = 200;
const size2D = 100;

function init() {
    canvas = document.getElementById('waveCanvas');
    ctx = canvas.getContext('2d');
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    initGrids();
    setupControls();
    animate();
}

function resizeCanvas() {
    const container = canvas.parentElement;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = container.clientWidth * dpr;
    canvas.height = 400 * dpr;
    canvas.style.width = container.clientWidth + 'px';
    canvas.style.height = '400px';
    ctx.scale(dpr, dpr);
}

function initGrids() {
    grid1D = new Array(size1D).fill(0);
    prev1D = new Array(size1D).fill(0);
    grid2D = [];
    prev2D = [];
    for (let i = 0; i < size2D; i++) {
        grid2D.push(new Array(size2D).fill(0));
        prev2D.push(new Array(size2D).fill(0));
    }
}

function setupControls() {
    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            mode = btn.dataset.mode;
            initGrids();
        });
    });
    document.getElementById('waveSpeed').addEventListener('input', (e) => {
        waveSpeed = parseFloat(e.target.value);
        document.getElementById('waveSpeedValue').textContent = waveSpeed.toFixed(1);
    });
    document.getElementById('damping').addEventListener('input', (e) => {
        damping = parseFloat(e.target.value);
        document.getElementById('dampingValue').textContent = damping.toFixed(2);
    });
    document.getElementById('dropBtn').addEventListener('click', () => drop(0.5, 0.5));
    document.getElementById('resetBtn').addEventListener('click', initGrids);
    canvas.addEventListener('click', (e) => {
        const rect = canvas.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;
        drop(x, y);
    });
}

function drop(x, y) {
    if (mode === '1d') {
        const idx = Math.floor(x * size1D);
        for (let i = -5; i <= 5; i++) {
            const ii = idx + i;
            if (ii >= 0 && ii < size1D) {
                grid1D[ii] = 50 * Math.exp(-i*i/5);
            }
        }
    } else {
        const cx = Math.floor(x * size2D);
        const cy = Math.floor(y * size2D);
        for (let i = -5; i <= 5; i++) {
            for (let j = -5; j <= 5; j++) {
                const ii = cx + i, jj = cy + j;
                if (ii >= 0 && ii < size2D && jj >= 0 && jj < size2D) {
                    const d = i*i + j*j;
                    grid2D[jj][ii] = 50 * Math.exp(-d/5);
                }
            }
        }
    }
}

function update() {
    const c2 = waveSpeed * waveSpeed * 0.25;
    if (mode === '1d') {
        const next = new Array(size1D).fill(0);
        for (let i = 1; i < size1D - 1; i++) {
            next[i] = 2 * grid1D[i] - prev1D[i] + c2 * (grid1D[i-1] - 2*grid1D[i] + grid1D[i+1]);
            next[i] *= (1 - damping);
        }
        prev1D = grid1D.slice();
        grid1D = next;
    } else {
        const next = [];
        for (let j = 0; j < size2D; j++) next.push(new Array(size2D).fill(0));
        for (let j = 1; j < size2D - 1; j++) {
            for (let i = 1; i < size2D - 1; i++) {
                const lap = grid2D[j][i-1] + grid2D[j][i+1] + grid2D[j-1][i] + grid2D[j+1][i] - 4*grid2D[j][i];
                next[j][i] = 2 * grid2D[j][i] - prev2D[j][i] + c2 * lap;
                next[j][i] *= (1 - damping);
            }
        }
        for (let j = 0; j < size2D; j++) prev2D[j] = grid2D[j].slice();
        grid2D = next;
    }
}

function draw() {
    const width = canvas.width / (window.devicePixelRatio || 1);
    const height = 400;
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, width, height);

    if (mode === '1d') {
        const centerY = height / 2;
        ctx.strokeStyle = 'rgba(255,255,255,0.2)';
        ctx.beginPath(); ctx.moveTo(0, centerY); ctx.lineTo(width, centerY); ctx.stroke();
        ctx.beginPath();
        for (let i = 0; i < size1D; i++) {
            const x = (i / size1D) * width;
            const y = centerY - grid1D[i] * 2;
            if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        const grad = ctx.createLinearGradient(0, 0, width, 0);
        grad.addColorStop(0, '#00ff88'); grad.addColorStop(0.5, '#00ffff'); grad.addColorStop(1, '#00ff88');
        ctx.strokeStyle = grad; ctx.lineWidth = 3; ctx.stroke();
    } else {
        const cellW = width / size2D, cellH = height / size2D;
        for (let j = 0; j < size2D; j++) {
            for (let i = 0; i < size2D; i++) {
                const v = grid2D[j][i];
                const intensity = Math.min(255, Math.abs(v) * 5);
                const r = v > 0 ? intensity : 0;
                const b = v < 0 ? intensity : 0;
                const g = intensity * 0.5;
                ctx.fillStyle = `rgb(${r},${g},${b})`;
                ctx.fillRect(i * cellW, j * cellH, cellW + 1, cellH + 1);
            }
        }
    }
}

function animate() {
    update();
    draw();
    requestAnimationFrame(animate);
}

document.addEventListener('DOMContentLoaded', init);
