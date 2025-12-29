let audioContext;
let isPlaying = false;
let bpm = 120;
let timeSignature = 4;
let currentBeat = 0;
let intervalId = null;
let pendulumDirection = 1;

function init() {
    setupControls();
}

function setupControls() {
    const bpmSlider = document.getElementById('bpmSlider');
    const playBtn = document.getElementById('playBtn');

    bpmSlider.addEventListener('input', (e) => {
        bpm = parseInt(e.target.value);
        document.getElementById('bpmValue').textContent = bpm;
        updatePresetButtons();
        if (isPlaying) restartMetronome();
    });

    playBtn.addEventListener('click', togglePlay);

    document.querySelectorAll('.preset-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            bpm = parseInt(btn.dataset.bpm);
            bpmSlider.value = bpm;
            document.getElementById('bpmValue').textContent = bpm;
            updatePresetButtons();
            if (isPlaying) restartMetronome();
        });
    });

    document.getElementById('timeSignature').addEventListener('change', (e) => {
        timeSignature = parseInt(e.target.value);
        updateBeatIndicators();
        currentBeat = 0;
        if (isPlaying) restartMetronome();
    });
}

function updatePresetButtons() {
    document.querySelectorAll('.preset-btn').forEach(btn => {
        btn.classList.toggle('active', parseInt(btn.dataset.bpm) === bpm);
    });
}

function updateBeatIndicators() {
    const container = document.querySelector('.beat-indicator');
    container.innerHTML = '';
    for (let i = 1; i <= timeSignature; i++) {
        const beat = document.createElement('div');
        beat.className = 'beat';
        beat.id = `beat${i}`;
        beat.textContent = i;
        container.appendChild(beat);
    }
}

function togglePlay() {
    if (isPlaying) {
        stopMetronome();
        document.getElementById('playBtn').textContent = '▶ 開始';
    } else {
        startMetronome();
        document.getElementById('playBtn').textContent = '⏸ 停止';
    }
    isPlaying = !isPlaying;
}

function startMetronome() {
    if (!audioContext) audioContext = new (window.AudioContext || window.webkitAudioContext)();
    currentBeat = 0;
    tick();
    const interval = (60 / bpm) * 1000;
    intervalId = setInterval(tick, interval);
}

function stopMetronome() {
    if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
    }
    resetVisuals();
}

function restartMetronome() {
    stopMetronome();
    startMetronome();
}

function tick() {
    playClick(currentBeat === 0);
    updateVisuals();
    currentBeat = (currentBeat + 1) % timeSignature;
}

function playClick(isAccent) {
    const freq = isAccent ? 1000 : 800;
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    
    osc.type = 'sine';
    osc.frequency.value = freq;
    
    osc.connect(gain);
    gain.connect(audioContext.destination);
    
    const now = audioContext.currentTime;
    gain.gain.setValueAtTime(isAccent ? 0.5 : 0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
    
    osc.start(now);
    osc.stop(now + 0.05);
}

function updateVisuals() {
    document.querySelectorAll('.beat').forEach((beat, i) => {
        beat.classList.remove('active', 'accent');
        if (i === currentBeat) {
            beat.classList.add('active');
            if (i === 0) beat.classList.add('accent');
        }
    });

    const pendulum = document.getElementById('pendulum');
    const angle = pendulumDirection * 30;
    pendulum.style.transform = `rotate(${angle}deg)`;
    pendulumDirection *= -1;
}

function resetVisuals() {
    document.querySelectorAll('.beat').forEach(beat => {
        beat.classList.remove('active', 'accent');
    });
    document.getElementById('pendulum').style.transform = 'rotate(0deg)';
}

document.addEventListener('DOMContentLoaded', init);
