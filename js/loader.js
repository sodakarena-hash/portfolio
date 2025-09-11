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
        // 少し遅延させてからDOMの準備を確実にする
        setTimeout(() => {
            this.createMoons();
        }, 100);
        
        setTimeout(() => {
            this.runLoading();
        }, 2000);
    }

    createMoons() {
        // 画面サイズ判定（window.innerWidthで確実に判定）
        const screenWidth = window.innerWidth;
        let config;
        
        if (screenWidth <= 360) {
            config = { width: 240, height: 120, moonSize: 20, radius: 60 };
        } else if (screenWidth <= 480) {
            config = { width: 280, height: 140, moonSize: 25, radius: 70 };
        } else if (screenWidth <= 768) {
            config = { width: 320, height: 160, moonSize: 25, radius: 80 };
        } else {
            config = { width: 400, height: 200, moonSize: 30, radius: 100 };
        }
        
        console.log(`画面: ${screenWidth}px → 設定:`, config);
        
        // アニメーションエリアのサイズを強制設定
        this.animationArea.style.width = config.width + 'px';
        this.animationArea.style.height = config.height + 'px';
        
        // 中央座標（エリアの中心）
        const centerX = config.width / 2;
        const centerY = config.height / 2;
        
        // 月の配置座標（手動で確実に計算）
        const moonPositions = [
            { x: centerX - config.radius * 0.8, y: centerY - config.radius * 0.4 },  // 左端
            { x: centerX - config.radius * 0.5, y: centerY - config.radius * 0.6 },  // 左上
            { x: centerX - config.radius * 0.2, y: centerY - config.radius * 0.7 },  // 中央左
            { x: centerX, y: centerY },                                               // 中央（半月）
            { x: centerX + config.radius * 0.2, y: centerY - config.radius * 0.7 },  // 中央右
            { x: centerX + config.radius * 0.5, y: centerY - config.radius * 0.6 },  // 右上
            { x: centerX + config.radius * 0.8, y: centerY - config.radius * 0.4 }   // 右端
        ];

        // 月相設定
        const phases = [
            'new-moon', 'thin-crescent', 'crescent', 'quarter',
            'waxing-gibbous', 'gibbous', 'full'
        ];

        // 既存の月をクリア
        this.animationArea.innerHTML = '';
        this.moons = [];

        // 月を作成
        moonPositions.forEach((pos, i) => {
            const moon = document.createElement('div');
            moon.className = `moon ${phases[i]}`;
            
            // スタイルを直接設定
            moon.style.cssText = `
                position: absolute;
                left: ${pos.x}px;
                top: ${pos.y}px;
                width: ${config.moonSize}px;
                height: ${config.moonSize}px;
                border-radius: 50%;
                background: white;
                overflow: hidden;
                box-shadow: 0 0 10px rgba(255, 255, 255, 0.3);
                transform: translate(-50%, -50%);
                transition: all 0.8s ease;
                z-index: 1;
            `;

            const shadow = document.createElement('div');
            shadow.className = 'moon-shadow';
            shadow.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                width: ${config.moonSize}px;
                height: ${config.moonSize}px;
                background: #000000;
                border-radius: 50%;
                transition: transform 0.3s ease;
            `;
            
            moon.appendChild(shadow);

            moon.dataset.originalX = pos.x;
            moon.dataset.originalY = pos.y;

            this.animationArea.appendChild(moon);
            this.moons.push(moon);
            
            console.log(`月${i+1} (${phases[i]}): (${pos.x}, ${pos.y})`);
        });
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
        fromMoon.style.boxShadow = '0 0 20px rgba(205, 148, 105, 0.6)';
        toMoon.style.opacity = '1';

        const toX = parseFloat(toMoon.dataset.originalX);
        const toY = parseFloat(toMoon.dataset.originalY);
        
        fromMoon.style.left = `${toX}px`;
        fromMoon.style.top = `${toY}px`;

        await this.wait(this.animationSpeed);

        // 吸収アニメーション
        fromMoon.style.opacity = '0';
        fromMoon.style.transform = 'translate(-50%, -50%) scale(0.1)';
        
        // エンハンス効果
        toMoon.style.boxShadow = `
            0 0 15px rgba(255, 255, 255, 0.5),
            0 0 30px rgba(205, 148, 105, 0.3)
        `;
        toMoon.style.transform = 'translate(-50%, -50%) scale(1.1)';

        await this.wait(this.animationSpeed * 0.3);

        if (fromMoon.parentNode) {
            fromMoon.parentNode.removeChild(fromMoon);
        }

        // エンハンス効果を戻す
        toMoon.style.boxShadow = '0 0 10px rgba(255, 255, 255, 0.3)';
        toMoon.style.transform = 'translate(-50%, -50%) scale(1)';
        
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