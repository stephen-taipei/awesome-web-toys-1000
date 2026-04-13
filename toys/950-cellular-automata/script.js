const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 370;
canvas.height = 300;

const cellSize = 3;
const cols = Math.floor(canvas.width / cellSize);
const rows = Math.floor(canvas.height / cellSize);

const rules = [30, 90, 110, 150, 182];
let ruleIndex = 0;
let cells = [];
let currentRow = 0;

function init() {
    cells = new Array(cols).fill(0);
    cells[Math.floor(cols / 2)] = 1;
    currentRow = 0;

    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawRow();
}

function changeRule() {
    ruleIndex = (ruleIndex + 1) % rules.length;
    init();
}

function applyRule(left, center, right) {
    const rule = rules[ruleIndex];
    const index = (left << 2) | (center << 1) | right;
    return (rule >> index) & 1;
}

function nextGeneration() {
    const newCells = new Array(cols).fill(0);

    for (let i = 0; i < cols; i++) {
        const left = cells[(i - 1 + cols) % cols];
        const center = cells[i];
        const right = cells[(i + 1) % cols];
        newCells[i] = applyRule(left, center, right);
    }

    cells = newCells;
    currentRow++;
}

function drawRow() {
    for (let i = 0; i < cols; i++) {
        if (cells[i]) {
            const hue = 15 + (currentRow / rows) * 30;
            ctx.fillStyle = `hsl(${hue}, 80%, 50%)`;
            ctx.fillRect(i * cellSize, currentRow * cellSize, cellSize, cellSize);
        }
    }
}

function drawInfo() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(10, 10, 100, 30);

    ctx.fillStyle = '#FF7043';
    ctx.font = '11px Arial';
    ctx.fillText(`Rule ${rules[ruleIndex]}`, 20, 28);
}

function animate() {
    if (currentRow < rows) {
        nextGeneration();
        drawRow();
    } else {
        setTimeout(init, 2000);
    }

    drawInfo();
    requestAnimationFrame(animate);
}

document.getElementById('ruleBtn').addEventListener('click', changeRule);

init();
animate();
