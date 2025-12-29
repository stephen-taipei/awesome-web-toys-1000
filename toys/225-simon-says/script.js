let audioContext;
let sequence = [];
let playerSequence = [];
let level = 1;
let highScore = 0;
let isPlaying = false;
let isShowingSequence = false;

const colors = ['green', 'red', 'yellow', 'blue'];
const frequencies = { green: 392, red: 330, yellow: 262, blue: 220 };

function init() {
    document.getElementById('startBtn').addEventListener('click', startGame);

    document.querySelectorAll('.simon-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            if (!isPlaying || isShowingSequence) return;
            const color = btn.dataset.color;
            playerInput(color);
        });
    });
}

function startGame() {
    sequence = [];
    playerSequence = [];
    level = 1;
    isPlaying = true;

    document.getElementById('startBtn').disabled = true;
    updateDisplay();
    addToSequence();
}

function addToSequence() {
    const randomColor = colors[Math.floor(Math.random() * 4)];
    sequence.push(randomColor);
    playerSequence = [];

    document.getElementById('centerDisplay').textContent = '看好...';

    setTimeout(() => {
        showSequence();
    }, 500);
}

function showSequence() {
    isShowingSequence = true;
    let i = 0;

    const showNext = () => {
        if (i >= sequence.length) {
            isShowingSequence = false;
            document.getElementById('centerDisplay').textContent = '你的回合';
            return;
        }

        const color = sequence[i];
        flashButton(color);
        playSound(color);
        i++;

        setTimeout(showNext, 600);
    };

    showNext();
}

function flashButton(color) {
    const btn = document.querySelector('.simon-btn[data-color="' + color + '"]');
    btn.classList.add('active');
    setTimeout(() => {
        btn.classList.remove('active');
    }, 300);
}

function playSound(color) {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }

    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();

    osc.type = 'sine';
    osc.frequency.value = frequencies[color];

    osc.connect(gain);
    gain.connect(audioContext.destination);

    gain.gain.setValueAtTime(0.3, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.3);

    osc.start();
    osc.stop(audioContext.currentTime + 0.3);
}

function playerInput(color) {
    flashButton(color);
    playSound(color);
    playerSequence.push(color);

    const currentIndex = playerSequence.length - 1;

    if (playerSequence[currentIndex] !== sequence[currentIndex]) {
        gameOver();
        return;
    }

    if (playerSequence.length === sequence.length) {
        level++;
        updateDisplay();
        document.getElementById('centerDisplay').textContent = '正確!';

        setTimeout(() => {
            addToSequence();
        }, 1000);
    }
}

function gameOver() {
    isPlaying = false;

    if (level - 1 > highScore) {
        highScore = level - 1;
    }

    document.getElementById('centerDisplay').textContent = '遊戲結束!';
    document.getElementById('startBtn').disabled = false;
    document.getElementById('startBtn').textContent = '再玩一次';

    playErrorSound();
    updateDisplay();
}

function playErrorSound() {
    if (!audioContext) return;

    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();

    osc.type = 'sawtooth';
    osc.frequency.value = 100;

    osc.connect(gain);
    gain.connect(audioContext.destination);

    gain.gain.setValueAtTime(0.3, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.5);

    osc.start();
    osc.stop(audioContext.currentTime + 0.5);
}

function updateDisplay() {
    document.getElementById('level').textContent = level;
    document.getElementById('highScore').textContent = highScore;
}

document.addEventListener('DOMContentLoaded', init);
