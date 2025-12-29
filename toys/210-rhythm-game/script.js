let canvas, ctx;
let notes = [];
let score = 0;
let combo = 0;
let isPlaying = false;
let speed = 2;
let bpm = 120;
let lastNoteTime = 0;
let hitEffects = [];
let audioContext;

const lanes = ['D', 'F', 'J', 'K'];
const laneColors = ['#ff0080', '#ff8c00', '#40e0d0', '#8a2be2'];
const laneWidth = 70;
const noteHeight = 30;

function init() {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    setupControls();
    setupKeyboard();
    animate();
}

function resizeCanvas() {
    canvas.width = canvas.offsetWidth;
    canvas.height = 400;
}

function setupControls() {
    document.getElementById('startBtn').addEventListener('click', toggleGame);

    document.getElementById('speedSlider').addEventListener('input', (e) => {
        speed = parseFloat(e.target.value);
        document.getElementById('speedValue').textContent = speed + 'x';
    });

    document.getElementById('bpmSlider').addEventListener('input', (e) => {
        bpm = parseInt(e.target.value);
        document.getElementById('bpmValue').textContent = bpm;
    });
}

function setupKeyboard() {
    document.addEventListener('keydown', (e) => {
        const key = e.key.toUpperCase();
        if (lanes.includes(key)) {
            e.preventDefault();
            handleHit(key);
            highlightLane(key, true);
        }
    });

    document.addEventListener('keyup', (e) => {
        const key = e.key.toUpperCase();
        if (lanes.includes(key)) {
            highlightLane(key, false);
        }
    });

    // Touch support
    document.querySelectorAll('.lane').forEach(lane => {
        lane.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const key = lane.dataset.key;
            handleHit(key);
            highlightLane(key, true);
        });
        lane.addEventListener('touchend', () => {
            highlightLane(lane.dataset.key, false);
        });
    });
}

function highlightLane(key, active) {
    const lane = document.querySelector(`.lane[data-key="${key}"]`);
    if (lane) {
        lane.classList.toggle('active', active);
    }
}

function toggleGame() {
    isPlaying = !isPlaying;
    document.getElementById('startBtn').textContent = isPlaying ? '停止遊戲' : '開始遊戲';

    if (isPlaying) {
        score = 0;
        combo = 0;
        notes = [];
        updateScore();
    }
}

function playSound(frequency) {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.1);
}

function spawnNote() {
    const beatInterval = 60000 / bpm;
    const now = Date.now();

    if (now - lastNoteTime >= beatInterval / 2) {
        // Random chance to spawn note
        if (Math.random() < 0.6) {
            const laneIndex = Math.floor(Math.random() * 4);
            notes.push({
                lane: laneIndex,
                y: -noteHeight,
                hit: false,
                missed: false
            });
        }
        lastNoteTime = now;
    }
}

function handleHit(key) {
    const laneIndex = lanes.indexOf(key);
    if (laneIndex === -1) return;

    const hitY = canvas.height - 50;
    const hitWindow = 50;

    // Find closest note in this lane
    let closestNote = null;
    let closestDist = Infinity;

    notes.forEach(note => {
        if (note.lane === laneIndex && !note.hit && !note.missed) {
            const dist = Math.abs(note.y - hitY);
            if (dist < closestDist && dist < hitWindow) {
                closestDist = dist;
                closestNote = note;
            }
        }
    });

    if (closestNote) {
        closestNote.hit = true;

        // Score based on accuracy
        let accuracy;
        if (closestDist < 10) {
            accuracy = 'Perfect';
            score += 100 * (1 + combo * 0.1);
        } else if (closestDist < 25) {
            accuracy = 'Great';
            score += 50 * (1 + combo * 0.1);
        } else {
            accuracy = 'Good';
            score += 25 * (1 + combo * 0.1);
        }

        combo++;
        updateScore();

        // Hit effect
        hitEffects.push({
            x: getLaneX(laneIndex),
            y: hitY,
            text: accuracy,
            alpha: 1,
            scale: 1
        });

        // Play sound
        const frequencies = [261.63, 329.63, 392.00, 523.25];
        playSound(frequencies[laneIndex]);
    }
}

function getLaneX(index) {
    const totalWidth = laneWidth * 4 + 30;
    const startX = (canvas.width - totalWidth) / 2;
    return startX + index * (laneWidth + 10) + laneWidth / 2;
}

function update() {
    if (!isPlaying) return;

    spawnNote();

    // Update notes
    notes.forEach(note => {
        if (!note.hit && !note.missed) {
            note.y += speed * 5;

            // Check if missed
            if (note.y > canvas.height + noteHeight) {
                note.missed = true;
                combo = 0;
                updateScore();
            }
        }
    });

    // Remove old notes
    notes = notes.filter(note => note.y < canvas.height + 100 && !note.hit);

    // Update hit effects
    hitEffects.forEach(effect => {
        effect.alpha -= 0.03;
        effect.scale += 0.02;
        effect.y -= 2;
    });
    hitEffects = hitEffects.filter(e => e.alpha > 0);
}

function updateScore() {
    document.getElementById('score').textContent = Math.floor(score);
    document.getElementById('combo').textContent = combo;
}

function draw() {
    ctx.fillStyle = '#0a0a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const totalWidth = laneWidth * 4 + 30;
    const startX = (canvas.width - totalWidth) / 2;

    // Draw lane backgrounds
    for (let i = 0; i < 4; i++) {
        const x = startX + i * (laneWidth + 10);

        // Lane glow
        const gradient = ctx.createLinearGradient(x, 0, x, canvas.height);
        gradient.addColorStop(0, 'transparent');
        gradient.addColorStop(1, laneColors[i] + '33');
        ctx.fillStyle = gradient;
        ctx.fillRect(x, 0, laneWidth, canvas.height);

        // Lane border
        ctx.strokeStyle = laneColors[i] + '44';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, 0, laneWidth, canvas.height);
    }

    // Draw hit line
    const hitY = canvas.height - 50;
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(startX, hitY);
    ctx.lineTo(startX + totalWidth, hitY);
    ctx.stroke();

    // Draw notes
    notes.forEach(note => {
        if (note.hit || note.missed) return;

        const x = startX + note.lane * (laneWidth + 10);
        const gradient = ctx.createLinearGradient(x, note.y, x, note.y + noteHeight);
        gradient.addColorStop(0, laneColors[note.lane]);
        gradient.addColorStop(1, laneColors[note.lane] + '88');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(x + 5, note.y, laneWidth - 10, noteHeight, 5);
        ctx.fill();

        // Note glow
        ctx.shadowBlur = 15;
        ctx.shadowColor = laneColors[note.lane];
        ctx.fill();
        ctx.shadowBlur = 0;
    });

    // Draw hit effects
    hitEffects.forEach(effect => {
        ctx.font = `bold ${20 * effect.scale}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillStyle = `rgba(255, 255, 255, ${effect.alpha})`;
        ctx.fillText(effect.text, effect.x, effect.y);
    });

    // Draw combo
    if (combo >= 5) {
        ctx.font = 'bold 30px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = `hsla(${(combo * 10) % 360}, 80%, 60%, 0.8)`;
        ctx.fillText(`${combo} COMBO!`, canvas.width / 2, 50);
    }
}

function animate() {
    update();
    draw();
    requestAnimationFrame(animate);
}

document.addEventListener('DOMContentLoaded', init);
