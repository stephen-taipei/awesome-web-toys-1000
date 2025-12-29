const targetEl = document.getElementById('target');
const currentEl = document.getElementById('current');
const movesEl = document.getElementById('moves');
const buttonsEl = document.getElementById('buttons');
const resultEl = document.getElementById('result');
const levelEl = document.getElementById('level');
const resetBtn = document.getElementById('resetBtn');
const newBtn = document.getElementById('newBtn');

let level = 1;
let target = 0;
let current = 0;
let startValue = 0;
let moves = 0;
let maxMoves = 0;
let operations = [];

const operationTypes = [
    { label: '+1', fn: x => x + 1 },
    { label: '+2', fn: x => x + 2 },
    { label: '+3', fn: x => x + 3 },
    { label: '-1', fn: x => x - 1 },
    { label: '-2', fn: x => x - 2 },
    { label: '×2', fn: x => x * 2 },
    { label: '×3', fn: x => x * 3 },
    { label: '÷2', fn: x => Math.floor(x / 2) },
    { label: '+10', fn: x => x + 10 },
    { label: '-5', fn: x => x - 5 },
    { label: '²', fn: x => x * x },
    { label: '±', fn: x => -x }
];

function generatePuzzle() {
    const numOps = Math.min(3 + Math.floor(level / 3), 6);
    maxMoves = 3 + Math.floor(level / 2);
    moves = maxMoves;

    operations = [];
    const shuffled = [...operationTypes].sort(() => Math.random() - 0.5);
    for (let i = 0; i < numOps; i++) {
        operations.push(shuffled[i]);
    }

    startValue = Math.floor(Math.random() * 10);
    current = startValue;

    let testValue = startValue;
    const steps = Math.floor(Math.random() * maxMoves) + 1;
    for (let i = 0; i < steps; i++) {
        const op = operations[Math.floor(Math.random() * operations.length)];
        testValue = op.fn(testValue);
    }
    target = testValue;

    current = startValue;
    renderAll();
    resultEl.textContent = '';
}

function renderAll() {
    targetEl.textContent = target;
    currentEl.textContent = current;
    movesEl.textContent = moves;

    buttonsEl.innerHTML = operations.map((op, i) =>
        `<button class="btn" data-index="${i}" ${moves <= 0 ? 'disabled' : ''}>${op.label}</button>`
    ).join('');

    buttonsEl.querySelectorAll('.btn').forEach(btn => {
        btn.onclick = () => applyOperation(parseInt(btn.dataset.index));
    });
}

function applyOperation(index) {
    if (moves <= 0) return;

    const op = operations[index];
    current = op.fn(current);
    moves--;

    renderAll();
    checkWin();
}

function checkWin() {
    if (current === target) {
        level++;
        levelEl.textContent = level;
        resultEl.textContent = '🎉 過關!';
        setTimeout(generatePuzzle, 1500);
    } else if (moves <= 0) {
        resultEl.textContent = `❌ 失敗! 答案是從 ${startValue} 開始`;
    }
}

function reset() {
    current = startValue;
    moves = maxMoves;
    resultEl.textContent = '';
    renderAll();
}

resetBtn.addEventListener('click', reset);
newBtn.addEventListener('click', generatePuzzle);

generatePuzzle();
