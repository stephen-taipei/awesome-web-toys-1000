/**
 * 熔岩燈 - Lava Lamp
 * 模擬經典熔岩燈的迷幻流動效果
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

    dist(v) {
        return this.sub(v).length();
    }

    dot(v) {
        return this.x * v.x + this.y * v.y;
    }
}

// 熔岩氣泡類別
class LavaBlob {
    constructor(x, y, radius, hue) {
        this.position = new Vector2(x, y);
        this.velocity = new Vector2(0, 0);
        this.baseRadius = radius;
        this.radius = radius;
        this.hue = hue;
        this.temperature = 0; // 0-1，影響上升
        this.phase = Math.random() * Math.PI * 2;
        this.pulseSpeed = 0.02 + Math.random() * 0.02;
        this.wobblePhase = Math.random() * Math.PI * 2;
        this.wobbleSpeed = 0.03 + Math.random() * 0.02;
        // 形狀變形
        this.deformation = [];
        const segments = 16;
        for (let i = 0; i < segments; i++) {
            this.deformation.push({
                offset: 0,
                velocity: 0,
                phase: Math.random() * Math.PI * 2
            });
        }
    }

    update(heat, viscosity, lampHeight, lampWidth, lampBottom, gravity) {
        // 底部加熱
        const distFromBottom = lampBottom - this.position.y;
        const heatZone = lampHeight * 0.2;

        if (distFromBottom < heatZone) {
            this.temperature += heat * 0.001;
        } else if (this.position.y < lampBottom - lampHeight * 0.7) {
            // 頂部冷卻
            this.temperature -= 0.005;
        }

        this.temperature = Math.max(0, Math.min(1, this.temperature));

        // 浮力（熱的上升，冷的下沉）
        const buoyancy = (this.temperature - 0.5) * heat * 0.003;
        this.velocity.y -= buoyancy;

        // 重力
        this.velocity.y += gravity * 0.3;

        // 黏度阻力
        const viscosityFactor = viscosity / 100;
        this.velocity = this.velocity.mul(0.98 - viscosityFactor * 0.05);

        // 水平隨機漂移
        this.velocity.x += (Math.random() - 0.5) * 0.02;

        // 更新位置
        this.position = this.position.add(this.velocity);

        // 邊界碰撞（燈瓶形狀）
        const centerX = lampWidth / 2;
        const lampRadius = this.getLampRadius(this.position.y, lampHeight, lampWidth, lampBottom);

        // 左右邊界
        const distFromCenter = Math.abs(this.position.x - centerX);
        const maxDist = lampRadius - this.radius;

        if (distFromCenter > maxDist) {
            this.position.x = centerX + Math.sign(this.position.x - centerX) * maxDist;
            this.velocity.x *= -0.5;
        }

        // 上下邊界
        const topY = lampBottom - lampHeight + this.radius * 1.5;
        const bottomY = lampBottom - this.radius;

        if (this.position.y < topY) {
            this.position.y = topY;
            this.velocity.y *= -0.3;
            this.temperature -= 0.05; // 碰頂冷卻
        }
        if (this.position.y > bottomY) {
            this.position.y = bottomY;
            this.velocity.y *= -0.3;
            this.temperature += 0.1; // 碰底加熱
        }

        // 呼吸效果
        this.phase += this.pulseSpeed;
        const pulse = 1 + Math.sin(this.phase) * 0.1;
        this.radius = this.baseRadius * pulse * (1 + this.temperature * 0.2);

        // 更新形狀變形
        this.wobblePhase += this.wobbleSpeed;
        for (let i = 0; i < this.deformation.length; i++) {
            const def = this.deformation[i];
            def.phase += 0.05;
            const targetOffset = Math.sin(def.phase + this.wobblePhase * (i % 3 + 1)) *
                                 this.radius * 0.2 * (1 - viscosityFactor * 0.5);
            def.velocity += (targetOffset - def.offset) * 0.1;
            def.velocity *= 0.9;
            def.offset += def.velocity;
        }
    }

    getLampRadius(y, lampHeight, lampWidth, lampBottom) {
        const relY = (lampBottom - y) / lampHeight;
        // 燈瓶形狀：中間寬，上下窄
        const baseRadius = lampWidth * 0.35;
        if (relY < 0.1) {
            // 底部收窄
            return baseRadius * (0.6 + relY * 4);
        } else if (relY > 0.85) {
            // 頂部收窄
            return baseRadius * (0.5 + (1 - relY) * 3.3);
        }
        return baseRadius;
    }

    draw(ctx, baseHue) {
        ctx.save();

        const hue = (baseHue + this.hue) % 360;
        const saturation = 80 + this.temperature * 20;
        const lightness = 45 + this.temperature * 15;

        // 繪製變形的氣泡
        ctx.beginPath();
        const segments = this.deformation.length;

        for (let i = 0; i <= segments; i++) {
            const angle = (i / segments) * Math.PI * 2;
            const def = this.deformation[i % segments];
            const r = this.radius + def.offset;
            const x = this.position.x + Math.cos(angle) * r;
            const y = this.position.y + Math.sin(angle) * r;

            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                // 使用曲線連接
                const prevAngle = ((i - 1) / segments) * Math.PI * 2;
                const prevDef = this.deformation[(i - 1) % segments];
                const prevR = this.radius + prevDef.offset;
                const prevX = this.position.x + Math.cos(prevAngle) * prevR;
                const prevY = this.position.y + Math.sin(prevAngle) * prevR;

                const cpAngle = (prevAngle + angle) / 2;
                const cpR = (prevR + r) / 2 * 1.05;
                const cpX = this.position.x + Math.cos(cpAngle) * cpR;
                const cpY = this.position.y + Math.sin(cpAngle) * cpR;

                ctx.quadraticCurveTo(cpX, cpY, x, y);
            }
        }
        ctx.closePath();

        // 熔岩漸層
        const gradient = ctx.createRadialGradient(
            this.position.x - this.radius * 0.3,
            this.position.y - this.radius * 0.3,
            0,
            this.position.x,
            this.position.y,
            this.radius * 1.2
        );

        gradient.addColorStop(0, `hsla(${hue}, ${saturation}%, ${lightness + 20}%, 0.95)`);
        gradient.addColorStop(0.5, `hsla(${hue}, ${saturation}%, ${lightness}%, 0.9)`);
        gradient.addColorStop(1, `hsla(${hue - 10}, ${saturation}%, ${lightness - 15}%, 0.85)`);

        ctx.fillStyle = gradient;
        ctx.fill();

        // 發光效果
        ctx.shadowColor = `hsla(${hue}, 100%, 50%, ${0.3 + this.temperature * 0.4})`;
        ctx.shadowBlur = 20 + this.temperature * 20;
        ctx.fill();

        // 高光
        ctx.beginPath();
        ctx.arc(
            this.position.x - this.radius * 0.25,
            this.position.y - this.radius * 0.25,
            this.radius * 0.2,
            0,
            Math.PI * 2
        );
        ctx.fillStyle = `rgba(255, 255, 255, ${0.2 + this.temperature * 0.2})`;
        ctx.fill();

        ctx.restore();
    }
}

class LavaLamp {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.blobs = [];
        this.heat = 50;
        this.viscosity = 60;
        this.hue = 30;
        this.shaking = false;
        this.shakeIntensity = 0;
        this.lampOffset = new Vector2(0, 0);

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

        // 燈瓶尺寸
        this.lampWidth = Math.min(this.width * 0.5, 300);
        this.lampHeight = this.height * 0.85;
        this.lampBottom = this.height * 0.92;
        this.lampCenterX = this.width / 2;
    }

    init() {
        this.blobs = [];

        // 創建初始熔岩氣泡
        const blobCount = 8 + Math.floor(Math.random() * 5);

        for (let i = 0; i < blobCount; i++) {
            const radius = 20 + Math.random() * 30;
            const x = this.lampCenterX + (Math.random() - 0.5) * this.lampWidth * 0.4;
            const y = this.lampBottom - this.lampHeight * 0.3 - Math.random() * this.lampHeight * 0.5;
            const hueOffset = (Math.random() - 0.5) * 30;

            const blob = new LavaBlob(x, y, radius, hueOffset);
            blob.temperature = Math.random() * 0.5;
            this.blobs.push(blob);
        }
    }

    bindEvents() {
        window.addEventListener('resize', () => this.resize());

        // 點擊創建新氣泡
        this.canvas.addEventListener('click', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            // 檢查是否在燈瓶內
            const lampRadius = this.getLampRadius(y);
            if (Math.abs(x - this.lampCenterX) < lampRadius &&
                y > this.lampBottom - this.lampHeight && y < this.lampBottom) {
                this.createBlobAt(x, y);
            }
        });

        // 控制項
        document.getElementById('heat').addEventListener('input', (e) => {
            this.heat = parseInt(e.target.value);
            document.getElementById('heatValue').textContent = this.heat;
        });

        document.getElementById('viscosity').addEventListener('input', (e) => {
            this.viscosity = parseInt(e.target.value);
            document.getElementById('viscosityValue').textContent = this.viscosity;
        });

        document.getElementById('hue').addEventListener('input', (e) => {
            this.hue = parseInt(e.target.value);
            document.getElementById('hueValue').textContent = this.hue + '°';
        });

        document.getElementById('resetBtn').addEventListener('click', () => this.init());
        document.getElementById('shakeBtn').addEventListener('click', () => this.shake());
        document.getElementById('colorBtn').addEventListener('click', () => this.randomColor());
    }

    getLampRadius(y) {
        const relY = (this.lampBottom - y) / this.lampHeight;
        const baseRadius = this.lampWidth * 0.35;
        if (relY < 0.1) {
            return baseRadius * (0.6 + relY * 4);
        } else if (relY > 0.85) {
            return baseRadius * (0.5 + (1 - relY) * 3.3);
        }
        return baseRadius;
    }

    createBlobAt(x, y) {
        const radius = 15 + Math.random() * 25;
        const hueOffset = (Math.random() - 0.5) * 30;
        const blob = new LavaBlob(x, y, radius, hueOffset);
        blob.temperature = y > this.lampBottom - this.lampHeight * 0.3 ? 0.8 : 0.2;
        this.blobs.push(blob);

        // 限制氣泡數量
        if (this.blobs.length > 20) {
            this.blobs.shift();
        }
    }

    shake() {
        this.shaking = true;
        this.shakeIntensity = 1;

        // 給所有氣泡隨機速度
        this.blobs.forEach(blob => {
            blob.velocity = blob.velocity.add(new Vector2(
                (Math.random() - 0.5) * 10,
                (Math.random() - 0.5) * 10
            ));
        });
    }

    randomColor() {
        this.hue = Math.floor(Math.random() * 360);
        document.getElementById('hue').value = this.hue;
        document.getElementById('hueValue').textContent = this.hue + '°';
    }

    update() {
        const gravity = 0.05;

        // 搖晃衰減
        if (this.shaking) {
            this.shakeIntensity *= 0.95;
            this.lampOffset = new Vector2(
                Math.sin(Date.now() * 0.05) * this.shakeIntensity * 10,
                Math.cos(Date.now() * 0.07) * this.shakeIntensity * 5
            );

            if (this.shakeIntensity < 0.01) {
                this.shaking = false;
                this.lampOffset = new Vector2(0, 0);
            }
        }

        // 更新氣泡
        this.blobs.forEach(blob => {
            if (this.shaking) {
                blob.velocity = blob.velocity.add(new Vector2(
                    (Math.random() - 0.5) * this.shakeIntensity * 2,
                    (Math.random() - 0.5) * this.shakeIntensity * 2
                ));
            }

            blob.update(
                this.heat,
                this.viscosity,
                this.lampHeight,
                this.lampWidth,
                this.lampBottom,
                gravity
            );
        });

        // 氣泡合併
        this.mergeBlobs();

        // 隨機分裂大氣泡
        this.splitBlobs();
    }

    mergeBlobs() {
        for (let i = 0; i < this.blobs.length; i++) {
            for (let j = i + 1; j < this.blobs.length; j++) {
                const blobA = this.blobs[i];
                const blobB = this.blobs[j];
                const dist = blobA.position.dist(blobB.position);
                const mergeThreshold = (blobA.radius + blobB.radius) * 0.6;

                if (dist < mergeThreshold && this.blobs.length > 4) {
                    // 合併
                    const totalArea = Math.PI * (blobA.baseRadius ** 2 + blobB.baseRadius ** 2);
                    const newRadius = Math.sqrt(totalArea / Math.PI);

                    if (newRadius < 60) {
                        blobA.baseRadius = newRadius;
                        blobA.radius = newRadius;
                        blobA.position = blobA.position.add(blobB.position).div(2);
                        blobA.velocity = blobA.velocity.add(blobB.velocity).div(2);
                        blobA.temperature = (blobA.temperature + blobB.temperature) / 2;

                        this.blobs.splice(j, 1);
                        j--;
                    }
                }
            }
        }
    }

    splitBlobs() {
        const newBlobs = [];

        this.blobs.forEach(blob => {
            if (blob.baseRadius > 40 && Math.random() < 0.005 && this.blobs.length < 15) {
                // 分裂
                const newRadius = blob.baseRadius * 0.6;
                blob.baseRadius = newRadius;
                blob.radius = newRadius;

                const offset = new Vector2(
                    (Math.random() - 0.5) * 20,
                    (Math.random() - 0.5) * 20
                );

                const newBlob = new LavaBlob(
                    blob.position.x + offset.x,
                    blob.position.y + offset.y,
                    newRadius,
                    blob.hue + (Math.random() - 0.5) * 10
                );
                newBlob.temperature = blob.temperature;
                newBlob.velocity = offset.normalize().mul(2);

                newBlobs.push(newBlob);
            }
        });

        this.blobs.push(...newBlobs);
    }

    draw() {
        const ctx = this.ctx;

        // 清除畫面
        ctx.fillStyle = '#0a0a0a';
        ctx.fillRect(0, 0, this.width, this.height);

        ctx.save();
        ctx.translate(this.lampOffset.x, this.lampOffset.y);

        // 繪製燈瓶
        this.drawLamp();

        // 繪製熔岩
        this.blobs.forEach(blob => blob.draw(ctx, this.hue));

        // 繪製燈瓶玻璃效果
        this.drawGlassEffect();

        ctx.restore();

        // 繪製底座和頂部
        this.drawBase();
    }

    drawLamp() {
        const ctx = this.ctx;

        ctx.save();

        // 燈瓶形狀路徑
        ctx.beginPath();

        const steps = 50;
        for (let i = 0; i <= steps; i++) {
            const y = this.lampBottom - (i / steps) * this.lampHeight;
            const radius = this.getLampRadius(y);
            const x = this.lampCenterX + radius;

            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }

        for (let i = steps; i >= 0; i--) {
            const y = this.lampBottom - (i / steps) * this.lampHeight;
            const radius = this.getLampRadius(y);
            const x = this.lampCenterX - radius;
            ctx.lineTo(x, y);
        }

        ctx.closePath();

        // 燈瓶內部漸層
        const gradient = ctx.createLinearGradient(0, this.lampBottom - this.lampHeight, 0, this.lampBottom);
        gradient.addColorStop(0, `hsla(${this.hue}, 30%, 10%, 0.9)`);
        gradient.addColorStop(0.3, `hsla(${this.hue}, 40%, 15%, 0.85)`);
        gradient.addColorStop(0.7, `hsla(${this.hue}, 50%, 20%, 0.8)`);
        gradient.addColorStop(1, `hsla(${this.hue + 20}, 60%, 30%, 0.9)`);

        ctx.fillStyle = gradient;
        ctx.fill();

        // 底部加熱發光
        const heatGlow = ctx.createRadialGradient(
            this.lampCenterX, this.lampBottom,
            0,
            this.lampCenterX, this.lampBottom,
            this.lampWidth * 0.4
        );
        heatGlow.addColorStop(0, `hsla(${this.hue + 20}, 100%, 50%, ${0.2 + this.heat * 0.005})`);
        heatGlow.addColorStop(1, 'transparent');

        ctx.fillStyle = heatGlow;
        ctx.fill();

        ctx.restore();
    }

    drawGlassEffect() {
        const ctx = this.ctx;

        ctx.save();

        // 玻璃反光
        ctx.beginPath();

        const steps = 30;
        for (let i = 0; i <= steps; i++) {
            const y = this.lampBottom - (i / steps) * this.lampHeight;
            const radius = this.getLampRadius(y);
            const x = this.lampCenterX - radius * 0.85;

            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }

        for (let i = steps; i >= 0; i--) {
            const y = this.lampBottom - (i / steps) * this.lampHeight;
            const radius = this.getLampRadius(y);
            const x = this.lampCenterX - radius * 0.75;
            ctx.lineTo(x, y);
        }

        ctx.closePath();

        const glassGradient = ctx.createLinearGradient(
            this.lampCenterX - this.lampWidth * 0.35, 0,
            this.lampCenterX - this.lampWidth * 0.25, 0
        );
        glassGradient.addColorStop(0, 'rgba(255, 255, 255, 0.02)');
        glassGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.08)');
        glassGradient.addColorStop(1, 'rgba(255, 255, 255, 0.02)');

        ctx.fillStyle = glassGradient;
        ctx.fill();

        ctx.restore();
    }

    drawBase() {
        const ctx = this.ctx;

        ctx.save();
        ctx.translate(this.lampOffset.x, this.lampOffset.y);

        // 頂部金屬蓋
        const topY = this.lampBottom - this.lampHeight;
        const topRadius = this.getLampRadius(topY);

        ctx.beginPath();
        ctx.ellipse(this.lampCenterX, topY - 5, topRadius * 1.1, 15, 0, 0, Math.PI * 2);

        const topGradient = ctx.createLinearGradient(
            this.lampCenterX - topRadius, topY - 15,
            this.lampCenterX + topRadius, topY + 5
        );
        topGradient.addColorStop(0, '#666');
        topGradient.addColorStop(0.5, '#999');
        topGradient.addColorStop(1, '#444');

        ctx.fillStyle = topGradient;
        ctx.fill();

        // 底座
        const baseY = this.lampBottom;
        const baseRadius = this.getLampRadius(baseY) * 1.2;

        // 底座主體
        ctx.beginPath();
        ctx.ellipse(this.lampCenterX, baseY + 15, baseRadius * 1.3, 25, 0, 0, Math.PI * 2);

        const baseGradient = ctx.createRadialGradient(
            this.lampCenterX, baseY, 0,
            this.lampCenterX, baseY + 15, baseRadius * 1.5
        );
        baseGradient.addColorStop(0, '#555');
        baseGradient.addColorStop(0.5, '#333');
        baseGradient.addColorStop(1, '#222');

        ctx.fillStyle = baseGradient;
        ctx.fill();

        // 底座頂部
        ctx.beginPath();
        ctx.ellipse(this.lampCenterX, baseY + 5, baseRadius * 1.1, 15, 0, 0, Math.PI * 2);

        const baseTopGradient = ctx.createLinearGradient(
            this.lampCenterX - baseRadius, baseY,
            this.lampCenterX + baseRadius, baseY + 10
        );
        baseTopGradient.addColorStop(0, '#777');
        baseTopGradient.addColorStop(0.5, '#999');
        baseTopGradient.addColorStop(1, '#555');

        ctx.fillStyle = baseTopGradient;
        ctx.fill();

        // 底座發光（加熱燈泡效果）
        const bulbGlow = ctx.createRadialGradient(
            this.lampCenterX, baseY, 0,
            this.lampCenterX, baseY, baseRadius * 0.8
        );
        bulbGlow.addColorStop(0, `hsla(${this.hue + 20}, 100%, 60%, ${0.1 + this.heat * 0.004})`);
        bulbGlow.addColorStop(1, 'transparent');

        ctx.fillStyle = bulbGlow;
        ctx.beginPath();
        ctx.arc(this.lampCenterX, baseY, baseRadius * 0.8, 0, Math.PI * 2);
        ctx.fill();

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
    new LavaLamp(canvas);
});
