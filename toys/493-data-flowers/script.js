const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const regenerateBtn = document.getElementById('regenerateBtn');
const infoEl = document.getElementById('info');

function generateFlowerData() {
    const flowers = [];
    for (let i = 0; i < 5; i++) {
        flowers.push({
            x: 50 + Math.random() * (canvas.width - 100),
            y: 120 + Math.random() * (canvas.height - 180),
            petals: Math.floor(Math.random() * 6) + 5,
            petalSize: 15 + Math.random() * 20,
            petalLength: 0.5 + Math.random() * 0.5,
            hue: Math.random() * 360,
            centerSize: 8 + Math.random() * 8,
            rotation: Math.random() * Math.PI
        });
    }
    return flowers;
}

function drawFlower(flower) {
    const { x, y, petals, petalSize, petalLength, hue, centerSize, rotation } = flower;

    // Draw stem
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.quadraticCurveTo(x - 10, y + 50, x, canvas.height);
    ctx.strokeStyle = '#228b22';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Draw leaves
    ctx.beginPath();
    ctx.ellipse(x - 15, y + 40, 20, 8, -0.5, 0, Math.PI * 2);
    ctx.fillStyle = '#32cd32';
    ctx.fill();

    ctx.beginPath();
    ctx.ellipse(x + 15, y + 60, 18, 7, 0.5, 0, Math.PI * 2);
    ctx.fill();

    // Draw petals
    for (let i = 0; i < petals; i++) {
        const angle = rotation + (i / petals) * Math.PI * 2;
        const petalX = x + Math.cos(angle) * petalSize * petalLength;
        const petalY = y + Math.sin(angle) * petalSize * petalLength;

        ctx.beginPath();
        ctx.ellipse(petalX, petalY, petalSize, petalSize * 0.5, angle, 0, Math.PI * 2);

        const gradient = ctx.createRadialGradient(petalX, petalY, 0, petalX, petalY, petalSize);
        gradient.addColorStop(0, `hsl(${hue}, 80%, 70%)`);
        gradient.addColorStop(1, `hsl(${hue}, 70%, 50%)`);
        ctx.fillStyle = gradient;
        ctx.fill();
    }

    // Draw center
    ctx.beginPath();
    ctx.arc(x, y, centerSize, 0, Math.PI * 2);
    const centerGradient = ctx.createRadialGradient(x, y, 0, x, y, centerSize);
    centerGradient.addColorStop(0, '#ffeb3b');
    centerGradient.addColorStop(1, '#ff9800');
    ctx.fillStyle = centerGradient;
    ctx.fill();

    // Center details
    for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const dotX = x + Math.cos(angle) * centerSize * 0.5;
        const dotY = y + Math.sin(angle) * centerSize * 0.5;
        ctx.beginPath();
        ctx.arc(dotX, dotY, 2, 0, Math.PI * 2);
        ctx.fillStyle = '#8b4513';
        ctx.fill();
    }
}

function draw() {
    // Clear with gradient background
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#87ceeb');
    gradient.addColorStop(0.6, '#98fb98');
    gradient.addColorStop(1, '#228b22');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw ground
    ctx.fillStyle = '#654321';
    ctx.fillRect(0, canvas.height - 20, canvas.width, 20);

    // Generate and draw flowers
    const flowers = generateFlowerData();
    flowers.sort((a, b) => a.y - b.y); // Draw back to front

    flowers.forEach(drawFlower);

    // Legend
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    ctx.font = '10px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('花瓣數 = 數值A', 10, 20);
    ctx.fillText('花瓣大小 = 數值B', 10, 35);
    ctx.fillText('顏色 = 類別', 10, 50);

    infoEl.textContent = `已生成 ${flowers.length} 朵數據花`;
}

regenerateBtn.addEventListener('click', draw);
draw();
