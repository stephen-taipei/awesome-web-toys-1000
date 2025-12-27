let audioContext;
let volume = 0.5;
let pitch = 1;

const effects = [
    { name: 'Laser', icon: '🔫', color: '#ff6b6b', type: 'laser' },
    { name: 'Explosion', icon: '💥', color: '#ff9f43', type: 'explosion' },
    { name: 'Beep', icon: '🔔', color: '#feca57', type: 'beep' },
    { name: 'Whoosh', icon: '💨', color: '#48dbfb', type: 'whoosh' },
    { name: 'Pop', icon: '🎈', color: '#ff6b9d', type: 'pop' },
    { name: 'Coin', icon: '🪙', color: '#ffd700', type: 'coin' },
    { name: 'Jump', icon: '🦘', color: '#26de81', type: 'jump' },
    { name: 'Power Up', icon: '⚡', color: '#a55eea', type: 'powerup' },
    { name: 'Error', icon: '❌', color: '#eb3b5a', type: 'error' },
    { name: 'Success', icon: '✅', color: '#20bf6b', type: 'success' },
    { name: 'Click', icon: '👆', color: '#4b7bec', type: 'click' },
    { name: 'Alarm', icon: '🚨', color: '#fc5c65', type: 'alarm' }
];

function init() {
    createEffectButtons();
    setupControls();
}

function createEffectButtons() {
    const grid = document.getElementById('effectsGrid');
    effects.forEach(effect => {
        const btn = document.createElement('button');
        btn.className = 'effect-btn';
        btn.style.background = `linear-gradient(135deg, ${effect.color}dd, ${effect.color}88)`;
        btn.innerHTML = `${effect.icon}<span class="label">${effect.name}</span>`;
        btn.addEventListener('click', () => playEffect(effect.type, btn));
        grid.appendChild(btn);
    });
}

function setupControls() {
    document.getElementById('volumeSlider').addEventListener('input', e => volume = parseFloat(e.target.value));
    document.getElementById('pitchSlider').addEventListener('input', e => pitch = parseFloat(e.target.value));
}

function playEffect(type, btn) {
    if (!audioContext) audioContext = new (window.AudioContext || window.webkitAudioContext)();
    btn.classList.add('playing');
    setTimeout(() => btn.classList.remove('playing'), 300);

    const now = audioContext.currentTime;
    switch (type) {
        case 'laser': playLaser(now); break;
        case 'explosion': playExplosion(now); break;
        case 'beep': playBeep(now); break;
        case 'whoosh': playWhoosh(now); break;
        case 'pop': playPop(now); break;
        case 'coin': playCoin(now); break;
        case 'jump': playJump(now); break;
        case 'powerup': playPowerUp(now); break;
        case 'error': playError(now); break;
        case 'success': playSuccess(now); break;
        case 'click': playClick(now); break;
        case 'alarm': playAlarm(now); break;
    }
}

function createOsc(freq, type = 'sine') {
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    osc.type = type;
    osc.frequency.value = freq * pitch;
    osc.connect(gain);
    gain.connect(audioContext.destination);
    gain.gain.value = 0;
    return { osc, gain };
}

function playLaser(t) {
    const { osc, gain } = createOsc(1500, 'sawtooth');
    osc.frequency.setValueAtTime(1500 * pitch, t);
    osc.frequency.exponentialRampToValueAtTime(100 * pitch, t + 0.3);
    gain.gain.setValueAtTime(volume * 0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
    osc.start(t);
    osc.stop(t + 0.3);
}

function playExplosion(t) {
    const bufferSize = audioContext.sampleRate * 0.5;
    const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.1));
    const noise = audioContext.createBufferSource();
    const gain = audioContext.createGain();
    const filter = audioContext.createBiquadFilter();
    noise.buffer = buffer;
    filter.type = 'lowpass';
    filter.frequency.value = 500;
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(audioContext.destination);
    gain.gain.setValueAtTime(volume, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
    noise.start(t);
}

function playBeep(t) {
    const { osc, gain } = createOsc(880, 'sine');
    gain.gain.setValueAtTime(volume * 0.3, t);
    gain.gain.setValueAtTime(0, t + 0.15);
    osc.start(t);
    osc.stop(t + 0.2);
}

function playWhoosh(t) {
    const bufferSize = audioContext.sampleRate * 0.4;
    const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    const noise = audioContext.createBufferSource();
    const gain = audioContext.createGain();
    const filter = audioContext.createBiquadFilter();
    noise.buffer = buffer;
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(200, t);
    filter.frequency.exponentialRampToValueAtTime(2000, t + 0.2);
    filter.frequency.exponentialRampToValueAtTime(200, t + 0.4);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(audioContext.destination);
    gain.gain.setValueAtTime(volume * 0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
    noise.start(t);
}

function playPop(t) {
    const { osc, gain } = createOsc(400, 'sine');
    osc.frequency.exponentialRampToValueAtTime(100 * pitch, t + 0.1);
    gain.gain.setValueAtTime(volume * 0.5, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
    osc.start(t);
    osc.stop(t + 0.1);
}

function playCoin(t) {
    [0, 0.1].forEach((delay, i) => {
        const { osc, gain } = createOsc(i === 0 ? 987 : 1318, 'square');
        gain.gain.setValueAtTime(volume * 0.2, t + delay);
        gain.gain.exponentialRampToValueAtTime(0.001, t + delay + 0.1);
        osc.start(t + delay);
        osc.stop(t + delay + 0.15);
    });
}

function playJump(t) {
    const { osc, gain } = createOsc(150, 'square');
    osc.frequency.exponentialRampToValueAtTime(400 * pitch, t + 0.15);
    gain.gain.setValueAtTime(volume * 0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
    osc.start(t);
    osc.stop(t + 0.2);
}

function playPowerUp(t) {
    [0, 0.08, 0.16, 0.24].forEach((delay, i) => {
        const { osc, gain } = createOsc(300 + i * 150, 'sine');
        gain.gain.setValueAtTime(volume * 0.25, t + delay);
        gain.gain.exponentialRampToValueAtTime(0.001, t + delay + 0.1);
        osc.start(t + delay);
        osc.stop(t + delay + 0.15);
    });
}

function playError(t) {
    [0, 0.15].forEach(delay => {
        const { osc, gain } = createOsc(200, 'sawtooth');
        gain.gain.setValueAtTime(volume * 0.2, t + delay);
        gain.gain.setValueAtTime(0, t + delay + 0.12);
        osc.start(t + delay);
        osc.stop(t + delay + 0.15);
    });
}

function playSuccess(t) {
    [523, 659, 784].forEach((freq, i) => {
        const { osc, gain } = createOsc(freq, 'sine');
        const delay = i * 0.1;
        gain.gain.setValueAtTime(volume * 0.25, t + delay);
        gain.gain.exponentialRampToValueAtTime(0.001, t + delay + 0.2);
        osc.start(t + delay);
        osc.stop(t + delay + 0.25);
    });
}

function playClick(t) {
    const { osc, gain } = createOsc(1000, 'sine');
    gain.gain.setValueAtTime(volume * 0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.03);
    osc.start(t);
    osc.stop(t + 0.05);
}

function playAlarm(t) {
    const { osc, gain } = createOsc(800, 'square');
    osc.frequency.setValueAtTime(800 * pitch, t);
    osc.frequency.setValueAtTime(600 * pitch, t + 0.15);
    osc.frequency.setValueAtTime(800 * pitch, t + 0.3);
    osc.frequency.setValueAtTime(600 * pitch, t + 0.45);
    gain.gain.setValueAtTime(volume * 0.2, t);
    gain.gain.setValueAtTime(0, t + 0.6);
    osc.start(t);
    osc.stop(t + 0.6);
}

document.addEventListener('DOMContentLoaded', init);
