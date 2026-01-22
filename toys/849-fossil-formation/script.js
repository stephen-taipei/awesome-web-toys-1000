const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 370;
canvas.height = 300;

let stage = 0;
let transition = 0;
const stages = [
    { name: '生物死亡', color: '#4682B4' },
    { name: '沉積覆蓋', color: '#8B7355' },
    { name: '礦物替換', color: '#A0522D' },
    { name: '地層抬升', color: '#87CEEB' },
    { name: '化石出土', color: '#F5DEB3' }
];

function nextStage() {
    if (stage < stages.length - 1) {
        stage++;
        transition = 0;
    } else {
        stage = 0;
        transition = 0;
    }
}

function drawStage0() {
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(0.3, '#4682B4');
    gradient.addColorStop(1, '#1e4d6b');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#DEB887';
    ctx.fillRect(0, canvas.height - 40, canvas.width, 40);

    drawShell(canvas.width / 2, canvas.height - 60, 1, false);

    for (let i = 0; i < 10; i++) {
        ctx.fillStyle = `rgba(144, 238, 144, ${0.3 + Math.random() * 0.3})`;
        ctx.beginPath();
        ctx.moveTo(50 + i * 30, canvas.height - 40);
        ctx.lineTo(55 + i * 30, canvas.height - 60 - Math.random() * 20);
        ctx.lineTo(60 + i * 30, canvas.height - 40);
        ctx.fill();
    }
}

function drawStage1() {
    ctx.fillStyle = '#1e4d6b';
    ctx.fillRect(0, 0, canvas.width, 50);

    for (let i = 0; i < 4; i++) {
        const y = 50 + i * 60;
        ctx.fillStyle = `hsl(30, ${30 + i * 10}%, ${50 - i * 8}%)`;
        ctx.fillRect(0, y, canvas.width, 60);
    }

    drawShell(canvas.width / 2, 150, 1, false);
}

function drawStage2() {
    for (let i = 0; i < 5; i++) {
        const y = i * 60;
        ctx.fillStyle = `hsl(25, ${40 + i * 5}%, ${45 - i * 6}%)`;
        ctx.fillRect(0, y, canvas.width, 60);
    }

    drawShell(canvas.width / 2, 150, 1, true);

    ctx.fillStyle = 'rgba(255, 215, 0, 0.1)';
    for (let i = 0; i < 20; i++) {
        ctx.beginPath();
        ctx.arc(
            canvas.width / 2 + (Math.random() - 0.5) * 80,
            150 + (Math.random() - 0.5) * 60,
            2 + Math.random() * 3,
            0, Math.PI * 2
        );
        ctx.fill();
    }
}

function drawStage3() {
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(0.2, '#B0C4DE');
    gradient.addColorStop(1, '#8B7355');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#6B4423';
    ctx.beginPath();
    ctx.moveTo(0, canvas.height - 80);
    ctx.lineTo(100, canvas.height - 150);
    ctx.lineTo(200, canvas.height - 120);
    ctx.lineTo(300, canvas.height - 180);
    ctx.lineTo(canvas.width, canvas.height - 100);
    ctx.lineTo(canvas.width, canvas.height);
    ctx.lineTo(0, canvas.height);
    ctx.fill();

    drawShell(200, canvas.height - 140, 0.8, true);
}

function drawStage4() {
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(1, '#F5DEB3');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#D2B48C';
    ctx.fillRect(0, canvas.height - 100, canvas.width, 100);

    for (let i = 0; i < 30; i++) {
        ctx.fillStyle = `rgba(139, 119, 101, ${0.3 + Math.random() * 0.4})`;
        ctx.beginPath();
        ctx.arc(
            Math.random() * canvas.width,
            canvas.height - 100 + Math.random() * 100,
            3 + Math.random() * 8,
            0, Math.PI * 2
        );
        ctx.fill();
    }

    drawShell(canvas.width / 2, canvas.height - 80, 1.2, true);

    ctx.strokeStyle = '#8B4513';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height - 80, 50, 0, Math.PI * 2);
    ctx.stroke();
}

function drawShell(x, y, scale, isFossil) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);

    if (isFossil) {
        ctx.fillStyle = '#D2B48C';
        ctx.strokeStyle = '#8B7355';
    } else {
        ctx.fillStyle = '#FFE4B5';
        ctx.strokeStyle = '#DEB887';
    }

    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, -30);

    for (let i = 0; i <= 10; i++) {
        const angle = (i / 10) * Math.PI;
        const r = 30 + Math.sin(i * 1.5) * 5;
        ctx.lineTo(Math.cos(angle) * r, -30 + Math.sin(angle) * r);
    }

    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    for (let i = 1; i < 8; i++) {
        ctx.beginPath();
        ctx.arc(0, -30, i * 4, 0, Math.PI);
        ctx.stroke();
    }

    ctx.restore();
}

function drawInfo() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(10, 10, 150, 40);

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 14px Arial';
    ctx.fillText(`階段 ${stage + 1}/5`, 20, 28);
    ctx.font = '12px Arial';
    ctx.fillText(stages[stage].name, 20, 44);
}

function animate() {
    switch (stage) {
        case 0: drawStage0(); break;
        case 1: drawStage1(); break;
        case 2: drawStage2(); break;
        case 3: drawStage3(); break;
        case 4: drawStage4(); break;
    }

    drawInfo();
    requestAnimationFrame(animate);
}

document.getElementById('nextBtn').addEventListener('click', nextStage);

animate();
