const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 370;
canvas.height = 300;

const colors = [
    { name: 'red', base: '#C62828', light: '#EF5350' },
    { name: 'blue', base: '#1565C0', light: '#42A5F5' },
    { name: 'green', base: '#2E7D32', light: '#66BB6A' },
    { name: 'yellow', base: '#F9A825', light: '#FFEE58' }
];

const buttons = [
    { x: 50, y: 50, color: 0 },
    { x: 195, y: 50, color: 1 },
    { x: 50, y: 165, color: 2 },
    { x: 195, y: 165, color: 3 }
];

const buttonSize = 110;

let sequence = [];
let playerSequence = [];
let level = 0;
let isPlaying = false;
let isShowingSequence = false;
let activeButton = -1;
let gameOver = false;
let message = '點擊開始遊戲';

function draw() {
    ctx.fillStyle = '#0a0a15';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    buttons.forEach((btn, i) => {
        const isActive = activeButton === i;
        ctx.fillStyle = isActive ? colors[btn.color].light : colors[btn.color].base;

        ctx.beginPath();
        ctx.roundRect(btn.x, btn.y, buttonSize, buttonSize, 15);
        ctx.fill();

        if (isActive) {
            ctx.shadowColor = colors[btn.color].light;
            ctx.shadowBlur = 20;
            ctx.fill();
            ctx.shadowBlur = 0;
        }
    });

    ctx.fillStyle = '#1a1a2a';
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2, 40, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#9C27B0';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(level, canvas.width / 2, canvas.height / 2);

    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(10, 10, 150, 30);
    ctx.fillStyle = '#9C27B0';
    ctx.font = '12px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(message, 20, 28);

    if (gameOver) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = '#9C27B0';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('遊戲結束!', canvas.width / 2, canvas.height / 2 - 10);
        ctx.font = '16px Arial';
        ctx.fillText(`達到等級: ${level}`, canvas.width / 2, canvas.height / 2 + 20);
    }
}

function flashButton(index, duration = 500) {
    return new Promise(resolve => {
        activeButton = index;
        draw();
        setTimeout(() => {
            activeButton = -1;
            draw();
            setTimeout(resolve, 200);
        }, duration);
    });
}

async function showSequence() {
    isShowingSequence = true;
    message = '觀看順序...';
    draw();

    await new Promise(r => setTimeout(r, 500));

    for (const index of sequence) {
        await flashButton(index);
    }

    isShowingSequence = false;
    message = '輪到你了!';
    draw();
}

function nextLevel() {
    level++;
    sequence.push(Math.floor(Math.random() * 4));
    playerSequence = [];
    showSequence();
}

function startGame() {
    if (isPlaying) return;

    sequence = [];
    playerSequence = [];
    level = 0;
    isPlaying = true;
    gameOver = false;
    message = '開始!';

    nextLevel();
}

function checkInput(index) {
    playerSequence.push(index);
    const currentIndex = playerSequence.length - 1;

    if (playerSequence[currentIndex] !== sequence[currentIndex]) {
        gameOver = true;
        isPlaying = false;
        message = '錯誤!';
        draw();
        return;
    }

    if (playerSequence.length === sequence.length) {
        message = '正確!';
        draw();
        setTimeout(nextLevel, 1000);
    }
}

canvas.addEventListener('click', async (e) => {
    if (isShowingSequence || gameOver) return;

    const rect = canvas.getBoundingClientRect();
    const mx = (e.clientX - rect.left) * (canvas.width / rect.width);
    const my = (e.clientY - rect.top) * (canvas.height / rect.height);

    buttons.forEach((btn, i) => {
        if (mx >= btn.x && mx <= btn.x + buttonSize &&
            my >= btn.y && my <= btn.y + buttonSize) {
            if (isPlaying) {
                flashButton(i, 300).then(() => checkInput(i));
            }
        }
    });
});

document.getElementById('startBtn').addEventListener('click', startGame);

function animate() {
    draw();
    requestAnimationFrame(animate);
}

animate();
