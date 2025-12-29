const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let width = 360, height = 450;
let basket = { x: 0, width: 70, height: 40 };
let fruits = [];
let score = 0, lives = 3;
let isPlaying = false;
let animationId = null;
let frameCount = 0;

const fruitTypes = ['🍎', '🍊', '🍋', '🍇', '🍓', '🍑', '🍒'];
const badItems = ['💀', '💣'];

function init() {
    setupCanvas();
    document.getElementById('startBtn').addEventListener('click', startGame);
    canvas.addEventListener('mousemove', handleMouse);
    canvas.addEventListener('touchmove', handleTouch, { passive: false });
    draw();
}

function setupCanvas() {
    const wrapper = document.querySelector('.game-wrapper');
    width = Math.min(360, wrapper.clientWidth);
    height = width * 1.25;
    canvas.width = width;
    canvas.height = height;
    basket.x = (width - basket.width) / 2;
}

function startGame() {
    score = 0;
    lives = 3;
    fruits = [];
    frameCount = 0;
    isPlaying = true;

    document.getElementById('startBtn').classList.add('hidden');
    updateStats();

    if (animationId) cancelAnimationFrame(animationId);
    gameLoop();
}

function gameLoop() {
    update();
    draw();
    if (isPlaying) {
        animationId = requestAnimationFrame(gameLoop);
    }
}

function update() {
    frameCount++;

    const spawnRate = Math.max(30, 60 - Math.floor(score / 5));
    if (frameCount % spawnRate === 0) {
        spawnFruit();
    }

    fruits.forEach(fruit => {
        fruit.y += fruit.speed;
    });

    fruits = fruits.filter(fruit => {
        if (fruit.y > height - basket.height - 20 && fruit.y < height - 10) {
            if (fruit.x > basket.x - 20 && fruit.x < basket.x + basket.width + 20) {
                if (fruit.isBad) {
                    lives--;
                    updateStats();
                    if (lives <= 0) endGame();
                } else {
                    score += 10;
                    updateStats();
                }
                return false;
            }
        }

        if (fruit.y > height) {
            if (!fruit.isBad) {
                lives--;
                updateStats();
                if (lives <= 0) endGame();
            }
            return false;
        }
        return true;
    });
}

function spawnFruit() {
    const isBad = Math.random() < 0.15;
    const items = isBad ? badItems : fruitTypes;
    fruits.push({
        x: 30 + Math.random() * (width - 60),
        y: -30,
        emoji: items[Math.floor(Math.random() * items.length)],
        speed: 3 + Math.random() * 2 + score * 0.02,
        isBad: isBad
    });
}

function draw() {
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, '#87ceeb');
    gradient.addColorStop(1, '#90ee90');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = '#8b4513';
    ctx.fillRect(0, height - 20, width, 20);

    fruits.forEach(fruit => {
        ctx.font = '30px serif';
        ctx.textAlign = 'center';
        ctx.fillText(fruit.emoji, fruit.x, fruit.y);
    });

    ctx.fillStyle = '#8b4513';
    ctx.fillRect(basket.x, height - basket.height - 15, basket.width, basket.height);
    ctx.fillStyle = '#d2691e';
    ctx.fillRect(basket.x + 5, height - basket.height - 10, basket.width - 10, basket.height - 10);
}

function handleMouse(e) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    basket.x = (e.clientX - rect.left) * scaleX - basket.width / 2;
    basket.x = Math.max(0, Math.min(width - basket.width, basket.x));
}

function handleTouch(e) {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    basket.x = (e.touches[0].clientX - rect.left) * scaleX - basket.width / 2;
    basket.x = Math.max(0, Math.min(width - basket.width, basket.x));
}

function updateStats() {
    document.getElementById('score').textContent = score;
    document.getElementById('lives').textContent = '❤️'.repeat(lives);
}

function endGame() {
    isPlaying = false;
    document.getElementById('startBtn').classList.remove('hidden');
    document.getElementById('startBtn').textContent = '分數: ' + score + ' - 再玩一次';
}

document.addEventListener('DOMContentLoaded', init);
window.addEventListener('resize', setupCanvas);
