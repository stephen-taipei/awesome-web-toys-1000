let audioContext;
let activeOscillators = {};
let waveType = 'sine';
let attack = 0.1;
let release = 0.5;
let volume = 0.5;
let vibrato = 0;

const notes = [
    { note: 'C4', freq: 261.63, key: 'a', type: 'white' },
    { note: 'C#4', freq: 277.18, key: 'w', type: 'black' },
    { note: 'D4', freq: 293.66, key: 's', type: 'white' },
    { note: 'D#4', freq: 311.13, key: 'e', type: 'black' },
    { note: 'E4', freq: 329.63, key: 'd', type: 'white' },
    { note: 'F4', freq: 349.23, key: 'f', type: 'white' },
    { note: 'F#4', freq: 369.99, key: 't', type: 'black' },
    { note: 'G4', freq: 392.00, key: 'g', type: 'white' },
    { note: 'G#4', freq: 415.30, key: 'y', type: 'black' },
    { note: 'A4', freq: 440.00, key: 'h', type: 'white' },
    { note: 'A#4', freq: 466.16, key: 'u', type: 'black' },
    { note: 'B4', freq: 493.88, key: 'j', type: 'white' },
    { note: 'C5', freq: 523.25, key: 'k', type: 'white' }
];

function init() {
    createKeyboard();
    setupControls();
    setupKeyboard();
}

function createKeyboard() {
    const keyboard = document.getElementById('keyboard');
    notes.forEach(n => {
        const key = document.createElement('div');
        key.className = `key ${n.type}`;
        key.dataset.note = n.note;
        key.dataset.freq = n.freq;
        const label = document.createElement('span');
        label.className = 'key-label';
        label.textContent = n.key.toUpperCase();
        key.appendChild(label);
        key.addEventListener('mousedown', () => playNote(n.freq, n.note));
        key.addEventListener('mouseup', () => stopNote(n.note));
        key.addEventListener('mouseleave', () => stopNote(n.note));
        key.addEventListener('touchstart', (e) => { e.preventDefault(); playNote(n.freq, n.note); });
        key.addEventListener('touchend', () => stopNote(n.note));
        keyboard.appendChild(key);
    });
}

function setupControls() {
    document.getElementById('waveType').addEventListener('change', (e) => waveType = e.target.value);
    document.getElementById('attackSlider').addEventListener('input', (e) => attack = parseFloat(e.target.value));
    document.getElementById('releaseSlider').addEventListener('input', (e) => release = parseFloat(e.target.value));
    document.getElementById('volumeSlider').addEventListener('input', (e) => volume = parseFloat(e.target.value));
    document.getElementById('vibratoSlider').addEventListener('input', (e) => vibrato = parseFloat(e.target.value));
}

function setupKeyboard() {
    document.addEventListener('keydown', (e) => {
        if (e.repeat) return;
        const noteData = notes.find(n => n.key === e.key.toLowerCase());
        if (noteData && !activeOscillators[noteData.note]) {
            playNote(noteData.freq, noteData.note);
            document.querySelector(`[data-note="${noteData.note}"]`)?.classList.add('active');
        }
    });
    document.addEventListener('keyup', (e) => {
        const noteData = notes.find(n => n.key === e.key.toLowerCase());
        if (noteData) {
            stopNote(noteData.note);
            document.querySelector(`[data-note="${noteData.note}"]`)?.classList.remove('active');
        }
    });
}

function playNote(freq, noteId) {
    if (!audioContext) audioContext = new (window.AudioContext || window.webkitAudioContext)();
    if (activeOscillators[noteId]) return;

    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    const vibratoOsc = audioContext.createOscillator();
    const vibratoGain = audioContext.createGain();

    osc.type = waveType;
    osc.frequency.setValueAtTime(freq, audioContext.currentTime);

    if (vibrato > 0) {
        vibratoOsc.frequency.setValueAtTime(5, audioContext.currentTime);
        vibratoGain.gain.setValueAtTime(vibrato, audioContext.currentTime);
        vibratoOsc.connect(vibratoGain);
        vibratoGain.connect(osc.frequency);
        vibratoOsc.start();
    }

    gain.gain.setValueAtTime(0, audioContext.currentTime);
    gain.gain.linearRampToValueAtTime(volume, audioContext.currentTime + attack);

    osc.connect(gain);
    gain.connect(audioContext.destination);
    osc.start();

    activeOscillators[noteId] = { osc, gain, vibratoOsc: vibrato > 0 ? vibratoOsc : null };
}

function stopNote(noteId) {
    const active = activeOscillators[noteId];
    if (!active) return;

    const { osc, gain, vibratoOsc } = active;
    gain.gain.linearRampToValueAtTime(0, audioContext.currentTime + release);
    osc.stop(audioContext.currentTime + release);
    if (vibratoOsc) vibratoOsc.stop(audioContext.currentTime + release);

    delete activeOscillators[noteId];
}

document.addEventListener('DOMContentLoaded', init);
