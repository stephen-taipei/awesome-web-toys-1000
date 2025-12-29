const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let width = 360, height = 360;
let balls = [];
let hue = 0;

function init() {
    setupCanvas();

    for (let i = 0; i < 5; i++) {
        addBall();
    }

    document.getElementById('addBtn').addEventListener('click', addBall);
    document.getElementById('colorBtn').addEventListener('click', changeColor);

    gameLoop();
}

function setupCanvas() {
    const wrapper = document.querySelector('.game-wrapper');
    width = Math.min(360, wrapper.clientWidth);
    height = width;
    canvas.width = width;
    canvas.height = height;
}

function addBall() {
    balls.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4,
        radius: 30 + Math.random() * 30
    });
}

function changeColor() {
    hue = (hue + 60) % 360;
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

function update() {
    balls.forEach(ball => {
        ball.x += ball.vx;
        ball.y += ball.vy;

        if (ball.x - ball.radius < 0 || ball.x + ball.radius > width) {
            ball.vx *= -1;
            ball.x = Math.max(ball.radius, Math.min(width - ball.radius, ball.x));
        }
        if (ball.y - ball.radius < 0 || ball.y + ball.radius > height) {
            ball.vy *= -1;
            ball.y = Math.max(ball.radius, Math.min(height - ball.radius, ball.y));
        }
    });
}

function draw() {
    const imageData = ctx.createImageData(width, height);
    const data = imageData.data;

    const threshold = 1;

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            let sum = 0;

            balls.forEach(ball => {
                const dx = x - ball.x;
                const dy = y - ball.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                sum += (ball.radius * ball.radius) / (dist * dist + 1);
            });

            const idx = (y * width + x) * 4;

            if (sum > threshold) {
                const intensity = Math.min(1, (sum - threshold) * 0.5);
                const h = hue / 360;
                const s = 0.8;
                const l = 0.3 + intensity * 0.4;

                const rgb = hslToRgb(h, s, l);
                data[idx] = rgb[0];
                data[idx + 1] = rgb[1];
                data[idx + 2] = rgb[2];
                data[idx + 3] = 255;
            } else {
                data[idx] = 0;
                data[idx + 1] = 0;
                data[idx + 2] = 0;
                data[idx + 3] = 255;
            }
        }
    }

    ctx.putImageData(imageData, 0, 0);

    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.lineWidth = 1;
    balls.forEach(ball => {
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.radius * 0.3, 0, Math.PI * 2);
        ctx.stroke();
    });
}

function hslToRgb(h, s, l) {
    let r, g, b;

    if (s === 0) {
        r = g = b = l;
    } else {
        const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1/6) return p + (q - p) * 6 * t;
            if (t < 1/2) return q;
            if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        };

        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }

    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

document.addEventListener('DOMContentLoaded', init);
window.addEventListener('resize', setupCanvas);
