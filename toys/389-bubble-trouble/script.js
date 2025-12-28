const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const livesEl = document.getElementById('lives');
const resultEl = document.getElementById('result');

let score = 0;
let lives = 3;
let gameOver = false;

const player = { x: 180, y: 350, width: 30, height: 40, speed: 5 };
let bubbles = [];
let projectile = null;

const gravity = 0.15;
const groundY = 360;

let keys = { left: false, right: false };

function initGame() {
    score = 0;
    lives = 3;
    gameOver = false;
    player.x = 180;
    projectile = null;
    scoreEl.textContent = '0';
    livesEl.textContent = '3';
    resultEl.textContent = '左右移動躲避，點擊發射!';

    bubbles = [{ x: 180, y: 100, vx: 2, vy: 0, radius: 40 }];
}

function shoot() {
    if (projectile || gameOver) return;
    projectile = { x: player.x, y: player.y, width: 4, height: 0 };
}

function splitBubble(bubble, index) {
    bubbles.splice(index, 1);
    score += Math.round(50 / bubble.radius * 10);
    scoreEl.textContent = score;

    if (bubble.radius > 15) {
        const newRadius = bubble.radius * 0.6;
        bubbles.push(
            { x: bubble.x - 10, y: bubble.y, vx: -2, vy: -5, radius: newRadius },
            { x: bubble.x + 10, y: bubble.y, vx: 2, vy: -5, radius: newRadius }
        );
    }

    if (bubbles.length === 0) {
        bubbles.push({ x: 180, y: 100, vx: 2 + score/500, vy: 0, radius: 40 });
    }
}

function update() {
    if (gameOver) return;

    // Player movement
    if (keys.left) player.x = Math.max(player.width/2, player.x - player.speed);
    if (keys.right) player.x = Math.min(canvas.width - player.width/2, player.x + player.speed);

    // Projectile
    if (projectile) {
        projectile.height += 15;
        if (projectile.y - projectile.height < 0) {
            projectile = null;
        }
    }

    // Bubbles
    bubbles.forEach((b, i) => {
        b.vy += gravity;
        b.x += b.vx;
        b.y += b.vy;

        // Wall bounce
        if (b.x - b.radius < 0 || b.x + b.radius > canvas.width) {
            b.vx *= -1;
            b.x = Math.max(b.radius, Math.min(canvas.width - b.radius, b.x));
        }

        // Ground bounce
        if (b.y + b.radius > groundY) {
            b.y = groundY - b.radius;
            b.vy = -Math.sqrt(2 * gravity * (200 + b.radius * 2));
        }

        // Projectile collision
        if (projectile) {
            const projTop = projectile.y - projectile.height;
            if (projectile.x > b.x - b.radius && projectile.x < b.x + b.radius &&
                projTop < b.y + b.radius && projectile.y > b.y - b.radius) {
                splitBubble(b, i);
                projectile = null;
            }
        }

        // Player collision
        if (b.x + b.radius > player.x - player.width/2 &&
            b.x - b.radius < player.x + player.width/2 &&
            b.y + b.radius > player.y - player.height &&
            b.y - b.radius < player.y) {
            lives--;
            livesEl.textContent = lives;
            if (lives <= 0) {
                gameOver = true;
                resultEl.textContent = `遊戲結束! 分數: ${score}`;
            } else {
                player.x = 180;
                resultEl.textContent = '小心泡泡!';
            }
        }
    });
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Ground
    ctx.fillStyle = '#636e72';
    ctx.fillRect(0, groundY, canvas.width, canvas.height - groundY);

    // Player
    ctx.fillStyle = '#fdcb6e';
    ctx.fillRect(player.x - player.width/2, player.y - player.height, player.width, player.height);
    ctx.fillStyle = '#2d3436';
    ctx.beginPath();
    ctx.arc(player.x - 5, player.y - player.height + 12, 4, 0, Math.PI * 2);
    ctx.arc(player.x + 5, player.y - player.height + 12, 4, 0, Math.PI * 2);
    ctx.fill();

    // Projectile
    if (projectile) {
        ctx.fillStyle = '#00b894';
        ctx.fillRect(projectile.x - projectile.width/2, projectile.y - projectile.height, projectile.width, projectile.height);
    }

    // Bubbles
    bubbles.forEach(b => {
        const gradient = ctx.createRadialGradient(b.x - b.radius/3, b.y - b.radius/3, 0, b.x, b.y, b.radius);
        gradient.addColorStop(0, 'rgba(255,255,255,0.8)');
        gradient.addColorStop(0.3, '#e84393');
        gradient.addColorStop(1, '#c0392b');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
        ctx.fill();
    });

    // Game over overlay
    if (gameOver) {
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('遊戲結束', canvas.width/2, canvas.height/2 - 20);
        ctx.font = '18px Arial';
        ctx.fillText(`分數: ${score}`, canvas.width/2, canvas.height/2 + 20);
        ctx.fillText('點擊重新開始', canvas.width/2, canvas.height/2 + 50);
    }
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') keys.left = true;
    if (e.key === 'ArrowRight') keys.right = true;
    if (e.code === 'Space') { e.preventDefault(); shoot(); }
});

document.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowLeft') keys.left = false;
    if (e.key === 'ArrowRight') keys.right = false;
});

canvas.addEventListener('click', (e) => {
    if (gameOver) { initGame(); return; }
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    if (x < canvas.width / 3) keys.left = true;
    else if (x > canvas.width * 2/3) keys.right = true;
    else shoot();
    setTimeout(() => { keys.left = false; keys.right = false; }, 100);
});

canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (gameOver) { initGame(); return; }
    const rect = canvas.getBoundingClientRect();
    const x = e.touches[0].clientX - rect.left;
    if (x < canvas.width / 3) keys.left = true;
    else if (x > canvas.width * 2/3) keys.right = true;
    else shoot();
});

canvas.addEventListener('touchend', () => { keys.left = false; keys.right = false; });

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

initGame();
gameLoop();
