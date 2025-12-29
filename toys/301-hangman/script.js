const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 200; canvas.height = 200;

const words = ['JAVASCRIPT', 'PROGRAMMING', 'DEVELOPER', 'ALGORITHM', 'FUNCTION', 'VARIABLE', 'COMPUTER', 'KEYBOARD', 'SOFTWARE', 'INTERNET'];
let word = '', guessed = [], wrong = 0, gameOver = false;

function init() {
    document.getElementById('newBtn').addEventListener('click', startGame);
    createKeyboard();
    startGame();
}

function createKeyboard() {
    const keyboard = document.getElementById('keyboard');
    keyboard.innerHTML = '';
    for (let i = 65; i <= 90; i++) {
        const btn = document.createElement('button');
        btn.textContent = String.fromCharCode(i);
        btn.addEventListener('click', () => guessLetter(String.fromCharCode(i)));
        keyboard.appendChild(btn);
    }
}

function startGame() {
    word = words[Math.floor(Math.random() * words.length)];
    guessed = [];
    wrong = 0;
    gameOver = false;
    document.getElementById('status').textContent = '';
    createKeyboard();
    updateDisplay();
    draw();
}

function guessLetter(letter) {
    if (gameOver || guessed.includes(letter)) return;

    guessed.push(letter);
    const btn = [...document.querySelectorAll('.keyboard button')].find(b => b.textContent === letter);

    if (word.includes(letter)) {
        btn.classList.add('correct');
    } else {
        btn.classList.add('wrong');
        wrong++;
    }
    btn.disabled = true;

    updateDisplay();
    draw();
    checkGameEnd();
}

function updateDisplay() {
    const display = word.split('').map(c => guessed.includes(c) ? c : '_').join(' ');
    document.getElementById('wordDisplay').textContent = display;
}

function checkGameEnd() {
    if (wrong >= 6) {
        gameOver = true;
        document.getElementById('status').textContent = '遊戲結束! 答案是: ' + word;
    } else if (word.split('').every(c => guessed.includes(c))) {
        gameOver = true;
        document.getElementById('status').textContent = '恭喜! 你猜對了!';
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#f39c12';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';

    ctx.beginPath();
    ctx.moveTo(20, 180);
    ctx.lineTo(80, 180);
    ctx.moveTo(50, 180);
    ctx.lineTo(50, 30);
    ctx.lineTo(120, 30);
    ctx.lineTo(120, 50);
    ctx.stroke();

    if (wrong >= 1) {
        ctx.beginPath();
        ctx.arc(120, 65, 15, 0, Math.PI * 2);
        ctx.stroke();
    }
    if (wrong >= 2) {
        ctx.beginPath();
        ctx.moveTo(120, 80);
        ctx.lineTo(120, 130);
        ctx.stroke();
    }
    if (wrong >= 3) {
        ctx.beginPath();
        ctx.moveTo(120, 90);
        ctx.lineTo(95, 110);
        ctx.stroke();
    }
    if (wrong >= 4) {
        ctx.beginPath();
        ctx.moveTo(120, 90);
        ctx.lineTo(145, 110);
        ctx.stroke();
    }
    if (wrong >= 5) {
        ctx.beginPath();
        ctx.moveTo(120, 130);
        ctx.lineTo(100, 165);
        ctx.stroke();
    }
    if (wrong >= 6) {
        ctx.beginPath();
        ctx.moveTo(120, 130);
        ctx.lineTo(140, 165);
        ctx.stroke();
    }
}

document.addEventListener('DOMContentLoaded', init);
document.addEventListener('keydown', e => {
    if (e.key.match(/^[a-zA-Z]$/)) guessLetter(e.key.toUpperCase());
});
