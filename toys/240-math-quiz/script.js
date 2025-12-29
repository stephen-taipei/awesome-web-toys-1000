let score = 0;
let timeLeft = 60;
let streak = 0;
let correctCount = 0;
let currentAnswer = 0;
let isPlaying = false;
let timerInterval = null;

function init() {
    document.getElementById('startBtn').addEventListener('click', startGame);
    document.getElementById('restartBtn').addEventListener('click', startGame);
}

function startGame() {
    score = 0;
    timeLeft = 60;
    streak = 0;
    correctCount = 0;
    isPlaying = true;

    document.getElementById('startBtn').style.display = 'none';
    document.getElementById('resultPanel').classList.remove('show');
    document.querySelector('.game-area').style.display = 'block';

    updateStats();
    generateQuestion();

    timerInterval = setInterval(() => {
        timeLeft--;
        document.getElementById('timer').textContent = timeLeft;
        document.getElementById('progress').style.width = (timeLeft / 60 * 100) + '%';

        if (timeLeft <= 0) {
            endGame();
        }
    }, 1000);
}

function generateQuestion() {
    const operators = ['+', '-', '×'];
    const op = operators[Math.floor(Math.random() * operators.length)];

    let a, b, answer;

    switch (op) {
        case '+':
            a = Math.floor(Math.random() * 50) + 1;
            b = Math.floor(Math.random() * 50) + 1;
            answer = a + b;
            break;
        case '-':
            a = Math.floor(Math.random() * 50) + 20;
            b = Math.floor(Math.random() * a) + 1;
            answer = a - b;
            break;
        case '×':
            a = Math.floor(Math.random() * 12) + 1;
            b = Math.floor(Math.random() * 12) + 1;
            answer = a * b;
            break;
    }

    currentAnswer = answer;
    document.getElementById('question').textContent = a + ' ' + op + ' ' + b + ' = ?';

    const options = generateOptions(answer);
    renderOptions(options);
}

function generateOptions(correct) {
    const options = [correct];

    while (options.length < 4) {
        const offset = Math.floor(Math.random() * 20) - 10;
        const wrong = correct + offset;
        if (wrong > 0 && !options.includes(wrong)) {
            options.push(wrong);
        }
    }

    return options.sort(() => Math.random() - 0.5);
}

function renderOptions(options) {
    const container = document.getElementById('options');
    container.innerHTML = '';

    options.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.textContent = opt;
        btn.addEventListener('click', () => checkAnswer(opt, btn));
        container.appendChild(btn);
    });
}

function checkAnswer(selected, btn) {
    if (!isPlaying) return;

    const buttons = document.querySelectorAll('.option-btn');
    buttons.forEach(b => b.style.pointerEvents = 'none');

    if (selected === currentAnswer) {
        btn.classList.add('correct');
        streak++;
        correctCount++;
        const points = 10 + streak * 2;
        score += points;
    } else {
        btn.classList.add('wrong');
        buttons.forEach(b => {
            if (parseInt(b.textContent) === currentAnswer) {
                b.classList.add('correct');
            }
        });
        streak = 0;
    }

    updateStats();

    setTimeout(() => {
        if (isPlaying) generateQuestion();
    }, 500);
}

function updateStats() {
    document.getElementById('score').textContent = score;
    document.getElementById('streak').textContent = streak;
}

function endGame() {
    isPlaying = false;
    clearInterval(timerInterval);

    document.querySelector('.game-area').style.display = 'none';
    document.getElementById('finalScore').textContent = score;
    document.getElementById('correct').textContent = correctCount;
    document.getElementById('resultPanel').classList.add('show');
    document.getElementById('startBtn').style.display = 'block';
    document.getElementById('startBtn').textContent = '再玩一次';
}

document.addEventListener('DOMContentLoaded', init);
