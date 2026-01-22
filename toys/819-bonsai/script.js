const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 370;
canvas.height = 300;

let branches = [];
let trimMode = false;

function initBonsai() {
    branches = [{
        x1: canvas.width / 2,
        y1: canvas.height - 60,
        x2: canvas.width / 2,
        y2: canvas.height - 100,
        width: 8,
        depth: 0,
        children: []
    }];
}

function growBranch(branch) {
    if (branch.depth >= 5) return;

    const angle1 = -Math.PI / 2 + (Math.random() - 0.5) * 0.8;
    const angle2 = -Math.PI / 2 + (Math.random() - 0.5) * 0.8;
    const len = 20 + Math.random() * 15;

    if (branch.children.length < 2 && Math.random() > 0.3) {
        branch.children.push({
            x1: branch.x2,
            y1: branch.y2,
            x2: branch.x2 + Math.cos(angle1) * len,
            y2: branch.y2 + Math.sin(angle1) * len,
            width: branch.width * 0.7,
            depth: branch.depth + 1,
            children: []
        });
    }

    if (branch.children.length < 2 && Math.random() > 0.3) {
        branch.children.push({
            x1: branch.x2,
            y1: branch.y2,
            x2: branch.x2 + Math.cos(angle2) * len,
            y2: branch.y2 + Math.sin(angle2) * len,
            width: branch.width * 0.7,
            depth: branch.depth + 1,
            children: []
        });
    }

    branch.children.forEach(child => {
        if (Math.random() > 0.5) growBranch(child);
    });
}

function drawBackground() {
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#F5F5DC');
    gradient.addColorStop(1, '#D2B48C');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#8B4513';
    ctx.beginPath();
    ctx.ellipse(canvas.width / 2, canvas.height - 30, 60, 25, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#654321';
    ctx.fillRect(canvas.width / 2 - 55, canvas.height - 55, 110, 30);

    ctx.fillStyle = '#3d2817';
    ctx.beginPath();
    ctx.ellipse(canvas.width / 2, canvas.height - 55, 55, 10, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#5D4037';
    ctx.beginPath();
    ctx.ellipse(canvas.width / 2, canvas.height - 55, 45, 8, 0, 0, Math.PI * 2);
    ctx.fill();
}

function drawBranch(branch) {
    ctx.strokeStyle = '#4a3728';
    ctx.lineWidth = branch.width;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(branch.x1, branch.y1);
    ctx.lineTo(branch.x2, branch.y2);
    ctx.stroke();

    if (branch.depth >= 3) {
        for (let i = 0; i < 5; i++) {
            const lx = branch.x2 + (Math.random() - 0.5) * 15;
            const ly = branch.y2 + (Math.random() - 0.5) * 15;
            ctx.fillStyle = `hsl(${100 + Math.random() * 40}, 50%, ${30 + Math.random() * 20}%)`;
            ctx.beginPath();
            ctx.arc(lx, ly, 4 + Math.random() * 4, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    branch.children.forEach(child => drawBranch(child));
}

function findAndRemoveBranch(branch, x, y, parent = null, index = -1) {
    const dist = Math.sqrt(Math.pow(x - branch.x2, 2) + Math.pow(y - branch.y2, 2));

    if (dist < 20 && parent && index >= 0) {
        parent.children.splice(index, 1);
        return true;
    }

    for (let i = 0; i < branch.children.length; i++) {
        if (findAndRemoveBranch(branch.children[i], x, y, branch, i)) {
            return true;
        }
    }
    return false;
}

function animate() {
    drawBackground();
    branches.forEach(branch => drawBranch(branch));
    requestAnimationFrame(animate);
}

canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);

    if (trimMode) {
        branches.forEach(branch => findAndRemoveBranch(branch, x, y));
    }
});

document.getElementById('growBtn').addEventListener('click', () => {
    branches.forEach(branch => growBranch(branch));
});

document.getElementById('trimBtn').addEventListener('click', () => {
    trimMode = !trimMode;
    document.getElementById('trimBtn').style.background = trimMode ? '#DC143C' : '#228B22';
    document.getElementById('trimBtn').textContent = trimMode ? '修剪中' : '修剪';
});

initBonsai();
growBranch(branches[0]);
growBranch(branches[0]);
animate();
