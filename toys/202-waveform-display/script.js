let canvas, ctx;
let waveType = 'sine';
let frequency = 1;
let amplitude = 0.8;
let harmonic2 = 0;
let harmonic3 = 0;
let time = 0;
let audioContext, oscillator, gainNode;
let isPlaying = false;

function init() {
    canvas = document.getElementById('waveformCanvas');
    ctx = canvas.getContext('2d');
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    setupControls();
    animate();
}

function resizeCanvas() {
    const width = Math.min(800, window.innerWidth - 40);
    canvas.width = width;
    canvas.height = width * 0.4;
}

function setupControls() {
    document.getElementById('waveType').addEventListener('change', (e) => {
        waveType = e.target.value;
        if (isPlaying) updateOscillator();
    });

    document.getElementById('freqSlider').addEventListener('input', (e) => {
        frequency = parseFloat(e.target.value);
        document.getElementById('freqValue').textContent = frequency.toFixed(1) + ' Hz';
    });

    document.getElementById('ampSlider').addEventListener('input', (e) => {
        amplitude = parseFloat(e.target.value);
        document.getElementById('ampValue').textContent = amplitude.toFixed(1);
        if (gainNode) gainNode.gain.setValueAtTime(amplitude * 0.3, audioContext.currentTime);
    });

    document.getElementById('harmonic2').addEventListener('change', (e) => {
        document.getElementById('h2Amp').disabled = !e.target.checked;
        harmonic2 = e.target.checked ? parseFloat(document.getElementById('h2Amp').value) : 0;
    });

    document.getElementById('h2Amp').addEventListener('input', (e) => {
        if (document.getElementById('harmonic2').checked) {
            harmonic2 = parseFloat(e.target.value);
        }
    });

    document.getElementById('harmonic3').addEventListener('change', (e) => {
        document.getElementById('h3Amp').disabled = !e.target.checked;
        harmonic3 = e.target.checked ? parseFloat(document.getElementById('h3Amp').value) : 0;
    });

    document.getElementById('h3Amp').addEventListener('input', (e) => {
        if (document.getElementById('harmonic3').checked) {
            harmonic3 = parseFloat(e.target.value);
        }
    });

    document.getElementById('playBtn').addEventListener('click', togglePlay);
    document.getElementById('resetBtn').addEventListener('click', reset);
}

function reset() {
    waveType = 'sine';
    frequency = 1;
    amplitude = 0.8;
    harmonic2 = 0;
    harmonic3 = 0;

    document.getElementById('waveType').value = 'sine';
    document.getElementById('freqSlider').value = 1;
    document.getElementById('ampSlider').value = 0.8;
    document.getElementById('h2Amp').value = 0;
    document.getElementById('h3Amp').value = 0;
    document.getElementById('harmonic2').checked = false;
    document.getElementById('harmonic3').checked = false;
    document.getElementById('freqValue').textContent = '1.0 Hz';
    document.getElementById('ampValue').textContent = '0.8';

    if (isPlaying) {
        togglePlay();
    }
}

function togglePlay() {
    if (isPlaying) {
        oscillator.stop();
        isPlaying = false;
        document.getElementById('playBtn').textContent = '播放聲音';
    } else {
        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        createOscillator();
        isPlaying = true;
        document.getElementById('playBtn').textContent = '停止聲音';
    }
}

function createOscillator() {
    oscillator = audioContext.createOscillator();
    gainNode = audioContext.createGain();

    updateOscillator();
    oscillator.frequency.setValueAtTime(220, audioContext.currentTime);
    gainNode.gain.setValueAtTime(amplitude * 0.3, audioContext.currentTime);

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    oscillator.start();
}

function updateOscillator() {
    if (!oscillator) return;
    const typeMap = {
        'sine': 'sine',
        'square': 'square',
        'triangle': 'triangle',
        'sawtooth': 'sawtooth',
        'custom': 'sine'
    };
    oscillator.type = typeMap[waveType];
}

function getWaveValue(t, freq = 1, type = waveType) {
    const phase = t * freq * Math.PI * 2;

    switch (type) {
        case 'sine':
            return Math.sin(phase);
        case 'square':
            return Math.sin(phase) >= 0 ? 1 : -1;
        case 'triangle':
            return 2 * Math.abs(2 * ((phase / (2 * Math.PI)) % 1) - 1) - 1;
        case 'sawtooth':
            return 2 * ((phase / (2 * Math.PI)) % 1) - 1;
        case 'custom':
            return Math.sin(phase) + 0.5 * Math.sin(phase * 2) + 0.25 * Math.sin(phase * 3);
        default:
            return Math.sin(phase);
    }
}

function draw() {
    const w = canvas.width;
    const h = canvas.height;

    // Dark background
    ctx.fillStyle = '#0a0a15';
    ctx.fillRect(0, 0, w, h);

    // Draw grid
    ctx.strokeStyle = 'rgba(0, 191, 255, 0.1)';
    ctx.lineWidth = 1;

    // Vertical lines
    for (let x = 0; x <= w; x += 50) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
    }

    // Horizontal lines
    for (let y = 0; y <= h; y += 30) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
    }

    // Center line
    ctx.strokeStyle = 'rgba(0, 255, 136, 0.3)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, h / 2);
    ctx.lineTo(w, h / 2);
    ctx.stroke();

    // Draw waveform
    ctx.beginPath();
    const centerY = h / 2;
    const scale = (h / 2 - 20) * amplitude;

    for (let x = 0; x < w; x++) {
        const t = (x / w) * 4 + time; // 4 cycles visible
        let value = getWaveValue(t, frequency);

        // Add harmonics
        if (harmonic2 > 0) {
            value += harmonic2 * getWaveValue(t, frequency * 2, 'sine');
        }
        if (harmonic3 > 0) {
            value += harmonic3 * getWaveValue(t, frequency * 3, 'sine');
        }

        // Normalize if needed
        const maxAmp = 1 + harmonic2 + harmonic3;
        value = value / maxAmp;

        const y = centerY - value * scale;

        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }

    // Gradient stroke
    const gradient = ctx.createLinearGradient(0, 0, w, 0);
    gradient.addColorStop(0, '#00ff88');
    gradient.addColorStop(0.5, '#00bfff');
    gradient.addColorStop(1, '#00ff88');
    ctx.strokeStyle = gradient;
    ctx.lineWidth = 3;
    ctx.stroke();

    // Glow effect
    ctx.strokeStyle = 'rgba(0, 255, 136, 0.3)';
    ctx.lineWidth = 8;
    ctx.stroke();

    // Draw info
    ctx.font = '14px monospace';
    ctx.fillStyle = '#00ff88';
    ctx.textAlign = 'left';
    ctx.fillText(`波形: ${getWaveTypeName()}`, 20, 25);
    ctx.fillText(`頻率: ${frequency.toFixed(1)} Hz`, 20, 45);
    ctx.fillText(`振幅: ${amplitude.toFixed(1)}`, 20, 65);

    time += 0.02;
}

function getWaveTypeName() {
    const names = {
        'sine': '正弦波',
        'square': '方波',
        'triangle': '三角波',
        'sawtooth': '鋸齒波',
        'custom': '自訂波'
    };
    return names[waveType];
}

function animate() {
    draw();
    requestAnimationFrame(animate);
}

document.addEventListener('DOMContentLoaded', init);
