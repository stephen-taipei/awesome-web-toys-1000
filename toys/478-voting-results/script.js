const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const infoEl = document.getElementById('info');

const candidates = [
    { name: '候選人 A', votes: 4521, color: '#e74c3c' },
    { name: '候選人 B', votes: 3876, color: '#3498db' },
    { name: '候選人 C', votes: 2543, color: '#2ecc71' },
    { name: '候選人 D', votes: 1890, color: '#f39c12' }
];

let totalVotes = candidates.reduce((s, c) => s + c.votes, 0);
let animatedVotes = candidates.map(c => c.votes);

function addVotes() {
    candidates.forEach((c, i) => {
        const newVotes = Math.floor(Math.random() * 50) + 10;
        c.votes += newVotes;
    });
    totalVotes = candidates.reduce((s, c) => s + c.votes, 0);
}

function animateValues() {
    candidates.forEach((c, i) => {
        animatedVotes[i] += (c.votes - animatedVotes[i]) * 0.1;
    });
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Title
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('即時投票結果', canvas.width / 2, 25);

    // Total votes
    ctx.font = '12px Arial';
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    ctx.fillText(`總票數: ${totalVotes.toLocaleString()}`, canvas.width / 2, 45);

    const animTotal = animatedVotes.reduce((s, v) => s + v, 0);

    // Draw bars
    const barHeight = 40;
    const barGap = 15;
    const startY = 70;
    const maxWidth = canvas.width - 80;

    candidates.forEach((c, i) => {
        const y = startY + i * (barHeight + barGap);
        const pct = animatedVotes[i] / animTotal;
        const barWidth = pct * maxWidth;

        // Background bar
        ctx.fillStyle = 'rgba(255,255,255,0.1)';
        ctx.fillRect(40, y, maxWidth, barHeight);

        // Filled bar
        ctx.fillStyle = c.color;
        ctx.fillRect(40, y, barWidth, barHeight);

        // Candidate name
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(c.name, 50, y + 16);

        // Vote count and percentage
        ctx.font = '11px Arial';
        ctx.fillText(`${Math.floor(animatedVotes[i]).toLocaleString()} 票`, 50, y + 32);

        // Percentage on right
        ctx.textAlign = 'right';
        ctx.font = 'bold 14px Arial';
        ctx.fillText(`${(pct * 100).toFixed(1)}%`, canvas.width - 20, y + barHeight / 2 + 5);
    });

    // Pie chart
    const pieX = canvas.width / 2;
    const pieY = 240;
    const pieRadius = 30;

    let startAngle = -Math.PI / 2;
    candidates.forEach((c, i) => {
        const pct = animatedVotes[i] / animTotal;
        const endAngle = startAngle + pct * Math.PI * 2;

        ctx.beginPath();
        ctx.moveTo(pieX, pieY);
        ctx.arc(pieX, pieY, pieRadius, startAngle, endAngle);
        ctx.closePath();
        ctx.fillStyle = c.color;
        ctx.fill();

        startAngle = endAngle;
    });

    // Pie center
    ctx.beginPath();
    ctx.arc(pieX, pieY, pieRadius * 0.5, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.1)';
    ctx.fill();
}

function update() {
    addVotes();
    animateValues();
    draw();

    const leader = candidates.reduce((a, b) => a.votes > b.votes ? a : b);
    const pct = (leader.votes / totalVotes * 100).toFixed(1);
    infoEl.textContent = `領先: ${leader.name} (${pct}%)`;
}

// Animation loop
function animate() {
    animateValues();
    draw();
    requestAnimationFrame(animate);
}

animate();
setInterval(update, 2000);
