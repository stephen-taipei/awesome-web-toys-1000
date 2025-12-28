const soundsEl = document.getElementById('sounds');
const atmosphereEl = document.getElementById('atmosphere');
const volumeSlider = document.getElementById('volume');

let audioCtx = null;
let activeSounds = new Map();

const soundTypes = [
    { emoji: '🌧️', name: '雨聲', freq: 200, type: 'noise' },
    { emoji: '🌊', name: '海浪', freq: 100, type: 'wave' },
    { emoji: '🔥', name: '火焰', freq: 150, type: 'fire' },
    { emoji: '🌲', name: '森林', freq: 400, type: 'noise' },
    { emoji: '💨', name: '風聲', freq: 300, type: 'wind' },
    { emoji: '🦗', name: '蟲鳴', freq: 800, type: 'chirp' },
    { emoji: '⏰', name: '時鐘', freq: 1000, type: 'tick' },
    { emoji: '💓', name: '心跳', freq: 60, type: 'beat' },
    { emoji: '🎵', name: '和弦', freq: 220, type: 'chord' }
];

function initAudio() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
}

function createNoise(frequency) {
    const bufferSize = 2 * audioCtx.sampleRate;
    const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = audioCtx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = frequency;

    const gain = audioCtx.createGain();
    gain.gain.value = volumeSlider.value / 100 * 0.3;

    whiteNoise.connect(filter);
    filter.connect(gain);
    gain.connect(audioCtx.destination);
    whiteNoise.start();

    return { source: whiteNoise, gain };
}

function createTone(frequency, type) {
    const oscillator = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    oscillator.type = type === 'chord' ? 'sine' : 'triangle';
    oscillator.frequency.value = frequency;

    if (type === 'beat') {
        // Heartbeat effect
        const lfo = audioCtx.createOscillator();
        const lfoGain = audioCtx.createGain();
        lfo.frequency.value = 1;
        lfoGain.gain.value = 0.5;
        lfo.connect(lfoGain);
        lfoGain.connect(gain.gain);
        lfo.start();
    }

    gain.gain.value = volumeSlider.value / 100 * 0.15;

    oscillator.connect(gain);
    gain.connect(audioCtx.destination);
    oscillator.start();

    return { source: oscillator, gain };
}

function toggleSound(index, btn) {
    initAudio();

    if (activeSounds.has(index)) {
        const sound = activeSounds.get(index);
        sound.source.stop();
        activeSounds.delete(index);
        btn.classList.remove('active');
    } else {
        const soundType = soundTypes[index];
        let sound;

        if (soundType.type === 'noise' || soundType.type === 'wind' || soundType.type === 'fire') {
            sound = createNoise(soundType.freq);
        } else {
            sound = createTone(soundType.freq, soundType.type);
        }

        activeSounds.set(index, sound);
        btn.classList.add('active');
    }

    updateAtmosphere();
}

function updateAtmosphere() {
    const activeNames = [];
    activeSounds.forEach((_, index) => {
        activeNames.push(soundTypes[index].name);
    });

    if (activeNames.length === 0) {
        atmosphereEl.textContent = '選擇音效來創造氛圍';
    } else {
        atmosphereEl.textContent = '🎧 ' + activeNames.join(' + ');
    }
}

function stopAll() {
    activeSounds.forEach((sound, index) => {
        sound.source.stop();
        soundsEl.children[index].classList.remove('active');
    });
    activeSounds.clear();
    updateAtmosphere();
}

volumeSlider.addEventListener('input', () => {
    const vol = volumeSlider.value / 100;
    activeSounds.forEach(sound => {
        sound.gain.gain.value = vol * 0.3;
    });
});

soundTypes.forEach((sound, i) => {
    const btn = document.createElement('button');
    btn.className = 'sound-btn';
    btn.innerHTML = `${sound.emoji}<span>${sound.name}</span>`;
    btn.onclick = () => toggleSound(i, btn);
    soundsEl.appendChild(btn);
});

document.getElementById('stopAll').addEventListener('click', stopAll);
