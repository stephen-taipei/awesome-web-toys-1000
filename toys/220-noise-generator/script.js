let audioContext;
let noiseNode;
let gainNode;
let analyser;
let dataArray;
let isPlaying = false;
let noiseType = 'white';
let volume = 0.3;

const canvas = document.getElementById('visualizer');
const ctx = canvas.getContext('2d');

const noiseInfo = {
    white: { name: 'White Noise', desc: '平衡的全頻譜噪音', color: '#ecf0f1' },
    pink: { name: 'Pink Noise', desc: '自然舒緩的粉紅噪音', color: '#f368e0' },
    brown: { name: 'Brown Noise', desc: '低沉深邃的棕噪音', color: '#a68b65' },
    blue: { name: 'Blue Noise', desc: '清脆明亮的藍噪音', color: '#0984e3' }
};

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
    const volumeSlider = document.getElementById('volumeSlider');
    const playBtn = document.getElementById('playBtn');

    volumeSlider.addEventListener('input', (e) => {
        volume = parseFloat(e.target.value);
        document.getElementById('volumeValue').textContent = Math.round(volume * 100) + '%';
        if (gainNode) gainNode.gain.value = volume;
    });

    playBtn.addEventListener('click', togglePlay);

    document.querySelectorAll('.noise-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            noiseType = btn.dataset.type;
            document.querySelectorAll('.noise-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            updateNoiseInfo();
            if (isPlaying) {
                stopNoise();
                startNoise();
            }
        });
    });
}

function updateNoiseInfo() {
    const info = noiseInfo[noiseType];
    document.getElementById('currentNoise').textContent = info.name;
    document.getElementById('noiseDesc').textContent = info.desc;
}

function togglePlay() {
    if (isPlaying) {
        stopNoise();
        document.getElementById('playBtn').textContent = '▶ 播放';
        document.getElementById('playBtn').classList.remove('playing');
    } else {
        startNoise();
        document.getElementById('playBtn').textContent = '⏸ 停止';
        document.getElementById('playBtn').classList.add('playing');
    }
    isPlaying = !isPlaying;
}

function startNoise() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }

    const bufferSize = 2 * audioContext.sampleRate;
    const noiseBuffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    generateNoise(output, noiseType);

    noiseNode = audioContext.createBufferSource();
    noiseNode.buffer = noiseBuffer;
    noiseNode.loop = true;

    gainNode = audioContext.createGain();
    gainNode.gain.value = volume;

    analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    dataArray = new Uint8Array(analyser.frequencyBinCount);

    noiseNode.connect(gainNode);
    gainNode.connect(analyser);
    analyser.connect(audioContext.destination);

    noiseNode.start();
}

function generateNoise(output, type) {
    let b0, b1, b2, b3, b4, b5, b6;
    b0 = b1 = b2 = b3 = b4 = b5 = b6 = 0.0;

    for (let i = 0; i < output.length; i++) {
        const white = Math.random() * 2 - 1;

        switch (type) {
            case 'white':
                output[i] = white;
                break;

            case 'pink':
                b0 = 0.99886 * b0 + white * 0.0555179;
                b1 = 0.99332 * b1 + white * 0.0750759;
                b2 = 0.96900 * b2 + white * 0.1538520;
                b3 = 0.86650 * b3 + white * 0.3104856;
                b4 = 0.55000 * b4 + white * 0.5329522;
                b5 = -0.7616 * b5 - white * 0.0168980;
                output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
                b6 = white * 0.115926;
                break;

            case 'brown':
                output[i] = (b0 + (0.02 * white)) / 1.02;
                b0 = output[i];
                output[i] *= 3.5;
                break;

            case 'blue':
                output[i] = white - b0;
                b0 = white;
                break;
        }
    }
}

function stopNoise() {
    if (noiseNode) {
        noiseNode.stop();
        noiseNode = null;
    }
}

function animate() {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.fillRect(0, 0, width, height);

    if (isPlaying && analyser) {
        analyser.getByteFrequencyData(dataArray);

        const barWidth = width / dataArray.length;
        const color = noiseInfo[noiseType].color;

        ctx.fillStyle = color;
        ctx.shadowBlur = 15;
        ctx.shadowColor = color;

        for (let i = 0; i < dataArray.length; i++) {
            const barHeight = (dataArray[i] / 255) * height * 0.9;
            const x = i * barWidth;
            ctx.fillRect(x, height - barHeight, barWidth - 1, barHeight);
        }

        ctx.shadowBlur = 0;
    }

    requestAnimationFrame(animate);
}

document.addEventListener('DOMContentLoaded', init);
window.addEventListener('resize', setupCanvas);
