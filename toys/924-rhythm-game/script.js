const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 370;
canvas.height = 300;

const lanes = 4;
const laneWidth = canvas.width / lanes;
const hitZoneY = canvas.height - 50;
const hitZoneHeight = 30;

let notes = [];
let score = 0;
let combo = 0;
let effects = [];
let time = 0;
let isPlaying = true;

const laneColors = ['#E74C3C', '#3498DB', '#2ECC71', '#F1C40F'];

function init() {
    notes = [];
    score = 0;
    combo = 0;
    effects = [];
    time = 0;
    isPlaying = true;
}

function spawnNote() {
    const lane = Math.floor(Math.random() * lanes);
    notes.push({
        lane,
        y: -20,
        speed: 3 + Math.random() * 2,
        hit: false
    });
}

function hitLane(lane) {
    const hitNote = notes.find(note =>
        note.lane === lane &&
        !note.hit &&
        note.y >= hitZoneY - 30 &&
        note.y <= hitZoneY + hitZoneHeight + 10
    );

    if (hitNote) {
        hitNote.hit = true;
        score += 100 * (1 + combo * 0.1);
        combo++;

        effects.push({
            x: lane * laneWidth + laneWidth / 2,
            y: hitZoneY,
            radius: 10,
            alpha: 1,
            type: 'hit'
        });
    } else {
        effects.push({
            x: lane * laneWidth + laneWidth / 2,
            y: hitZoneY,
            radius: 10,
            alpha: 1,
            type: 'miss'
        });
    }
}

function update() {
    if (!isPlaying) return;

    time++;

    if (time % 30 === 0) {
        spawnNote();
    }

    notes.forEach(note => {
        note.y += note.speed;
    });

    notes = notes.filter(note => {
        if (note.y > canvas.height && !note.hit) {
            combo = 0;
            return false;
        }
        if (note.hit && note.y > canvas.height) {
            return false;
        }
        return true;
    });

    effects.forEach(e => {
        e.radius += 3;
        e.alpha -= 0.05;
    });
    effects = effects.filter(e => e.alpha > 0);
}

function drawBackground() {
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < lanes; i++) {
        ctx.fillStyle = `rgba(${i === 0 ? '231, 76, 60' : i === 1 ? '52, 152, 219' : i === 2 ? '46, 204, 113' : '241, 196, 15'}, 0.1)`;
        ctx.fillRect(i * laneWidth, 0, laneWidth, canvas.height);

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(i * laneWidth, 0);
        ctx.lineTo(i * laneWidth, canvas.height);
        ctx.stroke();
    }
}

function drawHitZone() {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.fillRect(0, hitZoneY, canvas.width, hitZoneHeight);

    for (let i = 0; i < lanes; i++) {
        ctx.strokeStyle = laneColors[i];
        ctx.lineWidth = 3;
        ctx.strokeRect(i * laneWidth + 5, hitZoneY + 5, laneWidth - 10, hitZoneHeight - 10);
    }
}

function drawNotes() {
    notes.forEach(note => {
        if (note.hit) return;

        const x = note.lane * laneWidth + laneWidth / 2;
        const gradient = ctx.createRadialGradient(x, note.y, 0, x, note.y, 15);
        gradient.addColorStop(0, laneColors[note.lane]);
        gradient.addColorStop(1, 'transparent');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, note.y, 15, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = laneColors[note.lane];
        ctx.beginPath();
        ctx.arc(x, note.y, 10, 0, Math.PI * 2);
        ctx.fill();
    });
}

function drawEffects() {
    effects.forEach(e => {
        ctx.strokeStyle = e.type === 'hit'
            ? `rgba(46, 204, 113, ${e.alpha})`
            : `rgba(231, 76, 60, ${e.alpha})`;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.radius, 0, Math.PI * 2);
        ctx.stroke();
    });
}

function drawInfo() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(10, 10, 150, 45);

    ctx.fillStyle = '#fff';
    ctx.font = '12px Arial';
    ctx.fillText(`分數: ${Math.floor(score)}`, 20, 28);
    ctx.fillText(`連擊: ${combo}`, 20, 45);
}

function animate() {
    update();
    drawBackground();
    drawHitZone();
    drawNotes();
    drawEffects();
    drawInfo();

    requestAnimationFrame(animate);
}

canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const lane = Math.floor(x / laneWidth);
    hitLane(lane);
});

document.getElementById('startBtn').addEventListener('click', init);

animate();
