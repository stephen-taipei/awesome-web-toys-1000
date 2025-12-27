let score = 0;
let timeLeft = 30;
let combo = 0;
let isPlaying = false;
let gameInterval = null;
let moleTimeout = null;
let activeHole = null;

function init() {
    createGrid();
    document.getElementById('startBtn').addEventListener('click', startGame);
    document.getElementById('restartBtn').addEventListener('click', startGame);
}

function createGrid() {
    const grid = document.getElementById('gameGrid');
    for (let i = 0; i < 9; i++) {
        const hole = document.createElement('div');
        hole.className = 'hole';
        hole.dataset.index = i;
        hole.innerHTML = '<div class="mole"></div>';
        hole.addEventListener('click', () => whack(hole));
        grid.appendChild(hole);
    }
}

function startGame() {
    score = 0;
    timeLeft = 30;
    combo = 0;
    isPlaying = true;

    document.getElementById('startBtn').style.display = 'none';
    document.getElementById('resultPanel').classList.remove('show');
    updateStats();

    gameInterval = setInterval(() => {
        timeLeft--;
        updateStats();
        if (timeLeft <= 0) {
            endGame();
        }
    }, 1000);

    showMole();
}

function showMole() {
    if (!isPlaying) return;

    if (activeHole) {
        activeHole.classList.remove('active', 'hit');
    }

    const holes = document.querySelectorAll('.hole');
    let randomIndex;
    do {
        randomIndex = Math.floor(Math.random() * 9);
    } while (activeHole && activeHole.dataset.index == randomIndex);

    activeHole = holes[randomIndex];
    activeHole.classList.add('active');

    const hideTime = Math.max(400, 1000 - score * 10);
    moleTimeout = setTimeout(() => {
        if (activeHole && activeHole.classList.contains('active') && !activeHole.classList.contains('hit')) {
            activeHole.classList.remove('active');
            combo = 0;
            updateStats();
        }
        if (isPlaying) showMole();
    }, hideTime);
}

function whack(hole) {
    if (!isPlaying) return;
    if (!hole.classList.contains('active')) return;
    if (hole.classList.contains('hit')) return;

    hole.classList.add('hit');
    combo++;
    const points = 10 + combo * 5;
    score += points;
    updateStats();

    clearTimeout(moleTimeout);

    setTimeout(() => {
        hole.classList.remove('active', 'hit');
        if (isPlaying) showMole();
    }, 200);
}

function updateStats() {
    document.getElementById('score').textContent = score;
    document.getElementById('timer').textContent = timeLeft;
    document.getElementById('combo').textContent = combo;
}

function endGame() {
    isPlaying = false;
    clearInterval(gameInterval);
    clearTimeout(moleTimeout);

    if (activeHole) {
        activeHole.classList.remove('active', 'hit');
    }

    document.getElementById('finalScore').textContent = score;
    document.getElementById('resultPanel').classList.add('show');
    document.getElementById('startBtn').style.display = 'block';
    document.getElementById('startBtn').textContent = '再玩一次';
}

document.addEventListener('DOMContentLoaded', init);
