const texts = [
    "The quick brown fox jumps over the lazy dog near the river bank.",
    "Pack my box with five dozen liquor jugs for the celebration tonight.",
    "How vexingly quick daft zebras jump through the magical forest.",
    "The five boxing wizards jump quickly at dawn every morning.",
    "Crazy Frederick bought many very exquisite opal jewels last week."
];

let currentText = '', startTime = 0, timerInterval = null;
let timeLeft = 60, isRunning = false;

function init() {
    document.getElementById('startBtn').addEventListener('click', startTest);
    document.getElementById('inputArea').addEventListener('input', checkInput);
    currentText = texts[Math.floor(Math.random() * texts.length)];
    renderText();
}

function startTest() {
    currentText = texts[Math.floor(Math.random() * texts.length)];
    renderText();
    timeLeft = 60;
    isRunning = true;
    startTime = Date.now();
    document.getElementById('inputArea').disabled = false;
    document.getElementById('inputArea').value = '';
    document.getElementById('inputArea').focus();
    document.getElementById('timer').textContent = timeLeft;
    document.getElementById('wpm').textContent = '0';
    document.getElementById('accuracy').textContent = '100';

    timerInterval = setInterval(() => {
        timeLeft--;
        document.getElementById('timer').textContent = timeLeft;
        if (timeLeft <= 0) endTest();
    }, 1000);
}

function renderText(inputLength = 0, errors = []) {
    const display = document.getElementById('textDisplay');
    let html = '';
    for (let i = 0; i < currentText.length; i++) {
        let className = '';
        if (i < inputLength) {
            className = errors.includes(i) ? 'incorrect' : 'correct';
        } else if (i === inputLength) {
            className = 'current';
        }
        html += '<span class="' + className + '">' + currentText[i] + '</span>';
    }
    display.innerHTML = html;
}

function checkInput() {
    if (!isRunning) return;

    const input = document.getElementById('inputArea').value;
    const errors = [];

    for (let i = 0; i < input.length; i++) {
        if (input[i] !== currentText[i]) errors.push(i);
    }

    renderText(input.length, errors);

    const elapsedMinutes = (Date.now() - startTime) / 60000;
    const wordsTyped = input.trim().split(/\s+/).filter(w => w).length;
    const wpm = Math.round(wordsTyped / elapsedMinutes) || 0;
    document.getElementById('wpm').textContent = wpm;

    const accuracy = input.length > 0 ? Math.round((input.length - errors.length) / input.length * 100) : 100;
    document.getElementById('accuracy').textContent = accuracy;

    if (input === currentText) {
        currentText = texts[Math.floor(Math.random() * texts.length)];
        document.getElementById('inputArea').value = '';
        renderText();
    }
}

function endTest() {
    clearInterval(timerInterval);
    isRunning = false;
    document.getElementById('inputArea').disabled = true;
}

document.addEventListener('DOMContentLoaded', init);
