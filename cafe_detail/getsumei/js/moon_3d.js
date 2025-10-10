// 線画表現の改良されたScrollMoon 3D月クラス
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
        
        // 設定（サイズを大きく、線画表現に最適化）
        this.config = {
            moonColor: '#2a2a2a',
            craterColor: '#1a1a1a',
            mariaColor: '#404040',
            scrollSensitivity: 0.002,
            maxRotationSpeed: 0.05,
            dampening: 0.98,
            minUpdateInterval: 16,
            moonRadius: 2.0  // サイズを大きく
        };
    }

    init() {
        console.log('ScrollMoon初期化開始...');
        
        this.container = document.getElementById('moonContainer');
        
        if (!this.container) {
            console.error('moonContainerが見つかりません');
            return;
        }

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
        console.log('3D線画月作成開始...');
        
        // シーン作成
        this.scene = new THREE.Scene();
        
        const containerWidth = this.container.offsetWidth;
        const containerHeight = this.container.offsetHeight;
        
        // カメラ作成（大きくなった月に合わせて調整）
        this.camera = new THREE.PerspectiveCamera(75, containerWidth / containerHeight, 0.1, 1000);
        this.camera.position.z = 4.5;
        
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
        
        // 月グループ
        this.moonGroup = new THREE.Group();
        this.scene.add(this.moonGroup);
        
        // 線画の月を作成
        this.createWireframeMoon();
        
        console.log('3D線画月作成完了');
    }

    createWireframeMoon() {
        const moonRadius = this.config.moonRadius;
        
        // より密な経線・緯線の基本構造
        this.createEnhancedMoonStructure(moonRadius);
        
        // 詳細なクレーターライン
        this.addDetailedCraterLines(moonRadius);
        
        // 月の海（マリア）のライン
        this.addMoonMariaLines(moonRadius);
        
        // 表面の微細なライン
        this.addSurfaceDetailLines(moonRadius);
        
        console.log(`月グループに${this.moonGroup.children.length}個のラインオブジェクトを追加`);
    }

    createEnhancedMoonStructure(moonRadius) {
        const segments = 16; // より密な線
        
        // 経線（縦の線）をより美しく
        for (let i = 0; i < segments; i++) {
            const phi = (i / segments) * Math.PI * 2;
            
            // 連続した長い線と短い線を組み合わせ
            const lineSegments = [
                { start: -0.95, end: -0.6, opacity: 0.8 },
                { start: -0.4, end: -0.1, opacity: 0.6 },
                { start: 0.1, end: 0.4, opacity: 0.6 },
                { start: 0.6, end: 0.95, opacity: 0.8 }
            ];
            
            lineSegments.forEach(segment => {
                const segmentPoints = [];
                const steps = 12;
                for (let j = 0; j <= steps; j++) {
                    const t = j / steps;
                    const y = segment.start + (segment.end - segment.start) * t;
                    const theta = Math.acos(Math.max(-1, Math.min(1, y)));
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
                        opacity: segment.opacity
                    });
                    const line = new THREE.Line(lineGeometry, lineMaterial);
                    this.moonGroup.add(line);
                }
            });
        }
        
        // 緯線（横の線）をより詳細に
        const latitudes = [-0.8, -0.6, -0.4, -0.2, 0, 0.2, 0.4, 0.6, 0.8];
        latitudes.forEach((lat, index) => {
            const y = lat * moonRadius;
            const radius = Math.sqrt(Math.max(0, moonRadius * moonRadius - y * y));
            
            // メインの緯線
            const mainArcSegments = [
                { start: 0, end: Math.PI * 0.6 },
                { start: Math.PI * 0.8, end: Math.PI * 1.2 },
                { start: Math.PI * 1.4, end: Math.PI * 2.0 }
            ];
            
            mainArcSegments.forEach(segment => {
                const segmentPoints = [];
                const steps = 16;
                for (let i = 0; i <= steps; i++) {
                    const angle = segment.start + (segment.end - segment.start) * (i / steps);
                    segmentPoints.push(new THREE.Vector3(
                        Math.cos(angle) * radius,
                        y,
                        Math.sin(angle) * radius
                    ));
                }
                
                const lineGeometry = new THREE.BufferGeometry().setFromPoints(segmentPoints);
                const opacity = Math.abs(lat) < 0.1 ? 0.9 : 0.7; // 赤道付近を強調
                const lineMaterial = new THREE.LineBasicMaterial({ 
                    color: this.config.moonColor,
                    transparent: true,
                    opacity: opacity
                });
                const line = new THREE.Line(lineGeometry, lineMaterial);
                this.moonGroup.add(line);
            });
        });
    }

    addDetailedCraterLines(moonRadius) {
        // より多くの様々なサイズのクレーター
        const craters = [
            // 大きなクレーター
            { center: new THREE.Vector3(0.6, 0.4, 0.8), size: 0.2, detail: 20 },
            { center: new THREE.Vector3(-0.5, 0.7, 0.6), size: 0.15, detail: 16 },
            { center: new THREE.Vector3(0.8, -0.3, 0.7), size: 0.18, detail: 18 },
            
            // 中サイズのクレーター
            { center: new THREE.Vector3(-0.7, -0.4, 0.8), size: 0.1, detail: 12 },
            { center: new THREE.Vector3(0.3, 0.8, 0.5), size: 0.08, detail: 10 },
            { center: new THREE.Vector3(-0.8, 0.2, 0.7), size: 0.09, detail: 12 },
            
            // 小さなクレーター
            { center: new THREE.Vector3(0.9, -0.1, 0.5), size: 0.05, detail: 8 },
            { center: new THREE.Vector3(-0.6, -0.7, 0.6), size: 0.04, detail: 8 },
            { center: new THREE.Vector3(0.4, 0.6, 0.9), size: 0.06, detail: 8 },
            { center: new THREE.Vector3(-0.3, 0.9, 0.4), size: 0.03, detail: 6 }
        ];
        
        craters.forEach(crater => {
            this.createCraterLines(crater.center, crater.size, crater.detail, moonRadius);
        });
    }

    createCraterLines(center, size, detail, moonRadius) {
        const normalizedCenter = center.clone().normalize().multiplyScalar(moonRadius);
        
        // クレーターの外縁
        const rimPoints = [];
        for (let i = 0; i <= detail; i++) {
            const angle = (i / detail) * Math.PI * 2;
            const localPoint = new THREE.Vector3(
                Math.cos(angle) * size,
                Math.sin(angle) * size,
                0
            );
            
            // 球面に投影
            const craterNormal = normalizedCenter.clone().normalize();
            const quaternion = new THREE.Quaternion().setFromUnitVectors(
                new THREE.Vector3(0, 0, 1),
                craterNormal
            );
            localPoint.applyQuaternion(quaternion);
            
            rimPoints.push(normalizedCenter.clone().add(localPoint));
        }
        
        const rimGeometry = new THREE.BufferGeometry().setFromPoints(rimPoints);
        const rimMaterial = new THREE.LineBasicMaterial({ 
            color: this.config.craterColor,
            transparent: true,
            opacity: 0.8
        });
        const rimLine = new THREE.LineLoop(rimGeometry, rimMaterial);
        this.moonGroup.add(rimLine);
        
        // クレーターの内部構造（放射状の線）
        const radialLines = Math.max(4, Math.floor(detail / 3));
        for (let i = 0; i < radialLines; i++) {
            const angle = (i / radialLines) * Math.PI * 2;
            const direction = new THREE.Vector3(
                Math.cos(angle),
                Math.sin(angle),
                0
            );
            
            const craterNormal = normalizedCenter.clone().normalize();
            const quaternion = new THREE.Quaternion().setFromUnitVectors(
                new THREE.Vector3(0, 0, 1),
                craterNormal
            );
            direction.applyQuaternion(quaternion);
            
            const linePoints = [
                normalizedCenter.clone(),
                normalizedCenter.clone().add(direction.clone().multiplyScalar(size * 0.8))
            ];
            
            const lineGeometry = new THREE.BufferGeometry().setFromPoints(linePoints);
            const lineMaterial = new THREE.LineBasicMaterial({ 
                color: this.config.craterColor,
                transparent: true,
                opacity: 0.6
            });
            const line = new THREE.Line(lineGeometry, lineMaterial);
            this.moonGroup.add(line);
        }
    }

    addMoonMariaLines(moonRadius) {
        // 月の海（マリア）の境界線
        const maria = [
            { center: new THREE.Vector3(0.2, 0.6, 0.9), size: 0.3, complexity: 24 },
            { center: new THREE.Vector3(-0.6, -0.2, 0.8), size: 0.25, complexity: 20 },
            { center: new THREE.Vector3(0.7, -0.6, 0.5), size: 0.2, complexity: 16 }
        ];
        
        maria.forEach(mare => {
            this.createMariaLines(mare.center, mare.size, mare.complexity, moonRadius);
        });
    }

    createMariaLines(center, size, complexity, moonRadius) {
        const normalizedCenter = center.clone().normalize().multiplyScalar(moonRadius);
        
        // 不規則な境界線を作成
        const boundaryPoints = [];
        for (let i = 0; i <= complexity; i++) {
            const angle = (i / complexity) * Math.PI * 2;
            const radiusVariation = 0.8 + Math.random() * 0.4; // ランダムな変化
            const currentSize = size * radiusVariation;
            
            const localPoint = new THREE.Vector3(
                Math.cos(angle) * currentSize,
                Math.sin(angle) * currentSize,
                0
            );
            
            const mareNormal = normalizedCenter.clone().normalize();
            const quaternion = new THREE.Quaternion().setFromUnitVectors(
                new THREE.Vector3(0, 0, 1),
                mareNormal
            );
            localPoint.applyQuaternion(quaternion);
            
            boundaryPoints.push(normalizedCenter.clone().add(localPoint));
        }
        
        const boundaryGeometry = new THREE.BufferGeometry().setFromPoints(boundaryPoints);
        const boundaryMaterial = new THREE.LineBasicMaterial({ 
            color: this.config.mariaColor,
            transparent: true,
            opacity: 0.7
        });
        const boundaryLine = new THREE.LineLoop(boundaryGeometry, boundaryMaterial);
        this.moonGroup.add(boundaryLine);
    }

    addSurfaceDetailLines(moonRadius) {
        // 表面の細かい模様
        const detailLines = [
            // 山脈のライン
            { 
                points: [
                    new THREE.Vector3(0.5, 0.2, 1.0),
                    new THREE.Vector3(0.7, 0.1, 0.9),
                    new THREE.Vector3(0.9, 0.0, 0.7)
                ]
            },
            {
                points: [
                    new THREE.Vector3(-0.8, 0.5, 0.6),
                    new THREE.Vector3(-0.6, 0.3, 0.8),
                    new THREE.Vector3(-0.4, 0.1, 0.9)
                ]
            }
        ];
        
        detailLines.forEach(detail => {
            const normalizedPoints = detail.points.map(point => 
                point.clone().normalize().multiplyScalar(moonRadius)
            );
            
            const lineGeometry = new THREE.BufferGeometry().setFromPoints(normalizedPoints);
            const lineMaterial = new THREE.LineBasicMaterial({ 
                color: this.config.moonColor,
                transparent: true,
                opacity: 0.5
            });
            const line = new THREE.Line(lineGeometry, lineMaterial);
            this.moonGroup.add(line);
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
            
            this.scrollVelocity = this.scrollVelocity * 0.9 + deltaScroll * 0.1;
            this.targetRotationY += deltaScroll * this.config.scrollSensitivity;
            
            this.lastScrollTop = scrollTop;
            lastScrollTime = now;
        };
        
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
                    
                } catch (renderError) {
                    console.error('レンダリングエラー:', renderError);
                }
                
                this.lastFrameTime = now;
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