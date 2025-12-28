const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const infoEl = document.getElementById('info');

const words = [
    { text: 'JavaScript', x: 180, y: 150, size: 30, color: '#f39c12' },
    { text: 'Python', x: 100, y: 100, size: 25, color: '#3498db' },
    { text: 'React', x: 260, y: 100, size: 22, color: '#61dafb' },
    { text: 'Node.js', x: 280, y: 180, size: 20, color: '#68a063' },
    { text: 'CSS', x: 80, y: 180, size: 18, color: '#264de4' },
    { text: 'HTML', x: 120, y: 250, size: 18, color: '#e34c26' },
    { text: 'Vue', x: 250, y: 250, size: 16, color: '#42b883' },
    { text: 'TypeScript', x: 180, y: 80, size: 20, color: '#007acc' }
];

const cooccurrences = [
    { a: 0, b: 2, strength: 0.9 },
    { a: 0, b: 3, strength: 0.85 },
    { a: 0, b: 4, strength: 0.7 },
    { a: 0, b: 5, strength: 0.75 },
    { a: 0, b: 7, strength: 0.8 },
    { a: 1, b: 3, strength: 0.5 },
    { a: 2, b: 4, strength: 0.6 },
    { a: 2, b: 7, strength: 0.7 },
    { a: 3, b: 0, strength: 0.85 },
    { a: 4, b: 5, strength: 0.9 },
    { a: 5, b: 6, strength: 0.5 },
    { a: 6, b: 0, strength: 0.6 }
];

let hoverWord = null;

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Title
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('程式語言共現分析', canvas.width / 2, 25);

    // Draw connections
    cooccurrences.forEach(co => {
        const a = words[co.a];
        const b = words[co.b];
        const isHighlight = hoverWord === co.a || hoverWord === co.b;

        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.strokeStyle = isHighlight ? `rgba(255,255,255,${co.strength})` : `rgba(255,255,255,${co.strength * 0.3})`;
        ctx.lineWidth = co.strength * (isHighlight ? 4 : 2);
        ctx.stroke();
    });

    // Draw words
    words.forEach((word, i) => {
        const isHover = hoverWord === i;

        // Background circle
        ctx.beginPath();
        ctx.arc(word.x, word.y, word.size + 5, 0, Math.PI * 2);
        ctx.fillStyle = isHover ? `${word.color}66` : `${word.color}33`;
        ctx.fill();

        // Text
        ctx.fillStyle = isHover ? '#fff' : word.color;
        ctx.font = `bold ${word.size * 0.5}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(word.text, word.x, word.y);
    });
}

canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    hoverWord = null;
    words.forEach((word, i) => {
        const dist = Math.sqrt((x - word.x) ** 2 + (y - word.y) ** 2);
        if (dist < word.size + 10) {
            hoverWord = i;
        }
    });

    canvas.style.cursor = hoverWord !== null ? 'pointer' : 'default';
    draw();
});

canvas.addEventListener('click', () => {
    if (hoverWord !== null) {
        const word = words[hoverWord];
        const related = cooccurrences
            .filter(co => co.a === hoverWord || co.b === hoverWord)
            .map(co => {
                const other = co.a === hoverWord ? co.b : co.a;
                return `${words[other].text}(${(co.strength * 100).toFixed(0)}%)`;
            });
        infoEl.textContent = `${word.text} 共現: ${related.join(', ')}`;
    }
});

draw();
