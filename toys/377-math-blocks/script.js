const gridEl = document.getElementById('grid');
const targetSumEl = document.getElementById('targetSum');
const currentSumEl = document.getElementById('currentSum');
const resultEl = document.getElementById('result');
const scoreEl = document.getElementById('score');

const TARGET = 10;
let score = 0;
let blocks = [];
let selectedIndices = [];

function generateBlocks() {
    blocks = [];
    for (let i = 0; i < 16; i++) {
        blocks.push(Math.floor(Math.random() * 9) + 1);
    }
    selectedIndices = [];
    renderGrid();
}

function renderGrid() {
    gridEl.innerHTML = blocks.map((num, i) => {
        if (num === null) {
            return `<div class="block cleared"></div>`;
        }
        const isSelected = selectedIndices.includes(i);
        return `<button class="block ${isSelected ? 'selected' : ''}" data-index="${i}">${num}</button>`;
    }).join('');

    gridEl.querySelectorAll('.block:not(.cleared)').forEach(btn => {
        btn.onclick = () => toggleBlock(parseInt(btn.dataset.index));
    });

    updateSum();
}

function toggleBlock(index) {
    if (selectedIndices.includes(index)) {
        selectedIndices = selectedIndices.filter(i => i !== index);
    } else {
        selectedIndices.push(index);
    }
    renderGrid();
    checkSum();
}

function updateSum() {
    const sum = selectedIndices.reduce((acc, i) => acc + blocks[i], 0);
    currentSumEl.textContent = sum;
}

function checkSum() {
    const sum = selectedIndices.reduce((acc, i) => acc + blocks[i], 0);

    if (sum === TARGET) {
        score += selectedIndices.length * 10;
        scoreEl.textContent = score;
        resultEl.textContent = `✅ 消除 ${selectedIndices.length} 個方塊!`;

        selectedIndices.forEach(i => blocks[i] = null);
        selectedIndices = [];

        setTimeout(() => {
            fillEmptyBlocks();
            resultEl.textContent = '';
        }, 500);
    } else if (sum > TARGET) {
        resultEl.textContent = '⚠️ 超過了!';
    } else {
        resultEl.textContent = '';
    }
}

function fillEmptyBlocks() {
    blocks = blocks.map(b => b === null ? Math.floor(Math.random() * 9) + 1 : b);
    renderGrid();
}

targetSumEl.textContent = TARGET;
generateBlocks();
