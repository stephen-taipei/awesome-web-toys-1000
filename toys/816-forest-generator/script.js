const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 370;
canvas.height = 300;

let trees = [];

function generateForest() {
    trees = [];
    const treeCount = 15 + Math.floor(Math.random() * 10);

    for (let i = 0; i < treeCount; i++) {
        trees.push({
            x: Math.random() * canvas.width,
            y: canvas.height - 40 - Math.random() * 60,
            height: 40 + Math.random() * 60,
            width: 3 + Math.random() * 4,
            foliageSize: 20 + Math.random() * 25,
            type: Math.floor(Math.random() * 3),
            hue: 80 + Math.random() * 60,
            sway: Math.random() * Math.PI * 2
        });
    }

    trees.sort((a, b) => a.y - b.y);
}

function drawBackground() {
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#87ceeb');
    gradient.addColorStop(0.6, '#b0e0e6');
    gradient.addColorStop(1, '#90EE90');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < 3; i++) {
        ctx.fillStyle = `hsl(120, ${30 + i * 10}%, ${50 - i * 10}%)`;
        ctx.beginPath();
        ctx.moveTo(0, canvas.height - 60 + i * 20);
        for (let x = 0; x <= canvas.width; x += 20) {
            ctx.lineTo(x, canvas.height - 60 + i * 20 + Math.sin(x * 0.02 + i) * 10);
        }
        ctx.lineTo(canvas.width, canvas.height);
        ctx.lineTo(0, canvas.height);
        ctx.fill();
    }
}

function drawTree(tree, time) {
    const sway = Math.sin(time * 0.002 + tree.sway) * 3;

    ctx.strokeStyle = '#4a3728';
    ctx.lineWidth = tree.width;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(tree.x, tree.y);
    ctx.quadraticCurveTo(tree.x + sway * 0.5, tree.y - tree.height * 0.5, tree.x + sway, tree.y - tree.height);
    ctx.stroke();

    const foliageY = tree.y - tree.height;

    if (tree.type === 0) {
        for (let i = 0; i < 3; i++) {
            const size = tree.foliageSize * (1 - i * 0.2);
            const y = foliageY + i * 10;
            ctx.fillStyle = `hsl(${tree.hue}, 50%, ${35 + i * 5}%)`;
            ctx.beginPath();
            ctx.moveTo(tree.x + sway, y - size);
            ctx.lineTo(tree.x + sway - size * 0.8, y + size * 0.3);
            ctx.lineTo(tree.x + sway + size * 0.8, y + size * 0.3);
            ctx.fill();
        }
    } else if (tree.type === 1) {
        ctx.fillStyle = `hsl(${tree.hue}, 45%, 40%)`;
        ctx.beginPath();
        ctx.arc(tree.x + sway, foliageY, tree.foliageSize, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = `hsl(${tree.hue}, 50%, 45%)`;
        ctx.beginPath();
        ctx.arc(tree.x + sway - tree.foliageSize * 0.4, foliageY + 5, tree.foliageSize * 0.7, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(tree.x + sway + tree.foliageSize * 0.4, foliageY + 5, tree.foliageSize * 0.7, 0, Math.PI * 2);
        ctx.fill();
    } else {
        ctx.fillStyle = `hsl(${tree.hue}, 40%, 35%)`;
        ctx.beginPath();
        ctx.ellipse(tree.x + sway, foliageY, tree.foliageSize * 0.6, tree.foliageSize, 0, 0, Math.PI * 2);
        ctx.fill();
    }
}

function animate(time) {
    drawBackground();
    trees.forEach(tree => drawTree(tree, time));
    requestAnimationFrame(animate);
}

document.getElementById('generateBtn').addEventListener('click', generateForest);

generateForest();
animate(0);
