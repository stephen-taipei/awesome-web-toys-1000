const emojis = ['🎮', '🎲', '🎯', '🎪', '🎨', '🎭', '🎵', '🎸'];
let cards = [];
let flippedCards = [];
let matchedPairs = 0;
let moves = 0;
let timerInterval = null;
let seconds = 0;
let isLocked = false;

function init() {
    document.getElementById('restartBtn').addEventListener('click', startGame);
    startGame();
}

function startGame() {
    cards = [...emojis, ...emojis];
    shuffleArray(cards);
    matchedPairs = 0;
    moves = 0;
    seconds = 0;
    flippedCards = [];
    isLocked = false;

    clearInterval(timerInterval);
    timerInterval = null;

    updateStats();
    renderCards();
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function renderCards() {
    const grid = document.getElementById('gameGrid');
    grid.innerHTML = '';

    cards.forEach((emoji, index) => {
        const card = document.createElement('div');
        card.className = 'card';
        card.dataset.index = index;
        card.innerHTML = '<div class="card-inner"><div class="card-front"></div><div class="card-back">' + emoji + '</div></div>';
        card.addEventListener('click', () => flipCard(card, index));
        grid.appendChild(card);
    });
}

function flipCard(card, index) {
    if (isLocked) return;
    if (card.classList.contains('flipped')) return;
    if (card.classList.contains('matched')) return;

    if (!timerInterval) {
        timerInterval = setInterval(() => {
            seconds++;
            updateTimer();
        }, 1000);
    }

    card.classList.add('flipped');
    flippedCards.push({ card, index, emoji: cards[index] });

    if (flippedCards.length === 2) {
        moves++;
        updateStats();
        checkMatch();
    }
}

function checkMatch() {
    isLocked = true;
    const [first, second] = flippedCards;

    if (first.emoji === second.emoji) {
        first.card.classList.add('matched');
        second.card.classList.add('matched');
        matchedPairs++;
        updateStats();
        flippedCards = [];
        isLocked = false;

        if (matchedPairs === emojis.length) {
            clearInterval(timerInterval);
            setTimeout(() => {
                alert('恭喜完成! 共用了 ' + moves + ' 次翻牌, 時間 ' + formatTime(seconds));
            }, 500);
        }
    } else {
        setTimeout(() => {
            first.card.classList.remove('flipped');
            second.card.classList.remove('flipped');
            flippedCards = [];
            isLocked = false;
        }, 1000);
    }
}

function updateStats() {
    document.getElementById('moves').textContent = moves;
    document.getElementById('pairs').textContent = matchedPairs;
}

function updateTimer() {
    document.getElementById('timer').textContent = formatTime(seconds);
}

function formatTime(s) {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return mins + ':' + (secs < 10 ? '0' : '') + secs;
}

document.addEventListener('DOMContentLoaded', init);
