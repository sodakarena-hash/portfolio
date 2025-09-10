class ScrollMoon {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.moonGroup = null;
        this.container = null;
        
        // スクロール関連
        this.lastScrollTop = 0;
        this.scrollVelocity = 0;
        this.targetRotationY = 0;
        this.currentRotationY = 0;
        
        // パフォーマンス管理
        this.lastFrameTime = 0;
        
        // 設定（よりゆっくりな回転）
        this.config = {
            moonColor: '#2a2a2a',
            scrollSensitivity: 0.003, // 0.01から0.003に変更（より遅く）
            maxRotationSpeed: 0.1, // 0.3から0.1に変更（より遅く）
            dampening: 0.98, // 0.95から0.98に変更（より滑らか）
            minUpdateInterval: 16
        };
    }

    init() {
        this.container = document.getElementById('moonContainer');
        
        if (typeof THREE === 'undefined') {
            console.error('Three.js is required');
            return;
        }
        
        this.createMoon();
        this.setupScrollListener();
        this.startAnimation();
        
        return this;
    }

    createMoon() {
        this.scene = new THREE.Scene();
        
        const containerWidth = this.container.offsetWidth;
        const containerHeight = this.container.offsetHeight;
        
        this.camera = new THREE.PerspectiveCamera(75, containerWidth / containerHeight, 0.1, 1000);
        this.camera.position.z = 2.8;
        
        this.renderer = new THREE.WebGLRenderer({ 
            antialias: true, 
            alpha: true,
            powerPreference: "high-performance"
        });
        this.renderer.setSize(containerWidth, containerHeight);
        this.renderer.setClearColor(0x000000, 0);
        this.container.appendChild(this.renderer.domElement);
        
        // ライティング
        const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
        this.scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(1, 1, 1);
        this.scene.add(directionalLight);
        
        // 月グループ
        this.moonGroup = new THREE.Group();
        this.scene.add(this.moonGroup);
        
        this.createDetailedMoon();
    }

    createDetailedMoon() {
        const moonRadius = 1.4;
        this.createSparseMoonStructure(moonRadius);
        this.addImageBasedLines(moonRadius);
    }

    createSparseMoonStructure(moonRadius) {
        const segments = 12;
        
        // 経線（縦の線）を部分的に描画
        for (let i = 0; i < segments; i++) {
            const phi = (i / segments) * Math.PI * 2;
            
            const lineSegments = [
                { start: -0.8, end: -0.3 },
                { start: 0.1, end: 0.6 },
                { start: 0.8, end: 1.0 }
            ];
            
            lineSegments.forEach(segment => {
                const segmentPoints = [];
                for (let j = 0; j <= 8; j++) {
                    const t = j / 8;
                    const y = segment.start + (segment.end - segment.start) * t;
                    const theta = Math.acos(y);
                    const radius = Math.sin(theta);
                    
                    const x = Math.cos(phi) * radius * moonRadius;
                    const z = Math.sin(phi) * radius * moonRadius;
                    const actualY = y * moonRadius;
                    
                    segmentPoints.push(new THREE.Vector3(x, actualY, z));
                }
                
                if (segmentPoints.length > 1) {
                    const lineGeometry = new THREE.BufferGeometry().setFromPoints(segmentPoints);
                    const lineMaterial = new THREE.LineBasicMaterial({ 
                        color: this.config.moonColor,
                        transparent: true,
                        opacity: 0.8
                    });
                    const line = new THREE.Line(lineGeometry, lineMaterial);
                    this.moonGroup.add(line);
                }
            });
        }
        
        // 緯線（横の線）も部分的に
        const latitudes = [-0.6, -0.2, 0.2, 0.6];
        latitudes.forEach(lat => {
            const y = lat * moonRadius;
            const radius = Math.sqrt(moonRadius * moonRadius - y * y);
            
            const arcSegments = [
                { start: 0, end: Math.PI * 0.4 },
                { start: Math.PI * 0.7, end: Math.PI * 1.3 },
                { start: Math.PI * 1.6, end: Math.PI * 2.0 }
            ];
            
            arcSegments.forEach(segment => {
                const segmentPoints = [];
                const steps = 12;
                for (let i = 0; i <= steps; i++) {
                    const angle = segment.start + (segment.end - segment.start) * (i / steps);
                    segmentPoints.push(new THREE.Vector3(
                        Math.cos(angle) * radius,
                        y,
                        Math.sin(angle) * radius
                    ));
                }
                
                const lineGeometry = new THREE.BufferGeometry().setFromPoints(segmentPoints);
                const lineMaterial = new THREE.LineBasicMaterial({ 
                    color: this.config.moonColor,
                    transparent: true,
                    opacity: 0.6
                });
                const line = new THREE.Line(lineGeometry, lineMaterial);
                this.moonGroup.add(line);
            });
        });
    }

    addImageBasedLines(moonRadius) {
        const linePatterns = [
            {
                center: new THREE.Vector3(0.2, 0.4, 0.9).normalize().multiplyScalar(moonRadius),
                lines: [
                    { angle: 0, length: 0.6, opacity: 0.9 },
                    { angle: Math.PI/4, length: 0.8, opacity: 0.8 },
                    { angle: Math.PI/2, length: 0.5, opacity: 0.7 },
                    { angle: Math.PI, length: 0.9, opacity: 0.9 }
                ]
            },
            {
                center: new THREE.Vector3(-0.4, 0.6, 0.7).normalize().multiplyScalar(moonRadius),
                lines: [
                    { angle: 0, length: 0.4, opacity: 0.7 },
                    { angle: Math.PI/3, length: 0.5, opacity: 0.8 },
                    { angle: Math.PI, length: 0.6, opacity: 0.8 }
                ]
            }
        ];
        
        linePatterns.forEach(pattern => {
            // クレーター本体
            const craterPoints = [];
            for (let i = 0; i <= 16; i++) {
                const angle = (i / 16) * Math.PI * 2;
                const radius = 0.08;
                const localPoint = new THREE.Vector3(
                    Math.cos(angle) * radius,
                    Math.sin(angle) * radius,
                    0
                );
                
                const craterNormal = pattern.center.clone().normalize();
                const quaternion = new THREE.Quaternion().setFromUnitVectors(
                    new THREE.Vector3(0, 0, 1),
                    craterNormal
                );
                localPoint.applyQuaternion(quaternion);
                
                craterPoints.push(pattern.center.clone().add(localPoint));
            }
            
            const craterGeometry = new THREE.BufferGeometry().setFromPoints(craterPoints);
            const craterMaterial = new THREE.LineBasicMaterial({ 
                color: this.config.moonColor,
                transparent: true,
                opacity: 0.9
            });
            const craterLine = new THREE.LineLoop(craterGeometry, craterMaterial);
            this.moonGroup.add(craterLine);
            
            // 放射線
            pattern.lines.forEach(lineData => {
                const direction = new THREE.Vector3(
                    Math.cos(lineData.angle),
                    Math.sin(lineData.angle),
                    0
                );
                
                const craterNormal = pattern.center.clone().normalize();
                const quaternion = new THREE.Quaternion().setFromUnitVectors(
                    new THREE.Vector3(0, 0, 1),
                    craterNormal
                );
                direction.applyQuaternion(quaternion);
                
                const segments = Math.floor(lineData.length * 3);
                for (let i = 0; i < segments; i++) {
                    const segmentStart = (i / segments) * lineData.length;
                    const segmentEnd = ((i + 0.7) / segments) * lineData.length;
                    
                    const startPoint = pattern.center.clone().add(direction.clone().multiplyScalar(segmentStart));
                    const endPoint = pattern.center.clone().add(direction.clone().multiplyScalar(segmentEnd));
                    
                    const lineGeometry = new THREE.BufferGeometry().setFromPoints([startPoint, endPoint]);
                    const lineMaterial = new THREE.LineBasicMaterial({ 
                        color: this.config.moonColor,
                        transparent: true,
                        opacity: lineData.opacity * (1 - i / segments * 0.5)
                    });
                    const line = new THREE.Line(lineGeometry, lineMaterial);
                    this.moonGroup.add(line);
                }
            });
        });
    }

    setupScrollListener() {
        let lastScrollTime = 0;
        
        const updateScroll = () => {
            const now = Date.now();
            if (now - lastScrollTime < this.config.minUpdateInterval) return;
            
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const deltaScroll = scrollTop - this.lastScrollTop;
            
            // スクロール速度を計算（より滑らかに）
            this.scrollVelocity = this.scrollVelocity * 0.9 + deltaScroll * 0.1;
            
            // 回転目標値を更新（より遅く）
            this.targetRotationY += deltaScroll * this.config.scrollSensitivity;
            
            this.lastScrollTop = scrollTop;
            lastScrollTime = now;
            
            // デバッグ表示更新
            const debugElement = document.getElementById('rotationSpeed');
            if (debugElement) {
                debugElement.textContent = (this.scrollVelocity * 0.01).toFixed(3);
            }
        };
        
        // スクロールイベント
        let scrollTimeout;
        window.addEventListener('scroll', () => {
            if (!scrollTimeout) {
                scrollTimeout = setTimeout(() => {
                    updateScroll();
                    scrollTimeout = null;
                }, 16);
            }
        }, { passive: true });
    }

    startAnimation() {
        const animate = () => {
            const now = Date.now();
            
            if (now - this.lastFrameTime >= this.config.minUpdateInterval) {
                // より滑らかな回転補間
                this.currentRotationY += (this.targetRotationY - this.currentRotationY) * 0.05;
                
                // 月の回転を適用
                this.moonGroup.rotation.y = this.currentRotationY;
                this.moonGroup.rotation.x = Math.sin(now * 0.0008) * 0.03; // より微細な揺れ
                
                // 速度減衰
                this.scrollVelocity *= this.config.dampening;
                
                this.renderer.render(this.scene, this.camera);
                this.lastFrameTime = now;
            }
            
            requestAnimationFrame(animate);
        };
        
        animate();
    }

    handleResize() {
        if (!this.camera || !this.renderer) return;
        
        const containerWidth = this.container.offsetWidth;
        const containerHeight = this.container.offsetHeight;
        
        this.camera.aspect = containerWidth / containerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(containerWidth, containerHeight);
    }

    dispose() {
        if (this.renderer) {
            this.renderer.dispose();
            if (this.renderer.domElement) {
                this.renderer.domElement.remove();
            }
        }
        
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.moonGroup = null;
    }
}