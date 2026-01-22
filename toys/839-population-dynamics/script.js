const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 370;
canvas.height = 300;

let preyPop = 100;
let predatorPop = 20;
let preyHistory = [];
let predatorHistory = [];
let time = 0;

const alpha = 0.1;
const beta = 0.002;
const gamma = 0.1;
const delta = 0.001;

function reset() {
    preyPop = 100;
    predatorPop = 20;
    preyHistory = [];
    predatorHistory = [];
    time = 0;
}

function updatePopulation() {
    const dPrey = alpha * preyPop - beta * preyPop * predatorPop;
    const dPredator = delta * preyPop * predatorPop - gamma * predatorPop;

    preyPop += dPrey;
    predatorPop += dPredator;

    preyPop = Math.max(1, Math.min(300, preyPop));
    predatorPop = Math.max(1, Math.min(100, predatorPop));

    preyHistory.push(preyPop);
    predatorHistory.push(predatorPop);

    if (preyHistory.length > 340) {
        preyHistory.shift();
        predatorHistory.shift();
    }

    time++;
}

function drawBackground() {
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;

    for (let y = 50; y < canvas.height - 50; y += 40) {
        ctx.beginPath();
        ctx.moveTo(30, y);
        ctx.lineTo(canvas.width - 10, y);
        ctx.stroke();
    }
}

function drawGraph() {
    const graphHeight = 180;
    const graphTop = 30;
    const graphLeft = 30;
    const graphWidth = canvas.width - 40;

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 1;
    ctx.strokeRect(graphLeft, graphTop, graphWidth, graphHeight);

    if (preyHistory.length > 1) {
        ctx.strokeStyle = '#4CAF50';
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let i = 0; i < preyHistory.length; i++) {
            const x = graphLeft + (i / 340) * graphWidth;
            const y = graphTop + graphHeight - (preyHistory[i] / 300) * graphHeight;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();

        ctx.strokeStyle = '#f44336';
        ctx.beginPath();
        for (let i = 0; i < predatorHistory.length; i++) {
            const x = graphLeft + (i / 340) * graphWidth;
            const y = graphTop + graphHeight - (predatorHistory[i] / 100) * graphHeight;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();
    }

    ctx.fillStyle = '#4CAF50';
    ctx.font = '12px Arial';
    ctx.fillText(`獵物: ${Math.round(preyPop)}`, graphLeft, graphTop + graphHeight + 30);

    ctx.fillStyle = '#f44336';
    ctx.fillText(`掠食者: ${Math.round(predatorPop)}`, graphLeft + 100, graphTop + graphHeight + 30);

    ctx.fillStyle = '#fff';
    ctx.fillText(`時間: ${time}`, graphLeft + 220, graphTop + graphHeight + 30);

    ctx.fillStyle = '#4CAF50';
    ctx.fillRect(graphLeft, graphTop + graphHeight + 45, 15, 15);
    ctx.fillStyle = '#fff';
    ctx.fillText('獵物 (兔)', graphLeft + 20, graphTop + graphHeight + 57);

    ctx.fillStyle = '#f44336';
    ctx.fillRect(graphLeft + 100, graphTop + graphHeight + 45, 15, 15);
    ctx.fillStyle = '#fff';
    ctx.fillText('掠食者 (狐)', graphLeft + 120, graphTop + graphHeight + 57);
}

function drawPhaseSpace() {
    const phaseSize = 80;
    const phaseLeft = canvas.width - phaseSize - 20;
    const phaseTop = 230;

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 1;
    ctx.strokeRect(phaseLeft, phaseTop, phaseSize, phaseSize - 20);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.font = '9px Arial';
    ctx.fillText('相位空間', phaseLeft, phaseTop - 5);

    if (preyHistory.length > 1) {
        ctx.strokeStyle = 'rgba(255, 255, 0, 0.5)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        const len = Math.min(100, preyHistory.length);
        for (let i = preyHistory.length - len; i < preyHistory.length; i++) {
            const x = phaseLeft + (preyHistory[i] / 300) * phaseSize;
            const y = phaseTop + phaseSize - 20 - (predatorHistory[i] / 100) * (phaseSize - 20);
            if (i === preyHistory.length - len) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();

        ctx.fillStyle = '#FFD700';
        const lastX = phaseLeft + (preyPop / 300) * phaseSize;
        const lastY = phaseTop + phaseSize - 20 - (predatorPop / 100) * (phaseSize - 20);
        ctx.beginPath();
        ctx.arc(lastX, lastY, 3, 0, Math.PI * 2);
        ctx.fill();
    }
}

function animate() {
    updatePopulation();
    drawBackground();
    drawGraph();
    drawPhaseSpace();
    requestAnimationFrame(animate);
}

document.getElementById('resetBtn').addEventListener('click', reset);

reset();
animate();
