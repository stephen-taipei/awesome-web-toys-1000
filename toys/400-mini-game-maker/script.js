const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const toolsEl = document.getElementById('tools');
const resultEl = document.getElementById('result');

const GRID = 30;
const COLS = canvas.width / GRID;
const ROWS = canvas.height / GRID;

let mode = 'edit';
let currentTool = 'player';
let level = Array(ROWS).fill(null).map(() => Array(COLS).fill(null));
let player = { x: 0, y: 0, startX: 0, startY: 0 };
let coins = 0;
let totalCoins = 0;
let gameWon = false;

const elements = {
    player: { color: '#f1c40f', emoji: '😊' },
    wall: { color: '#2c3e50', emoji: '⬛' },
    coin: { color: '#f39c12', emoji: '⭐' },
    goal: { color: '#27ae60', emoji: '🚩' }
};

document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelector('.mode-btn.active').classList.remove('active');
        btn.classList.add('active');
        mode = btn.dataset.mode;
        toolsEl.style.display = mode === 'edit' ? 'flex' : 'none';

        if (mode === 'play') {
            startGame();
        } else {
            resetGame();
        }
    });
});

document.querySelectorAll('.tool-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelector('.tool-btn.active').classList.remove('active');
        btn.classList.add('active');
        currentTool = btn.dataset.tool;
    });
});

function placeElement(x, y) {
    if (mode !== 'edit') return;

    const col = Math.floor(x / GRID);
    const row = Math.floor(y / GRID);

    if (col < 0 || col >= COLS || row < 0 || row >= ROWS) return;

    if (currentTool === 'erase') {
        level[row][col] = null;
    } else if (currentTool === 'player') {
        // Remove old player position
        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                if (level[r][c] === 'player') level[r][c] = null;
            }
        }
        level[row][col] = 'player';
        player.startX = col;
        player.startY = row;
    } else {
        level[row][col] = currentTool;
    }

    draw();
}

function startGame() {
    player.x = player.startX;
    player.y = player.startY;
    coins = 0;
    totalCoins = 0;
    gameWon = false;

    // Count coins
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            if (level[r][c] === 'coin') totalCoins++;
        }
    }

    resultEl.textContent = `金幣: ${coins}/${totalCoins} - 使用方向鍵移動!`;
    draw();
}

function resetGame() {
    player.x = player.startX;
    player.y = player.startY;
    gameWon = false;
    resultEl.textContent = '放置元素來創建你的遊戲!';
    draw();
}

function movePlayer(dx, dy) {
    if (mode !== 'play' || gameWon) return;

    const newX = player.x + dx;
    const newY = player.y + dy;

    if (newX < 0 || newX >= COLS || newY < 0 || newY >= ROWS) return;
    if (level[newY][newX] === 'wall') return;

    player.x = newX;
    player.y = newY;

    // Collect coin
    if (level[newY][newX] === 'coin') {
        level[newY][newX] = null;
        coins++;
    }

    // Check goal
    if (level[newY][newX] === 'goal') {
        gameWon = true;
        resultEl.textContent = `🎉 恭喜過關! 收集了 ${coins}/${totalCoins} 金幣!`;
    } else {
        resultEl.textContent = `金幣: ${coins}/${totalCoins}`;
    }

    draw();
}

function draw() {
    ctx.fillStyle = '#2d3436';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    for (let i = 0; i <= COLS; i++) {
        ctx.beginPath();
        ctx.moveTo(i * GRID, 0);
        ctx.lineTo(i * GRID, canvas.height);
        ctx.stroke();
    }
    for (let i = 0; i <= ROWS; i++) {
        ctx.beginPath();
        ctx.moveTo(0, i * GRID);
        ctx.lineTo(canvas.width, i * GRID);
        ctx.stroke();
    }

    // Draw elements
    ctx.font = '20px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            const elem = level[r][c];
            if (elem && elements[elem]) {
                if (mode === 'play' && elem === 'player') continue;
                ctx.fillStyle = elements[elem].color;
                ctx.fillRect(c * GRID + 2, r * GRID + 2, GRID - 4, GRID - 4);
                ctx.fillText(elements[elem].emoji, c * GRID + GRID/2, r * GRID + GRID/2);
            }
        }
    }

    // Draw player in play mode
    if (mode === 'play') {
        ctx.fillStyle = elements.player.color;
        ctx.fillRect(player.x * GRID + 2, player.y * GRID + 2, GRID - 4, GRID - 4);
        ctx.fillText(gameWon ? '🎉' : '😊', player.x * GRID + GRID/2, player.y * GRID + GRID/2);
    }
}

canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    placeElement(e.clientX - rect.left, e.clientY - rect.top);
});

let isDrawing = false;
canvas.addEventListener('mousedown', () => { isDrawing = true; });
canvas.addEventListener('mouseup', () => { isDrawing = false; });
canvas.addEventListener('mousemove', (e) => {
    if (!isDrawing) return;
    const rect = canvas.getBoundingClientRect();
    placeElement(e.clientX - rect.left, e.clientY - rect.top);
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp') movePlayer(0, -1);
    if (e.key === 'ArrowDown') movePlayer(0, 1);
    if (e.key === 'ArrowLeft') movePlayer(-1, 0);
    if (e.key === 'ArrowRight') movePlayer(1, 0);
});

document.getElementById('clear').addEventListener('click', () => {
    level = Array(ROWS).fill(null).map(() => Array(COLS).fill(null));
    player = { x: 0, y: 0, startX: 0, startY: 0 };
    draw();
});

draw();
