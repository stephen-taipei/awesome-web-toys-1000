const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const gridSize = 15, cellSize = 20;
canvas.width = gridSize * cellSize;
canvas.height = gridSize * cellSize;

let maze = [], player = { x: 1, y: 1 }, goal = { x: gridSize - 2, y: gridSize - 2 };

function init() {
    document.getElementById('newBtn').addEventListener('click', generateMaze);
    document.addEventListener('keydown', handleKey);
    document.getElementById('upBtn').addEventListener('click', () => move(0, -1));
    document.getElementById('downBtn').addEventListener('click', () => move(0, 1));
    document.getElementById('leftBtn').addEventListener('click', () => move(-1, 0));
    document.getElementById('rightBtn').addEventListener('click', () => move(1, 0));
    generateMaze();
}

function handleKey(e) {
    switch(e.key) {
        case 'ArrowUp': move(0, -1); break;
        case 'ArrowDown': move(0, 1); break;
        case 'ArrowLeft': move(-1, 0); break;
        case 'ArrowRight': move(1, 0); break;
    }
}

function move(dx, dy) {
    const newX = player.x + dx;
    const newY = player.y + dy;
    if (maze[newY] && maze[newY][newX] === 0) {
        player.x = newX;
        player.y = newY;
        draw();
        if (player.x === goal.x && player.y === goal.y) {
            document.getElementById('status').textContent = '恭喜! 找到出口!';
        }
    }
}

function generateMaze() {
    maze = Array(gridSize).fill().map(() => Array(gridSize).fill(1));
    player = { x: 1, y: 1 };
    document.getElementById('status').textContent = '使用方向鍵移動';

    const stack = [[1, 1]];
    maze[1][1] = 0;

    while (stack.length > 0) {
        const [x, y] = stack[stack.length - 1];
        const neighbors = [];

        [[0, -2], [0, 2], [-2, 0], [2, 0]].forEach(([dx, dy]) => {
            const nx = x + dx, ny = y + dy;
            if (nx > 0 && nx < gridSize - 1 && ny > 0 && ny < gridSize - 1 && maze[ny][nx] === 1) {
                neighbors.push([nx, ny, dx / 2, dy / 2]);
            }
        });

        if (neighbors.length > 0) {
            const [nx, ny, wx, wy] = neighbors[Math.floor(Math.random() * neighbors.length)];
            maze[y + wy][x + wx] = 0;
            maze[ny][nx] = 0;
            stack.push([nx, ny]);
        } else {
            stack.pop();
        }
    }

    maze[goal.y][goal.x] = 0;
    draw();
}

function draw() {
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let y = 0; y < gridSize; y++) {
        for (let x = 0; x < gridSize; x++) {
            if (maze[y][x] === 1) {
                ctx.fillStyle = '#2c3e50';
                ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
            }
        }
    }

    ctx.fillStyle = '#e74c3c';
    ctx.beginPath();
    ctx.arc(goal.x * cellSize + cellSize/2, goal.y * cellSize + cellSize/2, cellSize/3, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#2ecc71';
    ctx.beginPath();
    ctx.arc(player.x * cellSize + cellSize/2, player.y * cellSize + cellSize/2, cellSize/3, 0, Math.PI * 2);
    ctx.fill();
}

document.addEventListener('DOMContentLoaded', init);
