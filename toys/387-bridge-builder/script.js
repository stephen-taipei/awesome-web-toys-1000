const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const materialsEl = document.getElementById('materials');
const resultEl = document.getElementById('result');
const testBtn = document.getElementById('testBtn');
const resetBtn = document.getElementById('resetBtn');

let materials = 10;
let nodes = [];
let beams = [];
let selectedNode = null;
let testing = false;
let car = null;
let success = false;

const groundY = 245;
const leftCliff = { x: 0, y: groundY, width: 80 };
const rightCliff = { x: 280, y: groundY, width: 80 };

function initGame() {
    materials = 10;
    testing = false;
    success = false;
    car = null;
    materialsEl.textContent = materials;
    resultEl.textContent = '點擊節點連接建造橋樑!';

    nodes = [
        { x: 80, y: groundY, fixed: true },
        { x: 280, y: groundY, fixed: true },
        { x: 130, y: groundY, fixed: false, vy: 0 },
        { x: 180, y: groundY, fixed: false, vy: 0 },
        { x: 230, y: groundY, fixed: false, vy: 0 },
        { x: 130, y: groundY - 40, fixed: false, vy: 0 },
        { x: 180, y: groundY - 40, fixed: false, vy: 0 },
        { x: 230, y: groundY - 40, fixed: false, vy: 0 }
    ];

    beams = [];
}

function addBeam(n1, n2) {
    if (n1 === n2) return;
    const exists = beams.some(b =>
        (b.n1 === n1 && b.n2 === n2) || (b.n1 === n2 && b.n2 === n1)
    );
    if (!exists && materials > 0) {
        beams.push({ n1, n2, broken: false });
        materials--;
        materialsEl.textContent = materials;
    }
}

function update() {
    if (!testing) return;

    const gravity = 0.2;
    const stiffness = 0.3;
    const damping = 0.98;

    // Apply gravity to non-fixed nodes
    nodes.forEach(n => {
        if (!n.fixed) {
            n.vy += gravity;
            n.vy *= damping;
            n.y += n.vy;

            if (n.y > canvas.height) n.y = canvas.height;
        }
    });

    // Beam constraints
    beams.forEach(beam => {
        if (beam.broken) return;
        const n1 = nodes[beam.n1];
        const n2 = nodes[beam.n2];

        const dx = n2.x - n1.x;
        const dy = n2.y - n1.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        const restLength = 50;

        if (dist > restLength * 2) {
            beam.broken = true;
            return;
        }

        const diff = (dist - restLength) / dist;
        const offsetX = dx * diff * stiffness;
        const offsetY = dy * diff * stiffness;

        if (!n1.fixed) { n1.x += offsetX; n1.y += offsetY; }
        if (!n2.fixed) { n2.x -= offsetX; n2.y -= offsetY; }
    });

    // Car movement
    if (car) {
        car.x += 1.5;

        // Find support
        let support = groundY;
        if (car.x >= leftCliff.width && car.x <= rightCliff.x) {
            nodes.forEach((n, i) => {
                if (!n.fixed && Math.abs(n.x - car.x) < 30) {
                    support = Math.min(support, n.y);
                }
            });
        }
        car.y = support - 15;

        if (car.y > groundY + 50) {
            testing = false;
            resultEl.textContent = '❌ 橋樑崩塌了!';
        }

        if (car.x > rightCliff.x + 30) {
            testing = false;
            success = true;
            resultEl.textContent = '🎉 成功過橋!';
        }
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Sky
    ctx.fillStyle = '#87ceeb';
    ctx.fillRect(0, 0, canvas.width, groundY);

    // Cliffs
    ctx.fillStyle = '#636e72';
    ctx.fillRect(leftCliff.x, leftCliff.y, leftCliff.width, canvas.height - leftCliff.y);
    ctx.fillRect(rightCliff.x, rightCliff.y, rightCliff.width, canvas.height - rightCliff.y);

    // Water
    ctx.fillStyle = '#0984e3';
    ctx.fillRect(leftCliff.width, groundY + 20, rightCliff.x - leftCliff.width, canvas.height);

    // Beams
    beams.forEach(beam => {
        const n1 = nodes[beam.n1];
        const n2 = nodes[beam.n2];
        ctx.strokeStyle = beam.broken ? '#e74c3c' : '#8B4513';
        ctx.lineWidth = beam.broken ? 2 : 6;
        ctx.beginPath();
        ctx.moveTo(n1.x, n1.y);
        ctx.lineTo(n2.x, n2.y);
        ctx.stroke();
    });

    // Nodes
    nodes.forEach((n, i) => {
        ctx.fillStyle = n.fixed ? '#2d3436' : (selectedNode === i ? '#e74c3c' : '#fdcb6e');
        ctx.beginPath();
        ctx.arc(n.x, n.y, 8, 0, Math.PI * 2);
        ctx.fill();
    });

    // Car
    if (car) {
        ctx.fillStyle = '#e74c3c';
        ctx.fillRect(car.x - 20, car.y - 15, 40, 20);
        ctx.fillStyle = '#2d3436';
        ctx.beginPath();
        ctx.arc(car.x - 10, car.y + 5, 6, 0, Math.PI * 2);
        ctx.arc(car.x + 10, car.y + 5, 6, 0, Math.PI * 2);
        ctx.fill();
    }
}

canvas.addEventListener('click', (e) => {
    if (testing) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    let clickedNode = null;
    nodes.forEach((n, i) => {
        if (Math.sqrt(Math.pow(n.x - x, 2) + Math.pow(n.y - y, 2)) < 15) {
            clickedNode = i;
        }
    });

    if (clickedNode !== null) {
        if (selectedNode === null) {
            selectedNode = clickedNode;
        } else {
            addBeam(selectedNode, clickedNode);
            selectedNode = null;
        }
    } else {
        selectedNode = null;
    }
});

testBtn.addEventListener('click', () => {
    if (testing) return;
    testing = true;
    car = { x: 20, y: groundY - 15 };
    resultEl.textContent = '測試中...';
});

resetBtn.addEventListener('click', initGame);

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

initGame();
gameLoop();
