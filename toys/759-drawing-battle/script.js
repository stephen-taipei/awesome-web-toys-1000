const canvas1 = document.getElementById('canvas1');
const canvas2 = document.getElementById('canvas2');
const ctx1 = canvas1.getContext('2d');
const ctx2 = canvas2.getContext('2d');
const topicEl = document.getElementById('topic');

canvas1.width = 170;
canvas1.height = 180;
canvas2.width = 170;
canvas2.height = 180;

const topics = ['最可愛的動物', '夢想中的房子', '最喜歡的食物', '未來的交通工具', '外星人', '超級英雄', '神奇的植物', '海底世界', '太空船', '機器人'];

function clearCanvases() {
    ctx1.fillStyle = '#fff';
    ctx1.fillRect(0, 0, canvas1.width, canvas1.height);
    ctx2.fillStyle = '#fff';
    ctx2.fillRect(0, 0, canvas2.width, canvas2.height);
}

function newTopic() {
    topicEl.textContent = topics[Math.floor(Math.random() * topics.length)];
    clearCanvases();
}

function setupCanvas(canvas, ctx, color) {
    let drawing = false;
    let lastPos = null;

    function draw(x, y) {
        if (lastPos) {
            ctx.strokeStyle = color;
            ctx.lineWidth = 3;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(lastPos.x, lastPos.y);
            ctx.lineTo(x, y);
            ctx.stroke();
        }
        lastPos = { x, y };
    }

    function getPos(e) {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        return {
            x: (clientX - rect.left) * scaleX,
            y: (clientY - rect.top) * scaleY
        };
    }

    canvas.addEventListener('mousedown', (e) => { drawing = true; lastPos = getPos(e); });
    canvas.addEventListener('mousemove', (e) => { if (drawing) { const pos = getPos(e); draw(pos.x, pos.y); } });
    canvas.addEventListener('mouseup', () => { drawing = false; lastPos = null; });
    canvas.addEventListener('mouseleave', () => { drawing = false; lastPos = null; });

    canvas.addEventListener('touchstart', (e) => { e.preventDefault(); drawing = true; lastPos = getPos(e); });
    canvas.addEventListener('touchmove', (e) => { e.preventDefault(); if (drawing) { const pos = getPos(e); draw(pos.x, pos.y); } });
    canvas.addEventListener('touchend', () => { drawing = false; lastPos = null; });
}

setupCanvas(canvas1, ctx1, '#e74c3c');
setupCanvas(canvas2, ctx2, '#3498db');

document.getElementById('newTopic').addEventListener('click', newTopic);

clearCanvases();
newTopic();
