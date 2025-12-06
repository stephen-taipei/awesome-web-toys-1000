/**
 * 陀螺 - Spinning Top
 * 模擬陀螺旋轉與進動效果
 */

class SpinningTop {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');

        // 陀螺狀態
        this.spinSpeed = 0;       // 自轉速度
        this.maxSpinSpeed = 70;   // 最大轉速設定
        this.friction = 10;       // 摩擦力
        this.rotation = 0;        // 自轉角度
        this.precessionAngle = 0; // 進動角度
        this.tiltAngle = 0.1;     // 傾斜角度
        this.wobble = 0;          // 晃動
        this.styleIndex = 0;      // 陀螺樣式

        // 位置
        this.x = 0;
        this.y = 0;
        this.groundY = 0;

        // 拖曳狀態
        this.isDragging = false;
        this.dragStartAngle = 0;
        this.lastMouseAngle = 0;
        this.dragSpeed = 0;

        // 軌跡
        this.trail = [];

        this.resize();
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
        this.x = this.width / 2;
        this.y = this.height * 0.6;
        this.groundY = this.height * 0.85;
    }

    bindEvents() {
        window.addEventListener('resize', () => this.resize());

        // 拖曳旋轉
        this.canvas.addEventListener('mousedown', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const mx = e.clientX - rect.left;
            const my = e.clientY - rect.top;

            this.isDragging = true;
            this.lastMouseAngle = Math.atan2(my - this.y, mx - this.x);
            this.dragSpeed = 0;
        });

        this.canvas.addEventListener('mousemove', (e) => {
            if (!this.isDragging) return;

            const rect = this.canvas.getBoundingClientRect();
            const mx = e.clientX - rect.left;
            const my = e.clientY - rect.top;

            const currentAngle = Math.atan2(my - this.y, mx - this.x);
            let angleDiff = currentAngle - this.lastMouseAngle;

            // 處理角度跨越 -PI 到 PI 的情況
            if (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
            if (angleDiff < -Math.PI) angleDiff += Math.PI * 2;

            this.dragSpeed = angleDiff * 50;
            this.spinSpeed += Math.abs(this.dragSpeed) * 0.5;
            this.spinSpeed = Math.min(this.spinSpeed, 150);

            this.lastMouseAngle = currentAngle;
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
            const touch = e.touches[0];
            const rect = this.canvas.getBoundingClientRect();
            const mx = touch.clientX - rect.left;
            const my = touch.clientY - rect.top;

            this.isDragging = true;
            this.lastMouseAngle = Math.atan2(my - this.y, mx - this.x);
        });

        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            if (!this.isDragging) return;

            const touch = e.touches[0];
            const rect = this.canvas.getBoundingClientRect();
            const mx = touch.clientX - rect.left;
            const my = touch.clientY - rect.top;

            const currentAngle = Math.atan2(my - this.y, mx - this.x);
            let angleDiff = currentAngle - this.lastMouseAngle;

            if (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
            if (angleDiff < -Math.PI) angleDiff += Math.PI * 2;

            this.dragSpeed = angleDiff * 50;
            this.spinSpeed += Math.abs(this.dragSpeed) * 0.5;
            this.spinSpeed = Math.min(this.spinSpeed, 150);

            this.lastMouseAngle = currentAngle;
        });

        this.canvas.addEventListener('touchend', () => {
            this.isDragging = false;
        });

        // 控制項
        document.getElementById('spinSpeed').addEventListener('input', (e) => {
            this.maxSpinSpeed = parseInt(e.target.value);
            document.getElementById('spinSpeedValue').textContent = this.maxSpinSpeed;
        });

        document.getElementById('friction').addEventListener('input', (e) => {
            this.friction = parseInt(e.target.value);
            document.getElementById('frictionValue').textContent = this.friction;
        });

        document.getElementById('style').addEventListener('input', (e) => {
            this.styleIndex = parseInt(e.target.value);
            const styles = ['傳統', '現代', '陀螺儀'];
            document.getElementById('styleValue').textContent = styles[this.styleIndex];
        });

        document.getElementById('spinBtn').addEventListener('click', () => {
            this.spinSpeed = this.maxSpinSpeed * 1.5;
            this.tiltAngle = 0.15;
            this.trail = [];
        });

        document.getElementById('resetBtn').addEventListener('click', () => {
            this.spinSpeed = 0;
            this.rotation = 0;
            this.precessionAngle = 0;
            this.tiltAngle = 0.1;
            this.wobble = 0;
            this.trail = [];
        });
    }

    update() {
        if (this.spinSpeed > 0.1) {
            // 自轉
            this.rotation += this.spinSpeed * 0.02;

            // 進動（當轉速降低時增加）
            const precessionRate = 0.02 / (this.spinSpeed * 0.1 + 0.5);
            this.precessionAngle += precessionRate;

            // 摩擦力減速
            this.spinSpeed *= 1 - this.friction * 0.0001;

            // 傾斜角度隨轉速變化
            const targetTilt = 0.1 + (1 - this.spinSpeed / 100) * 0.4;
            this.tiltAngle += (targetTilt - this.tiltAngle) * 0.01;

            // 晃動（轉速低時增加）
            if (this.spinSpeed < 30) {
                this.wobble = (1 - this.spinSpeed / 30) * 0.1;
            } else {
                this.wobble *= 0.95;
            }

            // 記錄軌跡
            const trailX = this.x + Math.cos(this.precessionAngle) * 30 * this.tiltAngle * 3;
            const trailY = this.y + Math.sin(this.precessionAngle) * 15 * this.tiltAngle * 3;
            this.trail.push({ x: trailX, y: trailY, alpha: 1 });

            if (this.trail.length > 100) {
                this.trail.shift();
            }
        } else {
            this.spinSpeed = 0;
            // 陀螺倒下
            if (this.tiltAngle < Math.PI / 2) {
                this.tiltAngle += 0.02;
            }
        }

        // 軌跡淡出
        this.trail.forEach(point => {
            point.alpha *= 0.98;
        });
        this.trail = this.trail.filter(point => point.alpha > 0.01);
    }

    draw() {
        const ctx = this.ctx;

        // 清除畫面
        ctx.fillStyle = '#2d3436';
        ctx.fillRect(0, 0, this.width, this.height);

        // 繪製地面
        this.drawGround();

        // 繪製軌跡
        this.drawTrail();

        // 繪製陰影
        this.drawShadow();

        // 繪製陀螺
        this.drawTop();

        // 繪製速度指示
        this.drawSpeedIndicator();
    }

    drawGround() {
        const ctx = this.ctx;

        // 地面漸層
        const groundGradient = ctx.createRadialGradient(
            this.x, this.groundY, 0,
            this.x, this.groundY, 300
        );
        groundGradient.addColorStop(0, '#a29bfe');
        groundGradient.addColorStop(0.5, '#6c5ce7');
        groundGradient.addColorStop(1, '#2d3436');

        ctx.fillStyle = groundGradient;
        ctx.beginPath();
        ctx.ellipse(this.x, this.groundY, 300, 80, 0, 0, Math.PI * 2);
        ctx.fill();

        // 地面反光
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.beginPath();
        ctx.ellipse(this.x - 50, this.groundY - 20, 100, 30, -0.3, 0, Math.PI * 2);
        ctx.fill();
    }

    drawTrail() {
        const ctx = this.ctx;

        if (this.trail.length < 2) return;

        ctx.save();
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        for (let i = 1; i < this.trail.length; i++) {
            const prev = this.trail[i - 1];
            const curr = this.trail[i];

            ctx.beginPath();
            ctx.moveTo(prev.x, prev.y);
            ctx.lineTo(curr.x, curr.y);
            ctx.strokeStyle = `rgba(253, 121, 168, ${curr.alpha * 0.5})`;
            ctx.lineWidth = 3 * curr.alpha;
            ctx.stroke();
        }

        ctx.restore();
    }

    drawShadow() {
        const ctx = this.ctx;

        const shadowScale = 1 - this.tiltAngle * 0.3;
        const shadowOffset = Math.sin(this.precessionAngle) * 20 * this.tiltAngle;

        ctx.save();
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.beginPath();
        ctx.ellipse(
            this.x + shadowOffset,
            this.groundY,
            40 * shadowScale,
            15 * shadowScale,
            0, 0, Math.PI * 2
        );
        ctx.fill();
        ctx.restore();
    }

    drawTop() {
        const ctx = this.ctx;

        ctx.save();
        ctx.translate(this.x, this.y);

        // 應用進動和晃動
        const wobbleX = Math.sin(this.rotation * 0.5) * this.wobble;
        const wobbleY = Math.cos(this.rotation * 0.5) * this.wobble;

        ctx.rotate(Math.sin(this.precessionAngle) * this.tiltAngle + wobbleX);

        // 根據樣式繪製不同的陀螺
        switch (this.styleIndex) {
            case 0:
                this.drawTraditionalTop(ctx);
                break;
            case 1:
                this.drawModernTop(ctx);
                break;
            case 2:
                this.drawGyroscope(ctx);
                break;
        }

        ctx.restore();
    }

    drawTraditionalTop(ctx) {
        const bodyHeight = 80;
        const bodyRadius = 50;
        const tipLength = 30;

        // 陀螺身體
        const bodyGradient = ctx.createLinearGradient(-bodyRadius, 0, bodyRadius, 0);
        bodyGradient.addColorStop(0, '#c0392b');
        bodyGradient.addColorStop(0.3, '#e74c3c');
        bodyGradient.addColorStop(0.5, '#ff6b6b');
        bodyGradient.addColorStop(0.7, '#e74c3c');
        bodyGradient.addColorStop(1, '#c0392b');

        ctx.fillStyle = bodyGradient;
        ctx.beginPath();
        ctx.moveTo(-bodyRadius, 0);
        ctx.quadraticCurveTo(-bodyRadius * 0.8, -bodyHeight * 0.4, -bodyRadius * 0.3, -bodyHeight * 0.7);
        ctx.lineTo(bodyRadius * 0.3, -bodyHeight * 0.7);
        ctx.quadraticCurveTo(bodyRadius * 0.8, -bodyHeight * 0.4, bodyRadius, 0);
        ctx.lineTo(0, tipLength);
        ctx.closePath();
        ctx.fill();

        // 旋轉條紋
        ctx.save();
        ctx.rotate(this.rotation);

        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            ctx.fillStyle = i % 2 === 0 ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.2)';
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.arc(0, -bodyHeight * 0.35, bodyRadius * 0.8, angle, angle + Math.PI / 8);
            ctx.closePath();
            ctx.fill();
        }

        ctx.restore();

        // 頂部手柄
        ctx.fillStyle = '#8B4513';
        ctx.beginPath();
        ctx.roundRect(-10, -bodyHeight * 0.7 - 25, 20, 25, 3);
        ctx.fill();

        // 尖端
        const tipGradient = ctx.createLinearGradient(0, 0, 0, tipLength);
        tipGradient.addColorStop(0, '#C0C0C0');
        tipGradient.addColorStop(1, '#808080');

        ctx.fillStyle = tipGradient;
        ctx.beginPath();
        ctx.moveTo(-5, 0);
        ctx.lineTo(5, 0);
        ctx.lineTo(0, tipLength);
        ctx.closePath();
        ctx.fill();
    }

    drawModernTop(ctx) {
        const radius = 45;
        const height = 60;

        ctx.save();
        ctx.rotate(this.rotation);

        // 主體 - 飛碟形狀
        const bodyGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, radius);
        bodyGradient.addColorStop(0, '#00cec9');
        bodyGradient.addColorStop(0.7, '#0984e3');
        bodyGradient.addColorStop(1, '#6c5ce7');

        ctx.fillStyle = bodyGradient;
        ctx.beginPath();
        ctx.ellipse(0, 0, radius, 15, 0, 0, Math.PI * 2);
        ctx.fill();

        // 發光邊緣
        if (this.spinSpeed > 10) {
            ctx.strokeStyle = `rgba(0, 255, 255, ${this.spinSpeed / 100})`;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.ellipse(0, 0, radius + 5, 20, 0, 0, Math.PI * 2);
            ctx.stroke();
        }

        // LED 燈效果
        const ledCount = 6;
        for (let i = 0; i < ledCount; i++) {
            const angle = (i / ledCount) * Math.PI * 2;
            const lx = Math.cos(angle) * radius * 0.7;
            const ly = Math.sin(angle) * 10;

            const hue = (this.rotation * 50 + i * 60) % 360;
            ctx.fillStyle = `hsla(${hue}, 100%, 50%, ${0.5 + this.spinSpeed / 200})`;
            ctx.beginPath();
            ctx.arc(lx, ly, 5, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();

        // 尖端
        ctx.fillStyle = '#2d3436';
        ctx.beginPath();
        ctx.moveTo(-8, 10);
        ctx.lineTo(8, 10);
        ctx.lineTo(0, 35);
        ctx.closePath();
        ctx.fill();
    }

    drawGyroscope(ctx) {
        const outerRadius = 50;
        const innerRadius = 35;

        // 外環
        ctx.save();
        ctx.rotate(this.precessionAngle);

        ctx.strokeStyle = '#C0C0C0';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.ellipse(0, 0, outerRadius, outerRadius * 0.3, 0, 0, Math.PI * 2);
        ctx.stroke();

        ctx.restore();

        // 中環
        ctx.save();
        ctx.rotate(this.precessionAngle + Math.PI / 2);

        ctx.strokeStyle = '#A0A0A0';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.ellipse(0, 0, innerRadius, innerRadius * 0.3, 0, 0, Math.PI * 2);
        ctx.stroke();

        ctx.restore();

        // 內部旋轉盤
        ctx.save();
        ctx.rotate(this.rotation);

        const discGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 25);
        discGradient.addColorStop(0, '#FFD700');
        discGradient.addColorStop(0.5, '#FFA500');
        discGradient.addColorStop(1, '#FF6347');

        ctx.fillStyle = discGradient;
        ctx.beginPath();
        ctx.arc(0, 0, 25, 0, Math.PI * 2);
        ctx.fill();

        // 旋轉標記
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 2;
        for (let i = 0; i < 4; i++) {
            const angle = (i / 4) * Math.PI * 2;
            ctx.beginPath();
            ctx.moveTo(Math.cos(angle) * 10, Math.sin(angle) * 10);
            ctx.lineTo(Math.cos(angle) * 22, Math.sin(angle) * 22);
            ctx.stroke();
        }

        ctx.restore();

        // 支架
        ctx.fillStyle = '#808080';
        ctx.beginPath();
        ctx.moveTo(-5, 15);
        ctx.lineTo(5, 15);
        ctx.lineTo(0, 40);
        ctx.closePath();
        ctx.fill();
    }

    drawSpeedIndicator() {
        const ctx = this.ctx;
        const x = 50;
        const y = 50;

        // 背景
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.beginPath();
        ctx.arc(x, y, 35, 0, Math.PI * 2);
        ctx.fill();

        // 速度弧
        const speedRatio = Math.min(this.spinSpeed / 100, 1);
        const gradient = ctx.createConicGradient(-Math.PI / 2, x, y);
        gradient.addColorStop(0, '#00ff00');
        gradient.addColorStop(0.5, '#ffff00');
        gradient.addColorStop(1, '#ff0000');

        ctx.strokeStyle = gradient;
        ctx.lineWidth = 6;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.arc(x, y, 28, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * speedRatio);
        ctx.stroke();

        // 數值
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(Math.round(this.spinSpeed), x, y);

        // 標籤
        ctx.font = '10px Arial';
        ctx.fillText('RPM', x, y + 15);
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
    new SpinningTop(canvas);
});
