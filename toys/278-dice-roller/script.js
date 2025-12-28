const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
let diceCount = 2, dice = [], isRolling = false, rollFrame = 0;
const size = 300, diceSize = 60;

function init() {
    canvas.width = size; canvas.height = size;
    for (let i = 0; i < diceCount; i++) dice.push({ value: 1, x: 0, y: 0 });
    positionDice();

    document.getElementById('rollBtn').addEventListener('click', roll);
    document.getElementById('addBtn').addEventListener('click', () => { if (diceCount < 6) { diceCount++; dice.push({ value: 1, x: 0, y: 0 }); positionDice(); draw(); }});
    document.getElementById('removeBtn').addEventListener('click', () => { if (diceCount > 1) { diceCount--; dice.pop(); positionDice(); draw(); }});
    canvas.addEventListener('click', roll);
    draw();
}

function positionDice() {
    const cols = Math.ceil(Math.sqrt(diceCount));
    const rows = Math.ceil(diceCount / cols);
    const spacing = 80;
    const startX = (size - (cols - 1) * spacing) / 2;
    const startY = (size - (rows - 1) * spacing) / 2;
    dice.forEach((d, i) => {
        d.x = startX + (i % cols) * spacing;
        d.y = startY + Math.floor(i / cols) * spacing;
    });
}

function roll() {
    if (isRolling) return;
    isRolling = true;
    rollFrame = 0;
    animate();
}

function animate() {
    rollFrame++;
    dice.forEach(d => d.value = Math.floor(Math.random() * 6) + 1);
    draw();
    if (rollFrame < 20) {
        setTimeout(animate, 50);
    } else {
        isRolling = false;
        const total = dice.reduce((sum, d) => sum + d.value, 0);
        document.getElementById('result').textContent = '總計: ' + total;
        const values = dice.map(d => d.value).join(' + ');
        document.getElementById('history').textContent = values + ' = ' + total;
    }
}

function draw() {
    ctx.clearRect(0, 0, size, size);
    dice.forEach(d => drawDie(d.x, d.y, d.value));
}

function drawDie(x, y, value) {
    const s = diceSize / 2;
    ctx.fillStyle = '#fff';
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(x - s, y - s, diceSize, diceSize, 8);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#333';
    const dotSize = 6;
    const patterns = {
        1: [[0, 0]],
        2: [[-1, -1], [1, 1]],
        3: [[-1, -1], [0, 0], [1, 1]],
        4: [[-1, -1], [1, -1], [-1, 1], [1, 1]],
        5: [[-1, -1], [1, -1], [0, 0], [-1, 1], [1, 1]],
        6: [[-1, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [1, 1]]
    };
    const offset = 15;
    patterns[value].forEach(([dx, dy]) => {
        ctx.beginPath();
        ctx.arc(x + dx * offset, y + dy * offset, dotSize, 0, Math.PI * 2);
        ctx.fill();
    });
}

document.addEventListener('DOMContentLoaded', init);
