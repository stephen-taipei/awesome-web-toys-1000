const texts = [
    "The quick brown fox jumps over the lazy dog near the riverbank.",
    "Programming is the art of telling a computer what to do step by step.",
    "A journey of a thousand miles begins with a single step forward.",
    "Practice makes perfect when you work hard and stay focused daily.",
    "Success comes to those who believe in their dreams and never give up."
];

let currentText = '';
let typedChars = 0;
let correctChars = 0;
let wrongChars = 0;
let timeLeft = 60;
let isPlaying = false;
let timerInterval = null;
let startTime = 0;

function init() {
    document.getElementById('startBtn').addEventListener('click', startGame);
    document.getElementById('restartBtn').addEventListener('click', startGame);
    document.getElementById('inputArea').addEventListener('input', handleInput);
}

function startGame() {
    currentText = texts[Math.floor(Math.random() * texts.length)];
    typedChars = 0;
    correctChars = 0;
    wrongChars = 0;
    timeLeft = 60;
    isPlaying = true;
    startTime = Date.now();

    document.getElementById('startBtn').style.display = 'none';
    document.getElementById('resultPanel').classList.remove('show');
    document.getElementById('inputArea').disabled = false;
    document.getElementById('inputArea').value = '';
    document.getElementById('inputArea').focus();

    renderText();
    updateStats();

    timerInterval = setInterval(() => {
        timeLeft--;
        document.getElementById('timer').textContent = timeLeft;
        updateWPM();
        if (timeLeft <= 0) endGame();
    }, 1000);
}

function renderText() {
    const display = document.getElementById('textDisplay');
    const input = document.getElementById('inputArea').value;

    let html = '';
    for (let i = 0; i < currentText.length; i++) {
        let className = '';
        if (i < input.length) {
            className = input[i] === currentText[i] ? 'correct' : 'wrong';
        } else if (i === input.length) {
            className = 'current';
        }
        html += '<span class="' + className + '">' + currentText[i] + '</span>';
    }
    display.innerHTML = html;
}

function handleInput() {
    if (!isPlaying) return;

    const input = document.getElementById('inputArea').value;
    typedChars = input.length;

    correctChars = 0;
    wrongChars = 0;
    for (let i = 0; i < input.length; i++) {
        if (i < currentText.length && input[i] === currentText[i]) {
            correctChars++;
        } else {
            wrongChars++;
        }
    }

    renderText();
    updateStats();

    if (input === currentText) {
        currentText = texts[Math.floor(Math.random() * texts.length)];
        document.getElementById('inputArea').value = '';
        renderText();
    }
}

function updateStats() {
    const accuracy = typedChars > 0 ? Math.round((correctChars / typedChars) * 100) : 100;
    document.getElementById('accuracy').textContent = accuracy;
}

function updateWPM() {
    const elapsed = (Date.now() - startTime) / 1000 / 60;
    const words = correctChars / 5;
    const wpm = elapsed > 0 ? Math.round(words / elapsed) : 0;
    document.getElementById('wpm').textContent = wpm;
}

function endGame() {
    isPlaying = false;
    clearInterval(timerInterval);

    const elapsed = 60 / 60;
    const words = correctChars / 5;
    const wpm = Math.round(words / elapsed);
    const accuracy = typedChars > 0 ? Math.round((correctChars / typedChars) * 100) : 0;

    document.getElementById('inputArea').disabled = true;
    document.getElementById('finalWpm').textContent = wpm;
    document.getElementById('finalAccuracy').textContent = accuracy + '%';
    document.getElementById('resultPanel').classList.add('show');
    document.getElementById('startBtn').style.display = 'block';
    document.getElementById('startBtn').textContent = '再測一次';
}

document.addEventListener('DOMContentLoaded', init);
