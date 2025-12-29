let duration = 10;
let timeLeft = 10;
let clickCount = 0;
let isPlaying = false;
let intervalId = null;

function init() {
    document.getElementById('clickBtn').addEventListener('click', handleClick);
    document.getElementById('restartBtn').addEventListener('click', resetGame);

    document.querySelectorAll('.duration-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            if (isPlaying) return;
            duration = parseInt(btn.dataset.duration);
            timeLeft = duration;
            document.querySelectorAll('.duration-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            updateDisplay();
        });
    });

    updateDisplay();
}

function handleClick() {
    if (!isPlaying) {
        startGame();
    }
    clickCount++;
    updateDisplay();
}

function startGame() {
    isPlaying = true;
    clickCount = 0;
    timeLeft = duration;

    document.getElementById('clickBtn').textContent = '繼續點擊!';
    document.getElementById('clickBtn').classList.add('playing');
    document.getElementById('resultPanel').classList.remove('show');

    intervalId = setInterval(() => {
        timeLeft--;
        updateDisplay();

        if (timeLeft <= 0) {
            endGame();
        }
    }, 1000);
}

function endGame() {
    isPlaying = false;
    clearInterval(intervalId);

    const cps = (clickCount / duration).toFixed(1);

    document.getElementById('clickBtn').textContent = '開始點擊!';
    document.getElementById('clickBtn').classList.remove('playing');

    document.getElementById('resultClicks').textContent = clickCount;
    document.getElementById('resultCps').textContent = cps;
    document.getElementById('resultPanel').classList.add('show');
}

function resetGame() {
    clickCount = 0;
    timeLeft = duration;
    document.getElementById('resultPanel').classList.remove('show');
    updateDisplay();
}

function updateDisplay() {
    document.getElementById('timeLeft').textContent = timeLeft;
    document.getElementById('clickCount').textContent = clickCount;

    const elapsed = duration - timeLeft;
    const cps = elapsed > 0 ? (clickCount / elapsed).toFixed(1) : '0.0';
    document.getElementById('cps').textContent = cps;
}

document.addEventListener('DOMContentLoaded', init);
