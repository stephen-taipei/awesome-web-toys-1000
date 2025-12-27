let audioContext;
let leftOsc, rightOsc;
let leftGain, rightGain;
let merger;
let isPlaying = false;
let baseFreq = 200;
let beatFreq = 10;
let volume = 0.3;

const canvas = document.getElementById('visualizer');
const ctx = canvas.getContext('2d');
let analyserLeft, analyserRight;
let dataArrayLeft, dataArrayRight;

function init() {
    setupCanvas();
    setupControls();
    animate();
}

function setupCanvas() {
    canvas.width = canvas.clientWidth * window.devicePixelRatio;
    canvas.height = canvas.clientHeight * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
}

function setupControls() {
    const baseSlider = document.getElementById('baseFreqSlider');
    const beatSlider = document.getElementById('beatFreqSlider');
    const volumeSlider = document.getElementById('volumeSlider');
    const playBtn = document.getElementById('playBtn');

    baseSlider.addEventListener('input', (e) => {
        baseFreq = parseInt(e.target.value);
        document.getElementById('baseFreqValue').textContent = baseFreq + ' Hz';
        updateFrequencies();
        updatePresetButtons();
    });

    beatSlider.addEventListener('input', (e) => {
        beatFreq = parseInt(e.target.value);
        document.getElementById('beatFreqValue').textContent = beatFreq + ' Hz';
        updateFrequencies();
        updatePresetButtons();
    });

    volumeSlider.addEventListener('input', (e) => {
        volume = parseFloat(e.target.value);
        if (leftGain) leftGain.gain.value = volume;
        if (rightGain) rightGain.gain.value = volume;
    });

    playBtn.addEventListener('click', togglePlay);

    document.querySelectorAll('.preset-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            beatFreq = parseInt(btn.dataset.beat);
            baseFreq = parseInt(btn.dataset.base);
            baseSlider.value = baseFreq;
            beatSlider.value = beatFreq;
            document.getElementById('baseFreqValue').textContent = baseFreq + ' Hz';
            document.getElementById('beatFreqValue').textContent = beatFreq + ' Hz';
            updateFrequencies();
            updatePresetButtons();
        });
    });
}

function updatePresetButtons() {
    document.querySelectorAll('.preset-btn').forEach(btn => {
        const presetBeat = parseInt(btn.dataset.beat);
        const presetBase = parseInt(btn.dataset.base);
        btn.classList.toggle('active', presetBeat === beatFreq && presetBase === baseFreq);
    });
}

function updateFrequencies() {
    const leftFreq = baseFreq;
    const rightFreq = baseFreq + beatFreq;

    document.getElementById('leftFreq').textContent = leftFreq;
    document.getElementById('rightFreq').textContent = rightFreq;
    document.getElementById('beatFreq').textContent = beatFreq;

    if (isPlaying && leftOsc && rightOsc) {
        leftOsc.frequency.setValueAtTime(leftFreq, audioContext.currentTime);
        rightOsc.frequency.setValueAtTime(rightFreq, audioContext.currentTime);
    }
}

function togglePlay() {
    if (isPlaying) {
        stopBeats();
        document.getElementById('playBtn').textContent = '▶ 開始';
    } else {
        startBeats();
        document.getElementById('playBtn').textContent = '⏸ 停止';
    }
    isPlaying = !isPlaying;
}

function startBeats() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }

    leftOsc = audioContext.createOscillator();
    rightOsc = audioContext.createOscillator();
    leftGain = audioContext.createGain();
    rightGain = audioContext.createGain();
    merger = audioContext.createChannelMerger(2);
    analyserLeft = audioContext.createAnalyser();
    analyserRight = audioContext.createAnalyser();

    leftOsc.type = 'sine';
    rightOsc.type = 'sine';
    leftOsc.frequency.value = baseFreq;
    rightOsc.frequency.value = baseFreq + beatFreq;

    leftGain.gain.value = volume;
    rightGain.gain.value = volume;

    analyserLeft.fftSize = 256;
    analyserRight.fftSize = 256;
    dataArrayLeft = new Uint8Array(analyserLeft.frequencyBinCount);
    dataArrayRight = new Uint8Array(analyserRight.frequencyBinCount);

    leftOsc.connect(leftGain);
    rightOsc.connect(rightGain);

    leftGain.connect(analyserLeft);
    rightGain.connect(analyserRight);

    analyserLeft.connect(merger, 0, 0);
    analyserRight.connect(merger, 0, 1);

    merger.connect(audioContext.destination);

    leftOsc.start();
    rightOsc.start();

    updateFrequencies();
}

function stopBeats() {
    if (leftOsc) {
        leftOsc.stop();
        rightOsc.stop();
        leftOsc = null;
        rightOsc = null;
    }
}

function animate() {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(0, 0, width, height);

    if (isPlaying && analyserLeft && analyserRight) {
        analyserLeft.getByteFrequencyData(dataArrayLeft);
        analyserRight.getByteFrequencyData(dataArrayRight);

        const barWidth = width / (dataArrayLeft.length * 2);

        ctx.fillStyle = '#9b59b6';
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#9b59b6';
        for (let i = 0; i < dataArrayLeft.length; i++) {
            const barHeight = (dataArrayLeft[i] / 255) * height * 0.8;
            ctx.fillRect(i * barWidth, height - barHeight, barWidth - 1, barHeight);
        }

        ctx.fillStyle = '#3498db';
        ctx.shadowColor = '#3498db';
        for (let i = 0; i < dataArrayRight.length; i++) {
            const barHeight = (dataArrayRight[i] / 255) * height * 0.8;
            const x = width - (i + 1) * barWidth;
            ctx.fillRect(x, height - barHeight, barWidth - 1, barHeight);
        }
        ctx.shadowBlur = 0;
    }

    requestAnimationFrame(animate);
}

document.addEventListener('DOMContentLoaded', init);
window.addEventListener('resize', setupCanvas);
