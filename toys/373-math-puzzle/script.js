const equationEl = document.getElementById('equation');
const choicesEl = document.getElementById('choices');
const resultEl = document.getElementById('result');
const scoreEl = document.getElementById('score');

let score = 0;
let blanks = [];
let answer = null;
let usedChoices = [];

function generatePuzzle() {
    const a = Math.floor(Math.random() * 10) + 1;
    const b = Math.floor(Math.random() * 10) + 1;
    const ops = ['+', '-', '×'];
    const op = ops[Math.floor(Math.random() * 3)];

    let result;
    if (op === '+') result = a + b;
    else if (op === '-') result = a - b;
    else result = a * b;

    const blankPos = Math.floor(Math.random() * 3);
    blanks = [];
    usedChoices = [];

    if (blankPos === 0) {
        answer = a;
        blanks = [null, op, b, '=', result];
    } else if (blankPos === 1) {
        answer = b;
        blanks = [a, op, null, '=', result];
    } else {
        answer = result;
        blanks = [a, op, b, '=', null];
    }

    renderEquation();
    renderChoices();
    resultEl.textContent = '填入正確的數字';
}

function renderEquation() {
    equationEl.innerHTML = blanks.map((item, i) => {
        if (item === null) {
            return `<div class="eq-blank" data-index="${i}"></div>`;
        }
        return `<span class="eq-item">${item}</span>`;
    }).join('');

    equationEl.querySelectorAll('.eq-blank').forEach(blank => {
        blank.onclick = () => clearBlank(parseInt(blank.dataset.index));
    });
}

function renderChoices() {
    const wrongChoices = [];
    while (wrongChoices.length < 3) {
        const wrong = Math.floor(Math.random() * 20) + 1;
        if (wrong !== answer && !wrongChoices.includes(wrong)) {
            wrongChoices.push(wrong);
        }
    }

    const allChoices = [...wrongChoices, answer].sort(() => Math.random() - 0.5);

    choicesEl.innerHTML = allChoices.map(num =>
        `<button class="choice ${usedChoices.includes(num) ? 'used' : ''}" data-num="${num}">${num}</button>`
    ).join('');

    choicesEl.querySelectorAll('.choice:not(.used)').forEach(btn => {
        btn.onclick = () => selectChoice(parseInt(btn.dataset.num));
    });
}

function selectChoice(num) {
    const blankIndex = blanks.findIndex(b => b === null);
    if (blankIndex === -1) return;

    blanks[blankIndex] = num;
    usedChoices.push(num);
    renderEquation();
    renderChoices();
    checkAnswer();
}

function clearBlank(index) {
    if (blanks[index] !== null && typeof blanks[index] === 'number') {
        usedChoices = usedChoices.filter(n => n !== blanks[index]);
        blanks[index] = null;
        renderEquation();
        renderChoices();
        resultEl.textContent = '填入正確的數字';
    }
}

function checkAnswer() {
    if (blanks.includes(null)) return;

    const filled = blanks.find((b, i) => typeof b === 'number' && i !== 0 && i !== 2 && i !== 4) ||
                   (typeof blanks[0] === 'number' && blanks[0]) ||
                   (typeof blanks[2] === 'number' && blanks[2]) ||
                   (typeof blanks[4] === 'number' && blanks[4]);

    if (filled === answer) {
        score += 10;
        scoreEl.textContent = score;
        resultEl.textContent = '✅ 正確!';
        setTimeout(generatePuzzle, 1500);
    } else {
        resultEl.textContent = '❌ 再試一次';
    }
}

generatePuzzle();
