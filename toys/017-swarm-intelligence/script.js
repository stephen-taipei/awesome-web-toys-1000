/**
 * Swarm Intelligence 群體智能
 *
 * Boids 演算法模擬鳥群飛行行為
 * - 分離 Separation: 避免與鄰近個體碰撞
 * - 對齊 Alignment: 朝向鄰近個體的平均方向
 * - 聚集 Cohesion: 朝向鄰近個體的中心移動
 *
 * 由 Craig Reynolds 於 1986 年提出
 *
 * @author Awesome Web Toys 1000
 * @version 1.0.0
 */

(function() {
    'use strict';

    // ==================== 常數設定 ====================

    const CONFIG = {
        DEFAULT_COUNT: 150,
        DEFAULT_PERCEPTION: 50,
        DEFAULT_MAX_SPEED: 4,
        DEFAULT_MAX_FORCE: 0.2,
        DEFAULT_SEPARATION: 1.5,
        DEFAULT_ALIGNMENT: 1.0,
        DEFAULT_COHESION: 1.0
    };

    // 預設情境
    const PRESETS = {
        flock: { separation: 1.5, alignment: 1.0, cohesion: 1.0, speed: 4, perception: 50 },
        school: { separation: 2.0, alignment: 1.5, cohesion: 0.8, speed: 3, perception: 40 },
        swarm: { separation: 1.0, alignment: 0.5, cohesion: 1.5, speed: 5, perception: 60 },
        chaos: { separation: 0.5, alignment: 0.2, cohesion: 0.3, speed: 6, perception: 30 }
    };

    // ==================== 全域狀態 ====================

    const state = {
        canvas: null,
        ctx: null,
        width: 0,
        height: 0,

        // Boids 陣列
        boids: [],

        // 參數設定
        boidCount: CONFIG.DEFAULT_COUNT,
        perception: CONFIG.DEFAULT_PERCEPTION,
        maxSpeed: CONFIG.DEFAULT_MAX_SPEED,
        maxForce: CONFIG.DEFAULT_MAX_FORCE,

        // Boids 規則權重
        separationWeight: CONFIG.DEFAULT_SEPARATION,
        alignmentWeight: CONFIG.DEFAULT_ALIGNMENT,
        cohesionWeight: CONFIG.DEFAULT_COHESION,

        // 滑鼠互動
        mouseMode: 'none',  // none, attract, repel
        mouseX: -1000,
        mouseY: -1000,

        // 特效
        trailEnabled: false,
        perceptionEnabled: false,

        // 動畫
        animationId: null
    };

    // ==================== 向量類別 ====================

    class Vector {
        constructor(x = 0, y = 0) {
            this.x = x;
            this.y = y;
        }

        add(v) {
            this.x += v.x;
            this.y += v.y;
            return this;
        }

        sub(v) {
            this.x -= v.x;
            this.y -= v.y;
            return this;
        }

        mult(n) {
            this.x *= n;
            this.y *= n;
            return this;
        }

        div(n) {
            if (n !== 0) {
                this.x /= n;
                this.y /= n;
            }
            return this;
        }

        mag() {
            return Math.sqrt(this.x * this.x + this.y * this.y);
        }

        normalize() {
            const m = this.mag();
            if (m > 0) this.div(m);
            return this;
        }

        limit(max) {
            const m = this.mag();
            if (m > max) {
                this.normalize().mult(max);
            }
            return this;
        }

        setMag(mag) {
            this.normalize().mult(mag);
            return this;
        }

        copy() {
            return new Vector(this.x, this.y);
        }

        static sub(v1, v2) {
            return new Vector(v1.x - v2.x, v1.y - v2.y);
        }

        static dist(v1, v2) {
            return Math.sqrt(Math.pow(v1.x - v2.x, 2) + Math.pow(v1.y - v2.y, 2));
        }
    }

    // ==================== Boid 類別 ====================

    class Boid {
        constructor(x, y) {
            this.position = new Vector(x, y);
            this.velocity = new Vector(
                (Math.random() - 0.5) * state.maxSpeed * 2,
                (Math.random() - 0.5) * state.maxSpeed * 2
            );
            this.acceleration = new Vector();

            // 顏色（根據初始方向）
            this.hue = Math.random() * 60 + 100;  // 綠色系
        }

        // 計算轉向力
        steer(desired) {
            desired.setMag(state.maxSpeed);
            const steer = Vector.sub(desired, this.velocity);
            steer.limit(state.maxForce);
            return steer;
        }

        // 分離：避免擁擠
        separation(boids) {
            const steering = new Vector();
            let count = 0;
            const desiredSeparation = state.perception * 0.5;

            for (const other of boids) {
                const d = Vector.dist(this.position, other.position);
                if (other !== this && d < desiredSeparation && d > 0) {
                    const diff = Vector.sub(this.position, other.position);
                    diff.normalize();
                    diff.div(d);  // 距離越近，力越大
                    steering.add(diff);
                    count++;
                }
            }

            if (count > 0) {
                steering.div(count);
                steering.setMag(state.maxSpeed);
                steering.sub(this.velocity);
                steering.limit(state.maxForce);
            }

            return steering;
        }

        // 對齊：朝向平均方向
        alignment(boids) {
            const steering = new Vector();
            let count = 0;

            for (const other of boids) {
                const d = Vector.dist(this.position, other.position);
                if (other !== this && d < state.perception) {
                    steering.add(other.velocity);
                    count++;
                }
            }

            if (count > 0) {
                steering.div(count);
                steering.setMag(state.maxSpeed);
                steering.sub(this.velocity);
                steering.limit(state.maxForce);
            }

            return steering;
        }

        // 聚集：朝向中心
        cohesion(boids) {
            const steering = new Vector();
            let count = 0;

            for (const other of boids) {
                const d = Vector.dist(this.position, other.position);
                if (other !== this && d < state.perception) {
                    steering.add(other.position);
                    count++;
                }
            }

            if (count > 0) {
                steering.div(count);
                steering.sub(this.position);
                steering.setMag(state.maxSpeed);
                steering.sub(this.velocity);
                steering.limit(state.maxForce);
            }

            return steering;
        }

        // 滑鼠互動
        mouseInteraction() {
            if (state.mouseMode === 'none') return new Vector();

            const mouse = new Vector(state.mouseX, state.mouseY);
            const d = Vector.dist(this.position, mouse);
            const interactionRadius = 150;

            if (d < interactionRadius) {
                let steering;
                if (state.mouseMode === 'attract') {
                    steering = Vector.sub(mouse, this.position);
                } else {
                    steering = Vector.sub(this.position, mouse);
                }
                const force = (interactionRadius - d) / interactionRadius;
                steering.setMag(state.maxSpeed * force * 2);
                steering.sub(this.velocity);
                steering.limit(state.maxForce * 3);
                return steering;
            }

            return new Vector();
        }

        // 邊界處理
        edges() {
            const margin = 50;
            const turnForce = 0.5;
            const steering = new Vector();

            if (this.position.x < margin) {
                steering.x = turnForce;
            } else if (this.position.x > state.width - margin) {
                steering.x = -turnForce;
            }

            if (this.position.y < margin) {
                steering.y = turnForce;
            } else if (this.position.y > state.height - margin) {
                steering.y = -turnForce;
            }

            return steering;
        }

        // 群聚行為
        flock(boids) {
            const separation = this.separation(boids);
            const alignment = this.alignment(boids);
            const cohesion = this.cohesion(boids);
            const mouse = this.mouseInteraction();
            const edges = this.edges();

            // 應用權重
            separation.mult(state.separationWeight);
            alignment.mult(state.alignmentWeight);
            cohesion.mult(state.cohesionWeight);

            // 累加所有力
            this.acceleration.add(separation);
            this.acceleration.add(alignment);
            this.acceleration.add(cohesion);
            this.acceleration.add(mouse);
            this.acceleration.add(edges);
        }

        update() {
            this.velocity.add(this.acceleration);
            this.velocity.limit(state.maxSpeed);
            this.position.add(this.velocity);
            this.acceleration.mult(0);  // 重置加速度

            // 更新顏色（根據速度方向）
            this.hue = (Math.atan2(this.velocity.y, this.velocity.x) * 180 / Math.PI + 180) * 0.5 + 60;
        }

        draw(ctx) {
            const angle = Math.atan2(this.velocity.y, this.velocity.x);
            const size = 8;

            ctx.save();
            ctx.translate(this.position.x, this.position.y);
            ctx.rotate(angle);

            // 繪製三角形
            ctx.fillStyle = `hsl(${this.hue}, 70%, 60%)`;
            ctx.beginPath();
            ctx.moveTo(size, 0);
            ctx.lineTo(-size * 0.6, size * 0.5);
            ctx.lineTo(-size * 0.6, -size * 0.5);
            ctx.closePath();
            ctx.fill();

            ctx.restore();

            // 顯示感知範圍
            if (state.perceptionEnabled) {
                ctx.strokeStyle = 'rgba(74, 222, 128, 0.1)';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.arc(this.position.x, this.position.y, state.perception, 0, Math.PI * 2);
                ctx.stroke();
            }
        }
    }

    // ==================== 初始化 ====================

    function init() {
        state.canvas = document.getElementById('canvas');
        state.ctx = state.canvas.getContext('2d');

        resizeCanvas();
        createBoids();
        bindEvents();
        animate();
    }

    function resizeCanvas() {
        const dpr = window.devicePixelRatio || 1;
        state.width = window.innerWidth;
        state.height = window.innerHeight;

        state.canvas.width = state.width * dpr;
        state.canvas.height = state.height * dpr;
        state.canvas.style.width = state.width + 'px';
        state.canvas.style.height = state.height + 'px';

        state.ctx.scale(dpr, dpr);
    }

    function createBoids() {
        state.boids = [];
        for (let i = 0; i < state.boidCount; i++) {
            state.boids.push(new Boid(
                Math.random() * state.width,
                Math.random() * state.height
            ));
        }
        updateStats();
    }

    // ==================== 事件綁定 ====================

    function bindEvents() {
        window.addEventListener('resize', () => {
            resizeCanvas();
        });

        // 滑鼠追蹤
        state.canvas.addEventListener('mousemove', (e) => {
            state.mouseX = e.clientX;
            state.mouseY = e.clientY;
        });

        state.canvas.addEventListener('mouseleave', () => {
            state.mouseX = -1000;
            state.mouseY = -1000;
        });

        // 觸控支援
        state.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            if (e.touches.length > 0) {
                state.mouseX = e.touches[0].clientX;
                state.mouseY = e.touches[0].clientY;
            }
        }, { passive: false });

        state.canvas.addEventListener('touchend', () => {
            state.mouseX = -1000;
            state.mouseY = -1000;
        });

        // 個體數量滑桿
        document.getElementById('count-slider').addEventListener('input', (e) => {
            state.boidCount = parseInt(e.target.value, 10);
            document.getElementById('count-display').textContent = state.boidCount;
            adjustBoidCount();
        });

        // 規則權重滑桿
        document.getElementById('separation-slider').addEventListener('input', (e) => {
            state.separationWeight = parseFloat(e.target.value);
            document.getElementById('separation-display').textContent = state.separationWeight.toFixed(1);
        });

        document.getElementById('alignment-slider').addEventListener('input', (e) => {
            state.alignmentWeight = parseFloat(e.target.value);
            document.getElementById('alignment-display').textContent = state.alignmentWeight.toFixed(1);
        });

        document.getElementById('cohesion-slider').addEventListener('input', (e) => {
            state.cohesionWeight = parseFloat(e.target.value);
            document.getElementById('cohesion-display').textContent = state.cohesionWeight.toFixed(1);
        });

        // 感知半徑滑桿
        document.getElementById('perception-slider').addEventListener('input', (e) => {
            state.perception = parseInt(e.target.value, 10);
            document.getElementById('perception-display').textContent = state.perception;
        });

        // 最大速度滑桿
        document.getElementById('speed-slider').addEventListener('input', (e) => {
            state.maxSpeed = parseFloat(e.target.value);
            document.getElementById('speed-display').textContent = state.maxSpeed;
        });

        // 滑鼠互動按鈕
        document.querySelectorAll('.mouse-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.mouse-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                state.mouseMode = btn.dataset.mode;
            });
        });

        // 特效切換
        document.getElementById('trail-toggle').addEventListener('change', (e) => {
            state.trailEnabled = e.target.checked;
        });

        document.getElementById('perception-toggle').addEventListener('change', (e) => {
            state.perceptionEnabled = e.target.checked;
        });

        // 預設情境按鈕
        document.querySelectorAll('.preset-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const preset = PRESETS[btn.dataset.preset];
                if (preset) {
                    applyPreset(preset);
                }
            });
        });
    }

    function adjustBoidCount() {
        while (state.boids.length < state.boidCount) {
            state.boids.push(new Boid(
                Math.random() * state.width,
                Math.random() * state.height
            ));
        }
        while (state.boids.length > state.boidCount) {
            state.boids.pop();
        }
        updateStats();
    }

    function applyPreset(preset) {
        state.separationWeight = preset.separation;
        state.alignmentWeight = preset.alignment;
        state.cohesionWeight = preset.cohesion;
        state.maxSpeed = preset.speed;
        state.perception = preset.perception;

        // 更新 UI
        document.getElementById('separation-slider').value = preset.separation;
        document.getElementById('separation-display').textContent = preset.separation.toFixed(1);
        document.getElementById('alignment-slider').value = preset.alignment;
        document.getElementById('alignment-display').textContent = preset.alignment.toFixed(1);
        document.getElementById('cohesion-slider').value = preset.cohesion;
        document.getElementById('cohesion-display').textContent = preset.cohesion.toFixed(1);
        document.getElementById('speed-slider').value = preset.speed;
        document.getElementById('speed-display').textContent = preset.speed;
        document.getElementById('perception-slider').value = preset.perception;
        document.getElementById('perception-display').textContent = preset.perception;
    }

    // ==================== 渲染 ====================

    function render() {
        const ctx = state.ctx;

        // 清除或拖尾
        if (state.trailEnabled) {
            ctx.fillStyle = 'rgba(12, 15, 20, 0.1)';
        } else {
            ctx.fillStyle = '#0c0f14';
        }
        ctx.fillRect(0, 0, state.width, state.height);

        // 繪製滑鼠影響範圍
        if (state.mouseMode !== 'none' && state.mouseX > 0) {
            ctx.beginPath();
            ctx.arc(state.mouseX, state.mouseY, 150, 0, Math.PI * 2);
            ctx.strokeStyle = state.mouseMode === 'attract'
                ? 'rgba(74, 222, 128, 0.3)'
                : 'rgba(239, 68, 68, 0.3)';
            ctx.lineWidth = 2;
            ctx.stroke();
        }

        // 更新並繪製所有 boids
        for (const boid of state.boids) {
            boid.flock(state.boids);
            boid.update();
            boid.draw(ctx);
        }
    }

    function animate() {
        render();
        state.animationId = requestAnimationFrame(animate);
    }

    function updateStats() {
        document.getElementById('boid-display').textContent = state.boids.length;
    }

    // ==================== 啟動 ====================

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
