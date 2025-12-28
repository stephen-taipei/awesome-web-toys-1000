const morseCode = {
    'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..', 'E': '.', 'F': '..-.',
    'G': '--.', 'H': '....', 'I': '..', 'J': '.---', 'K': '-.-', 'L': '.-..',
    'M': '--', 'N': '-.', 'O': '---', 'P': '.--.', 'Q': '--.-', 'R': '.-.',
    'S': '...', 'T': '-', 'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-',
    'Y': '-.--', 'Z': '--..', '0': '-----', '1': '.----', '2': '..---',
    '3': '...--', '4': '....-', '5': '.....', '6': '-....', '7': '--...',
    '8': '---..', '9': '----.', ' ': '/'
};

let audioCtx = null;

function init() {
    document.getElementById('convertBtn').addEventListener('click', convert);
    document.getElementById('playBtn').addEventListener('click', play);
}

function convert() {
    const text = document.getElementById('textInput').value.toUpperCase();
    let morse = '';

    for (const char of text) {
        if (morseCode[char]) {
            morse += morseCode[char].replace(/\./g, '・').replace(/-/g, '―') + ' ';
        }
    }

    document.getElementById('morseDisplay').textContent = morse || '・ ― ・ ―';
}

function play() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }

    const text = document.getElementById('textInput').value.toUpperCase();
    let morse = '';
    for (const char of text) {
        if (morseCode[char]) {
            morse += morseCode[char] + ' ';
        }
    }

    let time = audioCtx.currentTime;
    const dotDuration = 0.1;
    const dashDuration = 0.3;
    const freq = 600;

    for (const symbol of morse) {
        if (symbol === '.') {
            playTone(time, dotDuration, freq);
            time += dotDuration + 0.05;
        } else if (symbol === '-') {
            playTone(time, dashDuration, freq);
            time += dashDuration + 0.05;
        } else if (symbol === ' ') {
            time += 0.2;
        } else if (symbol === '/') {
            time += 0.4;
        }
    }
}

function playTone(startTime, duration, freq) {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.3, startTime);
    gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
    osc.start(startTime);
    osc.stop(startTime + duration);
}

document.addEventListener('DOMContentLoaded', init);
