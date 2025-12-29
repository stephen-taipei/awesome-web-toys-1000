let state = 'idle', startTime = 0, timeoutId = null;
let times = [], bestTime = Infinity;

function init() {
    const gameArea = document.getElementById('gameArea');
    gameArea.addEventListener('click', handleClick);
    document.getElementById('startBtn').addEventListener('click', startTest);
}

function startTest() {
    const gameArea = document.getElementById('gameArea');
    gameArea.className = 'game-area waiting';
    document.getElementById('instruction').textContent = '等待綠色...';
    document.getElementById('result').textContent = '';
    state = 'waiting';

    const delay = 2000 + Math.random() * 3000;
    timeoutId = setTimeout(() => {
        gameArea.className = 'game-area ready';
        document.getElementById('instruction').textContent = '點擊!';
        state = 'ready';
        startTime = Date.now();
    }, delay);
}

function handleClick() {
    const gameArea = document.getElementById('gameArea');

    if (state === 'idle') {
        startTest();
    } else if (state === 'waiting') {
        clearTimeout(timeoutId);
        gameArea.className = 'game-area early';
        document.getElementById('instruction').textContent = '太早了!';
        document.getElementById('result').textContent = '太早點擊';
        state = 'idle';
    } else if (state === 'ready') {
        const reactionTime = Date.now() - startTime;
        gameArea.className = 'game-area';
        document.getElementById('instruction').textContent = '點擊再試一次';
        document.getElementById('result').textContent = reactionTime + ' ms';

        times.push(reactionTime);
        if (times.length > 5) times.shift();

        if (reactionTime < bestTime) {
            bestTime = reactionTime;
            document.getElementById('bestTime').textContent = bestTime;
        }

        const avg = Math.round(times.reduce((a, b) => a + b, 0) / times.length);
        document.getElementById('avgTime').textContent = avg;

        state = 'idle';
    }
}

document.addEventListener('DOMContentLoaded', init);
