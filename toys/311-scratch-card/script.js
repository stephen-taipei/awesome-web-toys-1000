const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 300; canvas.height = 200;

const prizes = ['🎉 頭獎 $10000!', '🎊 二獎 $1000!', '🎁 三獎 $100!', '⭐ 小獎 $10', '💫 再試一次', '🌟 謝謝參與'];
let isScratching = false, prize = '', scratchedPixels = 0;

function init() {
    document.getElementById('newBtn').addEventListener('click', newCard);
    canvas.addEventListener('mousedown', () => isScratching = true);
    canvas.addEventListener('mouseup', () => isScratching = false);
    canvas.addEventListener('mousemove', scratch);
    canvas.addEventListener('touchstart', e => { e.preventDefault(); isScratching = true; });
    canvas.addEventListener('touchend', () => isScratching = false);
    canvas.addEventListener('touchmove', e => { e.preventDefault(); scratch(e.touches[0]); });
    newCard();
}

function newCard() {
    const random = Math.random();
    if (random < 0.01) prize = prizes[0];
    else if (random < 0.05) prize = prizes[1];
    else if (random < 0.15) prize = prizes[2];
    else if (random < 0.35) prize = prizes[3];
    else if (random < 0.6) prize = prizes[4];
    else prize = prizes[5];

    scratchedPixels = 0;
    document.getElementById('result').textContent = '';

    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#e74c3c';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(prize, canvas.width/2, canvas.height/2);

    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#95a5a6');
    gradient.addColorStop(0.5, '#7f8c8d');
    gradient.addColorStop(1, '#95a5a6');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#bdc3c7';
    ctx.font = '16px Arial';
    ctx.fillText('刮開這裡', canvas.width/2, canvas.height/2);
}

function scratch(e) {
    if (!isScratching) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, 20, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalCompositeOperation = 'source-over';

    checkProgress();
}

function checkProgress() {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let transparent = 0;
    for (let i = 3; i < imageData.data.length; i += 4) {
        if (imageData.data[i] < 128) transparent++;
    }
    const percentage = transparent / (canvas.width * canvas.height) * 100;

    if (percentage > 50 && !document.getElementById('result').textContent) {
        document.getElementById('result').textContent = prize;
    }
}

document.addEventListener('DOMContentLoaded', init);
