const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let size = 360;
let stars = [];
let time = 0;
let numArms = 4;
let rotationSpeed = 1;

function init() {
    setupCanvas();
    createGalaxy();

    document.getElementById('armsBtn').addEventListener('click', changeArms);
    document.getElementById('speedBtn').addEventListener('click', changeSpeed);

    gameLoop();
}

function setupCanvas() {
    const wrapper = document.querySelector('.game-wrapper');
    size = Math.min(360, wrapper.clientWidth - 20);
    canvas.width = size;
    canvas.height = size;
}

function createGalaxy() {
    stars = [];
    const numStars = 3000;
    const centerX = size / 2;
    const centerY = size / 2;

    for (let arm = 0; arm < numArms; arm++) {
        const armAngle = (Math.PI * 2 / numArms) * arm;

        for (let i = 0; i < numStars / numArms; i++) {
            const distance = Math.pow(Math.random(), 0.5) * (size * 0.45);
            const spiral = 0.3;
            const angle = armAngle + distance * spiral / 50 + (Math.random() - 0.5) * 0.5;
            const spread = (Math.random() - 0.5) * (20 + distance * 0.1);

            const x = centerX + Math.cos(angle) * distance + Math.cos(angle + Math.PI/2) * spread;
            const y = centerY + Math.sin(angle) * distance + Math.sin(angle + Math.PI/2) * spread;

            const brightness = 0.3 + Math.random() * 0.7;
            const isBlue = Math.random() < 0.3;
            const isYellow = Math.random() < 0.2;

            stars.push({
                x: x,
                y: y,
                baseX: x - centerX,
                baseY: y - centerY,
                distance: distance,
                size: 0.5 + Math.random() * 1.5,
                brightness: brightness,
                color: isBlue ? '#aaccff' : isYellow ? '#ffddaa' : '#ffffff'
            });
        }
    }

    for (let i = 0; i < 200; i++) {
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * 30;

        stars.push({
            x: centerX + Math.cos(angle) * distance,
            y: centerY + Math.sin(angle) * distance,
            baseX: Math.cos(angle) * distance,
            baseY: Math.sin(angle) * distance,
            distance: distance,
            size: 1 + Math.random() * 2,
            brightness: 0.8 + Math.random() * 0.2,
            color: '#ffffee'
        });
    }
}

function changeArms() {
    numArms = numArms === 2 ? 3 : numArms === 3 ? 4 : numArms === 4 ? 6 : 2;
    createGalaxy();
}

function changeSpeed() {
    rotationSpeed = rotationSpeed === 1 ? 2 : rotationSpeed === 2 ? 0.5 : 1;
}

function gameLoop() {
    time += 0.002 * rotationSpeed;
    draw();
    requestAnimationFrame(gameLoop);
}

function draw() {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, size, size);

    const centerX = size / 2;
    const centerY = size / 2;

    stars.forEach(star => {
        const rotSpeed = 0.5 / (star.distance + 10);
        const angle = Math.atan2(star.baseY, star.baseX) + time * rotSpeed;
        const dist = Math.sqrt(star.baseX * star.baseX + star.baseY * star.baseY);

        const x = centerX + Math.cos(angle) * dist;
        const y = centerY + Math.sin(angle) * dist;

        ctx.fillStyle = star.color;
        ctx.globalAlpha = star.brightness;
        ctx.beginPath();
        ctx.arc(x, y, star.size, 0, Math.PI * 2);
        ctx.fill();
    });

    ctx.globalAlpha = 1;

    const coreGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 40);
    coreGradient.addColorStop(0, 'rgba(255, 255, 200, 0.8)');
    coreGradient.addColorStop(0.3, 'rgba(255, 220, 150, 0.4)');
    coreGradient.addColorStop(1, 'rgba(255, 200, 100, 0)');
    ctx.fillStyle = coreGradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, 40, 0, Math.PI * 2);
    ctx.fill();
}

document.addEventListener('DOMContentLoaded', init);
window.addEventListener('resize', () => {
    setupCanvas();
    createGalaxy();
});
