let canvas, ctx;
let audioContext, analyser, oscillator, gainNode, micStream, source;
let dataArray;
let timebase = 5;
let voltage = 1;
let trigger = 50;
let showGrid = true;
let phosphorEffect = false;
let mode = 'tone';
let frequency = 440;
let waveType = 'sine';

function init() {
    canvas = document.getElementById('scopeCanvas');
    ctx = canvas.getContext('2d');
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    setupControls();
    startTone();
    animate();
}

function resizeCanvas() {
    const width = Math.min(700, window.innerWidth - 80);
    canvas.width = width;
    canvas.height = width * 0.5;
}

function setupAudio() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 2048;
        dataArray = new Uint8Array(analyser.frequencyBinCount);
    }
}

function setupControls() {
    document.getElementById('micBtn').addEventListener('click', () => setMode('mic'));
    document.getElementById('toneBtn').addEventListener('click', () => setMode('tone'));

    document.getElementById('timebaseSlider').addEventListener('input', (e) => {
        timebase = parseInt(e.target.value);
    });

    document.getElementById('voltageSlider').addEventListener('input', (e) => {
        voltage = parseFloat(e.target.value);
    });

    document.getElementById('freqSlider').addEventListener('input', (e) => {
        frequency = parseInt(e.target.value);
        document.getElementById('freqValue').textContent = frequency + ' Hz';
        if (oscillator) {
            oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
        }
    });

    document.getElementById('waveSelect').addEventListener('change', (e) => {
        waveType = e.target.value;
        if (oscillator) {
            oscillator.type = waveType;
        }
    });

    document.getElementById('triggerSlider').addEventListener('input', (e) => {
        trigger = parseInt(e.target.value);
        document.getElementById('triggerValue').textContent = trigger + '%';
    });

    document.getElementById('gridCheck').addEventListener('change', (e) => {
        showGrid = e.target.checked;
    });

    document.getElementById('phosphorCheck').addEventListener('change', (e) => {
        phosphorEffect = e.target.checked;
    });
}

function setMode(newMode) {
    mode = newMode;
    document.querySelectorAll('.source-btn').forEach(btn => btn.classList.remove('active'));

    if (newMode === 'tone') {
        document.getElementById('toneBtn').classList.add('active');
        if (micStream) {
            micStream.getTracks().forEach(track => track.stop());
            micStream = null;
        }
        startTone();
    } else if (newMode === 'mic') {
        document.getElementById('micBtn').classList.add('active');
        stopTone();
        startMicrophone();
    }
}

function startTone() {
    setupAudio();

    if (oscillator) {
        oscillator.stop();
    }

    oscillator = audioContext.createOscillator();
    gainNode = audioContext.createGain();

    oscillator.type = waveType;
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);

    oscillator.connect(gainNode);
    gainNode.connect(analyser);
    analyser.connect(audioContext.destination);

    oscillator.start();
}

function stopTone() {
    if (oscillator) {
        oscillator.stop();
        oscillator = null;
    }
}

async function startMicrophone() {
    setupAudio();

    try {
        micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        source = audioContext.createMediaStreamSource(micStream);
        source.connect(analyser);
    } catch (err) {
        alert('無法存取麥克風');
        setMode('tone');
    }
}

function findTriggerPoint() {
    const triggerLevel = (trigger / 100) * 255;

    for (let i = 1; i < dataArray.length - 1; i++) {
        if (dataArray[i - 1] < triggerLevel && dataArray[i] >= triggerLevel) {
            return i;
        }
    }
    return 0;
}

function draw() {
    const w = canvas.width;
    const h = canvas.height;

    // Background with phosphor effect
    if (phosphorEffect) {
        ctx.fillStyle = 'rgba(0, 26, 0, 0.1)';
    } else {
        ctx.fillStyle = '#001a00';
    }
    ctx.fillRect(0, 0, w, h);

    // Draw grid
    if (showGrid) {
        ctx.strokeStyle = '#003300';
        ctx.lineWidth = 1;

        // Vertical lines
        for (let x = 0; x <= w; x += w / 10) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, h);
            ctx.stroke();
        }

        // Horizontal lines
        for (let y = 0; y <= h; y += h / 8) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(w, y);
            ctx.stroke();
        }

        // Center lines (brighter)
        ctx.strokeStyle = '#005500';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, h / 2);
        ctx.lineTo(w, h / 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(w / 2, 0);
        ctx.lineTo(w / 2, h);
        ctx.stroke();
    }

    // Get waveform data
    if (analyser) {
        analyser.getByteTimeDomainData(dataArray);

        const triggerPoint = findTriggerPoint();
        const samplesPerPixel = timebase;
        const centerY = h / 2;

        // Draw waveform
        ctx.beginPath();
        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 2;

        // Glow effect
        ctx.shadowBlur = phosphorEffect ? 15 : 10;
        ctx.shadowColor = '#00ff00';

        let started = false;
        for (let x = 0; x < w; x++) {
            const dataIndex = triggerPoint + x * samplesPerPixel;
            if (dataIndex < dataArray.length) {
                const value = dataArray[dataIndex];
                const normalized = (value - 128) / 128;
                const y = centerY - normalized * (h / 2) * voltage * 0.8;

                if (!started) {
                    ctx.moveTo(x, y);
                    started = true;
                } else {
                    ctx.lineTo(x, y);
                }
            }
        }
        ctx.stroke();

        // Draw trigger level indicator
        ctx.shadowBlur = 0;
        ctx.strokeStyle = 'rgba(255, 255, 0, 0.5)';
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 5]);
        const triggerY = centerY - ((trigger - 50) / 50) * (h / 2) * voltage;
        ctx.beginPath();
        ctx.moveTo(0, triggerY);
        ctx.lineTo(20, triggerY);
        ctx.stroke();
        ctx.setLineDash([]);

        // Draw info
        ctx.font = '12px monospace';
        ctx.fillStyle = '#00ff00';
        ctx.shadowBlur = 0;
        ctx.fillText(`${mode === 'tone' ? frequency + ' Hz' : 'MIC'}`, 10, 20);
        ctx.fillText(`${waveType}`, 10, 35);
    }
}

function animate() {
    draw();
    requestAnimationFrame(animate);
}

document.addEventListener('DOMContentLoaded', init);
