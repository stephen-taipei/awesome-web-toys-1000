const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 370;
canvas.height = 300;

const labels = ['力量', '速度', '耐力', '智慧', '敏捷', '魅力'];
let data1 = [];
let data2 = [];
let target1 = [];
let target2 = [];

function randomize() {
    target1 = labels.map(() => Math.random() * 60 + 40);
    target2 = labels.map(() => Math.random() * 60 + 40);
}

function init() {
    data1 = labels.map(() => 50);
    data2 = labels.map(() => 50);
    randomize();
}

function lerp(a, b, t) {
    return a + (b - a) * t;
}

function update() {
    data1 = data1.map((v, i) => lerp(v, target1[i], 0.1));
    data2 = data2.map((v, i) => lerp(v, target2[i], 0.1));
}

function draw() {
    ctx.fillStyle = '#0a0a15';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const maxRadius = 100;
    const numSides = labels.length;

    for (let level = 5; level >= 1; level--) {
        const radius = (level / 5) * maxRadius;

        ctx.strokeStyle = 'rgba(126, 87, 194, 0.3)';
        ctx.lineWidth = 1;
        ctx.beginPath();

        for (let i = 0; i <= numSides; i++) {
            const angle = (i / numSides) * Math.PI * 2 - Math.PI / 2;
            const x = cx + Math.cos(angle) * radius;
            const y = cy + Math.sin(angle) * radius;

            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }

        ctx.closePath();
        ctx.stroke();
    }

    for (let i = 0; i < numSides; i++) {
        const angle = (i / numSides) * Math.PI * 2 - Math.PI / 2;
        const x = cx + Math.cos(angle) * maxRadius;
        const y = cy + Math.sin(angle) * maxRadius;

        ctx.strokeStyle = 'rgba(126, 87, 194, 0.3)';
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(x, y);
        ctx.stroke();

        const labelX = cx + Math.cos(angle) * (maxRadius + 20);
        const labelY = cy + Math.sin(angle) * (maxRadius + 20);

        ctx.fillStyle = '#fff';
        ctx.font = '11px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(labels[i], labelX, labelY);
    }

    const drawData = (data, color, alpha) => {
        ctx.fillStyle = color + Math.round(alpha * 40).toString(16).padStart(2, '0');
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.beginPath();

        data.forEach((value, i) => {
            const angle = (i / numSides) * Math.PI * 2 - Math.PI / 2;
            const radius = (value / 100) * maxRadius;
            const x = cx + Math.cos(angle) * radius;
            const y = cy + Math.sin(angle) * radius;

            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        });

        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        data.forEach((value, i) => {
            const angle = (i / numSides) * Math.PI * 2 - Math.PI / 2;
            const radius = (value / 100) * maxRadius;
            const x = cx + Math.cos(angle) * radius;
            const y = cy + Math.sin(angle) * radius;

            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(x, y, 4, 0, Math.PI * 2);
            ctx.fill();
        });
    };

    drawData(data1, '#7E57C2', 0.4);
    drawData(data2, '#26A69A', 0.4);

    ctx.fillStyle = '#7E57C2';
    ctx.fillRect(20, 15, 12, 12);
    ctx.fillStyle = '#fff';
    ctx.font = '10px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('角色A', 38, 24);

    ctx.fillStyle = '#26A69A';
    ctx.fillRect(90, 15, 12, 12);
    ctx.fillText('角色B', 108, 24);
}

document.getElementById('randomBtn').addEventListener('click', randomize);

function animate() {
    update();
    draw();
    requestAnimationFrame(animate);
}

init();
animate();
