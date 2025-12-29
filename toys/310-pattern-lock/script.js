const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const size = 300, gridSize = 3, spacing = size / gridSize;
canvas.width = size; canvas.height = size;

let dots = [], pattern = [], isDrawing = false, currentPos = { x: 0, y: 0 };

function init() {
    for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
            dots.push({
                x: col * spacing + spacing / 2,
                y: row * spacing + spacing / 2,
                id: row * gridSize + col + 1,
                selected: false
            });
        }
    }

    canvas.addEventListener('mousedown', startPattern);
    canvas.addEventListener('mousemove', updatePattern);
    canvas.addEventListener('mouseup', endPattern);

    canvas.addEventListener('touchstart', e => { e.preventDefault(); startPattern(e.touches[0]); });
    canvas.addEventListener('touchmove', e => { e.preventDefault(); updatePattern(e.touches[0]); });
    canvas.addEventListener('touchend', endPattern);

    document.getElementById('clearBtn').addEventListener('click', clearPattern);
    draw();
}

function startPattern(e) {
    clearPattern();
    isDrawing = true;
    updatePattern(e);
}

function updatePattern(e) {
    if (!isDrawing) return;

    const rect = canvas.getBoundingClientRect();
    currentPos.x = e.clientX - rect.left;
    currentPos.y = e.clientY - rect.top;

    dots.forEach(dot => {
        if (!dot.selected) {
            const dist = Math.sqrt((currentPos.x - dot.x) ** 2 + (currentPos.y - dot.y) ** 2);
            if (dist < 30) {
                dot.selected = true;
                pattern.push(dot);
            }
        }
    });

    draw();
}

function endPattern() {
    isDrawing = false;
    draw();

    if (pattern.length > 0) {
        const patternStr = pattern.map(d => d.id).join('-');
        document.getElementById('patternDisplay').textContent = patternStr;
        document.getElementById('status').textContent = '圖案: ' + pattern.length + ' 點';
    }
}

function clearPattern() {
    pattern = [];
    dots.forEach(d => d.selected = false);
    document.getElementById('patternDisplay').textContent = '';
    document.getElementById('status').textContent = '繪製你的圖案';
    draw();
}

function draw() {
    ctx.fillStyle = '#0f0f23';
    ctx.fillRect(0, 0, size, size);

    if (pattern.length > 1) {
        ctx.strokeStyle = '#00d9ff';
        ctx.lineWidth = 5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        ctx.moveTo(pattern[0].x, pattern[0].y);
        for (let i = 1; i < pattern.length; i++) {
            ctx.lineTo(pattern[i].x, pattern[i].y);
        }
        if (isDrawing && pattern.length > 0) {
            ctx.lineTo(currentPos.x, currentPos.y);
        }
        ctx.stroke();
    } else if (isDrawing && pattern.length === 1) {
        ctx.strokeStyle = '#00d9ff';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(pattern[0].x, pattern[0].y);
        ctx.lineTo(currentPos.x, currentPos.y);
        ctx.stroke();
    }

    dots.forEach(dot => {
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, dot.selected ? 20 : 15, 0, Math.PI * 2);

        if (dot.selected) {
            ctx.fillStyle = '#00d9ff';
            ctx.shadowColor = '#00d9ff';
            ctx.shadowBlur = 20;
        } else {
            ctx.fillStyle = '#334';
            ctx.shadowBlur = 0;
        }
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.fillStyle = dot.selected ? '#0f0f23' : '#00d9ff';
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, 5, 0, Math.PI * 2);
        ctx.fill();
    });
}

document.addEventListener('DOMContentLoaded', init);
