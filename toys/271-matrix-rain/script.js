const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let width = 360, height = 450;
let columns = [];
let fontSize = 14;
let speed = 1;
let colorHue = 120;

const chars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789';

function init() {
    setupCanvas();

    document.getElementById('colorBtn').addEventListener('click', changeColor);
    document.getElementById('speedBtn').addEventListener('click', changeSpeed);

    gameLoop();
}

function setupCanvas() {
    const wrapper = document.querySelector('.game-wrapper');
    width = Math.min(360, wrapper.clientWidth);
    height = width * 1.25;
    canvas.width = width;
    canvas.height = height;

    const numColumns = Math.floor(width / fontSize);
    columns = [];
    for (let i = 0; i < numColumns; i++) {
        columns[i] = {
            y: Math.random() * height,
            speed: 0.5 + Math.random() * 1.5,
            chars: []
        };

        const len = 5 + Math.floor(Math.random() * 15);
        for (let j = 0; j < len; j++) {
            columns[i].chars.push(chars[Math.floor(Math.random() * chars.length)]);
        }
    }
}

function changeColor() {
    colorHue = (colorHue + 60) % 360;
}

function changeSpeed() {
    speed = speed === 1 ? 2 : speed === 2 ? 0.5 : 1;
}

function gameLoop() {
    draw();
    requestAnimationFrame(gameLoop);
}

function draw() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    ctx.fillRect(0, 0, width, height);

    ctx.font = fontSize + 'px monospace';

    columns.forEach((col, i) => {
        const x = i * fontSize;

        col.chars.forEach((char, j) => {
            const y = col.y - j * fontSize;

            if (y > 0 && y < height) {
                const brightness = 1 - j / col.chars.length;

                if (j === 0) {
                    ctx.fillStyle = 'hsl(' + colorHue + ', 100%, 80%)';
                } else {
                    ctx.fillStyle = 'hsla(' + colorHue + ', 100%, ' + (50 * brightness) + '%, ' + brightness + ')';
                }

                ctx.fillText(char, x, y);
            }

            if (Math.random() < 0.01) {
                col.chars[j] = chars[Math.floor(Math.random() * chars.length)];
            }
        });

        col.y += col.speed * fontSize * speed * 0.1;

        if (col.y - col.chars.length * fontSize > height) {
            col.y = 0;
            col.speed = 0.5 + Math.random() * 1.5;

            const len = 5 + Math.floor(Math.random() * 15);
            col.chars = [];
            for (let j = 0; j < len; j++) {
                col.chars.push(chars[Math.floor(Math.random() * chars.length)]);
            }
        }
    });
}

document.addEventListener('DOMContentLoaded', init);
window.addEventListener('resize', setupCanvas);
