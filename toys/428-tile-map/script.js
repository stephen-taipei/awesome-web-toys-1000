const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const infoEl = document.getElementById('info');

const TILE_SIZE = 50;
const COLS = 6;
const ROWS = 5;
const PADDING = 30;

const regions = [
    '基隆', '台北', '新北', '桃園', '新竹', '苗栗',
    '台中', '彰化', '南投', '雲林', '嘉義', '台南',
    '高雄', '屏東', '台東', '花蓮', '宜蘭', '澎湖',
    '金門', '連江', '新竹縣', '嘉義縣', '桃園區', '中壢',
    '板橋', '三重', '新莊', '中和', '永和', '土城'
];

let tiles = [];
let hoveredTile = null;

function generateData() {
    tiles = [];
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            const index = row * COLS + col;
            tiles.push({
                name: regions[index] || `區域${index + 1}`,
                value: Math.floor(Math.random() * 100),
                row,
                col
            });
        }
    }
}

function getColor(value) {
    const hue = 200 - value * 1.5; // Blue to red
    return `hsl(${hue}, 70%, 50%)`;
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    tiles.forEach(tile => {
        const x = PADDING + tile.col * TILE_SIZE;
        const y = PADDING + tile.row * TILE_SIZE;

        ctx.fillStyle = getColor(tile.value);
        ctx.fillRect(x + 2, y + 2, TILE_SIZE - 4, TILE_SIZE - 4);

        if (tile === hoveredTile) {
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 3;
            ctx.strokeRect(x + 2, y + 2, TILE_SIZE - 4, TILE_SIZE - 4);
        }

        ctx.fillStyle = '#fff';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(tile.name.slice(0, 2), x + TILE_SIZE / 2, y + TILE_SIZE / 2 - 6);
        ctx.font = 'bold 12px Arial';
        ctx.fillText(tile.value, x + TILE_SIZE / 2, y + TILE_SIZE / 2 + 8);
    });

    // Legend
    ctx.font = '10px Arial';
    ctx.textAlign = 'left';
    ctx.fillStyle = '#fff';
    ctx.fillText('低', PADDING, canvas.height - 10);
    ctx.textAlign = 'right';
    ctx.fillText('高', canvas.width - PADDING, canvas.height - 10);

    const legendWidth = canvas.width - PADDING * 2;
    for (let i = 0; i < legendWidth; i++) {
        ctx.fillStyle = getColor(i / legendWidth * 100);
        ctx.fillRect(PADDING + i, canvas.height - 25, 1, 10);
    }
}

canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    const col = Math.floor((mx - PADDING) / TILE_SIZE);
    const row = Math.floor((my - PADDING) / TILE_SIZE);

    hoveredTile = null;
    if (row >= 0 && row < ROWS && col >= 0 && col < COLS) {
        hoveredTile = tiles[row * COLS + col];
        infoEl.textContent = `${hoveredTile.name}: ${hoveredTile.value} (人口指數)`;
    } else {
        infoEl.textContent = '懸停查看區域資訊';
    }

    draw();
});

document.getElementById('randomize').addEventListener('click', () => {
    generateData();
    draw();
});

generateData();
draw();
