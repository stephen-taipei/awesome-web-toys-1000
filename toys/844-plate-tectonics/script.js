const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 370;
canvas.height = 300;

let plates = [];
let mountains = [];
let rifts = [];
let speed = 1;
let time = 0;

function initPlates() {
    plates = [
        {
            x: 0, y: canvas.height / 2 - 30,
            width: 150, height: 60,
            vx: 0.2, color: '#8B4513',
            name: '板塊 A'
        },
        {
            x: 160, y: canvas.height / 2 - 30,
            width: 150, height: 60,
            vx: -0.2, color: '#A0522D',
            name: '板塊 B'
        }
    ];
    mountains = [];
    rifts = [];
}

function updatePlates() {
    const p1 = plates[0];
    const p2 = plates[1];

    p1.x += p1.vx * speed;
    p2.x += p2.vx * speed;

    const gap = p2.x - (p1.x + p1.width);

    if (gap < 5 && p1.vx > 0 && p2.vx < 0) {
        if (mountains.length < 20) {
            mountains.push({
                x: p1.x + p1.width,
                height: 5 + Math.random() * 15,
                width: 8 + Math.random() * 8
            });
        }

        mountains.forEach(m => {
            m.height += 0.05 * speed;
        });
    }

    if (gap > 20) {
        rifts.push({
            x: p1.x + p1.width + gap / 2,
            intensity: Math.min(gap / 50, 1)
        });

        if (rifts.length > 50) rifts.shift();
    }

    if (p1.x + p1.width > canvas.width - 50) {
        p1.vx = -Math.abs(p1.vx);
        p2.vx = Math.abs(p2.vx);
    }
    if (p2.x < 50) {
        p1.vx = Math.abs(p1.vx);
        p2.vx = -Math.abs(p2.vx);
    }
}

function drawBackground() {
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#006994');
    gradient.addColorStop(1, '#004466');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawMantle() {
    const gradient = ctx.createLinearGradient(0, canvas.height / 2 + 30, 0, canvas.height);
    gradient.addColorStop(0, '#8B0000');
    gradient.addColorStop(0.5, '#FF4500');
    gradient.addColorStop(1, '#FF6600');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, canvas.height / 2 + 30, canvas.width, canvas.height / 2);

    ctx.fillStyle = 'rgba(255, 200, 0, 0.3)';
    for (let i = 0; i < 10; i++) {
        const x = (time * 0.5 + i * 40) % canvas.width;
        const y = canvas.height / 2 + 50 + Math.sin(time * 0.02 + i) * 20;
        ctx.beginPath();
        ctx.arc(x, y, 10 + Math.sin(time * 0.05 + i) * 5, 0, Math.PI * 2);
        ctx.fill();
    }
}

function drawPlates() {
    plates.forEach(plate => {
        ctx.fillStyle = plate.color;
        ctx.fillRect(plate.x, plate.y, plate.width, plate.height);

        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        for (let i = 0; i < 5; i++) {
            ctx.fillRect(plate.x + 10 + i * 30, plate.y + 10, 20, 3);
            ctx.fillRect(plate.x + 10 + i * 30, plate.y + 20, 20, 3);
        }

        const arrowX = plate.x + plate.width / 2;
        const arrowY = plate.y + plate.height + 20;
        const dir = plate.vx > 0 ? 1 : -1;

        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(arrowX - dir * 20, arrowY);
        ctx.lineTo(arrowX + dir * 20, arrowY);
        ctx.lineTo(arrowX + dir * 10, arrowY - 8);
        ctx.moveTo(arrowX + dir * 20, arrowY);
        ctx.lineTo(arrowX + dir * 10, arrowY + 8);
        ctx.stroke();
    });
}

function drawMountains() {
    mountains.forEach(m => {
        ctx.fillStyle = '#654321';
        ctx.beginPath();
        ctx.moveTo(m.x - m.width / 2, plates[0].y);
        ctx.lineTo(m.x, plates[0].y - m.height);
        ctx.lineTo(m.x + m.width / 2, plates[0].y);
        ctx.fill();

        if (m.height > 20) {
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.moveTo(m.x - 3, plates[0].y - m.height + 5);
            ctx.lineTo(m.x, plates[0].y - m.height);
            ctx.lineTo(m.x + 3, plates[0].y - m.height + 5);
            ctx.fill();
        }
    });
}

function drawRifts() {
    rifts.forEach(r => {
        ctx.fillStyle = `rgba(255, 100, 0, ${r.intensity})`;
        ctx.beginPath();
        ctx.arc(r.x, canvas.height / 2, 5 * r.intensity, 0, Math.PI * 2);
        ctx.fill();
    });
}

function drawLabels() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(5, 5, 120, 50);

    ctx.fillStyle = '#fff';
    ctx.font = '11px Arial';
    ctx.fillText('碰撞 = 造山運動', 10, 20);
    ctx.fillText('分離 = 張裂帶', 10, 35);
    ctx.fillText(`速度: ${speed}x`, 10, 50);
}

function animate() {
    time++;
    drawBackground();
    drawMantle();
    drawRifts();
    drawPlates();
    drawMountains();
    drawLabels();
    updatePlates();
    requestAnimationFrame(animate);
}

document.getElementById('moveBtn').addEventListener('click', () => {
    speed = speed === 1 ? 3 : 1;
    document.getElementById('moveBtn').textContent = speed === 1 ? '加速移動' : '正常速度';
});

initPlates();
animate();
