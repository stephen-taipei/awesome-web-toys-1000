const colors = [
    { name: '紅色', hex: '#e74c3c' },
    { name: '藍色', hex: '#3498db' },
    { name: '綠色', hex: '#2ecc71' },
    { name: '黃色', hex: '#f1c40f' },
    { name: '紫色', hex: '#9b59b6' },
    { name: '橘色', hex: '#e67e22' }
];

let score = 0;
let timeLeft = 30;
let streak = 0;
let isPlaying = false;
let currentColor = null;
let intervalId = null;

function init() {
    document.getElementById('startBtn').addEventListener('click', startGame);
    document.getElementById('restartBtn').addEventListener('click', startGame);
}

function startGame() {
    score = 0;
    timeLeft = 30;
    streak = 0;
    isPlaying = true;

    document.getElementById('startBtn').style.display = 'none';
    document.getElementById('resultPanel').classList.remove('show');
    updateStats();

    intervalId = setInterval(() => {
        timeLeft--;
        updateStats();
        if (timeLeft <= 0) {
            endGame();
        }
    }, 1000);

    nextRound();
}

function nextRound() {
    const textColorIndex = Math.floor(Math.random() * colors.length);
    const displayColorIndex = Math.floor(Math.random() * colors.length);

    currentColor = colors[displayColorIndex];

    const colorWord = document.getElementById('colorWord');
    colorWord.textContent = colors[textColorIndex].name;
    colorWord.style.color = currentColor.hex;

    generateOptions();
}

function generateOptions() {
    const optionsContainer = document.getElementById('options');
    optionsContainer.innerHTML = '';

    const shuffledColors = [...colors].sort(() => Math.random() - 0.5).slice(0, 4);

    if (!shuffledColors.includes(currentColor)) {
        shuffledColors[Math.floor(Math.random() * 4)] = currentColor;
    }

    shuffledColors.sort(() => Math.random() - 0.5);

    shuffledColors.forEach(color => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.textContent = color.name;
        btn.style.background = color.hex;
        btn.addEventListener('click', () => checkAnswer(color, btn));
        optionsContainer.appendChild(btn);
    });
}

function checkAnswer(selectedColor, btn) {
    if (!isPlaying) return;

    if (selectedColor === currentColor) {
        streak++;
        const points = 10 + streak * 2;
        score += points;
        btn.classList.add('correct');
    } else {
        streak = 0;
        btn.classList.add('wrong');
    }

    updateStats();

    setTimeout(() => {
        nextRound();
    }, 300);
}

function updateStats() {
    document.getElementById('score').textContent = score;
    document.getElementById('timer').textContent = timeLeft;
    document.getElementById('streak').textContent = streak;
}

function endGame() {
    isPlaying = false;
    clearInterval(intervalId);

    document.getElementById('finalScore').textContent = score;
    document.getElementById('resultPanel').classList.add('show');
    document.getElementById('startBtn').style.display = 'block';
    document.getElementById('startBtn').textContent = '再玩一次';
}

document.addEventListener('DOMContentLoaded', init);
