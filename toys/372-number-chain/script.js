const targetEl = document.getElementById('target');
const chainEl = document.getElementById('chain');
const resultEl = document.getElementById('result');
const newBtn = document.getElementById('newBtn');
const scoreEl = document.getElementById('score');

let score = 0;
let target = 0;
let numbers = [];
let selectedNumbers = [];
let selectedOp = null;

function generatePuzzle() {
    const a = Math.floor(Math.random() * 9) + 1;
    const b = Math.floor(Math.random() * 9) + 1;
    const c = Math.floor(Math.random() * 9) + 1;

    const ops = ['+', '-', '×'];
    const op = ops[Math.floor(Math.random() * 3)];

    let result;
    if (op === '+') result = a + b + c;
    else if (op === '-') result = a + b - c;
    else result = a * b + c;

    target = result;
    numbers = [a, b, c].sort(() => Math.random() - 0.5);

    targetEl.textContent = target;
    selectedNumbers = [];
    selectedOp = null;
    resultEl.textContent = '選擇數字和運算符';
    renderChain();
}

function renderChain() {
    chainEl.innerHTML = '';

    numbers.forEach((num, i) => {
        const el = document.createElement('div');
        el.className = 'chain-item number' + (selectedNumbers.includes(i) ? ' selected' : '');
        el.textContent = num;
        el.onclick = () => selectNumber(i);
        chainEl.appendChild(el);
    });

    ['+', '-', '×'].forEach(op => {
        const el = document.createElement('div');
        el.className = 'chain-item operator' + (selectedOp === op ? ' selected' : '');
        el.textContent = op;
        el.onclick = () => selectOperator(op);
        chainEl.appendChild(el);
    });
}

function selectNumber(index) {
    if (selectedNumbers.includes(index)) {
        selectedNumbers = selectedNumbers.filter(i => i !== index);
    } else if (selectedNumbers.length < 3) {
        selectedNumbers.push(index);
    }
    renderChain();
    checkResult();
}

function selectOperator(op) {
    selectedOp = selectedOp === op ? null : op;
    renderChain();
    checkResult();
}

function checkResult() {
    if (selectedNumbers.length < 2 || !selectedOp) {
        resultEl.textContent = '選擇數字和運算符';
        return;
    }

    const nums = selectedNumbers.map(i => numbers[i]);
    let result;

    if (selectedNumbers.length === 2) {
        const [a, b] = nums;
        if (selectedOp === '+') result = a + b;
        else if (selectedOp === '-') result = a - b;
        else result = a * b;
    } else {
        const [a, b, c] = nums;
        if (selectedOp === '+') result = a + b + c;
        else if (selectedOp === '-') result = a - b - c;
        else result = a * b * c;
    }

    resultEl.textContent = `= ${result}`;

    if (result === target) {
        score += 10;
        scoreEl.textContent = score;
        resultEl.textContent = `✅ 正確! = ${result}`;
        setTimeout(generatePuzzle, 1500);
    }
}

newBtn.addEventListener('click', generatePuzzle);
generatePuzzle();
