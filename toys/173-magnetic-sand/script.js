/**
 * 磁性沙 - Magnetic Sand
 * 模擬鐵粉在磁場中形成磁力線的效果
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

    angle() {
        return Math.atan2(this.y, this.x);
    }

    rotate(angle) {
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        return new Vector2(
            this.x * cos - this.y * sin,
            this.x * sin + this.y * cos
        );
    }
}

// 磁性沙粒類別
class IronParticle {
    constructor(x, y) {
        this.position = new Vector2(x, y);
        this.velocity = new Vector2(0, 0);
        this.angle = Math.random() * Math.PI * 2;
        this.targetAngle = this.angle;
        this.length = 2 + Math.random() * 3;
        this.friction = 0.85 + Math.random() * 0.1;
    }

    applyMagneticField(field, strength) {
        // 磁場對粒子施加力
        const force = field.mul(strength * 0.0003);
        this.velocity = this.velocity.add(force);

        // 粒子朝向磁場方向
        if (field.length() > 0.1) {
            this.targetAngle = field.angle();
        }
    }

    update() {
        // 更新速度和位置
        this.velocity = this.velocity.mul(this.friction);
        this.position = this.position.add(this.velocity);

        // 平滑旋轉到目標角度
        let angleDiff = this.targetAngle - this.angle;
        while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
        while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
        this.angle += angleDiff * 0.1;
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.position.x, this.position.y);
        ctx.rotate(this.angle);

        // 鐵粉粒子（細長形狀）
        const gradient = ctx.createLinearGradient(-this.length, 0, this.length, 0);
        gradient.addColorStop(0, 'rgba(40, 40, 40, 0.9)');
        gradient.addColorStop(0.5, 'rgba(80, 80, 80, 1)');
        gradient.addColorStop(1, 'rgba(40, 40, 40, 0.9)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.ellipse(0, 0, this.length, 0.8, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }
}

// 磁極類別
class MagneticPole {
    constructor(x, y, polarity) {
        this.position = new Vector2(x, y);
        this.polarity = polarity; // 1 = N極, -1 = S極
    }

    getFieldAt(pos) {
        const diff = pos.sub(this.position);
        const dist = diff.length();

        if (dist < 10) return new Vector2(0, 0);

        // 磁場強度與距離平方成反比
        const strength = this.polarity / (dist * dist) * 10000;
        return diff.normalize().mul(strength);
    }

    draw(ctx, radius = 20) {
        ctx.save();

        // 磁極圓圈
        const gradient = ctx.createRadialGradient(
            this.position.x, this.position.y, 0,
            this.position.x, this.position.y, radius
        );

        if (this.polarity > 0) {
            gradient.addColorStop(0, '#e74c3c');
            gradient.addColorStop(0.6, '#c0392b');
            gradient.addColorStop(1, '#96281b');
        } else {
            gradient.addColorStop(0, '#3498db');
            gradient.addColorStop(0.6, '#2980b9');
            gradient.addColorStop(1, '#1a5276');
        }

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, radius, 0, Math.PI * 2);
        ctx.fill();

        // 極性標誌
        ctx.fillStyle = 'white';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.polarity > 0 ? 'N' : 'S', this.position.x, this.position.y);

        // 發光效果
        ctx.shadowColor = this.polarity > 0 ? '#e74c3c' : '#3498db';
        ctx.shadowBlur = 20;
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, radius, 0, Math.PI * 2);
        ctx.stroke();

        ctx.restore();
    }
}

class MagneticSand {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.particles = [];
        this.poles = [];
        this.strength = 60;
        this.particleCount = 1500;
        this.poleConfig = 2;
        this.mousePos = null;
        this.shaking = false;
        this.shakeIntensity = 0;

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
        this.particles = [];
        this.poles = [];

        // 創建沙粒
        for (let i = 0; i < this.particleCount; i++) {
            const x = Math.random() * this.width;
            const y = Math.random() * this.height;
            this.particles.push(new IronParticle(x, y));
        }

        // 創建磁極
        this.setupPoles();
    }

    setupPoles() {
        this.poles = [];
        const centerX = this.width / 2;
        const centerY = this.height / 2;
        const spacing = Math.min(this.width, this.height) * 0.3;

        switch (this.poleConfig) {
            case 1: // 單極
                this.poles.push(new MagneticPole(centerX, centerY, 1));
                break;
            case 2: // 雙極（條形磁鐵）
                this.poles.push(new MagneticPole(centerX - spacing / 2, centerY, 1));
                this.poles.push(new MagneticPole(centerX + spacing / 2, centerY, -1));
                break;
            case 3: // 三極
                for (let i = 0; i < 3; i++) {
                    const angle = (i / 3) * Math.PI * 2 - Math.PI / 2;
                    const x = centerX + Math.cos(angle) * spacing * 0.7;
                    const y = centerY + Math.sin(angle) * spacing * 0.7;
                    this.poles.push(new MagneticPole(x, y, i % 2 === 0 ? 1 : -1));
                }
                break;
            case 4: // 四極
                for (let i = 0; i < 4; i++) {
                    const angle = (i / 4) * Math.PI * 2;
                    const x = centerX + Math.cos(angle) * spacing * 0.7;
                    const y = centerY + Math.sin(angle) * spacing * 0.7;
                    this.poles.push(new MagneticPole(x, y, i % 2 === 0 ? 1 : -1));
                }
                break;
        }
    }

    bindEvents() {
        window.addEventListener('resize', () => {
            this.resize();
            this.init();
        });

        // 滑鼠移動
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mousePos = new Vector2(
                e.clientX - rect.left,
                e.clientY - rect.top
            );
        });

        this.canvas.addEventListener('mouseleave', () => {
            this.mousePos = null;
        });

        // 觸控
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const rect = this.canvas.getBoundingClientRect();
            const touch = e.touches[0];
            this.mousePos = new Vector2(
                touch.clientX - rect.left,
                touch.clientY - rect.top
            );
        });

        this.canvas.addEventListener('touchend', () => {
            this.mousePos = null;
        });

        // 控制項
        document.getElementById('strength').addEventListener('input', (e) => {
            this.strength = parseInt(e.target.value);
            document.getElementById('strengthValue').textContent = this.strength;
        });

        document.getElementById('particles').addEventListener('input', (e) => {
            this.particleCount = parseInt(e.target.value);
            document.getElementById('particlesValue').textContent = this.particleCount;
            this.init();
        });

        document.getElementById('poles').addEventListener('input', (e) => {
            this.poleConfig = parseInt(e.target.value);
            const labels = ['', '單極', '雙極', '三極', '四極'];
            document.getElementById('polesValue').textContent = labels[this.poleConfig];
            this.setupPoles();
        });

        document.getElementById('resetBtn').addEventListener('click', () => this.init());
        document.getElementById('shakeBtn').addEventListener('click', () => this.shake());
        document.getElementById('flipBtn').addEventListener('click', () => this.flipPolarity());
    }

    shake() {
        this.shaking = true;
        this.shakeIntensity = 1;

        // 給所有粒子隨機速度
        this.particles.forEach(particle => {
            particle.velocity = new Vector2(
                (Math.random() - 0.5) * 20,
                (Math.random() - 0.5) * 20
            );
        });
    }

    flipPolarity() {
        this.poles.forEach(pole => {
            pole.polarity *= -1;
        });
    }

    getMagneticField(pos) {
        let field = new Vector2(0, 0);

        // 來自固定磁極的磁場
        this.poles.forEach(pole => {
            field = field.add(pole.getFieldAt(pos));
        });

        // 來自滑鼠位置的額外磁極
        if (this.mousePos) {
            const mousePole = new MagneticPole(this.mousePos.x, this.mousePos.y, 1);
            field = field.add(mousePole.getFieldAt(pos).mul(1.5));
        }

        return field;
    }

    update() {
        // 搖晃衰減
        if (this.shaking) {
            this.shakeIntensity *= 0.95;
            if (this.shakeIntensity < 0.01) {
                this.shaking = false;
            }
        }

        // 更新每個粒子
        this.particles.forEach(particle => {
            // 獲取該位置的磁場
            const field = this.getMagneticField(particle.position);

            // 應用磁場力
            particle.applyMagneticField(field, this.strength);

            // 搖晃時添加隨機力
            if (this.shaking) {
                particle.velocity = particle.velocity.add(new Vector2(
                    (Math.random() - 0.5) * this.shakeIntensity * 5,
                    (Math.random() - 0.5) * this.shakeIntensity * 5
                ));
            }

            // 更新粒子
            particle.update();

            // 邊界處理
            if (particle.position.x < 0) particle.position.x = 0;
            if (particle.position.x > this.width) particle.position.x = this.width;
            if (particle.position.y < 0) particle.position.y = 0;
            if (particle.position.y > this.height) particle.position.y = this.height;
        });
    }

    draw() {
        const ctx = this.ctx;

        // 繪製背景（沙紙質感）
        this.drawBackground();

        // 繪製磁力線（可選，較淡）
        this.drawFieldLines();

        // 繪製沙粒
        this.particles.forEach(particle => particle.draw(ctx));

        // 繪製磁極
        this.poles.forEach(pole => pole.draw(ctx));

        // 繪製滑鼠位置磁極
        if (this.mousePos) {
            const mousePole = new MagneticPole(this.mousePos.x, this.mousePos.y, 1);
            mousePole.draw(ctx, 15);
        }
    }

    drawBackground() {
        const ctx = this.ctx;

        // 沙紙底色
        const gradient = ctx.createLinearGradient(0, 0, 0, this.height);
        gradient.addColorStop(0, '#f5f5dc');
        gradient.addColorStop(0.5, '#e8e4c9');
        gradient.addColorStop(1, '#d4d0b5');

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, this.width, this.height);

        // 添加一些紋理噪點
        ctx.fillStyle = 'rgba(0, 0, 0, 0.02)';
        for (let i = 0; i < 500; i++) {
            const x = Math.random() * this.width;
            const y = Math.random() * this.height;
            const size = Math.random() * 2;
            ctx.fillRect(x, y, size, size);
        }
    }

    drawFieldLines() {
        const ctx = this.ctx;

        ctx.save();
        ctx.strokeStyle = 'rgba(200, 100, 100, 0.05)';
        ctx.lineWidth = 1;

        // 從每個磁極發出磁力線
        this.poles.forEach(pole => {
            if (pole.polarity > 0) {
                const lineCount = 12;
                for (let i = 0; i < lineCount; i++) {
                    const startAngle = (i / lineCount) * Math.PI * 2;
                    this.drawFieldLine(pole.position, startAngle);
                }
            }
        });

        ctx.restore();
    }

    drawFieldLine(startPos, startAngle) {
        const ctx = this.ctx;
        const stepSize = 5;
        const maxSteps = 200;

        ctx.beginPath();

        let pos = startPos.add(Vector2.fromAngle
            ? new Vector2(Math.cos(startAngle), Math.sin(startAngle)).mul(25)
            : new Vector2(Math.cos(startAngle) * 25, Math.sin(startAngle) * 25)
        );
        ctx.moveTo(pos.x, pos.y);

        for (let i = 0; i < maxSteps; i++) {
            const field = this.getMagneticField(pos);
            if (field.length() < 0.1) break;

            const dir = field.normalize();
            pos = pos.add(dir.mul(stepSize));

            ctx.lineTo(pos.x, pos.y);

            // 檢查是否到達邊界或另一個磁極
            if (pos.x < 0 || pos.x > this.width || pos.y < 0 || pos.y > this.height) {
                break;
            }

            // 檢查是否接近 S 極
            for (const otherPole of this.poles) {
                if (otherPole.polarity < 0) {
                    if (pos.sub(otherPole.position).length() < 25) {
                        ctx.lineTo(otherPole.position.x, otherPole.position.y);
                        ctx.stroke();
                        return;
                    }
                }
            }
        }

        ctx.stroke();
    }

    animate() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.animate());
    }
}

// Vector2 靜態方法
Vector2.fromAngle = function(angle, length = 1) {
    return new Vector2(Math.cos(angle) * length, Math.sin(angle) * length);
};

// 初始化
window.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('canvas');
    new MagneticSand(canvas);
});
