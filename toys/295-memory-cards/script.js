const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const size = 300, cols = 4, rows = 4, cardSize = size / cols - 10;
canvas.width = size; canvas.height = size;

const symbols = ['🍎', '🍊', '🍋', '🍇', '🍓', '🍒', '🍑', '🥝'];
let cards = [], flipped = [], matched = [], moves = 0, isLocked = false;

function init() {
    document.getElementById('startBtn').addEventListener('click', startGame);
    canvas.addEventListener('click', handleClick);
    startGame();
}

function startGame() {
    const pairs = [...symbols, ...symbols];
    cards = pairs.sort(() => Math.random() - 0.5).map((symbol, i) => ({
        symbol, x: (i % cols) * (cardSize + 10) + 5, y: Math.floor(i / cols) * (cardSize + 10) + 5
    }));
    flipped = [];
    matched = [];
    moves = 0;
    isLocked = false;
    document.getElementById('pairs').textContent = '0';
    document.getElementById('moves').textContent = '0';
    draw();
}

function handleClick(e) {
    if (isLocked) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const cardIndex = cards.findIndex(card =>
        x >= card.x && x <= card.x + cardSize &&
        y >= card.y && y <= card.y + cardSize
    );

    if (cardIndex === -1 || flipped.includes(cardIndex) || matched.includes(cardIndex)) return;

    flipped.push(cardIndex);
    draw();

    if (flipped.length === 2) {
        moves++;
        document.getElementById('moves').textContent = moves;

        const [first, second] = flipped;
        if (cards[first].symbol === cards[second].symbol) {
            matched.push(first, second);
            document.getElementById('pairs').textContent = matched.length / 2;
            flipped = [];
            if (matched.length === cards.length) {
                setTimeout(() => alert('恭喜完成! 共翻了 ' + moves + ' 次'), 300);
            }
        } else {
            isLocked = true;
            setTimeout(() => { flipped = []; isLocked = false; draw(); }, 1000);
        }
    }
}

function draw() {
    ctx.fillStyle = '#2c3e50';
    ctx.fillRect(0, 0, size, size);

    cards.forEach((card, i) => {
        const isFlipped = flipped.includes(i) || matched.includes(i);

        if (isFlipped) {
            ctx.fillStyle = '#ecf0f1';
        } else {
            ctx.fillStyle = '#3498db';
        }

        ctx.beginPath();
        ctx.roundRect(card.x, card.y, cardSize, cardSize, 8);
        ctx.fill();

        if (isFlipped) {
            ctx.font = '35px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(card.symbol, card.x + cardSize/2, card.y + cardSize/2);
        } else {
            ctx.fillStyle = '#2980b9';
            ctx.font = 'bold 24px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('?', card.x + cardSize/2, card.y + cardSize/2);
        }
    });
}

document.addEventListener('DOMContentLoaded', init);
