// 改良されたScrollMoon 3D月クラス
class ScrollMoon {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.moonGroup = null;
        this.container = null;
        this.moonMesh = null;
        
        // スクロール関連
        this.lastScrollTop = 0;
        this.scrollVelocity = 0;
        this.targetRotationY = 0;
        this.currentRotationY = 0;
        
        // パフォーマンス管理
        this.lastFrameTime = 0;
        this.isInitialized = false;
        
        // 設定
        this.config = {
            moonColor: '#f5f5dc',        // より月らしい色
            craterColor: '#d3d3d3',      // クレーターの色
            shadowColor: '#2a2a2a',      // 影の色
            scrollSensitivity: 0.002,
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
        
        // カメラ作成
        this.camera = new THREE.PerspectiveCamera(75, containerWidth / containerHeight, 0.1, 1000);
        this.camera.position.z = 3.5;
        
        // レンダラー作成
        this.renderer = new THREE.WebGLRenderer({ 
            antialias: true, 
            alpha: true,
            powerPreference: "high-performance"
        });
        this.renderer.setSize(containerWidth, containerHeight);
        this.renderer.setClearColor(0x000000, 0);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        
        // DOMに追加
        this.container.appendChild(this.renderer.domElement);
        
        // ライティング
        this.setupLighting();
        
        // 月グループ
        this.moonGroup = new THREE.Group();
        this.scene.add(this.moonGroup);
        
        // 詳細な月を作成
        this.createRealisticMoon();
        
        console.log('3D月作成完了');
    }

    setupLighting() {
        // 環境光（全体を少し明るく）
        const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
        this.scene.add(ambientLight);
        
        // 指向性ライト（太陽光をシミュレート）
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(2, 1, 1);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 1024;
        directionalLight.shadow.mapSize.height = 1024;
        this.scene.add(directionalLight);
        
        // 補助光（月の裏側も少し見えるように）
        const fillLight = new THREE.DirectionalLight(0x6495ed, 0.2);
        fillLight.position.set(-1, -1, 0.5);
        this.scene.add(fillLight);
    }

    createRealisticMoon() {
        // 基本の月の球体
        const moonGeometry = new THREE.SphereGeometry(1.4, 64, 64);
        
        // 月の基本マテリアル
        const moonMaterial = new THREE.MeshLambertMaterial({
            color: this.config.moonColor,
            transparent: true,
            opacity: 0.9
        });
        
        this.moonMesh = new THREE.Mesh(moonGeometry, moonMaterial);
        this.moonMesh.castShadow = true;
        this.moonMesh.receiveShadow = true;
        this.moonGroup.add(this.moonMesh);
        
        // 月の表面詳細を追加
        this.addMoonDetails();
        
        // クレーターを追加
        this.addDetailedCraters();
        
        // 月の海（マリア）を追加
        this.addMoonMaria();
    }

    addMoonDetails() {
        // 月表面の微細な凹凸をノイズで表現
        const detailGeometry = new THREE.SphereGeometry(1.41, 32, 32);
        const vertices = detailGeometry.attributes.position.array;
        
        // 頂点に微細な変位を追加
        for (let i = 0; i < vertices.length; i += 3) {
            const x = vertices[i];
            const y = vertices[i + 1];
            const z = vertices[i + 2];
            
            // 簡単なノイズ関数
            const noise = (Math.sin(x * 10) + Math.cos(y * 10) + Math.sin(z * 10)) * 0.02;
            const length = Math.sqrt(x * x + y * y + z * z);
            const factor = (1 + noise) / length;
            
            vertices[i] = x * factor;
            vertices[i + 1] = y * factor;
            vertices[i + 2] = z * factor;
        }
        
        detailGeometry.attributes.position.needsUpdate = true;
        detailGeometry.computeVertexNormals();
        
        const detailMaterial = new THREE.MeshLambertMaterial({
            color: '#e8e8e8',
            transparent: true,
            opacity: 0.3
        });
        
        const detailMesh = new THREE.Mesh(detailGeometry, detailMaterial);
        this.moonGroup.add(detailMesh);
    }

    addDetailedCraters() {
        // より多くの、様々なサイズのクレーターを追加
        const craters = [
            // 大きなクレーター
            { pos: new THREE.Vector3(0.8, 0.6, 0.8), size: 0.15, depth: 0.05 },
            { pos: new THREE.Vector3(-0.6, 0.9, 0.5), size: 0.12, depth: 0.04 },
            { pos: new THREE.Vector3(0.3, -0.8, 1.0), size: 0.18, depth: 0.06 },
            
            // 中くらいのクレーター
            { pos: new THREE.Vector3(-0.9, 0.2, 0.7), size: 0.08, depth: 0.03 },
            { pos: new THREE.Vector3(0.7, -0.4, 0.9), size: 0.06, depth: 0.02 },
            { pos: new THREE.Vector3(-0.3, 0.7, 0.8), size: 0.07, depth: 0.025 },
            
            // 小さなクレーター
            { pos: new THREE.Vector3(0.9, -0.2, 0.6), size: 0.04, depth: 0.015 },
            { pos: new THREE.Vector3(-0.7, -0.6, 0.7), size: 0.03, depth: 0.01 },
            { pos: new THREE.Vector3(0.5, 0.8, 0.6), size: 0.035, depth: 0.012 }
        ];
        
        craters.forEach(crater => {
            this.createCrater(crater.pos, crater.size, crater.depth);
        });
    }

    createCrater(position, size, depth) {
        // クレーターの縁
        const rimGeometry = new THREE.TorusGeometry(size, size * 0.1, 8, 16);
        const rimMaterial = new THREE.MeshLambertMaterial({
            color: this.config.craterColor,
            transparent: true,
            opacity: 0.7
        });
        
        const rimMesh = new THREE.Mesh(rimGeometry, rimMaterial);
        
        // クレーターの位置に配置
        const normalizedPos = position.clone().normalize();
        rimMesh.position.copy(normalizedPos.multiplyScalar(1.42));
        
        // 月の表面に対して適切な向きに回転
        rimMesh.lookAt(normalizedPos.multiplyScalar(2));
        
        this.moonGroup.add(rimMesh);
        
        // クレーターの底部（影）
        const bottomGeometry = new THREE.CircleGeometry(size * 0.8, 16);
        const bottomMaterial = new THREE.MeshLambertMaterial({
            color: this.config.shadowColor,
            transparent: true,
            opacity: 0.5
        });
        
        const bottomMesh = new THREE.Mesh(bottomGeometry, bottomMaterial);
        bottomMesh.position.copy(normalizedPos.multiplyScalar(1.41));
        bottomMesh.lookAt(normalizedPos.multiplyScalar(2));
        
        this.moonGroup.add(bottomMesh);
    }

    addMoonMaria() {
        // 月の海（暗い部分）を追加
        const maria = [
            { pos: new THREE.Vector3(0.2, 0.8, 0.8), size: 0.25 },
            { pos: new THREE.Vector3(-0.7, -0.3, 0.9), size: 0.2 },
            { pos: new THREE.Vector3(0.8, -0.7, 0.4), size: 0.15 }
        ];
        
        maria.forEach(mare => {
            const mareGeometry = new THREE.CircleGeometry(mare.size, 20);
            const mareMaterial = new THREE.MeshLambertMaterial({
                color: '#808080',
                transparent: true,
                opacity: 0.4
            });
            
            const mareMesh = new THREE.Mesh(mareGeometry, mareMaterial);
            const normalizedPos = mare.pos.clone().normalize();
            mareMesh.position.copy(normalizedPos.multiplyScalar(1.415));
            mareMesh.lookAt(normalizedPos.multiplyScalar(2));
            
            this.moonGroup.add(mareMesh);
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
                        this.moonGroup.rotation.x = Math.sin(now * 0.0005) * 0.02;
                        this.moonGroup.rotation.z = Math.cos(now * 0.0003) * 0.01;
                    }
                    
                    // 月本体の自転
                    if (this.moonMesh) {
                        this.moonMesh.rotation.y += 0.001;
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
        this.moonMesh = null;
        this.isInitialized = false;
        
        console.log('ScrollMoonクリーンアップ完了');
    }
}