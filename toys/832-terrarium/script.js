const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 370;
canvas.height = 300;

let humidity = 50;
let plants = [];
let waterDrops = [];
let condensation = [];

function initPlants() {
    plants = [];
    for (let i = 0; i < 5; i++) {
        plants.push({
            x: 60 + i * 65,
            height: 20 + Math.random() * 30,
            width: 8 + Math.random() * 6,
            leaves: Math.floor(2 + Math.random() * 3),
            health: 100,
            type: Math.floor(Math.random() * 3)
        });
    }
}

function drawJar() {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(30, 50);
    ctx.lineTo(30, 260);
    ctx.quadraticCurveTo(30, 280, 50, 280);
    ctx.lineTo(320, 280);
    ctx.quadraticCurveTo(340, 280, 340, 260);
    ctx.lineTo(340, 50);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(40, 50);
    ctx.lineTo(40, 30);
    ctx.lineTo(330, 30);
    ctx.lineTo(330, 50);
    ctx.stroke();

    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.fillRect(35, 55, 300, 220);
}

function drawBackground() {
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(0.5, '#98FB98');
    gradient.addColorStop(1, '#8B4513');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#654321';
    ctx.fillRect(35, 240, 300, 40);

    ctx.fillStyle = '#8B4513';
    for (let i = 0; i < 30; i++) {
        ctx.beginPath();
        ctx.arc(50 + Math.random() * 270, 250 + Math.random() * 25, 2 + Math.random() * 4, 0, Math.PI * 2);
        ctx.fill();
    }
}

function drawPlant(plant) {
    const healthFactor = plant.health / 100;

    ctx.strokeStyle = `hsl(100, ${40 * healthFactor}%, ${25 + 10 * healthFactor}%)`;
    ctx.lineWidth = plant.width / 2;
    ctx.beginPath();
    ctx.moveTo(plant.x, 240);
    ctx.lineTo(plant.x, 240 - plant.height);
    ctx.stroke();

    for (let i = 0; i < plant.leaves; i++) {
        const y = 240 - plant.height * 0.4 - i * 15;
        const dir = i % 2 === 0 ? -1 : 1;

        ctx.fillStyle = `hsl(${100 + Math.random() * 20}, ${50 * healthFactor}%, ${35 + 15 * healthFactor}%)`;
        ctx.beginPath();

        if (plant.type === 0) {
            ctx.ellipse(plant.x + dir * 15, y, 12, 6, dir * 0.5, 0, Math.PI * 2);
        } else if (plant.type === 1) {
            ctx.moveTo(plant.x, y);
            ctx.lineTo(plant.x + dir * 20, y - 5);
            ctx.lineTo(plant.x + dir * 20, y + 5);
        } else {
            ctx.arc(plant.x + dir * 10, y, 8, 0, Math.PI * 2);
        }
        ctx.fill();
    }
}

function updateHumidity() {
    humidity -= 0.05;
    humidity = Math.max(0, Math.min(100, humidity));

    if (humidity > 70 && Math.random() < 0.1) {
        condensation.push({
            x: 40 + Math.random() * 290,
            y: 60 + Math.random() * 50,
            size: 1 + Math.random() * 2
        });
    }

    for (let i = condensation.length - 1; i >= 0; i--) {
        condensation[i].size += 0.01;
        if (condensation[i].size > 4) {
            waterDrops.push({
                x: condensation[i].x,
                y: condensation[i].y,
                vy: 0
            });
            condensation.splice(i, 1);
        }
    }

    plants.forEach(plant => {
        if (humidity > 30) {
            plant.health = Math.min(100, plant.health + 0.05);
            plant.height = Math.min(60, plant.height + 0.01);
        } else {
            plant.health = Math.max(0, plant.health - 0.1);
        }
    });
}

function updateWaterDrops() {
    for (let i = waterDrops.length - 1; i >= 0; i--) {
        waterDrops[i].vy += 0.1;
        waterDrops[i].y += waterDrops[i].vy;

        if (waterDrops[i].y > 235) {
            humidity += 2;
            waterDrops.splice(i, 1);
        }
    }
}

function drawCondensation() {
    condensation.forEach(drop => {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.beginPath();
        ctx.arc(drop.x, drop.y, drop.size, 0, Math.PI * 2);
        ctx.fill();
    });
}

function drawWaterDrops() {
    ctx.fillStyle = 'rgba(100, 149, 237, 0.7)';
    waterDrops.forEach(drop => {
        ctx.beginPath();
        ctx.arc(drop.x, drop.y, 3, 0, Math.PI * 2);
        ctx.fill();
    });
}

function drawHumidityMeter() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(350, 60, 15, 100);

    ctx.fillStyle = `hsl(${200 + humidity}, 70%, 50%)`;
    ctx.fillRect(350, 160 - humidity, 15, humidity);

    ctx.fillStyle = '#fff';
    ctx.font = '10px Arial';
    ctx.fillText(`${Math.round(humidity)}%`, 348, 175);
}

function addWater() {
    for (let i = 0; i < 10; i++) {
        waterDrops.push({
            x: 100 + Math.random() * 170,
            y: 60,
            vy: Math.random() * 2
        });
    }
}

function animate() {
    drawBackground();
    drawJar();
    plants.forEach(plant => drawPlant(plant));
    updateHumidity();
    updateWaterDrops();
    drawCondensation();
    drawWaterDrops();
    drawHumidityMeter();
    requestAnimationFrame(animate);
}

document.getElementById('waterBtn').addEventListener('click', addWater);

initPlants();
animate();
