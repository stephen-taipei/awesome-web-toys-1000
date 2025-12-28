const gridEl = document.getElementById('grid');
const scoreEl = document.getElementById('score');
const timerEl = document.getElementById('timer');
const resultEl = document.getElementById('result');
const startBtn = document.getElementById('startBtn');

let score = 0;
let timeLeft = 30;
let gameInterval = null;
let isPlaying = false;

function isPrime(n) {
    if (n < 2) return false;
    if (n === 2) return true;
    if (n % 2 === 0) return false;
    for (let i = 3; i <= Math.sqrt(n); i += 2) {
        if (n % i === 0) return false;
    }
    return true;
}

function generateGrid() {
    const numbers = [];
    const primes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47];
    const nonPrimes = [];

    for (let i = 4; i <= 50; i++) {
        if (!isPrime(i)) nonPrimes.push(i);
    }

    const numPrimes = Math.floor(Math.random() * 4) + 3;
    const shuffledPrimes = primes.sort(() => Math.random() - 0.5).slice(0, numPrimes);
    const shuffledNonPrimes = nonPrimes.sort(() => Math.random() - 0.5).slice(0, 12 - numPrimes);

    numbers.push(...shuffledPrimes, ...shuffledNonPrimes);
    numbers.sort(() => Math.random() - 0.5);

    gridEl.innerHTML = numbers.map(num =>
        `<button class="cell" data-num="${num}" ${!isPlaying ? 'disabled' : ''}>${num}</button>`
    ).join('');

    if (isPlaying) {
        gridEl.querySelectorAll('.cell').forEach(cell => {
            cell.onclick = () => checkNumber(cell, parseInt(cell.dataset.num));
        });
    }
}

function checkNumber(cell, num) {
    if (cell.disabled) return;
    cell.disabled = true;

    if (isPrime(num)) {
        cell.classList.add('correct');
        score += 10;
        scoreEl.textContent = score;
    } else {
        cell.classList.add('wrong');
        score = Math.max(0, score - 5);
        scoreEl.textContent = score;
    }

    const remaining = gridEl.querySelectorAll('.cell:not(.correct):not(.wrong)');
    const hasPrimes = Array.from(remaining).some(c => isPrime(parseInt(c.dataset.num)));

    if (!hasPrimes || remaining.length === 0) {
        generateGrid();
    }
}

function startGame() {
    score = 0;
    timeLeft = 30;
    isPlaying = true;
    scoreEl.textContent = '0';
    timerEl.textContent = '30';
    resultEl.textContent = '';
    startBtn.disabled = true;
    startBtn.textContent = '遊戲中...';

    generateGrid();

    gameInterval = setInterval(() => {
        timeLeft--;
        timerEl.textContent = timeLeft;
        if (timeLeft <= 0) endGame();
    }, 1000);
}

function endGame() {
    isPlaying = false;
    clearInterval(gameInterval);
    startBtn.disabled = false;
    startBtn.textContent = '再玩一次';
    resultEl.textContent = `🏆 最終分數: ${score}`;

    gridEl.querySelectorAll('.cell').forEach(cell => {
        cell.disabled = true;
        if (isPrime(parseInt(cell.dataset.num)) && !cell.classList.contains('correct')) {
            cell.style.border = '3px solid #00b894';
        }
    });
}

startBtn.addEventListener('click', startGame);
generateGrid();
