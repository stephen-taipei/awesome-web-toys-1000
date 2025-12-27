let targetNumber = 0;
let maxNumber = 100;
let attempts = 0;
let gameOver = false;
let guessHistory = [];

function init() {
    document.getElementById('guessBtn').addEventListener('click', makeGuess);
    document.getElementById('guessInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') makeGuess();
    });
    document.getElementById('restartBtn').addEventListener('click', startGame);

    document.querySelectorAll('.diff-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            if (gameOver) {
                maxNumber = parseInt(btn.dataset.max);
                document.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                startGame();
            }
        });
    });

    startGame();
}

function startGame() {
    targetNumber = Math.floor(Math.random() * maxNumber) + 1;
    attempts = 0;
    gameOver = false;
    guessHistory = [];

    document.getElementById('maxNum').textContent = maxNumber;
    document.getElementById('guessInput').max = maxNumber;
    document.getElementById('guessInput').value = '';
    document.getElementById('guessInput').disabled = false;
    document.getElementById('guessBtn').disabled = false;
    document.getElementById('feedback').textContent = '';
    document.getElementById('feedback').className = 'feedback';
    document.getElementById('attempts').textContent = '0';
    document.getElementById('history').innerHTML = '';
}

function makeGuess() {
    if (gameOver) return;

    const input = document.getElementById('guessInput');
    const guess = parseInt(input.value);

    if (isNaN(guess) || guess < 1 || guess > maxNumber) {
        showFeedback('請輸入有效數字', '');
        return;
    }

    attempts++;
    document.getElementById('attempts').textContent = attempts;

    let result;
    if (guess === targetNumber) {
        result = 'correct';
        showFeedback('恭喜! 你猜對了!', 'correct');
        endGame();
    } else if (guess < targetNumber) {
        result = 'higher';
        showFeedback('太小了! 再大一點', 'higher');
    } else {
        result = 'lower';
        showFeedback('太大了! 再小一點', 'lower');
    }

    addToHistory(guess, result);
    input.value = '';
    input.focus();
}

function showFeedback(message, className) {
    const feedback = document.getElementById('feedback');
    feedback.textContent = message;
    feedback.className = 'feedback ' + className;
}

function addToHistory(guess, result) {
    guessHistory.push({ guess, result });
    const history = document.getElementById('history');
    const item = document.createElement('span');
    item.className = 'history-item ' + result;
    item.textContent = guess;
    history.appendChild(item);
}

function endGame() {
    gameOver = true;
    document.getElementById('guessInput').disabled = true;
    document.getElementById('guessBtn').disabled = true;
}

document.addEventListener('DOMContentLoaded', init);
