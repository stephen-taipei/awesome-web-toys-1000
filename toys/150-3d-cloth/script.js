/**
 * 150 - 3D 布料模擬
 * 3D Cloth Simulation
 *
 * 使用 WebGL 實現 3D 空間中的布料物理模擬
 * 支援滑鼠旋轉視角、風力效果、即時互動
 */

// 3D 向量類別
class Vec3 {
    constructor(x = 0, y = 0, z = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    add(v) {
        return new Vec3(this.x + v.x, this.y + v.y, this.z + v.z);
    }

    sub(v) {
        return new Vec3(this.x - v.x, this.y - v.y, this.z - v.z);
    }

    mul(s) {
        return new Vec3(this.x * s, this.y * s, this.z * s);
    }

    length() {
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
    }

    normalize() {
        const len = this.length();
        if (len === 0) return new Vec3();
        return this.mul(1 / len);
    }

    cross(v) {
        return new Vec3(
            this.y * v.z - this.z * v.y,
            this.z * v.x - this.x * v.z,
            this.x * v.y - this.y * v.x
        );
    }

    dot(v) {
        return this.x * v.x + this.y * v.y + this.z * v.z;
    }
}

// 布料質點類別
class Particle {
    constructor(x, y, z, pinned = false) {
        this.position = new Vec3(x, y, z);
        this.prevPosition = new Vec3(x, y, z);
        this.acceleration = new Vec3();
        this.pinned = pinned;
        this.mass = 1;
    }

    applyForce(force) {
        if (!this.pinned) {
            this.acceleration = this.acceleration.add(force.mul(1 / this.mass));
        }
    }

    update(damping) {
        if (this.pinned) return;

        // Verlet 積分法
        const velocity = this.position.sub(this.prevPosition).mul(damping);
        this.prevPosition = new Vec3(this.position.x, this.position.y, this.position.z);
        this.position = this.position.add(velocity).add(this.acceleration.mul(0.016 * 0.016));
        this.acceleration = new Vec3();
    }
}

// 布料約束（彈簧）類別
class Constraint {
    constructor(p1, p2, restLength = null) {
        this.p1 = p1;
        this.p2 = p2;
        this.restLength = restLength || p1.position.sub(p2.position).length();
        this.stiffness = 1;
    }

    satisfy() {
        const diff = this.p2.position.sub(this.p1.position);
        const dist = diff.length();
        if (dist === 0) return;

        const difference = (this.restLength - dist) / dist;
        const correction = diff.mul(0.5 * difference * this.stiffness);

        if (!this.p1.pinned) {
            this.p1.position = this.p1.position.sub(correction);
        }
        if (!this.p2.pinned) {
            this.p2.position = this.p2.position.add(correction);
        }
    }
}

// 主要布料模擬類別
class ClothSimulation {
    constructor(canvas) {
        this.canvas = canvas;
        this.gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

        if (!this.gl) {
            console.error('WebGL 不支援');
            return;
        }

        this.particles = [];
        this.constraints = [];
        this.width = 25;
        this.height = 25;
        this.spacing = 0.08;

        // 相機參數
        this.cameraDistance = 3;
        this.cameraRotationX = 0.3;
        this.cameraRotationY = 0.5;
        this.cameraPanX = 0;
        this.cameraPanY = 0;

        // 物理參數
        this.gravity = 0.98;
        this.damping = 0.98;
        this.windStrength = 0.3;
        this.windEnabled = false;
        this.windTime = 0;

        // 互動狀態
        this.isDragging = false;
        this.isPanning = false;
        this.lastMouseX = 0;
        this.lastMouseY = 0;

        // 顏色配置
        this.clothColor = [0.2, 0.6, 1.0];
        this.wireframeColor = [0.1, 0.4, 0.8];

        this.initShaders();
        this.createCloth();
        this.setupEventListeners();
        this.resize();
        this.animate();
    }

    initShaders() {
        const gl = this.gl;

        // 頂點著色器
        const vsSource = `
            attribute vec3 aPosition;
            attribute vec3 aNormal;
            uniform mat4 uModelViewMatrix;
            uniform mat4 uProjectionMatrix;
            uniform mat4 uNormalMatrix;
            varying vec3 vNormal;
            varying vec3 vPosition;

            void main() {
                vec4 pos = uModelViewMatrix * vec4(aPosition, 1.0);
                vPosition = pos.xyz;
                vNormal = (uNormalMatrix * vec4(aNormal, 0.0)).xyz;
                gl_Position = uProjectionMatrix * pos;
            }
        `;

        // 片段著色器
        const fsSource = `
            precision mediump float;
            varying vec3 vNormal;
            varying vec3 vPosition;
            uniform vec3 uColor;
            uniform vec3 uLightDirection;

            void main() {
                vec3 normal = normalize(vNormal);
                vec3 lightDir = normalize(uLightDirection);

                // 雙面光照
                float diff = abs(dot(normal, lightDir));

                // 環境光 + 漫反射
                vec3 ambient = uColor * 0.3;
                vec3 diffuse = uColor * diff * 0.7;

                // 高光
                vec3 viewDir = normalize(-vPosition);
                vec3 halfDir = normalize(lightDir + viewDir);
                float spec = pow(max(abs(dot(normal, halfDir)), 0.0), 32.0);
                vec3 specular = vec3(1.0) * spec * 0.3;

                vec3 color = ambient + diffuse + specular;
                gl_FragColor = vec4(color, 1.0);
            }
        `;

        // 線框著色器
        const lineVsSource = `
            attribute vec3 aPosition;
            uniform mat4 uModelViewMatrix;
            uniform mat4 uProjectionMatrix;

            void main() {
                gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(aPosition, 1.0);
            }
        `;

        const lineFsSource = `
            precision mediump float;
            uniform vec3 uColor;

            void main() {
                gl_FragColor = vec4(uColor, 0.5);
            }
        `;

        // 編譯著色器
        this.clothProgram = this.createProgram(vsSource, fsSource);
        this.lineProgram = this.createProgram(lineVsSource, lineFsSource);

        // 建立緩衝區
        this.positionBuffer = gl.createBuffer();
        this.normalBuffer = gl.createBuffer();
        this.indexBuffer = gl.createBuffer();
        this.wireframeBuffer = gl.createBuffer();
    }

    createProgram(vsSource, fsSource) {
        const gl = this.gl;

        const vs = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(vs, vsSource);
        gl.compileShader(vs);

        const fs = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(fs, fsSource);
        gl.compileShader(fs);

        const program = gl.createProgram();
        gl.attachShader(program, vs);
        gl.attachShader(program, fs);
        gl.linkProgram(program);

        return program;
    }

    createCloth() {
        this.particles = [];
        this.constraints = [];

        const startX = -(this.width * this.spacing) / 2;
        const startY = (this.height * this.spacing) / 2;
        const startZ = 0;

        // 建立質點網格
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const px = startX + x * this.spacing;
                const py = startY - y * this.spacing;
                const pz = startZ;

                // 固定頂端的點
                const pinned = y === 0 && (x % 4 === 0 || x === this.width - 1);
                this.particles.push(new Particle(px, py, pz, pinned));
            }
        }

        // 建立約束（彈簧連接）
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const idx = y * this.width + x;

                // 水平約束
                if (x < this.width - 1) {
                    this.constraints.push(new Constraint(
                        this.particles[idx],
                        this.particles[idx + 1]
                    ));
                }

                // 垂直約束
                if (y < this.height - 1) {
                    this.constraints.push(new Constraint(
                        this.particles[idx],
                        this.particles[idx + this.width]
                    ));
                }

                // 對角約束（增加穩定性）
                if (x < this.width - 1 && y < this.height - 1) {
                    this.constraints.push(new Constraint(
                        this.particles[idx],
                        this.particles[idx + this.width + 1]
                    ));
                    this.constraints.push(new Constraint(
                        this.particles[idx + 1],
                        this.particles[idx + this.width]
                    ));
                }

                // 彎曲約束（跳過一格）
                if (x < this.width - 2) {
                    this.constraints.push(new Constraint(
                        this.particles[idx],
                        this.particles[idx + 2]
                    ));
                }
                if (y < this.height - 2) {
                    this.constraints.push(new Constraint(
                        this.particles[idx],
                        this.particles[idx + this.width * 2]
                    ));
                }
            }
        }
    }

    setupEventListeners() {
        // 滑鼠事件
        this.canvas.addEventListener('mousedown', (e) => this.onMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.onMouseMove(e));
        this.canvas.addEventListener('mouseup', () => this.onMouseUp());
        this.canvas.addEventListener('mouseleave', () => this.onMouseUp());
        this.canvas.addEventListener('wheel', (e) => this.onWheel(e));
        this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());

        // 觸控事件
        this.canvas.addEventListener('touchstart', (e) => this.onTouchStart(e));
        this.canvas.addEventListener('touchmove', (e) => this.onTouchMove(e));
        this.canvas.addEventListener('touchend', () => this.onMouseUp());

        // 視窗大小調整
        window.addEventListener('resize', () => this.resize());

        // 控制項
        document.getElementById('windStrength').addEventListener('input', (e) => {
            this.windStrength = e.target.value / 100;
            document.getElementById('windStrengthValue').textContent = e.target.value;
        });

        document.getElementById('gravity').addEventListener('input', (e) => {
            this.gravity = e.target.value / 100;
            document.getElementById('gravityValue').textContent = e.target.value;
        });

        document.getElementById('damping').addEventListener('input', (e) => {
            this.damping = e.target.value / 100;
            document.getElementById('dampingValue').textContent = e.target.value;
        });

        document.getElementById('clothSize').addEventListener('change', (e) => {
            this.width = parseInt(e.target.value);
            this.height = parseInt(e.target.value);
            this.createCloth();
        });

        document.getElementById('resetBtn').addEventListener('click', () => {
            this.createCloth();
        });

        document.getElementById('dropBtn').addEventListener('click', () => {
            // 放開左上角固定點
            for (let i = 0; i < Math.min(4, this.width); i++) {
                this.particles[i].pinned = false;
            }
        });

        document.getElementById('windToggle').addEventListener('click', (e) => {
            this.windEnabled = !this.windEnabled;
            e.target.textContent = this.windEnabled ? '關閉風力' : '開啟風力';
            e.target.classList.toggle('active', this.windEnabled);
        });
    }

    onMouseDown(e) {
        if (e.button === 2 || e.ctrlKey) {
            this.isPanning = true;
        } else {
            this.isDragging = true;
        }
        this.lastMouseX = e.clientX;
        this.lastMouseY = e.clientY;
    }

    onMouseMove(e) {
        const deltaX = e.clientX - this.lastMouseX;
        const deltaY = e.clientY - this.lastMouseY;

        if (this.isDragging) {
            this.cameraRotationY += deltaX * 0.005;
            this.cameraRotationX += deltaY * 0.005;
            this.cameraRotationX = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.cameraRotationX));
        } else if (this.isPanning) {
            this.cameraPanX += deltaX * 0.002;
            this.cameraPanY -= deltaY * 0.002;
        }

        this.lastMouseX = e.clientX;
        this.lastMouseY = e.clientY;
    }

    onMouseUp() {
        this.isDragging = false;
        this.isPanning = false;
    }

    onWheel(e) {
        e.preventDefault();
        this.cameraDistance += e.deltaY * 0.003;
        this.cameraDistance = Math.max(1, Math.min(10, this.cameraDistance));
    }

    onTouchStart(e) {
        e.preventDefault();
        if (e.touches.length === 1) {
            this.isDragging = true;
            this.lastMouseX = e.touches[0].clientX;
            this.lastMouseY = e.touches[0].clientY;
        } else if (e.touches.length === 2) {
            this.isPanning = true;
            this.lastMouseX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
            this.lastMouseY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
            this.lastPinchDist = Math.hypot(
                e.touches[1].clientX - e.touches[0].clientX,
                e.touches[1].clientY - e.touches[0].clientY
            );
        }
    }

    onTouchMove(e) {
        e.preventDefault();
        if (e.touches.length === 1 && this.isDragging) {
            const deltaX = e.touches[0].clientX - this.lastMouseX;
            const deltaY = e.touches[0].clientY - this.lastMouseY;
            this.cameraRotationY += deltaX * 0.005;
            this.cameraRotationX += deltaY * 0.005;
            this.cameraRotationX = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.cameraRotationX));
            this.lastMouseX = e.touches[0].clientX;
            this.lastMouseY = e.touches[0].clientY;
        } else if (e.touches.length === 2) {
            const dist = Math.hypot(
                e.touches[1].clientX - e.touches[0].clientX,
                e.touches[1].clientY - e.touches[0].clientY
            );
            const scale = (this.lastPinchDist - dist) * 0.01;
            this.cameraDistance += scale;
            this.cameraDistance = Math.max(1, Math.min(10, this.cameraDistance));
            this.lastPinchDist = dist;
        }
    }

    resize() {
        const rect = this.canvas.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;
        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    }

    update() {
        const dt = 0.016; // 固定時間步長
        const iterations = 5; // 約束迭代次數

        // 施加重力
        const gravity = new Vec3(0, -this.gravity * 0.01, 0);
        for (const p of this.particles) {
            p.applyForce(gravity);
        }

        // 施加風力
        if (this.windEnabled) {
            this.windTime += dt;
            const windX = Math.sin(this.windTime * 2) * this.windStrength * 0.02;
            const windZ = Math.cos(this.windTime * 1.5) * this.windStrength * 0.01;
            const wind = new Vec3(windX, 0, windZ);

            for (const p of this.particles) {
                // 添加一些隨機變化
                const noise = new Vec3(
                    (Math.random() - 0.5) * 0.005,
                    (Math.random() - 0.5) * 0.002,
                    (Math.random() - 0.5) * 0.005
                );
                p.applyForce(wind.add(noise));
            }
        }

        // 更新質點位置
        for (const p of this.particles) {
            p.update(this.damping);
        }

        // 滿足約束
        for (let i = 0; i < iterations; i++) {
            for (const c of this.constraints) {
                c.satisfy();
            }
        }
    }

    calculateNormals() {
        const normals = new Array(this.particles.length).fill(null).map(() => new Vec3());

        // 計算每個三角形的法向量並累加到頂點
        for (let y = 0; y < this.height - 1; y++) {
            for (let x = 0; x < this.width - 1; x++) {
                const i0 = y * this.width + x;
                const i1 = i0 + 1;
                const i2 = i0 + this.width;
                const i3 = i2 + 1;

                const p0 = this.particles[i0].position;
                const p1 = this.particles[i1].position;
                const p2 = this.particles[i2].position;
                const p3 = this.particles[i3].position;

                // 第一個三角形
                const n1 = p1.sub(p0).cross(p2.sub(p0)).normalize();
                normals[i0] = normals[i0].add(n1);
                normals[i1] = normals[i1].add(n1);
                normals[i2] = normals[i2].add(n1);

                // 第二個三角形
                const n2 = p2.sub(p3).cross(p1.sub(p3)).normalize();
                normals[i1] = normals[i1].add(n2);
                normals[i2] = normals[i2].add(n2);
                normals[i3] = normals[i3].add(n2);
            }
        }

        // 正規化
        return normals.map(n => n.normalize());
    }

    render() {
        const gl = this.gl;

        gl.clearColor(0.05, 0.05, 0.1, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.enable(gl.DEPTH_TEST);
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

        // 建立矩陣
        const aspect = this.canvas.width / this.canvas.height;
        const projectionMatrix = this.perspective(45 * Math.PI / 180, aspect, 0.1, 100);
        const modelViewMatrix = this.createModelViewMatrix();
        const normalMatrix = this.createNormalMatrix(modelViewMatrix);

        // 準備頂點數據
        const positions = [];
        for (const p of this.particles) {
            positions.push(p.position.x, p.position.y, p.position.z);
        }

        // 計算法向量
        const normals = this.calculateNormals();
        const normalData = [];
        for (const n of normals) {
            normalData.push(n.x, n.y, n.z);
        }

        // 建立索引
        const indices = [];
        for (let y = 0; y < this.height - 1; y++) {
            for (let x = 0; x < this.width - 1; x++) {
                const i = y * this.width + x;
                indices.push(i, i + 1, i + this.width);
                indices.push(i + 1, i + this.width + 1, i + this.width);
            }
        }

        // 繪製布料面
        gl.useProgram(this.clothProgram);

        // 設置 uniform
        const projLoc = gl.getUniformLocation(this.clothProgram, 'uProjectionMatrix');
        const mvLoc = gl.getUniformLocation(this.clothProgram, 'uModelViewMatrix');
        const normLoc = gl.getUniformLocation(this.clothProgram, 'uNormalMatrix');
        const colorLoc = gl.getUniformLocation(this.clothProgram, 'uColor');
        const lightLoc = gl.getUniformLocation(this.clothProgram, 'uLightDirection');

        gl.uniformMatrix4fv(projLoc, false, projectionMatrix);
        gl.uniformMatrix4fv(mvLoc, false, modelViewMatrix);
        gl.uniformMatrix4fv(normLoc, false, normalMatrix);
        gl.uniform3fv(colorLoc, this.clothColor);
        gl.uniform3fv(lightLoc, [0.5, 1.0, 0.5]);

        // 位置 attribute
        const posLoc = gl.getAttribLocation(this.clothProgram, 'aPosition');
        gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.DYNAMIC_DRAW);
        gl.enableVertexAttribArray(posLoc);
        gl.vertexAttribPointer(posLoc, 3, gl.FLOAT, false, 0, 0);

        // 法向量 attribute
        const normAttrLoc = gl.getAttribLocation(this.clothProgram, 'aNormal');
        gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normalData), gl.DYNAMIC_DRAW);
        gl.enableVertexAttribArray(normAttrLoc);
        gl.vertexAttribPointer(normAttrLoc, 3, gl.FLOAT, false, 0, 0);

        // 索引緩衝區
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.DYNAMIC_DRAW);

        gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);

        // 繪製線框
        gl.useProgram(this.lineProgram);

        const lineProjLoc = gl.getUniformLocation(this.lineProgram, 'uProjectionMatrix');
        const lineMvLoc = gl.getUniformLocation(this.lineProgram, 'uModelViewMatrix');
        const lineColorLoc = gl.getUniformLocation(this.lineProgram, 'uColor');

        gl.uniformMatrix4fv(lineProjLoc, false, projectionMatrix);
        gl.uniformMatrix4fv(lineMvLoc, false, modelViewMatrix);
        gl.uniform3fv(lineColorLoc, this.wireframeColor);

        const linePosLoc = gl.getAttribLocation(this.lineProgram, 'aPosition');
        gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
        gl.enableVertexAttribArray(linePosLoc);
        gl.vertexAttribPointer(linePosLoc, 3, gl.FLOAT, false, 0, 0);

        // 建立線框索引
        const wireframeIndices = [];
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const i = y * this.width + x;
                if (x < this.width - 1) {
                    wireframeIndices.push(i, i + 1);
                }
                if (y < this.height - 1) {
                    wireframeIndices.push(i, i + this.width);
                }
            }
        }

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.wireframeBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(wireframeIndices), gl.DYNAMIC_DRAW);
        gl.drawElements(gl.LINES, wireframeIndices.length, gl.UNSIGNED_SHORT, 0);

        // 繪製固定點
        gl.uniform3fv(lineColorLoc, [1.0, 0.5, 0.0]);
        for (let i = 0; i < this.particles.length; i++) {
            if (this.particles[i].pinned) {
                const p = this.particles[i].position;
                // 繪製小十字
                const size = 0.02;
                const pinPositions = [
                    p.x - size, p.y, p.z,
                    p.x + size, p.y, p.z,
                    p.x, p.y - size, p.z,
                    p.x, p.y + size, p.z
                ];
                gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
                gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(pinPositions), gl.DYNAMIC_DRAW);
                gl.drawArrays(gl.LINES, 0, 4);
            }
        }
    }

    createModelViewMatrix() {
        // 建立視圖矩陣
        const cosX = Math.cos(this.cameraRotationX);
        const sinX = Math.sin(this.cameraRotationX);
        const cosY = Math.cos(this.cameraRotationY);
        const sinY = Math.sin(this.cameraRotationY);

        const eye = [
            this.cameraDistance * cosX * sinY + this.cameraPanX,
            this.cameraDistance * sinX + this.cameraPanY,
            this.cameraDistance * cosX * cosY
        ];

        return this.lookAt(eye, [this.cameraPanX, this.cameraPanY, 0], [0, 1, 0]);
    }

    createNormalMatrix(modelViewMatrix) {
        // 簡化版法向量矩陣（3x3 轉 4x4）
        const m = modelViewMatrix;
        return new Float32Array([
            m[0], m[1], m[2], 0,
            m[4], m[5], m[6], 0,
            m[8], m[9], m[10], 0,
            0, 0, 0, 1
        ]);
    }

    perspective(fov, aspect, near, far) {
        const f = 1.0 / Math.tan(fov / 2);
        const nf = 1 / (near - far);
        return new Float32Array([
            f / aspect, 0, 0, 0,
            0, f, 0, 0,
            0, 0, (far + near) * nf, -1,
            0, 0, 2 * far * near * nf, 0
        ]);
    }

    lookAt(eye, center, up) {
        const zAxis = this.normalize([
            eye[0] - center[0],
            eye[1] - center[1],
            eye[2] - center[2]
        ]);
        const xAxis = this.normalize(this.cross(up, zAxis));
        const yAxis = this.cross(zAxis, xAxis);

        return new Float32Array([
            xAxis[0], yAxis[0], zAxis[0], 0,
            xAxis[1], yAxis[1], zAxis[1], 0,
            xAxis[2], yAxis[2], zAxis[2], 0,
            -this.dot(xAxis, eye), -this.dot(yAxis, eye), -this.dot(zAxis, eye), 1
        ]);
    }

    normalize(v) {
        const len = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
        return [v[0] / len, v[1] / len, v[2] / len];
    }

    cross(a, b) {
        return [
            a[1] * b[2] - a[2] * b[1],
            a[2] * b[0] - a[0] * b[2],
            a[0] * b[1] - a[1] * b[0]
        ];
    }

    dot(a, b) {
        return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
    }

    animate() {
        this.update();
        this.render();
        requestAnimationFrame(() => this.animate());
    }
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('canvas');
    new ClothSimulation(canvas);
});
