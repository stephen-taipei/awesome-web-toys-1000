const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const infoEl = document.getElementById('info');

const leftNodes = [
    { name: '學生A', id: 'a' },
    { name: '學生B', id: 'b' },
    { name: '學生C', id: 'c' },
    { name: '學生D', id: 'd' },
    { name: '學生E', id: 'e' }
];

const rightNodes = [
    { name: '數學', id: 'm' },
    { name: '英文', id: 'e' },
    { name: '物理', id: 'p' },
    { name: '化學', id: 'c' }
];

const edges = [
    { from: 0, to: 0 }, { from: 0, to: 1 },
    { from: 1, to: 1 }, { from: 1, to: 2 },
    { from: 2, to: 0 }, { from: 2, to: 2 }, { from: 2, to: 3 },
    { from: 3, to: 1 }, { from: 3, to: 3 },
    { from: 4, to: 0 }, { from: 4, to: 2 }
];

const leftX = 80;
const rightX = canvas.width - 80;
const startY = 60;
const nodeRadius = 20;

let hoverNode = null;
let hoverSide = null;

function getNodeY(index, total) {
    const spacing = (canvas.height - startY - 60) / (total - 1);
    return startY + index * spacing;
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Title
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('學生選課關係', canvas.width / 2, 25);

    // Column labels
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    ctx.font = '12px Arial';
    ctx.fillText('學生', leftX, 45);
    ctx.fillText('課程', rightX, 45);

    // Draw edges
    edges.forEach(edge => {
        const fromY = getNodeY(edge.from, leftNodes.length);
        const toY = getNodeY(edge.to, rightNodes.length);

        const isHighlight = (hoverSide === 'left' && hoverNode === edge.from) ||
                           (hoverSide === 'right' && hoverNode === edge.to);

        ctx.beginPath();
        ctx.moveTo(leftX + nodeRadius, fromY);
        ctx.bezierCurveTo(
            canvas.width / 2, fromY,
            canvas.width / 2, toY,
            rightX - nodeRadius, toY
        );

        ctx.strokeStyle = isHighlight ? '#fff' : 'rgba(255,255,255,0.3)';
        ctx.lineWidth = isHighlight ? 3 : 1;
        ctx.stroke();
    });

    // Draw left nodes
    leftNodes.forEach((node, i) => {
        const y = getNodeY(i, leftNodes.length);
        const isHover = hoverSide === 'left' && hoverNode === i;

        ctx.beginPath();
        ctx.arc(leftX, y, nodeRadius, 0, Math.PI * 2);
        ctx.fillStyle = isHover ? '#3498db' : '#2980b9';
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = isHover ? 3 : 2;
        ctx.stroke();

        ctx.fillStyle = '#fff';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(node.name, leftX, y + 4);
    });

    // Draw right nodes
    rightNodes.forEach((node, i) => {
        const y = getNodeY(i, rightNodes.length);
        const isHover = hoverSide === 'right' && hoverNode === i;

        ctx.beginPath();
        ctx.arc(rightX, y, nodeRadius, 0, Math.PI * 2);
        ctx.fillStyle = isHover ? '#e74c3c' : '#c0392b';
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = isHover ? 3 : 2;
        ctx.stroke();

        ctx.fillStyle = '#fff';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(node.name, rightX, y + 4);
    });
}

canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    hoverNode = null;
    hoverSide = null;

    // Check left nodes
    leftNodes.forEach((node, i) => {
        const nodeY = getNodeY(i, leftNodes.length);
        if (Math.sqrt((x - leftX) ** 2 + (y - nodeY) ** 2) < nodeRadius) {
            hoverNode = i;
            hoverSide = 'left';
        }
    });

    // Check right nodes
    rightNodes.forEach((node, i) => {
        const nodeY = getNodeY(i, rightNodes.length);
        if (Math.sqrt((x - rightX) ** 2 + (y - nodeY) ** 2) < nodeRadius) {
            hoverNode = i;
            hoverSide = 'right';
        }
    });

    canvas.style.cursor = hoverNode !== null ? 'pointer' : 'default';
    draw();
});

canvas.addEventListener('click', () => {
    if (hoverNode !== null) {
        if (hoverSide === 'left') {
            const courses = edges.filter(e => e.from === hoverNode).map(e => rightNodes[e.to].name);
            infoEl.textContent = `${leftNodes[hoverNode].name} 選修: ${courses.join(', ')}`;
        } else {
            const students = edges.filter(e => e.to === hoverNode).map(e => leftNodes[e.from].name);
            infoEl.textContent = `${rightNodes[hoverNode].name} 修課學生: ${students.join(', ')}`;
        }
    }
});

draw();
