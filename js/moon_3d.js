// ScrollMoon 3Dムーンクラス
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
        this.isInitialized = false;
        
        // 設定（よりゆっくりな回転）
        this.config = {
            moonColor: '#2a2a2a',
            scrollSensitivity: 0.002, // ゆっくり回転
            maxRotationSpeed: 0.05,
            dampening: 0.98,
            minUpdateInterval: 16
        };
    }

    init() {
        console.log('ScrollMoon初期化開始...');
        
        this.container = document.getElementById('moonContainer');
        
        if (!this.container) {
            console.error('moonContainerが見つかりません');
            return;
        }

        // Three.jsの確認
        if (typeof THREE === 'undefined') {
            console.error('Three.jsが読み込まれていません');
            return;
        }
        
        try {
            this.createMoon();
            this.setupScrollListener();
            this.startAnimation();
            this.isInitialized = true;
            console.log('ScrollMoon初期化完了');
        } catch (error) {
            console.error('初期化エラー:', error);
        }
        
        return this;
    }

    createMoon() {
        console.log('3D月作成開始...');
        
        // シーン作成
        this.scene = new THREE.Scene();
        
        const containerWidth = this.container.offsetWidth;
        const containerHeight = this.container.offsetHeight;
        
        console.log(`コンテナサイズ: ${containerWidth}x${containerHeight}`);
        
        // カメラ作成
        this.camera = new THREE.PerspectiveCamera(75, containerWidth / containerHeight, 0.1, 1000);
        this.camera.position.z = 2.8;
        
        // レンダラー作成
        this.renderer = new THREE.WebGLRenderer({ 
            antialias: true, 
            alpha: true,
            powerPreference: "high-performance"
        });
        this.renderer.setSize(containerWidth, containerHeight);
        this.renderer.setClearColor(0x000000, 0);
        
        // DOMに追加
        this.container.appendChild(this.renderer.domElement);
        console.log('Canvas要素をDOMに追加しました');
        
        // ライティング
        const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
        this.scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(1, 1, 1);
        this.scene.add(directionalLight);
        
        // 月グループ
        this.moonGroup = new THREE.Group();
        this.scene.add(this.moonGroup);
        
        // 月の詳細を作成
        this.createDetailedMoon();
        
        console.log('3D月作成完了');
    }

    createDetailedMoon() {
        const moonRadius = 1.4;
        
        console.log('月の構造作成中...');
        this.createSparseMoonStructure(moonRadius);
        this.addImageBasedLines(moonRadius);
        
        console.log(`月グループに${this.moonGroup.children.length}個のオブジェクトを追加`);
    }

    createSparseMoonStructure(moonRadius) {
        const segments = 8; // 軽量化のため減らす
        
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
                for (let j = 0; j <= 6; j++) { // ポイント数を減らす
                    const t = j / 6;
                    const y = segment.start + (segment.end - segment.start) * t;
                    const theta = Math.acos(Math.max(-1, Math.min(1, y))); // clamp
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
        
        // 緯線（横の線）
        const latitudes = [-0.6, -0.2, 0.2, 0.6];
        latitudes.forEach(lat => {
            const y = lat * moonRadius;
            const radius = Math.sqrt(Math.max(0, moonRadius * moonRadius - y * y));
            
            const arcSegments = [
                { start: 0, end: Math.PI * 0.4 },
                { start: Math.PI * 0.7, end: Math.PI * 1.3 },
                { start: Math.PI * 1.6, end: Math.PI * 2.0 }
            ];
            
            arcSegments.forEach(segment => {
                const segmentPoints = [];
                const steps = 8; // ステップ数を減らす
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
                    { angle: Math.PI/2, length: 0.5, opacity: 0.7 },
                    { angle: Math.PI, length: 0.9, opacity: 0.9 }
                ]
            },
            {
                center: new THREE.Vector3(-0.4, 0.6, 0.7).normalize().multiplyScalar(moonRadius),
                lines: [
                    { angle: 0, length: 0.4, opacity: 0.7 },
                    { angle: Math.PI/3, length: 0.5, opacity: 0.8 }
                ]
            }
        ];
        
        linePatterns.forEach(pattern => {
            // クレーター本体
            const craterPoints = [];
            for (let i = 0; i <= 12; i++) {
                const angle = (i / 12) * Math.PI * 2;
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
                
                const segments = Math.floor(lineData.length * 2); // セグメント数を減らす
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
        console.log('スクロールリスナー設定中...');
        
        let lastScrollTime = 0;
        
        const updateScroll = () => {
            const now = Date.now();
            if (now - lastScrollTime < this.config.minUpdateInterval) return;
            
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const deltaScroll = scrollTop - this.lastScrollTop;
            
            // スクロール速度を計算
            this.scrollVelocity = this.scrollVelocity * 0.9 + deltaScroll * 0.1;
            
            // 回転目標値を更新
            this.targetRotationY += deltaScroll * this.config.scrollSensitivity;
            
            this.lastScrollTop = scrollTop;
            lastScrollTime = now;
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
        
        console.log('スクロールリスナー設定完了');
    }

    startAnimation() {
        console.log('アニメーションループ開始...');
        
        let frameCount = 0;
        
        const animate = () => {
            const now = Date.now();
            
            if (now - this.lastFrameTime >= this.config.minUpdateInterval) {
                try {
                    // 回転補間
                    this.currentRotationY += (this.targetRotationY - this.currentRotationY) * 0.05;
                    
                    // 月の回転を適用
                    if (this.moonGroup) {
                        this.moonGroup.rotation.y = this.currentRotationY;
                        this.moonGroup.rotation.x = Math.sin(now * 0.0008) * 0.03;
                    }
                    
                    // 速度減衰
                    this.scrollVelocity *= this.config.dampening;
                    
                    // レンダリング
                    if (this.renderer && this.scene && this.camera) {
                        this.renderer.render(this.scene, this.camera);
                    }
                    
                    // デバッグ用フレーム数表示
                    if (frameCount < 3) {
                        console.log(`フレーム ${frameCount} レンダリング完了`);
                    }
                    
                } catch (renderError) {
                    console.error('レンダリングエラー:', renderError);
                }
                
                this.lastFrameTime = now;
                frameCount++;
            }
            
            requestAnimationFrame(animate);
        };
        
        animate();
        console.log('アニメーションループ開始完了');
    }

    handleResize() {
        if (!this.camera || !this.renderer || !this.container) return;
        
        const containerWidth = this.container.offsetWidth;
        const containerHeight = this.container.offsetHeight;
        
        this.camera.aspect = containerWidth / containerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(containerWidth, containerHeight);
        
        console.log(`リサイズ: ${containerWidth}x${containerHeight}`);
    }

    dispose() {
        if (this.renderer) {
            this.renderer.dispose();
            if (this.renderer.domElement && this.renderer.domElement.parentNode) {
                this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
            }
        }
        
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.moonGroup = null;
        this.isInitialized = false;
        
        console.log('ScrollMoonクリーンアップ完了');
    }
}