const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const size = 250;
canvas.width = size; canvas.height = size;

const readings = {
    heart: ['你的感情生活豐富多彩', '深厚的愛情將來臨', '感情運勢正上升', '要多關注伴侶的需求'],
    head: ['你思維敏捷靈活', '學習能力很強', '適合從事創意工作', '理性與感性達到平衡'],
    life: ['你的生命力旺盛', '將會有長壽的祝福', '健康運勢良好', '精力充沛活力十足'],
    fate: ['事業運正在上升', '貴人運很旺', '財運亨通', '機會正在向你靠近']
};

function init() {
    document.getElementById('readBtn').addEventListener('click', readPalm);
    canvas.addEventListener('click', readPalm);
    drawPalm();
}

function drawPalm() {
    ctx.fillStyle = '#f4d4bc';
    ctx.beginPath();
    ctx.ellipse(size/2, size/2 + 20, 80, 100, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#d4a484';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';

    ctx.beginPath();
    ctx.moveTo(40, 80);
    ctx.quadraticCurveTo(125, 60, 210, 90);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(40, 120);
    ctx.quadraticCurveTo(125, 100, 200, 130);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(60, 200);
    ctx.quadraticCurveTo(80, 100, 70, 50);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(125, 200);
    ctx.quadraticCurveTo(130, 150, 125, 100);
    ctx.stroke();

    ctx.fillStyle = '#ff69b4';
    ctx.font = '10px Arial';
    ctx.fillText('心線', 130, 75);
    ctx.fillText('智慧線', 130, 115);
    ctx.fillText('生命線', 50, 130);
    ctx.fillText('命運線', 135, 155);
}

function readPalm() {
    const heart = readings.heart[Math.floor(Math.random() * readings.heart.length)];
    const head = readings.head[Math.floor(Math.random() * readings.head.length)];
    const life = readings.life[Math.floor(Math.random() * readings.life.length)];
    const fate = readings.fate[Math.floor(Math.random() * readings.fate.length)];

    document.getElementById('reading').innerHTML =
        '💗 <strong>心線:</strong> ' + heart + '<br>' +
        '🧠 <strong>智慧線:</strong> ' + head + '<br>' +
        '🌿 <strong>生命線:</strong> ' + life + '<br>' +
        '⭐ <strong>命運線:</strong> ' + fate;

    canvas.style.animation = 'glow 0.5s ease-out';
    setTimeout(() => canvas.style.animation = '', 500);
}

const style = document.createElement('style');
style.textContent = '@keyframes glow { 0%, 100% { filter: drop-shadow(0 0 0 transparent); } 50% { filter: drop-shadow(0 0 20px #ff69b4); } }';
document.head.appendChild(style);

document.addEventListener('DOMContentLoaded', init);
