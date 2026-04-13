const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 370;
canvas.height = 300;

let grid = [];
const cellSize = 5;
const cols = Math.floor(canvas.width / cellSize);
const rows = Math.floor(canvas.height / cellSize);

function initGrid() {
    grid = [];
    for (let i = 0; i < cols; i++) {
        grid[i] = [];
        for (let j = 0; j < rows; j++) {
            grid[i][j] = {
                moss: 0,
                moisture: Math.random() * 0.3
            };
        }
    }

    for (let i = 0; i < 5; i++) {
        const x = Math.floor(Math.random() * cols);
        const y = Math.floor(Math.random() * rows);
        grid[x][y].moss = 1;
    }
}

function drawRock() {
    ctx.fillStyle = '#696969';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < 100; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const shade = Math.random() * 30 - 15;
        ctx.fillStyle = `rgb(${105 + shade}, ${105 + shade}, ${105 + shade})`;
        ctx.beginPath();
        ctx.arc(x, y, 2 + Math.random() * 5, 0, Math.PI * 2);
        ctx.fill();
    }
}

function updateMoss() {
    const newGrid = JSON.parse(JSON.stringify(grid));

    for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
            if (grid[i][j].moss > 0 && grid[i][j].moss < 1) {
                newGrid[i][j].moss = Math.min(1, grid[i][j].moss + 0.02);
            }

            if (grid[i][j].moss >= 0.5) {
                const directions = [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [1, 1], [-1, 1], [1, -1]];

                directions.forEach(([dx, dy]) => {
                    const ni = i + dx;
                    const nj = j + dy;

                    if (ni >= 0 && ni < cols && nj >= 0 && nj < rows) {
                        if (grid[ni][nj].moss === 0 && Math.random() < 0.01 + grid[ni][nj].moisture * 0.05) {
                            newGrid[ni][nj].moss = 0.1;
                        }
                    }
                });
            }
        }
    }

    grid = newGrid;
}

function drawMoss() {
    for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
            if (grid[i][j].moss > 0) {
                const intensity = grid[i][j].moss;
                const hue = 80 + Math.random() * 20;
                const saturation = 40 + intensity * 30;
                const lightness = 25 + intensity * 20;

                ctx.fillStyle = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
                ctx.beginPath();
                ctx.arc(
                    i * cellSize + cellSize / 2 + (Math.random() - 0.5) * 2,
                    j * cellSize + cellSize / 2 + (Math.random() - 0.5) * 2,
                    cellSize / 2 * intensity + Math.random(),
                    0, Math.PI * 2
                );
                ctx.fill();

                if (intensity > 0.7) {
                    for (let k = 0; k < 3; k++) {
                        ctx.fillStyle = `hsl(${hue + 10}, ${saturation + 10}%, ${lightness + 10}%)`;
                        ctx.beginPath();
                        ctx.arc(
                            i * cellSize + Math.random() * cellSize,
                            j * cellSize + Math.random() * cellSize,
                            1 + Math.random(),
                            0, Math.PI * 2
                        );
                        ctx.fill();
                    }
                }
            }
        }
    }
}

function animate() {
    drawRock();
    updateMoss();
    drawMoss();
    requestAnimationFrame(animate);
}

document.getElementById('resetBtn').addEventListener('click', initGrid);

initGrid();
animate();
