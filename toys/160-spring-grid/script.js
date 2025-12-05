/**
 * 彈簧網格 - Spring Grid
 * 彈簧連結波動模擬
 */

class Vector2 {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }

    add(v) {
        return new Vector2(this.x + v.x, this.y + v.y);
    }

    sub(v) {
        return new Vector2(this.x - v.x, this.y - v.y);
    }

    mul(s) {
        return new Vector2(this.x * s, this.y * s);
    }

    div(s) {
        return s !== 0 ? new Vector2(this.x / s, this.y / s) : new Vector2();
    }

    length() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    normalize() {
        const len = this.length();
        return len > 0 ? this.div(len) : new Vector2();
    }

    clone() {
        return new Vector2(this.x, this.y);
    }

    static dist(a, b) {
        return a.sub(b).length();
    }
}

// 網格節點
class Node {
    constructor(x, y, fixed = false) {
        this.position = new Vector2(x, y);
        this.prevPosition = new Vector2(x, y);
        this.restPosition = new Vector2(x, y);
        this.velocity = new Vector2();
        this.acceleration = new Vector2();
        this.fixed = fixed;
        this.z = 0; // 高度（用於 3D 效果）
        this.zVelocity = 0;
    }

    update(damping) {
        if (this.fixed) return;

        // Verlet integration for x, y
        const vel = this.position.sub(this.prevPosition).mul(damping);
        this.prevPosition = this.position.clone();
        this.position = this.position.add(vel).add(this.acceleration);
        this.acceleration = new Vector2();

        // Update z (height) with spring back to 0
        this.zVelocity *= damping;
        this.zVelocity -= this.z * 0.1; // Spring force
        this.z += this.zVelocity;
    }

    applyForce(force) {
        if (this.fixed) return;
        this.acceleration = this.acceleration.add(force);
    }

    disturb(strength) {
        if (this.fixed) return;
        this.zVelocity += strength;
    }
}

// 彈簧連結
class Spring {
    constructor(nodeA, nodeB, restLength) {
        this.nodeA = nodeA;
        this.nodeB = nodeB;
        this.restLength = restLength;
    }

    update(stiffness) {
        const diff = this.nodeB.position.sub(this.nodeA.position);
        const dist = diff.length();

        if (dist === 0) return;

        const displacement = dist - this.restLength;
        const force = diff.normalize().mul(displacement * stiffness);

        this.nodeA.applyForce(force);
        this.nodeB.applyForce(force.mul(-1));

        // 傳遞 z 波動
        const zDiff = this.nodeB.z - this.nodeA.z;
        const zForce = zDiff * stiffness * 0.5;

        if (!this.nodeA.fixed) {
            this.nodeA.zVelocity += zForce;
        }
        if (!this.nodeB.fixed) {
            this.nodeB.zVelocity -= zForce;
        }
    }
}

// 網格系統
class SpringGrid {
    constructor(width, height, cols, rows) {
        this.width = width;
        this.height = height;
        this.cols = cols;
        this.rows = rows;
        this.nodes = [];
        this.springs = [];

        this.init();
    }

    init() {
        this.nodes = [];
        this.springs = [];

        const marginX = this.width * 0.1;
        const marginY = this.height * 0.1;
        const spacingX = (this.width - marginX * 2) / (this.cols - 1);
        const spacingY = (this.height - marginY * 2) / (this.rows - 1);

        // 創建節點
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const x = marginX + col * spacingX;
                const y = marginY + row * spacingY;

                // 邊緣固定
                const isEdge = row === 0 || row === this.rows - 1 ||
                               col === 0 || col === this.cols - 1;

                this.nodes.push(new Node(x, y, isEdge));
            }
        }

        // 創建彈簧 - 水平連結
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols - 1; col++) {
                const idx = row * this.cols + col;
                this.springs.push(new Spring(
                    this.nodes[idx],
                    this.nodes[idx + 1],
                    spacingX
                ));
            }
        }

        // 創建彈簧 - 垂直連結
        for (let row = 0; row < this.rows - 1; row++) {
            for (let col = 0; col < this.cols; col++) {
                const idx = row * this.cols + col;
                this.springs.push(new Spring(
                    this.nodes[idx],
                    this.nodes[idx + this.cols],
                    spacingY
                ));
            }
        }

        // 創建彈簧 - 對角線連結（增加穩定性）
        const diagLength = Math.sqrt(spacingX * spacingX + spacingY * spacingY);
        for (let row = 0; row < this.rows - 1; row++) {
            for (let col = 0; col < this.cols - 1; col++) {
                const idx = row * this.cols + col;

                // 右下對角線
                this.springs.push(new Spring(
                    this.nodes[idx],
                    this.nodes[idx + this.cols + 1],
                    diagLength
                ));

                // 左下對角線
                this.springs.push(new Spring(
                    this.nodes[idx + 1],
                    this.nodes[idx + this.cols],
                    diagLength
                ));
            }
        }
    }

    update(stiffness, damping) {
        const stiff = stiffness * 0.002;
        const damp = damping * 0.01;

        // 更新彈簧
        for (const spring of this.springs) {
            spring.update(stiff);
        }

        // 更新節點
        for (const node of this.nodes) {
            // 向靜止位置回彈
            if (!node.fixed) {
                const toRest = node.restPosition.sub(node.position);
                node.applyForce(toRest.mul(stiff * 0.5));
            }
            node.update(damp);
        }
    }

    getNodeAt(x, y, radius = 30) {
        let closest = null;
        let minDist = radius;

        for (const node of this.nodes) {
            const dist = Vector2.dist(new Vector2(x, y), node.position);
            if (dist < minDist) {
                minDist = dist;
                closest = node;
            }
        }

        return closest;
    }

    disturbAt(x, y, strength, radius) {
        for (const node of this.nodes) {
            const dist = Vector2.dist(new Vector2(x, y), node.position);
            if (dist < radius) {
                const factor = 1 - dist / radius;
                node.disturb(strength * factor);
            }
        }
    }

    createWave(centerX, centerY) {
        for (const node of this.nodes) {
            const dist = Vector2.dist(new Vector2(centerX, centerY), node.position);
            const delay = dist * 0.02;
            const strength = Math.max(0, 1 - dist / 300) * 20;

            setTimeout(() => {
                node.disturb(strength);
            }, delay * 100);
        }
    }

    shake() {
        for (const node of this.nodes) {
            if (!node.fixed) {
                node.disturb((Math.random() - 0.5) * 30);
            }
        }
    }

    draw(ctx) {
        // 繪製彈簧連結
        for (const spring of this.springs) {
            const a = spring.nodeA;
            const b = spring.nodeB;

            // 根據高度差計算顏色
            const avgZ = (a.z + b.z) / 2;
            const tension = Math.abs(avgZ) / 30;

            const hue = 200 - tension * 60; // 藍色到紫色
            const lightness = 50 + avgZ * 2;
            const alpha = 0.3 + tension * 0.4;

            ctx.beginPath();
            ctx.moveTo(a.position.x, a.position.y);
            ctx.lineTo(b.position.x, b.position.y);
            ctx.strokeStyle = `hsla(${hue}, 80%, ${Math.max(30, Math.min(70, lightness))}%, ${alpha})`;
            ctx.lineWidth = 1 + tension * 2;
            ctx.stroke();
        }

        // 繪製節點
        for (const node of this.nodes) {
            const size = 4 + Math.abs(node.z) * 0.2;
            const brightness = 50 + node.z * 3;

            // 節點光暈
            if (Math.abs(node.z) > 2) {
                const glowSize = size * 3;
                const gradient = ctx.createRadialGradient(
                    node.position.x, node.position.y, 0,
                    node.position.x, node.position.y, glowSize
                );
                gradient.addColorStop(0, `hsla(200, 100%, 70%, 0.5)`);
                gradient.addColorStop(1, `hsla(200, 100%, 70%, 0)`);

                ctx.beginPath();
                ctx.arc(node.position.x, node.position.y, glowSize, 0, Math.PI * 2);
                ctx.fillStyle = gradient;
                ctx.fill();
            }

            // 節點主體
            ctx.beginPath();
            ctx.arc(node.position.x, node.position.y, size, 0, Math.PI * 2);

            if (node.fixed) {
                ctx.fillStyle = '#37474f';
            } else {
                const hue = 200 + node.z * 2;
                ctx.fillStyle = `hsl(${hue}, 80%, ${Math.max(30, Math.min(80, brightness))}%)`;
            }
            ctx.fill();
        }
    }
}

// 主應用
class App {
    constructor() {
        this.canvas = document.getElementById('canvas');
        this.ctx = this.canvas.getContext('2d');

        this.stiffness = 50;
        this.damping = 95;
        this.density = 15;

        this.grid = null;
        this.isDragging = false;
        this.lastPointerPos = null;

        this.setupCanvas();
        this.setupControls();
        this.setupEvents();
        this.init();
        this.animate();
    }

    setupCanvas() {
        const container = this.canvas.parentElement;
        const rect = container.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;

        this.canvas.width = rect.width * dpr;
        this.canvas.height = 500 * dpr;
        this.ctx.scale(dpr, dpr);

        this.width = rect.width;
        this.height = 500;
    }

    init() {
        this.grid = new SpringGrid(this.width, this.height, this.density, this.density);
    }

    setupControls() {
        // 彈性滑桿
        const stiffnessSlider = document.getElementById('stiffness');
        const stiffnessValue = document.getElementById('stiffnessValue');
        stiffnessSlider.addEventListener('input', (e) => {
            this.stiffness = parseInt(e.target.value);
            stiffnessValue.textContent = this.stiffness;
        });

        // 阻尼滑桿
        const dampingSlider = document.getElementById('damping');
        const dampingValue = document.getElementById('dampingValue');
        dampingSlider.addEventListener('input', (e) => {
            this.damping = parseInt(e.target.value);
            dampingValue.textContent = this.damping;
        });

        // 密度滑桿
        const densitySlider = document.getElementById('density');
        const densityValue = document.getElementById('densityValue');
        densitySlider.addEventListener('input', (e) => {
            this.density = parseInt(e.target.value);
            densityValue.textContent = this.density;
            this.init();
        });

        // 按鈕
        document.getElementById('resetBtn').addEventListener('click', () => {
            this.init();
        });

        document.getElementById('waveBtn').addEventListener('click', () => {
            this.grid.createWave(this.width / 2, this.height / 2);
        });

        document.getElementById('shakeBtn').addEventListener('click', () => {
            this.grid.shake();
        });
    }

    setupEvents() {
        // 滑鼠事件
        this.canvas.addEventListener('mousedown', (e) => this.handlePointerDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.handlePointerMove(e));
        this.canvas.addEventListener('mouseup', () => this.handlePointerUp());
        this.canvas.addEventListener('mouseleave', () => this.handlePointerUp());

        // 觸控事件
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.handlePointerDown(e.touches[0]);
        });
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            this.handlePointerMove(e.touches[0]);
        });
        this.canvas.addEventListener('touchend', () => this.handlePointerUp());

        // 視窗調整
        window.addEventListener('resize', () => {
            this.setupCanvas();
            this.init();
        });
    }

    getPointerPos(e) {
        const rect = this.canvas.getBoundingClientRect();
        return new Vector2(
            e.clientX - rect.left,
            e.clientY - rect.top
        );
    }

    handlePointerDown(e) {
        this.isDragging = true;
        this.lastPointerPos = this.getPointerPos(e);

        // 擾動點擊位置
        this.grid.disturbAt(this.lastPointerPos.x, this.lastPointerPos.y, 15, 80);
    }

    handlePointerMove(e) {
        const pos = this.getPointerPos(e);

        if (this.isDragging) {
            // 根據移動速度產生擾動
            if (this.lastPointerPos) {
                const velocity = pos.sub(this.lastPointerPos);
                const speed = velocity.length();

                if (speed > 2) {
                    this.grid.disturbAt(pos.x, pos.y, speed * 0.5, 60);
                }
            }
            this.lastPointerPos = pos;
        }
    }

    handlePointerUp() {
        this.isDragging = false;
        this.lastPointerPos = null;
    }

    update() {
        this.grid.update(this.stiffness, this.damping);
    }

    draw() {
        // 清空畫布
        this.ctx.fillStyle = '#0a1929';
        this.ctx.fillRect(0, 0, this.width, this.height);

        // 繪製背景網格裝飾
        this.drawBackgroundGrid();

        // 繪製彈簧網格
        this.grid.draw(this.ctx);
    }

    drawBackgroundGrid() {
        const spacing = 50;
        this.ctx.strokeStyle = 'rgba(30, 50, 80, 0.3)';
        this.ctx.lineWidth = 1;

        // 垂直線
        for (let x = spacing; x < this.width; x += spacing) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.height);
            this.ctx.stroke();
        }

        // 水平線
        for (let y = spacing; y < this.height; y += spacing) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.width, y);
            this.ctx.stroke();
        }
    }

    animate() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.animate());
    }
}

// 啟動
window.addEventListener('load', () => {
    new App();
});
