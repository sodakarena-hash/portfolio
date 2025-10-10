// ====================================
// デモ用ローディングアニメーション（完全版）
// ====================================

class DemoMoonLoader {
    constructor() {
        this.animationArea = document.getElementById('demoMoonAnimationArea');
        this.progressBar = document.getElementById('demoProgressBar');
        this.progressPercent = document.getElementById('demoProgressPercent');
        
        this.moons = [];
        this.loadingDuration = 6000; // 6秒間
        this.animationSpeed = 800;
        this.isRunning = false;
        
        this.phases = [
            'new-moon',
            'thin-crescent',
            'crescent',
            'quarter',
            'waxing-gibbous',
            'gibbous',
            'full'
        ];
        
        this.init();
    }

    init() {
        if (!this.animationArea) return;
        
        this.createMoons();
        this.startLoop();
    }

    createMoons() {
        const areaWidth = 320;
        const areaHeight = 160;
        
        this.animationArea.style.width = areaWidth + 'px';
        this.animationArea.style.height = areaHeight + 'px';
        
        const moonCount = 7;
        const startAngle = -157;
        const endAngle = -20;
        const radius = 120;
        
        const areaCenterX = areaWidth / 2;
        const areaCenterY = areaHeight / 2;
        
        const angleRange = endAngle - startAngle;
        const angleStep = angleRange / (moonCount - 1);
        
        const fourthMoonAngle = startAngle + (3 * angleStep);
        const fourthMoonAngleRad = (fourthMoonAngle * Math.PI) / 180;
        
        const arcCenterX = areaCenterX - radius * Math.cos(fourthMoonAngleRad);
        const arcCenterY = areaCenterY - radius * Math.sin(fourthMoonAngleRad);

        this.animationArea.innerHTML = '';
        this.moons = [];

        for (let i = 0; i < moonCount; i++) {
            const angle = startAngle + (angleStep * i);
            const angleRad = (angle * Math.PI) / 180;

            const x = arcCenterX + radius * Math.cos(angleRad);
            const y = arcCenterY + radius * Math.sin(angleRad);

            const moon = document.createElement('div');
            moon.className = `moon ${this.phases[i]}`;
            moon.style.left = `${x}px`;
            moon.style.top = `${y}px`;

            const shadow = document.createElement('div');
            shadow.className = 'moon-shadow';
            moon.appendChild(shadow);

            moon.dataset.originalX = x;
            moon.dataset.originalY = y;

            this.animationArea.appendChild(moon);
            this.moons.push(moon);
        }
    }

    async startLoop() {
        while (true) {
            await this.runFullAnimation();
            await this.wait(2000); // 2秒待機
            this.resetAll();
        }
    }

    async runFullAnimation() {
        if (this.isRunning) return;
        this.isRunning = true;

        // プログレスバーと月のアニメーションを同時に開始
        const startTime = Date.now();
        
        // プログレスバーのアニメーション
        const updateProgress = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / this.loadingDuration, 1);
            
            const easedProgress = this.easeInOutCubic(progress);
            const percentage = Math.floor(easedProgress * 100);
            
            this.progressBar.style.width = `${percentage}%`;
            this.progressPercent.textContent = `${percentage}%`;
            
            if (progress < 1) {
                requestAnimationFrame(updateProgress);
            }
        };
        
        updateProgress();
        
        // 月のアニメーション開始（少し遅延）
        await this.wait(800);
        await this.runMoonAnimation();
        
        // 残り時間を待機
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, this.loadingDuration - elapsed);
        await this.wait(remaining);
        
        this.isRunning = false;
    }

    async runMoonAnimation() {
        // 最初の月以外を薄くする
        this.moons.forEach((moon, index) => {
            if (index > 0) {
                moon.style.opacity = '0.6';
            }
        });

        // 順次移動・吸収
        for (let i = 0; i < this.moons.length - 1; i++) {
            const fromMoon = this.moons[i];
            const toMoon = this.moons[i + 1];
            
            if (fromMoon && toMoon && fromMoon.parentNode) {
                await this.mergeMoons(fromMoon, toMoon);
            }
        }

        await this.finalizeMoon();
    }

    async mergeMoons(fromMoon, toMoon) {
        fromMoon.classList.add('moving');
        toMoon.style.opacity = '1';

        const toX = parseFloat(toMoon.dataset.originalX);
        const toY = parseFloat(toMoon.dataset.originalY);
        
        fromMoon.style.left = `${toX}px`;
        fromMoon.style.top = `${toY}px`;

        await this.wait(this.animationSpeed);

        fromMoon.classList.add('absorbed');
        fromMoon.classList.remove('moving');
        toMoon.classList.add('enhanced');

        await this.wait(this.animationSpeed * 0.3);
        toMoon.classList.remove('enhanced');
        await this.wait(this.animationSpeed * 0.2);
    }

    async finalizeMoon() {
        const remainingMoons = this.animationArea.querySelectorAll('.moon');
        if (remainingMoons.length > 0) {
            const finalMoon = remainingMoons[remainingMoons.length - 1];
            
            finalMoon.style.boxShadow = `
                0 0 25px rgba(255, 255, 255, 0.8),
                0 0 50px rgba(205, 148, 105, 0.6),
                0 0 75px rgba(255, 255, 255, 0.4)
            `;
            finalMoon.style.transform = 'translate(-50%, -50%) scale(1.3)';
        }
        
        await this.wait(this.animationSpeed);
    }

    resetAll() {
        // プログレスバーをリセット
        this.progressBar.style.width = '0%';
        this.progressPercent.textContent = '0%';
        
        // 月をリセット
        this.createMoons();
    }

    easeInOutCubic(t) {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// ====================================
// デモ用3D月オブジェクト
// ====================================

class Demo3DMoon {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.moonGroup = null;
        this.container = null;
        this.rotationY = 0;
        
        this.config = {
            moonColor: '#2a2a2a',
            craterColor: '#1a1a1a',
            mariaColor: '#404040',
            moonRadius: 1.8,
            rotationSpeed: 0.003
        };
    }

    init() {
        this.container = document.getElementById('demoMoonContainer');
        
        if (!this.container) {
            console.error('demoMoonContainer not found');
            return;
        }

        if (typeof THREE === 'undefined') {
            console.error('Three.js not loaded');
            return;
        }
        
        try {
            this.createMoon();
            this.startAnimation();
        } catch (error) {
            console.error('3D Moon init error:', error);
        }
        
        return this;
    }

    createMoon() {
        this.scene = new THREE.Scene();
        
        const containerWidth = this.container.offsetWidth;
        const containerHeight = this.container.offsetHeight;
        
        this.camera = new THREE.PerspectiveCamera(75, containerWidth / containerHeight, 0.1, 1000);
        this.camera.position.z = 4;
        
        this.renderer = new THREE.WebGLRenderer({ 
            antialias: true, 
            alpha: true,
            powerPreference: "high-performance"
        });
        this.renderer.setSize(containerWidth, containerHeight);
        this.renderer.setClearColor(0x000000, 0);
        
        this.container.appendChild(this.renderer.domElement);
        
        this.moonGroup = new THREE.Group();
        this.scene.add(this.moonGroup);
        
        this.createWireframeMoon();
    }

    createWireframeMoon() {
        const moonRadius = this.config.moonRadius;
        
        this.createMoonStructure(moonRadius);
        this.addCraters(moonRadius);
        this.addMaria(moonRadius);
    }

    createMoonStructure(moonRadius) {
        const segments = 16;
        
        // 経線
        for (let i = 0; i < segments; i++) {
            const phi = (i / segments) * Math.PI * 2;
            
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
        
        // 緯線
        const latitudes = [-0.8, -0.6, -0.4, -0.2, 0, 0.2, 0.4, 0.6, 0.8];
        latitudes.forEach(lat => {
            const y = lat * moonRadius;
            const radius = Math.sqrt(Math.max(0, moonRadius * moonRadius - y * y));
            
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
                const opacity = Math.abs(lat) < 0.1 ? 0.9 : 0.7;
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

    addCraters(moonRadius) {
        const craters = [
            { center: new THREE.Vector3(0.6, 0.4, 0.8), size: 0.15, detail: 12 },
            { center: new THREE.Vector3(-0.5, 0.7, 0.6), size: 0.12, detail: 10 },
            { center: new THREE.Vector3(0.8, -0.3, 0.7), size: 0.14, detail: 12 }
        ];
        
        craters.forEach(crater => {
            const normalizedCenter = crater.center.clone().normalize().multiplyScalar(moonRadius);
            
            const rimPoints = [];
            for (let i = 0; i <= crater.detail; i++) {
                const angle = (i / crater.detail) * Math.PI * 2;
                const localPoint = new THREE.Vector3(
                    Math.cos(angle) * crater.size,
                    Math.sin(angle) * crater.size,
                    0
                );
                
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
        });
    }

    addMaria(moonRadius) {
        const maria = [
            { center: new THREE.Vector3(0.2, 0.6, 0.9), size: 0.2, complexity: 16 },
            { center: new THREE.Vector3(-0.6, -0.2, 0.8), size: 0.18, complexity: 14 }
        ];
        
        maria.forEach(mare => {
            const normalizedCenter = mare.center.clone().normalize().multiplyScalar(moonRadius);
            
            const boundaryPoints = [];
            for (let i = 0; i <= mare.complexity; i++) {
                const angle = (i / mare.complexity) * Math.PI * 2;
                const radiusVariation = 0.8 + Math.random() * 0.4;
                const currentSize = mare.size * radiusVariation;
                
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
        });
    }

    startAnimation() {
        const animate = () => {
            this.rotationY += this.config.rotationSpeed;
            
            if (this.moonGroup) {
                this.moonGroup.rotation.y = this.rotationY;
                this.moonGroup.rotation.x = Math.sin(Date.now() * 0.001) * 0.05;
            }
            
            if (this.renderer && this.scene && this.camera) {
                this.renderer.render(this.scene, this.camera);
            }
            
            requestAnimationFrame(animate);
        };
        
        animate();
    }
}

// ====================================
// 初期化
// ====================================

window.addEventListener('load', function() {
    // ローディングアニメーションのデモ
    new DemoMoonLoader();
    
    // 3D月のデモ
    if (typeof THREE !== 'undefined') {
        new Demo3DMoon().init();
    }
});