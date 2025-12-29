let audioContext;
let oscillator;
let gainNode;
let vibratoOsc;
let vibratoGain;
let isPlaying = false;
let waveType = 'sine';
let vibratoAmount = 3;

const canvas = document.getElementById('visualizer');
const ctx = canvas.getContext('2d');
let animationId;
let waveData = [];

function init() {
    setupCanvas();
    setupControls();
    setupThereminArea();
    animate();
}

function setupCanvas() {
    const area = document.getElementById('thereminArea');
    canvas.width = area.clientWidth;
    canvas.height = area.clientHeight;

    for (let i = 0; i < canvas.width; i++) {
        waveData.push(canvas.height / 2);
    }
}

function setupControls() {
    document.getElementById('waveType').addEventListener('change', e => {
        waveType = e.target.value;
        if (oscillator) oscillator.type = waveType;
    });
    document.getElementById('vibratoSlider').addEventListener('input', e => {
        vibratoAmount = parseFloat(e.target.value);
        if (vibratoGain) vibratoGain.gain.value = vibratoAmount;
    });
}

function setupThereminArea() {
    const area = document.getElementById('thereminArea');
    const indicator = document.getElementById('handIndicator');

    area.addEventListener('mouseenter', startSound);
    area.addEventListener('mouseleave', stopSound);
    area.addEventListener('mousemove', handleMove);

    area.addEventListener('touchstart', e => {
        e.preventDefault();
        startSound();
        handleTouch(e);
    });
    area.addEventListener('touchmove', e => {
        e.preventDefault();
        handleTouch(e);
    });
    area.addEventListener('touchend', stopSound);
}

function handleMove(e) {
    const area = document.getElementById('thereminArea');
    const rect = area.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    updateSound(x, y, rect.width, rect.height);
    updateIndicator(x, y);
}

function handleTouch(e) {
    const area = document.getElementById('thereminArea');
    const rect = area.getBoundingClientRect();
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    updateSound(x, y, rect.width, rect.height);
    updateIndicator(x, y);
}

function updateIndicator(x, y) {
    const indicator = document.getElementById('handIndicator');
    indicator.style.left = x + 'px';
    indicator.style.top = y + 'px';
}

function startSound() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }

    if (isPlaying) return;

    oscillator = audioContext.createOscillator();
    gainNode = audioContext.createGain();
    vibratoOsc = audioContext.createOscillator();
    vibratoGain = audioContext.createGain();

    oscillator.type = waveType;
    oscillator.frequency.value = 440;

    vibratoOsc.frequency.value = 5;
    vibratoGain.gain.value = vibratoAmount;

    vibratoOsc.connect(vibratoGain);
    vibratoGain.connect(oscillator.frequency);

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    gainNode.gain.value = 0;

    oscillator.start();
    vibratoOsc.start();

    isPlaying = true;
    document.getElementById('handIndicator').classList.add('active');
}

function stopSound() {
    if (!isPlaying) return;

    gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.1);
    setTimeout(() => {
        if (oscillator) {
            oscillator.stop();
            vibratoOsc.stop();
        }
        isPlaying = false;
    }, 100);

    document.getElementById('handIndicator').classList.remove('active');
}

function updateSound(x, y, width, height) {
    if (!isPlaying || !oscillator) return;

    const minFreq = 100;
    const maxFreq = 1500;
    const freq = minFreq + (x / width) * (maxFreq - minFreq);

    const vol = 1 - (y / height);

    oscillator.frequency.setTargetAtTime(freq, audioContext.currentTime, 0.01);
    gainNode.gain.setTargetAtTime(vol * 0.5, audioContext.currentTime, 0.01);

    document.getElementById('freqValue').textContent = Math.round(freq);
    document.getElementById('volValue').textContent = Math.round(vol * 100);
}

function animate() {
    ctx.fillStyle = 'rgba(15, 15, 26, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (isPlaying && oscillator) {
        const freq = oscillator.frequency.value;
        const vol = gainNode.gain.value;

        waveData.shift();
        const amplitude = vol * 100;
        const offset = Math.sin(Date.now() * freq / 50000) * amplitude;
        waveData.push(canvas.height / 2 + offset);
    } else {
        waveData.shift();
        waveData.push(canvas.height / 2);
    }

    ctx.beginPath();
    ctx.strokeStyle = '#00ff88';
    ctx.lineWidth = 2;
    ctx.shadowBlur = 20;
    ctx.shadowColor = '#00ff88';

    waveData.forEach((y, x) => {
        if (x === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    });

    ctx.stroke();
    ctx.shadowBlur = 0;

    animationId = requestAnimationFrame(animate);
}

document.addEventListener('DOMContentLoaded', init);
window.addEventListener('resize', setupCanvas);
