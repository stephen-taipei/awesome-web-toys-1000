const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 370;
canvas.height = 300;

const cols = 4;
const rows = 3;
const cardWidth = 70;
const cardHeight = 80;
const padding = 15;
const startX = (canvas.width - cols * (cardWidth + padding)) / 2 + padding / 2;
const startY = (canvas.height - rows * (cardHeight + padding)) / 2 + padding / 2;

const symbols = ['★', '♥', '♦', '♣', '♠', '●'];
let cards = [];
let flipped = [];
let matched = [];
let moves = 0;
let canClick = true;

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function init() {
    const pairs = [...symbols, ...symbols];
    shuffle(pairs);

    cards = [];
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            cards.push({
                x: startX + col * (cardWidth + padding),
                y: startY + row * (cardHeight + padding),
                symbol: pairs[row * cols + col],
                index: row * cols + col
            });
        }
    }

    flipped = [];
    matched = [];
    moves = 0;
    canClick = true;
}

function draw() {
    ctx.fillStyle = '#0a1520';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    cards.forEach((card, i) => {
        const isFlipped = flipped.includes(i) || matched.includes(i);

        if (isFlipped) {
            ctx.fillStyle = '#FF9800';
            ctx.fillRect(card.x, card.y, cardWidth, cardHeight);

            ctx.fillStyle = '#fff';
            ctx.font = 'bold 32px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(card.symbol, card.x + cardWidth / 2, card.y + cardHeight / 2);
        } else {
            ctx.fillStyle = '#37474F';
            ctx.fillRect(card.x, card.y, cardWidth, cardHeight);

            ctx.strokeStyle = '#FF9800';
            ctx.lineWidth = 2;
            ctx.strokeRect(card.x + 5, card.y + 5, cardWidth - 10, cardHeight - 10);

            ctx.fillStyle = '#546E7A';
            ctx.font = '24px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('?', card.x + cardWidth / 2, card.y + cardHeight / 2);
        }
    });

    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(10, 10, 120, 30);
    ctx.fillStyle = '#FF9800';
    ctx.font = '12px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`步數: ${moves}  配對: ${matched.length / 2}/${symbols.length}`, 20, 28);

    if (matched.length === cards.length) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = '#FF9800';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('恭喜完成!', canvas.width / 2, canvas.height / 2 - 10);
        ctx.font = '16px Arial';
        ctx.fillText(`總共 ${moves} 步`, canvas.width / 2, canvas.height / 2 + 20);
    }
}

canvas.addEventListener('click', (e) => {
    if (!canClick || matched.length === cards.length) return;

    const rect = canvas.getBoundingClientRect();
    const mx = (e.clientX - rect.left) * (canvas.width / rect.width);
    const my = (e.clientY - rect.top) * (canvas.height / rect.height);

    cards.forEach((card, i) => {
        if (mx >= card.x && mx <= card.x + cardWidth &&
            my >= card.y && my <= card.y + cardHeight) {
            if (flipped.includes(i) || matched.includes(i)) return;

            flipped.push(i);
            draw();

            if (flipped.length === 2) {
                moves++;
                canClick = false;

                setTimeout(() => {
                    const [first, second] = flipped;
                    if (cards[first].symbol === cards[second].symbol) {
                        matched.push(first, second);
                    }
                    flipped = [];
                    canClick = true;
                    draw();
                }, 800);
            }
        }
    });
});

document.getElementById('resetBtn').addEventListener('click', () => {
    init();
    draw();
});

init();
draw();
