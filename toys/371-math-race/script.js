const questionEl = document.getElementById('question');
const answerEl = document.getElementById('answer');
const scoreEl = document.getElementById('score');
const timerEl = document.getElementById('timer');
const resultEl = document.getElementById('result');
const startBtn = document.getElementById('startBtn');

let score = 0;
let timeLeft = 30;
let currentAnswer = 0;
let gameInterval = null;
let isPlaying = false;

const operations = ['+', '-', '×'];

function generateQuestion() {
    const op = operations[Math.floor(Math.random() * operations.length)];
    let a, b;

    if (op === '+') {
        a = Math.floor(Math.random() * 50) + 1;
        b = Math.floor(Math.random() * 50) + 1;
        currentAnswer = a + b;
    } else if (op === '-') {
        a = Math.floor(Math.random() * 50) + 10;
        b = Math.floor(Math.random() * a);
        currentAnswer = a - b;
    } else {
        a = Math.floor(Math.random() * 12) + 1;
        b = Math.floor(Math.random() * 12) + 1;
        currentAnswer = a * b;
    }

    questionEl.textContent = `${a} ${op} ${b} = ?`;
    answerEl.value = '';
    answerEl.focus();
}

function checkAnswer() {
    const userAnswer = parseInt(answerEl.value);
    if (userAnswer === currentAnswer) {
        score += 10;
        scoreEl.textContent = score;
        resultEl.textContent = '✅ 正確!';
        resultEl.style.color = '#00b894';
        generateQuestion();
    }
}

function startGame() {
    score = 0;
    timeLeft = 30;
    isPlaying = true;
    scoreEl.textContent = '0';
    timerEl.textContent = '30';
    resultEl.textContent = '';
    startBtn.disabled = true;
    startBtn.textContent = '遊戲中...';
    answerEl.disabled = false;

    generateQuestion();

    gameInterval = setInterval(() => {
        timeLeft--;
        timerEl.textContent = timeLeft;

        if (timeLeft <= 0) {
            endGame();
        }
    }, 1000);
}

function endGame() {
    isPlaying = false;
    clearInterval(gameInterval);
    answerEl.disabled = true;
    startBtn.disabled = false;
    startBtn.textContent = '再玩一次';
    questionEl.textContent = '時間到!';
    resultEl.textContent = `🏆 最終分數: ${score}`;
    resultEl.style.color = '#ffeaa7';
}

answerEl.addEventListener('input', () => {
    if (isPlaying) checkAnswer();
});

answerEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !isPlaying) {
        startGame();
    }
});

startBtn.addEventListener('click', startGame);
answerEl.disabled = true;
