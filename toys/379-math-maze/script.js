const mazeEl = document.getElementById('maze');
const questionArea = document.getElementById('questionArea');
const questionEl = document.getElementById('question');
const optionsEl = document.getElementById('options');
const resultEl = document.getElementById('result');
const levelEl = document.getElementById('level');

let level = 1;
let playerPos = 0;
let goalPos = 24;
let currentLock = null;
let correctAnswer = 0;

const mazeTemplates = [
    [0,1,0,0,0, 0,1,0,1,0, 0,0,0,1,0, 1,1,0,0,0, 0,0,0,1,2],
    [0,0,0,1,0, 1,1,0,1,0, 0,0,0,0,0, 0,1,1,1,0, 0,0,0,0,2],
    [0,1,0,0,0, 0,1,0,1,0, 0,0,0,1,0, 0,1,0,0,0, 0,0,0,1,2]
];

let maze = [];
let locks = [];

function generateMaze() {
    const template = mazeTemplates[level % mazeTemplates.length];
    maze = [...template];
    playerPos = 0;
    goalPos = 24;

    locks = [];
    const pathIndices = maze.map((v, i) => v === 0 ? i : -1).filter(i => i > 0 && i < 24);
    const numLocks = Math.min(2 + level, pathIndices.length);
    const shuffled = pathIndices.sort(() => Math.random() - 0.5).slice(0, numLocks);
    shuffled.forEach(i => locks.push(i));

    renderMaze();
    resultEl.textContent = '到達終點!';
}

function renderMaze() {
    mazeEl.innerHTML = maze.map((cell, i) => {
        if (i === playerPos) return `<div class="cell player">🧑</div>`;
        if (i === goalPos) return `<div class="cell goal">🏁</div>`;
        if (cell === 1) return `<div class="cell wall"></div>`;
        if (locks.includes(i)) return `<div class="cell locked" data-pos="${i}">🔒</div>`;
        return `<div class="cell path unlocked" data-pos="${i}"></div>`;
    }).join('');

    mazeEl.querySelectorAll('.cell.locked, .cell.path').forEach(cell => {
        cell.onclick = () => tryMove(parseInt(cell.dataset.pos));
    });
}

function tryMove(pos) {
    const playerRow = Math.floor(playerPos / 5);
    const playerCol = playerPos % 5;
    const targetRow = Math.floor(pos / 5);
    const targetCol = pos % 5;

    const isAdjacent = Math.abs(playerRow - targetRow) + Math.abs(playerCol - targetCol) === 1;
    if (!isAdjacent) return;

    if (locks.includes(pos)) {
        currentLock = pos;
        showQuestion();
    } else if (maze[pos] !== 1) {
        playerPos = pos;
        renderMaze();
        checkWin();
    }
}

function showQuestion() {
    const ops = ['+', '-', '×'];
    const op = ops[Math.floor(Math.random() * 3)];
    let a, b;

    if (op === '×') {
        a = Math.floor(Math.random() * 10) + 2;
        b = Math.floor(Math.random() * 10) + 2;
        correctAnswer = a * b;
    } else if (op === '+') {
        a = Math.floor(Math.random() * 50) + 10;
        b = Math.floor(Math.random() * 50) + 10;
        correctAnswer = a + b;
    } else {
        a = Math.floor(Math.random() * 50) + 30;
        b = Math.floor(Math.random() * 30) + 1;
        correctAnswer = a - b;
    }

    questionEl.textContent = `${a} ${op} ${b} = ?`;

    const wrongs = new Set();
    while (wrongs.size < 3) {
        const wrong = correctAnswer + (Math.random() > 0.5 ? 1 : -1) * (Math.floor(Math.random() * 10) + 1);
        if (wrong !== correctAnswer && wrong > 0) wrongs.add(wrong);
    }

    const allOptions = [...wrongs, correctAnswer].sort(() => Math.random() - 0.5);
    optionsEl.innerHTML = allOptions.map(opt =>
        `<button class="option" data-answer="${opt}">${opt}</button>`
    ).join('');

    optionsEl.querySelectorAll('.option').forEach(btn => {
        btn.onclick = () => checkAnswer(parseInt(btn.dataset.answer));
    });

    questionArea.classList.add('active');
}

function checkAnswer(answer) {
    questionArea.classList.remove('active');

    if (answer === correctAnswer) {
        locks = locks.filter(l => l !== currentLock);
        playerPos = currentLock;
        resultEl.textContent = '✅ 解鎖成功!';
        renderMaze();
        checkWin();
    } else {
        resultEl.textContent = '❌ 答案錯誤!';
    }
    currentLock = null;
}

function checkWin() {
    if (playerPos === goalPos) {
        level++;
        levelEl.textContent = level;
        resultEl.textContent = '🎉 過關!';
        setTimeout(generateMaze, 1500);
    }
}

generateMaze();
