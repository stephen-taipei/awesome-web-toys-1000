const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const infoEl = document.getElementById('info');

const groups = [
    { name: '台北', color: '#e74c3c' },
    { name: '台中', color: '#3498db' },
    { name: '高雄', color: '#2ecc71' },
    { name: '台南', color: '#f39c12' }
];

// Flow matrix [from][to]
const matrix = [
    [0, 30, 20, 15],
    [25, 0, 35, 10],
    [15, 20, 0, 25],
    [20, 15, 30, 0]
];

const cx = canvas.width / 2;
const cy = canvas.height / 2 + 10;
const outerRadius = 120;
const innerRadius = 100;

let hoverChord = null;
let chords = [];

function calculateArcs() {
    const total = matrix.flat().reduce((a, b) => a + b, 0);
    const groupTotals = groups.map((_, i) =>
        matrix[i].reduce((a, b) => a + b, 0) + matrix.map(row => row[i]).reduce((a, b) => a + b, 0)
    );
    const grandTotal = groupTotals.reduce((a, b) => a + b, 0);

    const arcs = [];
    let currentAngle = 0;
    const gap = 0.05;

    groups.forEach((group, i) => {
        const angle = (groupTotals[i] / grandTotal) * (Math.PI * 2 - gap * groups.length);
        arcs.push({
            group,
            startAngle: currentAngle,
            endAngle: currentAngle + angle,
            index: i
        });
        currentAngle += angle + gap;
    });

    return arcs;
}

function calculateChords(arcs) {
    chords = [];

    for (let i = 0; i < groups.length; i++) {
        for (let j = i + 1; j < groups.length; j++) {
            if (matrix[i][j] > 0 || matrix[j][i] > 0) {
                chords.push({
                    source: i,
                    target: j,
                    value: matrix[i][j] + matrix[j][i]
                });
            }
        }
    }
    return chords;
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Title
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('城市間人口流動', cx, 25);

    const arcs = calculateArcs();
    calculateChords(arcs);

    // Draw arcs
    arcs.forEach(arc => {
        ctx.beginPath();
        ctx.arc(cx, cy, outerRadius, arc.startAngle - Math.PI / 2, arc.endAngle - Math.PI / 2);
        ctx.arc(cx, cy, innerRadius, arc.endAngle - Math.PI / 2, arc.startAngle - Math.PI / 2, true);
        ctx.closePath();
        ctx.fillStyle = arc.group.color;
        ctx.fill();

        // Label
        const midAngle = (arc.startAngle + arc.endAngle) / 2 - Math.PI / 2;
        const labelRadius = outerRadius + 15;
        ctx.fillStyle = '#fff';
        ctx.font = '11px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(
            arc.group.name,
            cx + Math.cos(midAngle) * labelRadius,
            cy + Math.sin(midAngle) * labelRadius + 4
        );
    });

    // Draw chords
    chords.forEach(chord => {
        const sourceArc = arcs[chord.source];
        const targetArc = arcs[chord.target];
        const isHover = hoverChord === chord;

        const s1 = (sourceArc.startAngle + sourceArc.endAngle) / 2 - Math.PI / 2;
        const t1 = (targetArc.startAngle + targetArc.endAngle) / 2 - Math.PI / 2;

        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(s1) * innerRadius, cy + Math.sin(s1) * innerRadius);
        ctx.quadraticCurveTo(cx, cy, cx + Math.cos(t1) * innerRadius, cy + Math.sin(t1) * innerRadius);

        ctx.strokeStyle = isHover ? '#fff' : `${sourceArc.group.color}88`;
        ctx.lineWidth = isHover ? chord.value / 8 + 2 : chord.value / 10;
        ctx.stroke();
    });
}

canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const arcs = calculateArcs();
    hoverChord = null;

    chords.forEach(chord => {
        const sourceArc = arcs[chord.source];
        const targetArc = arcs[chord.target];
        const s1 = (sourceArc.startAngle + targetArc.endAngle) / 2 - Math.PI / 2;
        const midX = cx;
        const midY = cy;

        const dist = Math.sqrt((x - midX) ** 2 + (y - midY) ** 2);
        if (dist < innerRadius * 0.8) {
            hoverChord = chord;
        }
    });

    draw();
});

canvas.addEventListener('click', () => {
    if (hoverChord) {
        const source = groups[hoverChord.source].name;
        const target = groups[hoverChord.target].name;
        infoEl.textContent = `${source} ↔ ${target}: ${hoverChord.value} 萬人次`;
    }
});

draw();
