const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 370;
canvas.height = 300;

let terrain = [];
let waterDrops = [];
let sediment = [];
let isRaining = false;

function initTerrain() {
    terrain = [];
    const baseHeight = canvas.height - 100;

    for (let x = 0; x < canvas.width; x++) {
        let height = baseHeight;
        height -= Math.sin(x * 0.02) * 30;
        height -= Math.sin(x * 0.05) * 20;

        if (x > 100 && x < 200) {
            height -= 40 * Math.sin((x - 100) / 100 * Math.PI);
        }
        if (x > 250 && x < 320) {
            height -= 30 * Math.sin((x - 250) / 70 * Math.PI);
        }

        terrain.push({
            height: height,
            hardness: 0.5 + Math.random() * 0.5
        });
    }
}

function addRain() {
    for (let i = 0; i < 10; i++) {
        waterDrops.push({
            x: Math.random() * canvas.width,
            y: 0,
            vy: 2 + Math.random() * 2,
            sedimentCarried: 0
        });
    }
}

function updateWater() {
    for (let i = waterDrops.length - 1; i >= 0; i--) {
        const drop = waterDrops[i];
        drop.y += drop.vy;

        const x = Math.floor(drop.x);
        if (x >= 0 && x < terrain.length) {
            if (drop.y >= terrain[x].height) {
                const erosionAmount = 0.1 / terrain[x].hardness;
                terrain[x].height += erosionAmount;
                drop.sedimentCarried += erosionAmount;

                let leftHeight = x > 0 ? terrain[x - 1].height : terrain[x].height;
                let rightHeight = x < terrain.length - 1 ? terrain[x + 1].height : terrain[x].height;

                if (leftHeight < terrain[x].height && leftHeight < rightHeight) {
                    drop.x -= 1;
                } else if (rightHeight < terrain[x].height) {
                    drop.x += 1;
                }

                drop.y = terrain[Math.floor(drop.x)]?.height || drop.y;

                if (drop.vy < 1 && drop.sedimentCarried > 0) {
                    const depositX = Math.floor(drop.x);
                    if (depositX >= 0 && depositX < terrain.length) {
                        terrain[depositX].height -= drop.sedimentCarried * 0.5;
                        drop.sedimentCarried *= 0.5;
                    }
                }

                drop.vy *= 0.8;
            }
        }

        if (drop.y > canvas.height || drop.vy < 0.1) {
            waterDrops.splice(i, 1);
        }
    }
}

function drawBackground() {
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(0.5, '#B0C4DE');
    gradient.addColorStop(1, '#708090');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawTerrain() {
    ctx.beginPath();
    ctx.moveTo(0, canvas.height);

    for (let x = 0; x < terrain.length; x++) {
        ctx.lineTo(x, terrain[x].height);
    }

    ctx.lineTo(canvas.width, canvas.height);
    ctx.closePath();

    const gradient = ctx.createLinearGradient(0, 100, 0, canvas.height);
    gradient.addColorStop(0, '#8B4513');
    gradient.addColorStop(0.3, '#A0522D');
    gradient.addColorStop(0.7, '#D2691E');
    gradient.addColorStop(1, '#DEB887');
    ctx.fillStyle = gradient;
    ctx.fill();

    ctx.strokeStyle = '#654321';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let x = 0; x < terrain.length; x++) {
        if (x === 0) ctx.moveTo(x, terrain[x].height);
        else ctx.lineTo(x, terrain[x].height);
    }
    ctx.stroke();
}

function drawWater() {
    ctx.fillStyle = 'rgba(100, 149, 237, 0.8)';
    waterDrops.forEach(drop => {
        ctx.beginPath();
        ctx.arc(drop.x, drop.y, 2 + drop.sedimentCarried * 2, 0, Math.PI * 2);
        ctx.fill();
    });

    if (isRaining) {
        ctx.strokeStyle = 'rgba(150, 200, 255, 0.5)';
        ctx.lineWidth = 1;
        for (let i = 0; i < 20; i++) {
            const x = Math.random() * canvas.width;
            const y = Math.random() * 100;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x - 2, y + 15);
            ctx.stroke();
        }
    }
}

function drawStats() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(5, 5, 100, 25);

    ctx.fillStyle = '#fff';
    ctx.font = '11px Arial';
    ctx.fillText(`水滴: ${waterDrops.length}`, 10, 20);
}

function animate() {
    drawBackground();
    drawTerrain();
    drawWater();
    drawStats();
    updateWater();

    if (isRaining) {
        addRain();
    }

    requestAnimationFrame(animate);
}

document.getElementById('rainBtn').addEventListener('click', () => {
    isRaining = !isRaining;
    document.getElementById('rainBtn').textContent = isRaining ? '停止降雨' : '降雨';
});

document.getElementById('resetBtn').addEventListener('click', initTerrain);

initTerrain();
animate();
