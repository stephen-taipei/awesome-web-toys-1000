let difficulty = 'easy';
let correctAnswer = 0;
let correctCount = 0;
let streak = 0;
let timeLeft = 30;
let timerInterval = null;

const ranges = {
    easy: { max: 10, ops: ['+', '-'] },
    medium: { max: 50, ops: ['+', '-', '×'] },
    hard: { max: 100, ops: ['+', '-', '×', '÷'] }
};

function init() {
    document.querySelectorAll('.diff-btn').forEach(btn => {
        btn.addEventListener('click', () => setDifficulty(btn.dataset.diff));
    });
    document.getElementById('submitBtn').addEventListener('click', submit);
    document.getElementById('answer').addEventListener('keypress', e => {
        if (e.key === 'Enter') submit();
    });
    generateQuestion();
    startTimer();
}

function setDifficulty(diff) {
    difficulty = diff;
    document.querySelectorAll('.diff-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.diff === diff);
    });
    generateQuestion();
}

function generateQuestion() {
    const range = ranges[difficulty];
    const op = range.ops[Math.floor(Math.random() * range.ops.length)];
    let a, b;

    if (op === '÷') {
        b = Math.floor(Math.random() * 10) + 1;
        correctAnswer = Math.floor(Math.random() * 10) + 1;
        a = b * correctAnswer;
    } else {
        a = Math.floor(Math.random() * range.max) + 1;
        b = Math.floor(Math.random() * range.max) + 1;

        if (op === '-' && a < b) [a, b] = [b, a];

        switch (op) {
            case '+': correctAnswer = a + b; break;
            case '-': correctAnswer = a - b; break;
            case '×': correctAnswer = a * b; break;
        }
    }

    document.getElementById('question').textContent = `${a} ${op} ${b} = ?`;
    document.getElementById('answer').value = '';
    document.getElementById('answer').focus();
}

function submit() {
    const answer = parseInt(document.getElementById('answer').value);

    if (answer === correctAnswer) {
        correctCount++;
        streak++;
        document.getElementById('result').textContent = '✅ 正確!';
    } else {
        streak = 0;
        document.getElementById('result').textContent = `❌ 答案是 ${correctAnswer}`;
    }

    document.getElementById('correct').textContent = correctCount;
    document.getElementById('streak').textContent = streak;

    setTimeout(() => {
        document.getElementById('result').textContent = '';
        generateQuestion();
    }, 1000);
}

function startTimer() {
    timerInterval = setInterval(() => {
        timeLeft--;
        document.getElementById('time').textContent = timeLeft;
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            timeLeft = 30;
            document.getElementById('time').textContent = timeLeft;
            startTimer();
        }
    }, 1000);
}

document.addEventListener('DOMContentLoaded', init);
