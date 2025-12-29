let grid = [];
let score = 0;
let highScore = 0;

function init() {
    document.getElementById('newGameBtn').addEventListener('click', newGame);
    document.addEventListener('keydown', handleKeydown);
    document.querySelectorAll('.control-btn').forEach(btn => {
        btn.addEventListener('click', () => move(btn.dataset.dir));
    });

    setupSwipe();
    newGame();
}

function setupSwipe() {
    const gameGrid = document.getElementById('gameGrid');
    let startX, startY;

    gameGrid.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
    });

    gameGrid.addEventListener('touchend', (e) => {
        const dx = e.changedTouches[0].clientX - startX;
        const dy = e.changedTouches[0].clientY - startY;
        if (Math.abs(dx) > Math.abs(dy)) {
            move(dx > 0 ? 'right' : 'left');
        } else {
            move(dy > 0 ? 'down' : 'up');
        }
    });
}

function newGame() {
    grid = [[0,0,0,0], [0,0,0,0], [0,0,0,0], [0,0,0,0]];
    score = 0;
    addRandomTile();
    addRandomTile();
    render();
}

function addRandomTile() {
    const empty = [];
    for (let y = 0; y < 4; y++) {
        for (let x = 0; x < 4; x++) {
            if (grid[y][x] === 0) empty.push({x, y});
        }
    }
    if (empty.length > 0) {
        const pos = empty[Math.floor(Math.random() * empty.length)];
        grid[pos.y][pos.x] = Math.random() < 0.9 ? 2 : 4;
    }
}

function handleKeydown(e) {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
        const dir = e.key.replace('Arrow', '').toLowerCase();
        move(dir);
    }
}

function move(dir) {
    const oldGrid = JSON.stringify(grid);

    if (dir === 'left') {
        for (let y = 0; y < 4; y++) {
            grid[y] = slideAndMerge(grid[y]);
        }
    } else if (dir === 'right') {
        for (let y = 0; y < 4; y++) {
            grid[y] = slideAndMerge(grid[y].reverse()).reverse();
        }
    } else if (dir === 'up') {
        for (let x = 0; x < 4; x++) {
            const col = [grid[0][x], grid[1][x], grid[2][x], grid[3][x]];
            const merged = slideAndMerge(col);
            for (let y = 0; y < 4; y++) grid[y][x] = merged[y];
        }
    } else if (dir === 'down') {
        for (let x = 0; x < 4; x++) {
            const col = [grid[3][x], grid[2][x], grid[1][x], grid[0][x]];
            const merged = slideAndMerge(col);
            for (let y = 0; y < 4; y++) grid[3-y][x] = merged[y];
        }
    }

    if (JSON.stringify(grid) !== oldGrid) {
        addRandomTile();
        render();
        checkGameOver();
    }
}

function slideAndMerge(row) {
    let arr = row.filter(v => v !== 0);
    for (let i = 0; i < arr.length - 1; i++) {
        if (arr[i] === arr[i + 1]) {
            arr[i] *= 2;
            score += arr[i];
            arr.splice(i + 1, 1);
        }
    }
    while (arr.length < 4) arr.push(0);
    return arr;
}

function render() {
    const gameGrid = document.getElementById('gameGrid');
    gameGrid.innerHTML = '';

    for (let y = 0; y < 4; y++) {
        for (let x = 0; x < 4; x++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            const value = grid[y][x];
            if (value > 0) {
                cell.textContent = value;
                cell.dataset.value = value;
            }
            gameGrid.appendChild(cell);
        }
    }

    document.getElementById('score').textContent = score;
    if (score > highScore) {
        highScore = score;
        document.getElementById('highScore').textContent = highScore;
    }
}

function checkGameOver() {
    for (let y = 0; y < 4; y++) {
        for (let x = 0; x < 4; x++) {
            if (grid[y][x] === 0) return;
            if (x < 3 && grid[y][x] === grid[y][x+1]) return;
            if (y < 3 && grid[y][x] === grid[y+1][x]) return;
        }
    }
    setTimeout(() => alert('遊戲結束! 分數: ' + score), 100);
}

document.addEventListener('DOMContentLoaded', init);
