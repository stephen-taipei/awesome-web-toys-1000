let audioContext;
let oscillators = [];
let gains = [];
let panners = [];
let masterGain;
let isPlaying = false;

const frequencies = [220, 330, 440];

function init() {
    setupControls();
    animate();
}

function setupControls() {
    document.getElementById('playBtn').addEventListener('click', togglePlay);

    document.querySelectorAll('.fader').forEach((fader, i) => {
        fader.addEventListener('input', () => updateVolume(i, fader.value));
    });

    document.querySelectorAll('.pan').forEach((pan, i) => {
        pan.addEventListener('input', () => updatePan(i, pan.value));
    });

    document.querySelectorAll('.mute-btn').forEach((btn, i) => {
        btn.addEventListener('click', () => toggleMute(i, btn));
    });

    document.querySelectorAll('.solo-btn').forEach((btn, i) => {
        btn.addEventListener('click', () => toggleSolo(i, btn));
    });
}

function togglePlay() {
    if (isPlaying) {
        stopAudio();
        document.getElementById('playBtn').textContent = '開始演示';
    } else {
        startAudio();
        document.getElementById('playBtn').textContent = '停止演示';
    }
    isPlaying = !isPlaying;
}

function startAudio() {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    masterGain = audioContext.createGain();
    masterGain.gain.value = 0.8;
    masterGain.connect(audioContext.destination);

    frequencies.forEach((freq, i) => {
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        const panner = audioContext.createStereoPanner();

        osc.type = i === 0 ? 'sine' : i === 1 ? 'triangle' : 'square';
        osc.frequency.value = freq;
        gain.gain.value = 0.75;

        osc.connect(gain);
        gain.connect(panner);
        panner.connect(masterGain);
        osc.start();

        oscillators.push(osc);
        gains.push(gain);
        panners.push(panner);
    });
}

function stopAudio() {
    oscillators.forEach(osc => osc.stop());
    oscillators = [];
    gains = [];
    panners = [];
}

function updateVolume(channel, value) {
    if (channel < 3 && gains[channel]) {
        gains[channel].gain.value = value / 100;
    } else if (channel === 3 && masterGain) {
        masterGain.gain.value = value / 100;
    }
}

function updatePan(channel, value) {
    if (panners[channel]) {
        panners[channel].pan.value = value / 100;
    }
}

function toggleMute(channel, btn) {
    btn.classList.toggle('active');
    if (gains[channel]) {
        gains[channel].gain.value = btn.classList.contains('active') ? 0 : 0.75;
    }
}

function toggleSolo(channel, btn) {
    btn.classList.toggle('active');
    const isSolo = btn.classList.contains('active');
    gains.forEach((gain, i) => {
        if (isSolo) {
            gain.gain.value = i === channel ? 0.75 : 0;
        } else {
            gain.gain.value = 0.75;
        }
    });
}

function animate() {
    document.querySelectorAll('.channel').forEach((ch, i) => {
        const meter = ch.querySelector('.meter-fill');
        if (meter) {
            const level = isPlaying ? 30 + Math.random() * 50 : 0;
            meter.style.height = level + '%';
        }
    });
    requestAnimationFrame(animate);
}

document.addEventListener('DOMContentLoaded', init);
