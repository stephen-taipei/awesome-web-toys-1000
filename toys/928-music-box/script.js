const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 370;
canvas.height = 300;

let windUp = 100;
let rotation = 0;
let notes = [];
let sparkles = [];
let time = 0;

function wind() {
    windUp = Math.min(100, windUp + 30);
}

function update() {
    if (windUp > 0) {
        const speed = windUp / 100;
        rotation += 0.02 * speed;
        windUp -= 0.05;

        if (time % 20 === 0 && windUp > 10) {
            const angle = Math.random() * Math.PI * 2;
            const distance = 30 + Math.random() * 40;
            notes.push({
                x: canvas.width / 2 + Math.cos(angle) * distance,
                y: 80 + Math.sin(angle) * 20,
                vy: -1 - Math.random(),
                alpha: 1,
                symbol: ['♪', '♫', '♩', '♬'][Math.floor(Math.random() * 4)]
            });
        }

        if (time % 10 === 0) {
            sparkles.push({
                x: canvas.width / 2 + (Math.random() - 0.5) * 100,
                y: 150 + (Math.random() - 0.5) * 50,
                vx: (Math.random() - 0.5) * 2,
                vy: -1 - Math.random(),
                size: 2 + Math.random() * 3,
                alpha: 1
            });
        }
    }

    notes.forEach(note => {
        note.y += note.vy;
        note.alpha -= 0.01;
    });
    notes = notes.filter(n => n.alpha > 0);

    sparkles.forEach(s => {
        s.x += s.vx;
        s.y += s.vy;
        s.alpha -= 0.02;
    });
    sparkles = sparkles.filter(s => s.alpha > 0);
}

function drawBackground() {
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#1a1008');
    gradient.addColorStop(1, '#2a1810');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawMusicBox() {
    const cx = canvas.width / 2;
    const cy = 180;

    ctx.fillStyle = '#8B4513';
    ctx.beginPath();
    ctx.moveTo(cx - 80, cy + 40);
    ctx.lineTo(cx + 80, cy + 40);
    ctx.lineTo(cx + 70, cy + 80);
    ctx.lineTo(cx - 70, cy + 80);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#A0522D';
    ctx.fillRect(cx - 75, cy - 20, 150, 60);

    ctx.strokeStyle = '#654321';
    ctx.lineWidth = 2;
    ctx.strokeRect(cx - 75, cy - 20, 150, 60);

    ctx.fillStyle = '#DEB887';
    ctx.beginPath();
    ctx.ellipse(cx, cy - 20, 60, 15, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.save();
    ctx.translate(cx, cy - 5);
    ctx.rotate(rotation);

    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.arc(0, 0, 25, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#B8860B';
    ctx.lineWidth = 2;
    for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(Math.cos(angle) * 10, Math.sin(angle) * 10);
        ctx.lineTo(Math.cos(angle) * 22, Math.sin(angle) * 22);
        ctx.stroke();
    }

    ctx.restore();

    ctx.fillStyle = '#B8860B';
    ctx.beginPath();
    ctx.arc(cx, cy - 5, 5, 0, Math.PI * 2);
    ctx.fill();
}

function drawBallerina() {
    const cx = canvas.width / 2;
    const cy = 80;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rotation * 2);

    ctx.fillStyle = '#FFB6C1';
    ctx.beginPath();
    ctx.arc(0, -20, 8, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#FF69B4';
    ctx.beginPath();
    ctx.moveTo(0, -12);
    ctx.lineTo(-15, 10);
    ctx.lineTo(15, 10);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = '#FFB6C1';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-5, 10);
    ctx.lineTo(-8, 25);
    ctx.moveTo(5, 10);
    ctx.lineTo(8, 25);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(-3, -8);
    ctx.lineTo(-15, -5);
    ctx.moveTo(3, -8);
    ctx.lineTo(15, -5);
    ctx.stroke();

    ctx.restore();
}

function drawNotes() {
    ctx.font = '20px Arial';
    notes.forEach(note => {
        ctx.fillStyle = `rgba(255, 215, 0, ${note.alpha})`;
        ctx.fillText(note.symbol, note.x, note.y);
    });
}

function drawSparkles() {
    sparkles.forEach(s => {
        ctx.fillStyle = `rgba(255, 215, 0, ${s.alpha})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fill();
    });
}

function drawWindIndicator() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(10, canvas.height - 30, 100, 15);

    ctx.fillStyle = '#FFD700';
    ctx.fillRect(12, canvas.height - 28, windUp * 0.96, 11);

    ctx.fillStyle = '#fff';
    ctx.font = '10px Arial';
    ctx.fillText('發條', 115, canvas.height - 19);
}

function drawInfo() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(10, 10, 100, 30);

    ctx.fillStyle = '#FFD700';
    ctx.font = '11px Arial';
    ctx.fillText(`發條: ${Math.floor(windUp)}%`, 20, 28);
}

function animate() {
    time++;
    update();
    drawBackground();
    drawSparkles();
    drawMusicBox();
    drawBallerina();
    drawNotes();
    drawWindIndicator();
    drawInfo();

    requestAnimationFrame(animate);
}

document.getElementById('windBtn').addEventListener('click', wind);

animate();
