const questionEl = document.getElementById('question');
const answerEl = document.getElementById('answer');
const submitBtn = document.getElementById('submitBtn');
const resultEl = document.getElementById('result');
const accuracyEl = document.getElementById('accuracy');
const scoreEl = document.getElementById('score');

let score = 0;
let correctAnswer = 0;

function generateQuestion() {
    const types = ['multiply', 'add', 'subtract', 'percent'];
    const type = types[Math.floor(Math.random() * types.length)];
    let question, answer;

    if (type === 'multiply') {
        const a = Math.floor(Math.random() * 90) + 10;
        const b = Math.floor(Math.random() * 90) + 10;
        question = `${a} × ${b} = ?`;
        answer = a * b;
    } else if (type === 'add') {
        const nums = Array.from({ length: 4 }, () => Math.floor(Math.random() * 900) + 100);
        question = nums.join(' + ') + ' = ?';
        answer = nums.reduce((a, b) => a + b, 0);
    } else if (type === 'subtract') {
        const a = Math.floor(Math.random() * 9000) + 1000;
        const b = Math.floor(Math.random() * a);
        question = `${a} - ${b} = ?`;
        answer = a - b;
    } else {
        const percent = [10, 15, 20, 25, 30][Math.floor(Math.random() * 5)];
        const num = Math.floor(Math.random() * 900) + 100;
        question = `${num} 的 ${percent}% = ?`;
        answer = Math.round(num * percent / 100);
    }

    correctAnswer = answer;
    questionEl.textContent = question;
    answerEl.value = '';
    answerEl.disabled = false;
    submitBtn.disabled = false;
    resultEl.textContent = '';
    accuracyEl.innerHTML = '<p class="label">輸入你的估算值</p>';
}

function checkAnswer() {
    const userAnswer = parseInt(answerEl.value);
    if (isNaN(userAnswer)) return;

    answerEl.disabled = true;
    submitBtn.disabled = true;

    const error = Math.abs(userAnswer - correctAnswer);
    const accuracy = Math.max(0, 100 - (error / correctAnswer * 100));
    const points = Math.round(accuracy);

    score += points;
    scoreEl.textContent = score;

    resultEl.textContent = `正確答案: ${correctAnswer}`;

    let grade = '';
    if (accuracy >= 95) grade = '🎯 完美!';
    else if (accuracy >= 80) grade = '👍 很接近!';
    else if (accuracy >= 50) grade = '😊 還不錯';
    else grade = '💪 繼續加油';

    accuracyEl.innerHTML = `
        <p class="label">準確度</p>
        <p class="value">${accuracy.toFixed(1)}%</p>
        <p class="points">${grade} +${points}分</p>
    `;

    setTimeout(generateQuestion, 3000);
}

submitBtn.addEventListener('click', checkAnswer);
answerEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') checkAnswer();
});

generateQuestion();
