/**
 * 風鈴 - Wind Chime
 * 模擬風鈴擺動與碰撞發聲的效果
 */

class AudioEngine {
    constructor() {
        this.audioContext = null;
        this.muted = false;
        this.material = 0; // 0: metal, 1: wood, 2: glass
    }

    init() {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
    }

    playChime(frequency, volume = 0.3) {
        if (this.muted || !this.audioContext) return;

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        const filterNode = this.audioContext.createBiquadFilter();

        // 根據材質調整音色
        switch (this.material) {
            case 0: // 金屬 - 清脆明亮
                oscillator.type = 'sine';
                filterNode.type = 'highpass';
                filterNode.frequency.value = 200;
                break;
            case 1: // 木頭 - 溫暖沉穩
                oscillator.type = 'triangle';
                filterNode.type = 'lowpass';
                filterNode.frequency.value = 800;
                break;
            case 2: // 玻璃 - 清澈悠揚
                oscillator.type = 'sine';
                filterNode.type = 'bandpass';
                filterNode.frequency.value = frequency;
                filterNode.Q.value = 10;
                break;
        }

        oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);

        // 音量包絡
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(volume * 0.5, this.audioContext.currentTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 2);

        oscillator.connect(filterNode);
        filterNode.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 2);
    }
}

class ChimeTube {
    constructor(x, pivotY, length, width, frequency, color) {
        this.pivotX = x;
        this.pivotY = pivotY;
        this.length = length;
        this.width = width;
        this.frequency = frequency;
        this.color = color;

        this.angle = 0;
        this.angularVelocity = 0;
        this.damping = 0.995;

        // 管底位置
        this.updatePosition();
    }

    updatePosition() {
        this.bottomX = this.pivotX + Math.sin(this.angle) * this.length;
        this.bottomY = this.pivotY + Math.cos(this.angle) * this.length;
    }

    applyForce(force) {
        this.angularVelocity += force / this.length;
    }

    update(gravity, windForce) {
        // 重力恢復
        const gravityTorque = -gravity * Math.sin(this.angle);
        this.angularVelocity += gravityTorque;

        // 風力
        this.angularVelocity += windForce * 0.001 * (Math.random() - 0.3);

        // 阻尼
        this.angularVelocity *= this.damping;

        // 限制最大角度
        const maxAngle = Math.PI / 4;
        if (Math.abs(this.angle) > maxAngle) {
            this.angle = Math.sign(this.angle) * maxAngle;
            this.angularVelocity *= -0.3;
        }

        // 更新角度
        this.angle += this.angularVelocity;

        this.updatePosition();
    }

    checkCollision(other) {
        // 簡化碰撞檢測：檢查管底距離
        const dx = this.bottomX - other.bottomX;
        const dy = this.bottomY - other.bottomY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const minDist = (this.width + other.width) / 2 + 2;

        return dist < minDist;
    }

    resolveCollision(other, audioEngine) {
        // 交換部分角速度
        const temp = this.angularVelocity;
        this.angularVelocity = other.angularVelocity * 0.8;
        other.angularVelocity = temp * 0.8;

        // 分離
        const pushAngle = 0.02;
        if (this.pivotX < other.pivotX) {
            this.angle -= pushAngle;
            other.angle += pushAngle;
        } else {
            this.angle += pushAngle;
            other.angle -= pushAngle;
        }

        // 發出聲音
        const collisionForce = Math.abs(temp - other.angularVelocity);
        if (collisionForce > 0.005) {
            const avgFreq = (this.frequency + other.frequency) / 2;
            const volume = Math.min(collisionForce * 10, 0.5);
            audioEngine.playChime(avgFreq, volume);
        }
    }

    draw(ctx, material) {
        ctx.save();

        // 繪製繩子
        ctx.beginPath();
        ctx.moveTo(this.pivotX, this.pivotY);
        ctx.lineTo(this.pivotX + Math.sin(this.angle) * 10, this.pivotY + Math.cos(this.angle) * 10);
        ctx.strokeStyle = '#8B7355';
        ctx.lineWidth = 2;
        ctx.stroke();

        // 繪製管子
        ctx.translate(this.pivotX, this.pivotY);
        ctx.rotate(this.angle);

        const gradient = ctx.createLinearGradient(-this.width / 2, 15, this.width / 2, 15);

        switch (material) {
            case 0: // 金屬
                gradient.addColorStop(0, '#B8860B');
                gradient.addColorStop(0.3, '#FFD700');
                gradient.addColorStop(0.5, '#FFF8DC');
                gradient.addColorStop(0.7, '#FFD700');
                gradient.addColorStop(1, '#B8860B');
                break;
            case 1: // 木頭
                gradient.addColorStop(0, '#5D4037');
                gradient.addColorStop(0.3, '#8D6E63');
                gradient.addColorStop(0.5, '#A1887F');
                gradient.addColorStop(0.7, '#8D6E63');
                gradient.addColorStop(1, '#5D4037');
                break;
            case 2: // 玻璃
                gradient.addColorStop(0, 'rgba(135, 206, 250, 0.6)');
                gradient.addColorStop(0.3, 'rgba(200, 230, 255, 0.8)');
                gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.9)');
                gradient.addColorStop(0.7, 'rgba(200, 230, 255, 0.8)');
                gradient.addColorStop(1, 'rgba(135, 206, 250, 0.6)');
                break;
        }

        // 管子主體
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(-this.width / 2, 15, this.width, this.length - 20, 3);
        ctx.fill();

        // 邊框
        ctx.strokeStyle = material === 2 ? 'rgba(100, 180, 220, 0.5)' : 'rgba(0, 0, 0, 0.2)';
        ctx.lineWidth = 1;
        ctx.stroke();

        // 頂部裝飾
        ctx.fillStyle = material === 0 ? '#DAA520' : (material === 1 ? '#6D4C41' : 'rgba(180, 210, 230, 0.8)');
        ctx.beginPath();
        ctx.ellipse(0, 15, this.width / 2 + 2, 5, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }
}

class Striker {
    constructor(x, y, radius) {
        this.pivotX = x;
        this.pivotY = y;
        this.radius = radius;
        this.stringLength = 50;

        this.angle = 0;
        this.angularVelocity = 0;
        this.damping = 0.99;

        this.updatePosition();
    }

    updatePosition() {
        this.x = this.pivotX + Math.sin(this.angle) * this.stringLength;
        this.y = this.pivotY + Math.cos(this.angle) * this.stringLength;
    }

    applyForce(force) {
        this.angularVelocity += force;
    }

    update(gravity, windForce) {
        const gravityTorque = -gravity * Math.sin(this.angle) * 0.5;
        this.angularVelocity += gravityTorque;

        this.angularVelocity += windForce * 0.002 * (Math.random() - 0.3);
        this.angularVelocity *= this.damping;

        const maxAngle = Math.PI / 3;
        if (Math.abs(this.angle) > maxAngle) {
            this.angle = Math.sign(this.angle) * maxAngle;
            this.angularVelocity *= -0.3;
        }

        this.angle += this.angularVelocity;
        this.updatePosition();
    }

    checkTubeCollision(tube) {
        const dx = this.x - tube.bottomX;
        const dy = this.y - tube.bottomY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        return dist < this.radius + tube.width / 2 + 5;
    }

    resolveTubeCollision(tube, audioEngine) {
        const pushAngle = 0.03;
        if (this.x < tube.bottomX) {
            this.angularVelocity -= pushAngle;
            tube.angularVelocity += pushAngle * 2;
        } else {
            this.angularVelocity += pushAngle;
            tube.angularVelocity -= pushAngle * 2;
        }

        const collisionForce = Math.abs(this.angularVelocity) + Math.abs(tube.angularVelocity);
        if (collisionForce > 0.01) {
            audioEngine.playChime(tube.frequency, Math.min(collisionForce * 5, 0.5));
        }
    }

    draw(ctx, material) {
        ctx.save();

        // 繪製繩子
        ctx.beginPath();
        ctx.moveTo(this.pivotX, this.pivotY);
        ctx.lineTo(this.x, this.y);
        ctx.strokeStyle = '#8B7355';
        ctx.lineWidth = 2;
        ctx.stroke();

        // 繪製敲擊器
        const gradient = ctx.createRadialGradient(
            this.x - this.radius * 0.3,
            this.y - this.radius * 0.3,
            0,
            this.x,
            this.y,
            this.radius
        );

        switch (material) {
            case 0: // 金屬
                gradient.addColorStop(0, '#FFD700');
                gradient.addColorStop(0.5, '#DAA520');
                gradient.addColorStop(1, '#B8860B');
                break;
            case 1: // 木頭
                gradient.addColorStop(0, '#A1887F');
                gradient.addColorStop(0.5, '#8D6E63');
                gradient.addColorStop(1, '#5D4037');
                break;
            case 2: // 玻璃
                gradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
                gradient.addColorStop(0.5, 'rgba(200, 230, 255, 0.7)');
                gradient.addColorStop(1, 'rgba(135, 206, 250, 0.5)');
                break;
        }

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        ctx.restore();
    }
}

class WindChime {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.tubes = [];
        this.striker = null;
        this.audio = new AudioEngine();
        this.windForce = 30;
        this.tubeCount = 5;
        this.material = 0;
        this.isDragging = false;
        this.lastMousePos = null;

        this.resize();
        this.init();
        this.bindEvents();
        this.animate();
    }

    resize() {
        const container = this.canvas.parentElement;
        const rect = container.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;

        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;
        this.ctx.scale(dpr, dpr);

        this.width = rect.width;
        this.height = rect.height;
    }

    init() {
        this.tubes = [];

        const frequencies = [523, 587, 659, 698, 784, 880, 988, 1047]; // C5 to C6
        const centerX = this.width / 2;
        const topY = 80;
        const spacing = Math.min(50, (this.width - 100) / this.tubeCount);

        // 建立管子
        for (let i = 0; i < this.tubeCount; i++) {
            const x = centerX + (i - (this.tubeCount - 1) / 2) * spacing;
            const length = 120 + i * 25;
            const width = 15 - i * 0.5;
            const frequency = frequencies[i % frequencies.length];

            this.tubes.push(new ChimeTube(x, topY, length, width, frequency));
        }

        // 建立敲擊器
        this.striker = new Striker(centerX, topY + 80, 15);
    }

    bindEvents() {
        window.addEventListener('resize', () => {
            this.resize();
            this.init();
        });

        // 點擊初始化音訊
        this.canvas.addEventListener('click', () => {
            this.audio.init();
        });

        // 拖曳互動
        this.canvas.addEventListener('mousedown', (e) => {
            this.audio.init();
            this.isDragging = true;
            const rect = this.canvas.getBoundingClientRect();
            this.lastMousePos = {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            };
        });

        this.canvas.addEventListener('mousemove', (e) => {
            if (!this.isDragging) return;

            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            if (this.lastMousePos) {
                const dx = x - this.lastMousePos.x;
                const force = dx * 0.002;

                this.tubes.forEach(tube => {
                    tube.applyForce(force);
                });
                this.striker.applyForce(force);
            }

            this.lastMousePos = { x, y };
        });

        this.canvas.addEventListener('mouseup', () => {
            this.isDragging = false;
        });

        this.canvas.addEventListener('mouseleave', () => {
            this.isDragging = false;
        });

        // 觸控
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.audio.init();
            this.isDragging = true;
            const touch = e.touches[0];
            const rect = this.canvas.getBoundingClientRect();
            this.lastMousePos = {
                x: touch.clientX - rect.left,
                y: touch.clientY - rect.top
            };
        });

        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            if (!this.isDragging) return;

            const touch = e.touches[0];
            const rect = this.canvas.getBoundingClientRect();
            const x = touch.clientX - rect.left;

            if (this.lastMousePos) {
                const dx = x - this.lastMousePos.x;
                const force = dx * 0.002;

                this.tubes.forEach(tube => {
                    tube.applyForce(force);
                });
                this.striker.applyForce(force);
            }

            this.lastMousePos = { x, y: touch.clientY - rect.top };
        });

        this.canvas.addEventListener('touchend', () => {
            this.isDragging = false;
        });

        // 控制項
        document.getElementById('windForce').addEventListener('input', (e) => {
            this.windForce = parseInt(e.target.value);
            document.getElementById('windForceValue').textContent = this.windForce;
        });

        document.getElementById('tubeCount').addEventListener('input', (e) => {
            this.tubeCount = parseInt(e.target.value);
            document.getElementById('tubeCountValue').textContent = this.tubeCount;
            this.init();
        });

        document.getElementById('material').addEventListener('input', (e) => {
            this.material = parseInt(e.target.value);
            this.audio.material = this.material;
            const labels = ['金屬', '木頭', '玻璃'];
            document.getElementById('materialValue').textContent = labels[this.material];
        });

        document.getElementById('resetBtn').addEventListener('click', () => this.init());
        document.getElementById('gustBtn').addEventListener('click', () => this.gust());

        const muteBtn = document.getElementById('muteBtn');
        muteBtn.addEventListener('click', () => {
            this.audio.muted = !this.audio.muted;
            muteBtn.textContent = this.audio.muted ? '開啟聲音' : '靜音';
            muteBtn.classList.toggle('muted', this.audio.muted);
        });
    }

    gust() {
        const force = 0.15;
        this.tubes.forEach(tube => {
            tube.applyForce(force * (Math.random() - 0.3));
        });
        this.striker.applyForce(force * (Math.random() - 0.3));
    }

    update() {
        const gravity = 0.001;

        // 更新管子
        this.tubes.forEach(tube => {
            tube.update(gravity, this.windForce);
        });

        // 更新敲擊器
        this.striker.update(gravity, this.windForce);

        // 管子間碰撞
        for (let i = 0; i < this.tubes.length; i++) {
            for (let j = i + 1; j < this.tubes.length; j++) {
                if (this.tubes[i].checkCollision(this.tubes[j])) {
                    this.tubes[i].resolveCollision(this.tubes[j], this.audio);
                }
            }
        }

        // 敲擊器與管子碰撞
        this.tubes.forEach(tube => {
            if (this.striker.checkTubeCollision(tube)) {
                this.striker.resolveTubeCollision(tube, this.audio);
            }
        });
    }

    draw() {
        const ctx = this.ctx;

        // 清除畫面
        const skyGradient = ctx.createLinearGradient(0, 0, 0, this.height);
        skyGradient.addColorStop(0, '#e8f4fc');
        skyGradient.addColorStop(0.5, '#d4eaf7');
        skyGradient.addColorStop(1, '#c0dff0');
        ctx.fillStyle = skyGradient;
        ctx.fillRect(0, 0, this.width, this.height);

        // 繪製頂部裝飾板
        this.drawTopBoard();

        // 繪製管子
        this.tubes.forEach(tube => tube.draw(ctx, this.material));

        // 繪製敲擊器
        this.striker.draw(ctx, this.material);

        // 繪製風效果
        if (this.windForce > 20) {
            this.drawWind();
        }
    }

    drawTopBoard() {
        const ctx = this.ctx;
        const centerX = this.width / 2;
        const boardWidth = Math.min(300, this.width * 0.6);
        const boardY = 60;

        // 裝飾板
        const gradient = ctx.createLinearGradient(
            centerX - boardWidth / 2, boardY,
            centerX + boardWidth / 2, boardY + 20
        );

        switch (this.material) {
            case 0: // 金屬
                gradient.addColorStop(0, '#B8860B');
                gradient.addColorStop(0.5, '#FFD700');
                gradient.addColorStop(1, '#B8860B');
                break;
            case 1: // 木頭
                gradient.addColorStop(0, '#5D4037');
                gradient.addColorStop(0.5, '#8D6E63');
                gradient.addColorStop(1, '#5D4037');
                break;
            case 2: // 玻璃
                gradient.addColorStop(0, 'rgba(135, 206, 250, 0.7)');
                gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.8)');
                gradient.addColorStop(1, 'rgba(135, 206, 250, 0.7)');
                break;
        }

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(centerX - boardWidth / 2, boardY, boardWidth, 20, 10);
        ctx.fill();

        // 掛鉤
        ctx.strokeStyle = '#666';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(centerX, boardY - 10, 15, Math.PI, 0);
        ctx.stroke();
    }

    drawWind() {
        const ctx = this.ctx;
        const windLines = Math.floor(this.windForce / 10);

        ctx.save();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 2;

        for (let i = 0; i < windLines; i++) {
            const y = 100 + Math.random() * (this.height - 200);
            const x = Math.random() * this.width;
            const length = 20 + Math.random() * 40;

            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.bezierCurveTo(
                x + length * 0.3, y - 5,
                x + length * 0.7, y + 5,
                x + length, y
            );
            ctx.stroke();
        }

        ctx.restore();
    }

    animate() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.animate());
    }
}

// 初始化
window.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('canvas');
    new WindChime(canvas);
});
