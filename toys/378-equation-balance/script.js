const leftPlate = document.getElementById('leftPlate');
const rightPlate = document.getElementById('rightPlate');
const leftSumEl = document.getElementById('leftSum');
const rightSumEl = document.getElementById('rightSum');
const statusEl = document.getElementById('status');
const numbersEl = document.getElementById('numbers');
const scoreEl = document.getElementById('score');

let score = 0;
let leftNums = [];
let rightNums = [];
let availableNums = [];

function generatePuzzle() {
    leftNums = [];
    rightNums = [];
    availableNums = [];

    for (let i = 0; i < 8; i++) {
        availableNums.push(Math.floor(Math.random() * 9) + 1);
    }

    renderAll();
}

function renderAll() {
    renderPlate(leftPlate, leftNums, 'left');
    renderPlate(rightPlate, rightNums, 'right');
    renderNumbers();
    updateSums();
    checkBalance();
}

function renderPlate(plate, nums, side) {
    plate.innerHTML = nums.map((n, i) =>
        `<div class="num" onclick="removeFromPlate('${side}', ${i})">${n}</div>`
    ).join('');
}

function renderNumbers() {
    numbersEl.innerHTML = availableNums.map((n, i) =>
        `<button class="number" draggable="true" data-index="${i}" data-value="${n}">${n}</button>`
    ).join('');

    numbersEl.querySelectorAll('.number').forEach(btn => {
        btn.addEventListener('dragstart', handleDragStart);
        btn.addEventListener('click', () => addToPlate(parseInt(btn.dataset.index)));
    });
}

function handleDragStart(e) {
    e.dataTransfer.setData('index', e.target.dataset.index);
}

[leftPlate, rightPlate].forEach(plate => {
    plate.addEventListener('dragover', (e) => {
        e.preventDefault();
        plate.classList.add('dragover');
    });
    plate.addEventListener('dragleave', () => plate.classList.remove('dragover'));
    plate.addEventListener('drop', (e) => {
        e.preventDefault();
        plate.classList.remove('dragover');
        const index = parseInt(e.dataTransfer.getData('index'));
        const side = plate.id === 'leftPlate' ? 'left' : 'right';
        addToPlate(index, side);
    });
});

let currentSide = 'left';
function addToPlate(index, side = currentSide) {
    if (index >= availableNums.length) return;
    const num = availableNums[index];
    availableNums.splice(index, 1);

    if (side === 'left') leftNums.push(num);
    else rightNums.push(num);

    currentSide = currentSide === 'left' ? 'right' : 'left';
    renderAll();
}

function removeFromPlate(side, index) {
    let num;
    if (side === 'left') num = leftNums.splice(index, 1)[0];
    else num = rightNums.splice(index, 1)[0];
    availableNums.push(num);
    renderAll();
}

function updateSums() {
    const leftSum = leftNums.reduce((a, b) => a + b, 0);
    const rightSum = rightNums.reduce((a, b) => a + b, 0);
    leftSumEl.textContent = leftSum;
    rightSumEl.textContent = rightSum;
}

function checkBalance() {
    const leftSum = leftNums.reduce((a, b) => a + b, 0);
    const rightSum = rightNums.reduce((a, b) => a + b, 0);

    if (leftNums.length > 0 && rightNums.length > 0 && leftSum === rightSum) {
        statusEl.textContent = '⚖️ 平衡!';
        statusEl.classList.add('balanced');
        score += leftNums.length + rightNums.length;
        scoreEl.textContent = score;
        setTimeout(generatePuzzle, 2000);
    } else if (leftSum > rightSum) {
        statusEl.textContent = '⬅️ 左邊較重';
        statusEl.classList.remove('balanced');
    } else if (rightSum > leftSum) {
        statusEl.textContent = '➡️ 右邊較重';
        statusEl.classList.remove('balanced');
    } else {
        statusEl.textContent = '點擊數字加到天平上';
        statusEl.classList.remove('balanced');
    }
}

generatePuzzle();
