const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const regenerateBtn = document.getElementById('regenerateBtn');
const infoEl = document.getElementById('info');

const bases = ['A', 'T', 'G', 'C'];
const baseColors = {
    A: '#e74c3c', // Adenine - Red
    T: '#3498db', // Thymine - Blue
    G: '#2ecc71', // Guanine - Green
    C: '#f1c40f'  // Cytosine - Yellow
};
const complementary = { A: 'T', T: 'A', G: 'C', C: 'G' };

let sequence = '';
let offset = 0;

function generateSequence(length = 50) {
    return Array.from({ length }, () => bases[Math.floor(Math.random() * 4)]).join('');
}

function draw() {
    ctx.fillStyle = '#0a0a15';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const cx = canvas.width / 2;
    const helixWidth = 100;
    const verticalStep = 8;
    const rotationStep = 0.3;

    // Title
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('DNA 雙螺旋結構', cx, 20);

    // Draw double helix
    for (let i = 0; i < sequence.length; i++) {
        const y = 35 + i * verticalStep;
        if (y > canvas.height - 50) break;

        const angle = offset + i * rotationStep;
        const x1 = cx + Math.sin(angle) * helixWidth / 2;
        const x2 = cx + Math.sin(angle + Math.PI) * helixWidth / 2;
        const depth1 = Math.cos(angle);
        const depth2 = Math.cos(angle + Math.PI);

        const base1 = sequence[i];
        const base2 = complementary[base1];

        // Draw connecting line (hydrogen bond)
        ctx.beginPath();
        ctx.moveTo(x1, y);
        ctx.lineTo(x2, y);
        ctx.strokeStyle = 'rgba(255,255,255,0.2)';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Draw base pairs (back ones first)
        const drawBase = (x, base, depth) => {
            const size = 8 + depth * 2;
            const alpha = 0.5 + depth * 0.25;

            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fillStyle = baseColors[base];
            ctx.globalAlpha = alpha;
            ctx.fill();
            ctx.globalAlpha = 1;

            // Label
            if (size > 6) {
                ctx.fillStyle = '#fff';
                ctx.font = `bold ${Math.max(8, size)}px Arial`;
                ctx.textAlign = 'center';
                ctx.fillText(base, x, y + 4);
            }
        };

        // Draw back strand first, then front
        if (depth1 < depth2) {
            drawBase(x1, base1, depth1);
            drawBase(x2, base2, depth2);
        } else {
            drawBase(x2, base2, depth2);
            drawBase(x1, base1, depth1);
        }

        // Draw backbone
        if (i > 0) {
            const prevAngle = offset + (i - 1) * rotationStep;
            const prevX1 = cx + Math.sin(prevAngle) * helixWidth / 2;
            const prevX2 = cx + Math.sin(prevAngle + Math.PI) * helixWidth / 2;
            const prevY = 35 + (i - 1) * verticalStep;

            ctx.strokeStyle = 'rgba(255,255,255,0.5)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(prevX1, prevY);
            ctx.lineTo(x1, y);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(prevX2, prevY);
            ctx.lineTo(x2, y);
            ctx.stroke();
        }
    }

    // Legend
    const legendY = canvas.height - 25;
    let legendX = 40;
    Object.entries(baseColors).forEach(([base, color]) => {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(legendX, legendY, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(base, legendX, legendY + 4);
        legendX += 80;
    });

    offset += 0.02;
    requestAnimationFrame(draw);
}

function regenerate() {
    sequence = generateSequence(50);
    const gcContent = (sequence.match(/[GC]/g) || []).length / sequence.length * 100;
    infoEl.textContent = `序列長度: ${sequence.length} bp | GC含量: ${gcContent.toFixed(1)}%`;
}

regenerateBtn.addEventListener('click', regenerate);

regenerate();
draw();
