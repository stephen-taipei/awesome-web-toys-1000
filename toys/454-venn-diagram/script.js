const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const infoEl = document.getElementById('info');

const sets = [
    { name: '程式設計', cx: 130, cy: 140, r: 80, color: '#e74c3c', count: 150 },
    { name: '設計美學', cx: 230, cy: 140, r: 80, color: '#3498db', count: 120 },
    { name: '商業思維', cx: 180, cy: 210, r: 80, color: '#2ecc71', count: 100 }
];

const intersections = {
    ab: { name: '前端開發', count: 45 },
    bc: { name: '產品設計', count: 35 },
    ac: { name: '技術創業', count: 30 },
    abc: { name: '全端產品經理', count: 15 }
};

let hoverArea = null;

function isInCircle(x, y, cx, cy, r) {
    return Math.sqrt((x - cx) ** 2 + (y - cy) ** 2) <= r;
}

function getArea(x, y) {
    const inA = isInCircle(x, y, sets[0].cx, sets[0].cy, sets[0].r);
    const inB = isInCircle(x, y, sets[1].cx, sets[1].cy, sets[1].r);
    const inC = isInCircle(x, y, sets[2].cx, sets[2].cy, sets[2].r);

    if (inA && inB && inC) return 'abc';
    if (inA && inB) return 'ab';
    if (inB && inC) return 'bc';
    if (inA && inC) return 'ac';
    if (inA) return 'a';
    if (inB) return 'b';
    if (inC) return 'c';
    return null;
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Title
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('技能交集分析', canvas.width / 2, 25);

    // Draw circles with blend mode
    ctx.globalCompositeOperation = 'source-over';

    sets.forEach((set, i) => {
        const isHover = hoverArea === ['a', 'b', 'c'][i] ||
                       (i === 0 && ['ab', 'ac', 'abc'].includes(hoverArea)) ||
                       (i === 1 && ['ab', 'bc', 'abc'].includes(hoverArea)) ||
                       (i === 2 && ['ac', 'bc', 'abc'].includes(hoverArea));

        ctx.beginPath();
        ctx.arc(set.cx, set.cy, set.r, 0, Math.PI * 2);
        ctx.fillStyle = `${set.color}${isHover ? '88' : '55'}`;
        ctx.fill();
        ctx.strokeStyle = set.color;
        ctx.lineWidth = 3;
        ctx.stroke();
    });

    // Labels for each set
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 11px Arial';
    ctx.fillText(sets[0].name, 70, 100);
    ctx.fillText(sets[1].name, 260, 100);
    ctx.fillText(sets[2].name, 180, 270);

    // Intersection counts
    ctx.font = 'bold 14px Arial';
    ctx.fillStyle = 'rgba(255,255,255,0.9)';

    // A only
    ctx.fillText(sets[0].count - 45 - 30 - 15, 90, 150);
    // B only
    ctx.fillText(sets[1].count - 45 - 35 - 15, 270, 150);
    // C only
    ctx.fillText(sets[2].count - 30 - 35 - 15, 180, 240);
    // A∩B
    ctx.fillText(intersections.ab.count - 15, 180, 120);
    // B∩C
    ctx.fillText(intersections.bc.count - 15, 220, 190);
    // A∩C
    ctx.fillText(intersections.ac.count - 15, 140, 190);
    // A∩B∩C
    ctx.font = 'bold 16px Arial';
    ctx.fillText(intersections.abc.count, 180, 165);
}

canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    hoverArea = getArea(x, y);
    canvas.style.cursor = hoverArea ? 'pointer' : 'default';
    draw();
});

canvas.addEventListener('click', () => {
    if (hoverArea) {
        let message = '';
        if (hoverArea === 'abc') message = `${intersections.abc.name}: ${intersections.abc.count} 人`;
        else if (hoverArea === 'ab') message = `${intersections.ab.name}: ${intersections.ab.count} 人`;
        else if (hoverArea === 'bc') message = `${intersections.bc.name}: ${intersections.bc.count} 人`;
        else if (hoverArea === 'ac') message = `${intersections.ac.name}: ${intersections.ac.count} 人`;
        else if (hoverArea === 'a') message = `${sets[0].name}: ${sets[0].count} 人`;
        else if (hoverArea === 'b') message = `${sets[1].name}: ${sets[1].count} 人`;
        else if (hoverArea === 'c') message = `${sets[2].name}: ${sets[2].count} 人`;
        infoEl.textContent = message;
    }
});

draw();
