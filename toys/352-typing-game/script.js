const texts = [
    'The quick brown fox jumps over the lazy dog',
    'Pack my box with five dozen liquor jugs',
    'How vexingly quick daft zebras jump',
    'The five boxing wizards jump quickly',
    'Sphinx of black quartz judge my vow'
];

let currentText = '';
let currentIndex = 0;
let correctChars = 0;
let totalChars = 0;
let startTime = null;
let timerInterval = null;
let timeLeft = 60;
let isRunning = false;

function init() {
    document.getElementById('startBtn').addEventListener('click', startGame);
    document.getElementById('input').addEventListener('input', handleInput);
    displayText();
}

function startGame() {
    isRunning = true;
    currentIndex = 0;
    correctChars = 0;
    totalChars = 0;
    timeLeft = 60;
    currentText = texts[Math.floor(Math.random() * texts.length)];

    document.getElementById('input').disabled = false;
    document.getElementById('input').value = '';
    document.getElementById('input').focus();
    document.getElementById('startBtn').textContent = '重新開始';

    startTime = Date.now();
    timerInterval = setInterval(updateTimer, 1000);
    displayText();
}

function displayText() {
    const display = document.getElementById('textDisplay');
    if (!currentText) {
        display.textContent = '點擊開始遊戲';
        return;
    }

    let html = '';
    for (let i = 0; i < currentText.length; i++) {
        if (i < currentIndex) {
            const inputChar = document.getElementById('input').value[i];
            if (inputChar === currentText[i]) {
                html += `<span class="correct">${currentText[i]}</span>`;
            } else {
                html += `<span class="wrong">${currentText[i]}</span>`;
            }
        } else if (i === currentIndex) {
            html += `<span class="current">${currentText[i]}</span>`;
        } else {
            html += currentText[i];
        }
    }
    display.innerHTML = html;
}

function handleInput(e) {
    if (!isRunning) return;

    const inputValue = e.target.value;
    currentIndex = inputValue.length;
    totalChars = inputValue.length;

    correctChars = 0;
    for (let i = 0; i < inputValue.length; i++) {
        if (inputValue[i] === currentText[i]) {
            correctChars++;
        }
    }

    displayText();
    updateStats();

    if (inputValue === currentText) {
        currentText = texts[Math.floor(Math.random() * texts.length)];
        e.target.value = '';
        currentIndex = 0;
        displayText();
    }
}

function updateTimer() {
    timeLeft--;
    document.getElementById('time').textContent = timeLeft;

    if (timeLeft <= 0) {
        endGame();
    }
}

function updateStats() {
    const elapsed = (Date.now() - startTime) / 1000 / 60; // minutes
    const wpm = Math.round((correctChars / 5) / elapsed) || 0;
    const accuracy = totalChars > 0 ? Math.round((correctChars / totalChars) * 100) : 100;

    document.getElementById('wpm').textContent = wpm;
    document.getElementById('accuracy').textContent = accuracy;
}

function endGame() {
    isRunning = false;
    clearInterval(timerInterval);
    document.getElementById('input').disabled = true;
    document.getElementById('textDisplay').innerHTML = '<div style="text-align:center;font-size:1.5rem">時間到! 🎉</div>';
}

document.addEventListener('DOMContentLoaded', init);
