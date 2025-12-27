let audioContext;
let isPlaying = false;
let currentStep = 0;
let bpm = 120;
let intervalId;

const sounds = ['kick', 'snare', 'hihat', 'clap'];
const soundLabels = ['Kick', 'Snare', 'Hi-Hat', 'Clap'];
const steps = 16;
let pattern = {};

const presets = {
    rock: { kick: [0,8], snare: [4,12], hihat: [0,2,4,6,8,10,12,14], clap: [] },
    hiphop: { kick: [0,6,10], snare: [4,12], hihat: [0,2,4,6,8,10,12,14], clap: [4,12] },
    edm: { kick: [0,4,8,12], snare: [4,12], hihat: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15], clap: [4,12] }
};

function init() {
    createGrid();
    setupControls();
}

function createGrid() {
    const grid = document.getElementById('drumGrid');
    grid.innerHTML = '';

    sounds.forEach((sound, rowIndex) => {
        pattern[sound] = new Array(steps).fill(false);
        const row = document.createElement('div');
        row.className = 'drum-row';

        const label = document.createElement('div');
        label.className = 'drum-label';
        label.textContent = soundLabels[rowIndex];
        row.appendChild(label);

        for (let i = 0; i < steps; i++) {
            const cell = document.createElement('div');
            cell.className = 'drum-cell off';
            cell.dataset.sound = sound;
            cell.dataset.step = i;
            cell.addEventListener('click', () => toggleCell(cell, sound, i));
            row.appendChild(cell);
        }

        grid.appendChild(row);
    });
}

function setupControls() {
    document.getElementById('playBtn').addEventListener('click', togglePlay);
    document.getElementById('clearBtn').addEventListener('click', clearPattern);

    document.getElementById('bpmSlider').addEventListener('input', (e) => {
        bpm = parseInt(e.target.value);
        document.getElementById('bpmValue').textContent = bpm;
        if (isPlaying) {
            stopSequencer();
            startSequencer();
        }
    });

    document.querySelectorAll('.preset-btn').forEach(btn => {
        btn.addEventListener('click', () => loadPreset(btn.dataset.preset));
    });
}

function toggleCell(cell, sound, step) {
    pattern[sound][step] = !pattern[sound][step];
    cell.classList.toggle('on', pattern[sound][step]);
    cell.classList.toggle('off', !pattern[sound][step]);

    if (pattern[sound][step]) {
        playSound(sound);
    }
}

function togglePlay() {
    isPlaying = !isPlaying;
    document.getElementById('playBtn').textContent = isPlaying ? '停止' : '播放';

    if (isPlaying) {
        startSequencer();
    } else {
        stopSequencer();
    }
}

function startSequencer() {
    const interval = (60 / bpm) * 1000 / 4;
    intervalId = setInterval(playStep, interval);
}

function stopSequencer() {
    clearInterval(intervalId);
    currentStep = 0;
    updatePlayhead();
}

function playStep() {
    // Remove active class from previous step
    document.querySelectorAll('.drum-cell').forEach(cell => {
        cell.classList.remove('active');
    });

    // Play sounds and highlight current step
    sounds.forEach(sound => {
        if (pattern[sound][currentStep]) {
            playSound(sound);
        }
        const cell = document.querySelector(`[data-sound="${sound}"][data-step="${currentStep}"]`);
        if (cell) cell.classList.add('active');
    });

    currentStep = (currentStep + 1) % steps;
}

function updatePlayhead() {
    document.querySelectorAll('.drum-cell').forEach(cell => {
        cell.classList.remove('active');
    });
}

function playSound(type) {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }

    const now = audioContext.currentTime;

    switch (type) {
        case 'kick':
            playKick(now);
            break;
        case 'snare':
            playSnare(now);
            break;
        case 'hihat':
            playHihat(now);
            break;
        case 'clap':
            playClap(now);
            break;
    }
}

function playKick(time) {
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();

    osc.frequency.setValueAtTime(150, time);
    osc.frequency.exponentialRampToValueAtTime(0.01, time + 0.5);

    gain.gain.setValueAtTime(1, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.5);

    osc.connect(gain);
    gain.connect(audioContext.destination);

    osc.start(time);
    osc.stop(time + 0.5);
}

function playSnare(time) {
    const noise = audioContext.createBufferSource();
    const buffer = audioContext.createBuffer(1, audioContext.sampleRate * 0.2, audioContext.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < buffer.length; i++) {
        data[i] = Math.random() * 2 - 1;
    }
    noise.buffer = buffer;

    const filter = audioContext.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 1000;

    const gain = audioContext.createGain();
    gain.gain.setValueAtTime(0.5, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.2);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(audioContext.destination);

    noise.start(time);
    noise.stop(time + 0.2);
}

function playHihat(time) {
    const noise = audioContext.createBufferSource();
    const buffer = audioContext.createBuffer(1, audioContext.sampleRate * 0.1, audioContext.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < buffer.length; i++) {
        data[i] = Math.random() * 2 - 1;
    }
    noise.buffer = buffer;

    const filter = audioContext.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 7000;

    const gain = audioContext.createGain();
    gain.gain.setValueAtTime(0.3, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.1);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(audioContext.destination);

    noise.start(time);
    noise.stop(time + 0.1);
}

function playClap(time) {
    for (let i = 0; i < 3; i++) {
        const noise = audioContext.createBufferSource();
        const buffer = audioContext.createBuffer(1, audioContext.sampleRate * 0.03, audioContext.sampleRate);
        const data = buffer.getChannelData(0);
        for (let j = 0; j < buffer.length; j++) {
            data[j] = Math.random() * 2 - 1;
        }
        noise.buffer = buffer;

        const filter = audioContext.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 2000;

        const gain = audioContext.createGain();
        gain.gain.setValueAtTime(0.5, time + i * 0.01);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.15);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(audioContext.destination);

        noise.start(time + i * 0.01);
        noise.stop(time + 0.15);
    }
}

function clearPattern() {
    sounds.forEach(sound => {
        pattern[sound] = new Array(steps).fill(false);
    });
    document.querySelectorAll('.drum-cell').forEach(cell => {
        cell.classList.remove('on');
        cell.classList.add('off');
    });
}

function loadPreset(presetName) {
    clearPattern();
    const preset = presets[presetName];

    sounds.forEach(sound => {
        preset[sound].forEach(step => {
            pattern[sound][step] = true;
            const cell = document.querySelector(`[data-sound="${sound}"][data-step="${step}"]`);
            if (cell) {
                cell.classList.add('on');
                cell.classList.remove('off');
            }
        });
    });
}

document.addEventListener('DOMContentLoaded', init);
