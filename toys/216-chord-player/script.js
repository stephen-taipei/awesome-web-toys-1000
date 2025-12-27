let audioContext;
let waveType = 'triangle';
let volume = 0.4;
let activeOscillators = [];

const chords = [
    { name: 'C', type: 'major', notes: [261.63, 329.63, 392.00], noteNames: 'C - E - G' },
    { name: 'Dm', type: 'minor', notes: [293.66, 349.23, 440.00], noteNames: 'D - F - A' },
    { name: 'Em', type: 'minor', notes: [329.63, 392.00, 493.88], noteNames: 'E - G - B' },
    { name: 'F', type: 'major', notes: [349.23, 440.00, 523.25], noteNames: 'F - A - C' },
    { name: 'G', type: 'major', notes: [392.00, 493.88, 587.33], noteNames: 'G - B - D' },
    { name: 'Am', type: 'minor', notes: [440.00, 523.25, 659.25], noteNames: 'A - C - E' },
    { name: 'G7', type: 'seventh', notes: [392.00, 493.88, 587.33, 349.23], noteNames: 'G - B - D - F' },
    { name: 'Bdim', type: 'diminished', notes: [493.88, 587.33, 698.46], noteNames: 'B - D - F' },
    { name: 'D', type: 'major', notes: [293.66, 369.99, 440.00], noteNames: 'D - F# - A' },
    { name: 'E', type: 'major', notes: [329.63, 415.30, 493.88], noteNames: 'E - G# - B' },
    { name: 'A', type: 'major', notes: [440.00, 554.37, 659.25], noteNames: 'A - C# - E' },
    { name: 'Bm', type: 'minor', notes: [493.88, 587.33, 739.99], noteNames: 'B - D - F#' },
    { name: 'C7', type: 'seventh', notes: [261.63, 329.63, 392.00, 466.16], noteNames: 'C - E - G - Bb' },
    { name: 'D7', type: 'seventh', notes: [293.66, 369.99, 440.00, 261.63], noteNames: 'D - F# - A - C' },
    { name: 'E7', type: 'seventh', notes: [329.63, 415.30, 493.88, 293.66], noteNames: 'E - G# - B - D' },
    { name: 'A7', type: 'seventh', notes: [440.00, 554.37, 659.25, 392.00], noteNames: 'A - C# - E - G' }
];

function init() {
    createChordButtons();
    setupControls();
}

function createChordButtons() {
    const grid = document.getElementById('chordGrid');
    chords.forEach(chord => {
        const btn = document.createElement('button');
        btn.className = 'chord-btn ' + chord.type;
        btn.innerHTML = chord.name + '<span class="type">' + getTypeName(chord.type) + '</span>';
        btn.addEventListener('mousedown', () => playChord(chord, btn));
        btn.addEventListener('mouseup', () => stopChord(btn));
        btn.addEventListener('mouseleave', () => stopChord(btn));
        btn.addEventListener('touchstart', (e) => { e.preventDefault(); playChord(chord, btn); });
        btn.addEventListener('touchend', () => stopChord(btn));
        grid.appendChild(btn);
    });
}

function getTypeName(type) {
    const names = { major: '大調', minor: '小調', seventh: '七和弦', diminished: '減和弦' };
    return names[type] || type;
}

function setupControls() {
    document.getElementById('waveType').addEventListener('change', e => waveType = e.target.value);
    document.getElementById('volumeSlider').addEventListener('input', e => volume = parseFloat(e.target.value));
}

function playChord(chord, btn) {
    if (!audioContext) audioContext = new (window.AudioContext || window.webkitAudioContext)();

    stopAllOscillators();

    btn.classList.add('playing');
    document.getElementById('currentChord').textContent = chord.name;
    document.getElementById('currentChord').classList.add('playing');
    document.getElementById('chordNotes').textContent = chord.noteNames;

    const now = audioContext.currentTime;
    chord.notes.forEach((freq, i) => {
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();

        osc.type = waveType;
        osc.frequency.value = freq;

        osc.connect(gain);
        gain.connect(audioContext.destination);

        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(volume / chord.notes.length, now + 0.05);

        osc.start(now);
        activeOscillators.push({ osc, gain });
    });
}

function stopChord(btn) {
    btn.classList.remove('playing');
    document.getElementById('currentChord').classList.remove('playing');
    stopAllOscillators();
}

function stopAllOscillators() {
    if (!audioContext) return;
    const now = audioContext.currentTime;
    activeOscillators.forEach(({ osc, gain }) => {
        gain.gain.linearRampToValueAtTime(0, now + 0.3);
        osc.stop(now + 0.3);
    });
    activeOscillators = [];
}

document.addEventListener('DOMContentLoaded', init);
