class MoonLoader {
    constructor() {
        this.overlay = document.getElementById('moon-loading-overlay');
        this.animationArea = document.getElementById('moonAnimationArea');
        this.progressBar = document.getElementById('progressBar');
        this.progressPercent = document.getElementById('progressPercent');
        this.loadingMessage = document.getElementById('loadingMessage');
        this.mainContent = document.getElementById('mainContent');
        
        this.moons = [];
        this.loadingDuration = 6000;
        this.animationSpeed = 800;
        
        this.messages = [
            '月明かりを集めています',
            'コーヒー豆を準備中',
            '香りを調合中',
            '静寂を整えています',
            '心地よい空間を作成中',
            '最後の仕上げ',
            '準備完了'
        ];
        
        this.start();
    }

    start() {
        this.createMoons();
        setTimeout(() => {
            this.runLoading();
        }, 2000);
    }

    createMoons() {
        // CSSのレスポンシブサイズと完全一致させる
        let areaWidth, areaHeight;
        
        if (window.innerWidth <= 360) {
            areaWidth = 240;
            areaHeight = 120;
        } else if (window.innerWidth <= 480) {
            areaWidth = 280;
            areaHeight = 140;
        } else if (window.innerWidth <= 768) {
            areaWidth = 320;
            areaHeight = 160;
        } else {
            areaWidth = 400;
            areaHeight = 200;
        }
        
        console.log(`画面: ${window.innerWidth}px → エリア: ${areaWidth}x${areaHeight}`);
        
        // CSSサイズを強制的に同期
        this.animationArea.style.width = areaWidth + 'px';
        this.animationArea.style.height = areaHeight + 'px';
        
        // 元の円弧設定（オリジナルと同じ）
        const moonCount = 7;
        const startAngle = -157;
        const endAngle = -20;
        const radius = 120;
        
        // アニメーションエリアの中央座標
        const areaCenterX = areaWidth / 2;
        const areaCenterY = areaHeight / 2;
        
        // 角度計算（オリジナルと同じ）
        const angleRange = endAngle - startAngle;
        const angleStep = angleRange / (moonCount - 1);
        
        // 4番目の月（インデックス3）の角度
        const fourthMoonAngle = startAngle + (3 * angleStep);
        const fourthMoonAngleRad = (fourthMoonAngle * Math.PI) / 180;
        
        // 4番目の月が中央に来るように円弧の中心を逆算（オリジナルと同じ）
        const arcCenterX = areaCenterX - radius * Math.cos(fourthMoonAngleRad);
        const arcCenterY = areaCenterY - radius * Math.sin(fourthMoonAngleRad);

        // 月相設定：左から段階的に満月へ（中央は半月）（オリジナルと同じ）
        const phases = [
            'new-moon',        // 1. 新月（一番左）
            'thin-crescent',   // 2. 細い三日月
            'crescent',        // 3. 三日月  
            'quarter',         // 4. 半月（中央に配置）
            'waxing-gibbous',  // 5. 満ちゆく月（少し）
            'gibbous',         // 6. 満ちゆく月（多め）
            'full'             // 7. 満月（一番右）
        ];

        this.animationArea.innerHTML = '';
        this.moons = [];

        for (let i = 0; i < moonCount; i++) {
            const angle = startAngle + (angleStep * i);
            const angleRad = (angle * Math.PI) / 180;

            const x = arcCenterX + radius * Math.cos(angleRad);
            const y = arcCenterY + radius * Math.sin(angleRad);

            const moon = document.createElement('div');
            moon.className = `moon ${phases[i]}`;
            moon.style.left = `${x}px`;
            moon.style.top = `${y}px`;

            const shadow = document.createElement('div');
            shadow.className = 'moon-shadow';
            moon.appendChild(shadow);

            moon.dataset.originalX = x;
            moon.dataset.originalY = y;

            this.animationArea.appendChild(moon);
            this.moons.push(moon);
            
            console.log(`月${i+1}: (${x.toFixed(1)}, ${y.toFixed(1)})`);
        }
    }

    runLoading() {
        console.log('Loading started');
        
        const startTime = Date.now();
        
        // プログレスバーアニメーション
        const updateProgress = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / this.loadingDuration, 1);
            
            const easedProgress = this.easeInOutCubic(progress);
            const percentage = Math.floor(easedProgress * 100);
            
            this.progressBar.style.width = `${percentage}%`;
            this.progressPercent.textContent = `${percentage}%`;
            
            const messageIndex = Math.min(
                Math.floor(progress * this.messages.length),
                this.messages.length - 1
            );
            this.loadingMessage.textContent = this.messages[messageIndex];
            
            if (progress < 1) {
                requestAnimationFrame(updateProgress);
            } else {
                console.log('Loading completed');
                setTimeout(() => {
                    this.finish();
                }, 500);
            }
        };
        
        updateProgress();
        
        // 月のアニメーション開始
        setTimeout(() => {
            this.runMoonAnimation();
        }, 800);
    }

    async runMoonAnimation() {
        // 最初の月以外を薄くする（オリジナルと同じ）
        this.moons.forEach((moon, index) => {
            if (index > 0) {
                moon.style.opacity = '0.6';
            }
        });

        // 順次移動・吸収（オリジナルと同じ）
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

        if (fromMoon.parentNode) {
            fromMoon.parentNode.removeChild(fromMoon);
        }

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

    finish() {
        this.overlay.classList.add('fade-out');
        
        setTimeout(() => {
            this.mainContent.classList.add('loaded');
            // メインサイトの初期化は main.js で行う
            if (typeof initMainSite === 'function') {
                initMainSite();
            }
        }, 1000);
    }

    easeInOutCubic(t) {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// 初期化
window.addEventListener('load', function() {
    new MoonLoader();
});