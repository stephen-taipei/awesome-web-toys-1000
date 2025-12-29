let state = 'idle';
let startTime = 0;
let timeoutId = null;
let results = [];

function init() {
    const gameArea = document.getElementById('gameArea');
    gameArea.addEventListener('click', handleClick);
    document.getElementById('resetBtn').addEventListener('click', resetStats);
    updateDisplay();
}

function handleClick() {
    switch (state) {
        case 'idle':
            startGame();
            break;
        case 'waiting':
            tooEarly();
            break;
        case 'go':
            recordTime();
            break;
        case 'early':
        case 'result':
            resetGame();
            break;
    }
}

function startGame() {
    state = 'waiting';
    updateGameArea('waiting', '等待綠色...');

    const delay = 2000 + Math.random() * 3000;
    timeoutId = setTimeout(() => {
        state = 'go';
        startTime = performance.now();
        updateGameArea('go', '點擊!');
    }, delay);
}

function tooEarly() {
    clearTimeout(timeoutId);
    state = 'early';
    updateGameArea('early', '太早了!', '點擊重試');
}

function recordTime() {
    const reactionTime = Math.round(performance.now() - startTime);
    results.push(reactionTime);
    state = 'result';

    updateGameArea('idle', reactionTime + ' ms', '點擊再試一次');
    updateStats();
    updateHistory();
}

function resetGame() {
    state = 'idle';
    updateGameArea('idle', '點擊開始');
}

function updateGameArea(className, instruction, result = '') {
    const gameArea = document.getElementById('gameArea');
    const instructionEl = document.getElementById('instruction');
    const resultEl = document.getElementById('result');

    gameArea.className = 'game-area ' + className;
    instructionEl.textContent = instruction;
    resultEl.textContent = result;
}

function updateStats() {
    if (results.length === 0) {
        document.getElementById('bestTime').textContent = '-- ms';
        document.getElementById('avgTime').textContent = '-- ms';
        document.getElementById('attempts').textContent = '0';
        return;
    }

    const best = Math.min(...results);
    const avg = Math.round(results.reduce((a, b) => a + b, 0) / results.length);

    document.getElementById('bestTime').textContent = best + ' ms';
    document.getElementById('avgTime').textContent = avg + ' ms';
    document.getElementById('attempts').textContent = results.length;
}

function updateHistory() {
    const historyList = document.getElementById('historyList');
    const best = Math.min(...results);

    historyList.innerHTML = results.slice(-10).map(time => {
        const isBest = time === best;
        return '<div class="history-item' + (isBest ? ' best' : '') + '">' + time + ' ms</div>';
    }).join('');
}

function resetStats() {
    results = [];
    updateStats();
    document.getElementById('historyList').innerHTML = '';
    resetGame();
}

function updateDisplay() {
    updateGameArea('idle', '點擊開始');
}

document.addEventListener('DOMContentLoaded', init);
