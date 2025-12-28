let targetNumber = 0, attempts = 0, minRange = 1, maxRange = 100;
let history = [], gameOver = false;

function init() {
    document.getElementById('guessBtn').addEventListener('click', makeGuess);
    document.getElementById('newGameBtn').addEventListener('click', newGame);
    document.getElementById('guessInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') makeGuess();
    });
    newGame();
}

function newGame() {
    targetNumber = Math.floor(Math.random() * 100) + 1;
    attempts = 0;
    minRange = 1;
    maxRange = 100;
    history = [];
    gameOver = false;
    document.getElementById('hint').textContent = '我想了一個數字...';
    document.getElementById('attempts').textContent = '0';
    document.getElementById('range').textContent = '1-100';
    document.getElementById('history').innerHTML = '';
    document.getElementById('guessInput').value = '';
    document.getElementById('guessInput').disabled = false;
    document.getElementById('guessBtn').disabled = false;
}

function makeGuess() {
    if (gameOver) return;

    const input = document.getElementById('guessInput');
    const guess = parseInt(input.value);

    if (isNaN(guess) || guess < 1 || guess > 100) {
        document.getElementById('hint').textContent = '請輸入 1-100 的數字!';
        return;
    }

    attempts++;
    document.getElementById('attempts').textContent = attempts;

    let result = '', className = '';
    if (guess === targetNumber) {
        document.getElementById('hint').textContent = '恭喜! 你猜對了!';
        result = '正確!';
        gameOver = true;
        document.getElementById('guessInput').disabled = true;
        document.getElementById('guessBtn').disabled = true;
    } else if (guess < targetNumber) {
        document.getElementById('hint').textContent = '太小了! 再大一點';
        result = '太小';
        className = 'low';
        minRange = Math.max(minRange, guess + 1);
    } else {
        document.getElementById('hint').textContent = '太大了! 再小一點';
        result = '太大';
        className = 'high';
        maxRange = Math.min(maxRange, guess - 1);
    }

    document.getElementById('range').textContent = minRange + '-' + maxRange;

    history.unshift({ guess, result, className });
    renderHistory();
    input.value = '';
    input.focus();
}

function renderHistory() {
    const container = document.getElementById('history');
    container.innerHTML = history.map(h =>
        '<div class="' + h.className + '"><span>' + h.guess + '</span><span>' + h.result + '</span></div>'
    ).join('');
}

document.addEventListener('DOMContentLoaded', init);
