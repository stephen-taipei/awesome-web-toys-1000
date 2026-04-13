const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 370;
canvas.height = 300;

const cellSize = 20;
const cols = Math.floor(canvas.width / cellSize);
const rows = Math.floor(canvas.height / cellSize);

let maze = [];
let player = { x: 1, y: 1 };
let goal = { x: cols - 2, y: rows - 2 };
let moves = 0;
let won = false;

function generateMaze() {
    maze = [];
    for (let y = 0; y < rows; y++) {
        maze[y] = [];
        for (let x = 0; x < cols; x++) {
            maze[y][x] = 1;
        }
    }

    function carve(x, y) {
        const directions = [
            [0, -2], [0, 2], [-2, 0], [2, 0]
        ].sort(() => Math.random() - 0.5);

        maze[y][x] = 0;

        for (const [dx, dy] of directions) {
            const nx = x + dx;
            const ny = y + dy;

            if (nx > 0 && nx < cols - 1 && ny > 0 && ny < rows - 1 && maze[ny][nx] === 1) {
                maze[y + dy / 2][x + dx / 2] = 0;
                carve(nx, ny);
            }
        }
    }

    carve(1, 1);
    maze[goal.y][goal.x] = 0;
    maze[goal.y - 1][goal.x] = 0;
}

function init() {
    generateMaze();
    player = { x: 1, y: 1 };
    moves = 0;
    won = false;
}

function movePlayer(dx, dy) {
    if (won) return;

    const nx = player.x + dx;
    const ny = player.y + dy;

    if (nx >= 0 && nx < cols && ny >= 0 && ny < rows && maze[ny][nx] === 0) {
        player.x = nx;
        player.y = ny;
        moves++;

        if (player.x === goal.x && player.y === goal.y) {
            won = true;
        }
    }
}

function draw() {
    ctx.fillStyle = '#15150a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            if (maze[y][x] === 1) {
                ctx.fillStyle = '#5D4037';
                ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
            }
        }
    }

    ctx.fillStyle = '#4CAF50';
    ctx.beginPath();
    ctx.arc(
        goal.x * cellSize + cellSize / 2,
        goal.y * cellSize + cellSize / 2,
        cellSize / 3,
        0, Math.PI * 2
    );
    ctx.fill();

    ctx.fillStyle = '#FFC107';
    ctx.beginPath();
    ctx.arc(
        player.x * cellSize + cellSize / 2,
        player.y * cellSize + cellSize / 2,
        cellSize / 3,
        0, Math.PI * 2
    );
    ctx.fill();

    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(10, 10, 80, 30);
    ctx.fillStyle = '#FFC107';
    ctx.font = '12px Arial';
    ctx.fillText(`步數: ${moves}`, 20, 28);

    if (won) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = '#FFC107';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('恭喜過關!', canvas.width / 2, canvas.height / 2 - 10);
        ctx.font = '16px Arial';
        ctx.fillText(`總共 ${moves} 步`, canvas.width / 2, canvas.height / 2 + 20);
        ctx.textAlign = 'left';
    }
}

function animate() {
    draw();
    requestAnimationFrame(animate);
}

document.addEventListener('keydown', (e) => {
    switch (e.key) {
        case 'ArrowUp': movePlayer(0, -1); break;
        case 'ArrowDown': movePlayer(0, 1); break;
        case 'ArrowLeft': movePlayer(-1, 0); break;
        case 'ArrowRight': movePlayer(1, 0); break;
    }
});

canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mx = (e.clientX - rect.left) * (canvas.width / rect.width);
    const my = (e.clientY - rect.top) * (canvas.height / rect.height);

    const px = player.x * cellSize + cellSize / 2;
    const py = player.y * cellSize + cellSize / 2;

    const dx = mx - px;
    const dy = my - py;

    if (Math.abs(dx) > Math.abs(dy)) {
        movePlayer(dx > 0 ? 1 : -1, 0);
    } else {
        movePlayer(0, dy > 0 ? 1 : -1);
    }
});

document.getElementById('newBtn').addEventListener('click', init);

init();
animate();
