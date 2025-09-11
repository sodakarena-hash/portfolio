// Google Maps初期化
function initMap() {
    const cafeLocation = { lat: 35.6702, lng: 139.7026 };
    
    const map = new google.maps.Map(document.getElementById("map"), {
        zoom: 16,
        center: cafeLocation,
        styles: [
            {
                "featureType": "all",
                "elementType": "geometry.fill",
                "stylers": [{"color": "#F5F3EE"}]
            },
            {
                "featureType": "water",
                "elementType": "geometry",
                "stylers": [{"color": "#CD9469"}, {"lightness": 40}]
            },
            {
                "featureType": "road",
                "elementType": "geometry",
                "stylers": [{"color": "#ffffff"}]
            }
        ]
    });
    
    const marker = new google.maps.Marker({
        position: cafeLocation,
        map: map,
        title: "月明茶房",
        icon: {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="20" cy="20" r="18" fill="#CD9469" stroke="white" stroke-width="2"/>
                    <text x="20" y="26" text-anchor="middle" fill="white" font-family="serif" font-size="12">月</text>
                </svg>
            `),
            scaledSize: new google.maps.Size(40, 40)
        }
    });
    
    const infoWindow = new google.maps.InfoWindow({
        content: `
            <div style="font-family: 'Noto Serif JP', serif; padding: 10px;">
                <h3 style="color: #CD9469; margin-bottom: 5px;">月明茶房</h3>
                <p style="margin: 0; font-size: 14px;">東京都渋谷区神宮前1-2-3<br>月明ビル1F</p>
            </div>
        `
    });
    
    marker.addListener("click", () => {
        infoWindow.open(map, marker);
    });
}

// メニューデータ
const menuData = {
    morning: {
        title: "モーニングメニュー",
        subtitle: "Morning Menu - 10:00~11:30",
        items: [
            { name: "月光ブレンド", description: "店主厳選の豆で淹れる、朝のひととき専用ブレンド", price: "¥580" },
            { name: "昭和トースト", description: "厚切り食パンにバターと自家製ジャム、ゆで卵付き", price: "¥680" },
            { name: "月見パンケーキ", description: "ふわふわパンケーキに半月バターと蜂蜜", price: "¥780" },
            { name: "レトロサンドイッチ", description: "懐かしのハムエッグサンド、コーヒー付き", price: "¥850" },
            { name: "月明モーニングセット", description: "本日のコーヒー、トースト、サラダ、スープの特別セット", price: "¥980" }
        ]
    },
    lunch: {
        title: "ランチメニュー",
        subtitle: "Lunch Menu - 12:00~15:00",
        items: [
            { name: "月影カレー", description: "スパイス香る自家製カレー、福神漬けと目玉焼き添え", price: "¥1,280" },
            { name: "レトロナポリタン", description: "昭和の喫茶店の味を再現した懐かしいナポリタン", price: "¥1,180" },
            { name: "月見ハンバーグ", description: "ふっくら手こねハンバーグに半熟目玉焼きをのせて", price: "¥1,480" },
            { name: "昭和オムライス", description: "チキンライスを薄焼き卵で包んだ王道オムライス", price: "¥1,380" },
            { name: "月明定食", description: "本日の魚料理、小鉢三品、ご飯、味噌汁のセット", price: "¥1,680" },
            { name: "レトロサンドイッチセット", description: "選べるサンドイッチとスープ、サラダのセット", price: "¥1,280" }
        ]
    },
    dinner: {
        title: "ディナーメニュー",
        subtitle: "Dinner Menu - 17:00~21:00",
        items: [
            { name: "月夜のビーフシチュー", description: "赤ワインでじっくり煮込んだ極上のビーフシチュー", price: "¥2,480" },
            { name: "昭和グラタン", description: "エビとマカロニの濃厚チーズグラタン", price: "¥1,880" },
            { name: "月光ステーキ", description: "国産牛のサーロインステーキ、季節野菜添え", price: "¥3,280" },
            { name: "レトロピラフ", description: "シーフードとサフランの香り豊かなピラフ", price: "¥1,680" },
            { name: "月明コース", description: "前菜、スープ、メイン、デザート、コーヒーのフルコース", price: "¥3,980" },
            { name: "昭和の洋食セット", description: "エビフライとハンバーグの贅沢セット", price: "¥2,280" },
            { name: "ワインセレクション", description: "料理に合わせたワイン（グラス）", price: "¥680~" }
        ]
    }
};

// DOMContentLoaded時の初期化
document.addEventListener('DOMContentLoaded', function() {
    // ポップアップ機能
    const popupOverlay = document.getElementById('popup-overlay');
    const popupBody = document.getElementById('popup-body');
    const popupClose = document.querySelector('.popup-close');
    
    function showMenuPopup(menuType) {
        const menu = menuData[menuType];
        
        popupBody.innerHTML = `
            <h2 class="popup-title">${menu.title}</h2>
            <p style="text-align: center; color: #666; margin-bottom: 30px; font-size: 16px;">${menu.subtitle}</p>
            <div class="menu-items">
                ${menu.items.map(item => `
                    <div class="menu-item">
                        <div class="menu-item-info">
                            <h4 class="menu-item-name">${item.name}</h4>
                            <p class="menu-item-description">${item.description}</p>
                        </div>
                        <div class="menu-item-price">${item.price}</div>
                    </div>
                `).join('')}
            </div>
        `;
        
        popupOverlay.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
    
    function hideMenuPopup() {
        popupOverlay.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
    
    // メニューカードのクリックイベント
    document.querySelectorAll('.menu-card').forEach(card => {
        card.addEventListener('click', () => {
            const menuType = card.dataset.menu;
            showMenuPopup(menuType);
        });
    });
    
    // ポップアップを閉じる
    if (popupClose) {
        popupClose.addEventListener('click', hideMenuPopup);
    }
    if (popupOverlay) {
        popupOverlay.addEventListener('click', (e) => {
            if (e.target === popupOverlay) {
                hideMenuPopup();
            }
        });
    }
    
    // ESCキーでポップアップを閉じる
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            hideMenuPopup();
        }
    });

    // モバイルメニュー
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const navItems = document.querySelector('.nav-items');
    
    if (mobileMenuToggle && navItems) {
        let isMenuOpen = false;
        
        mobileMenuToggle.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            isMenuOpen = !isMenuOpen;
            
            if (isMenuOpen) {
                navItems.classList.add('show');
            } else {
                navItems.classList.remove('show');
            }
        });

        // メニューアイテムクリック時にメニューを閉じる
        document.querySelectorAll('.nav-menu').forEach(link => {
            link.addEventListener('click', function() {
                if (window.innerWidth <= 767 && isMenuOpen) {
                    navItems.classList.remove('show');
                    isMenuOpen = false;
                }
            });
        });
    }
    
    // スムーススクロール機能
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const headerHeight = document.querySelector('.header').offsetHeight;
                const targetPosition = target.offsetTop - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // フォーム送信処理
    const formBox = document.querySelector('.form-box');
    if (formBox) {
        formBox.addEventListener('submit', function(e) {
            e.preventDefault();
            alert('ご予約ありがとうございます。確認メールをお送りいたします。');
        });
    }
    
    // アニメーション対象の要素を設定
    const animatedElements = document.querySelectorAll('.fade-in');
    if (animatedElements.length > 0) {
        animatedElements.forEach(el => {
            animationObserver.observe(el);
        });
    }
    
    // 初期背景画像設定
    updateBackgroundImages();
});

// スクロール時のヘッダー効果
window.addEventListener('scroll', function() {
    const header = document.querySelector('.header');
    if (header) {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (scrollTop > 100) {
            header.style.background = 'rgba(24, 24, 24, 0.95)';
            header.style.backdropFilter = 'blur(10px)';
        } else {
            header.style.background = '#181818';
            header.style.backdropFilter = 'none';
        }
    }
});

// アニメーション効果
const animationObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
});

// レスポンシブ背景画像の切り替え
function updateBackgroundImages() {
    const isMobile = window.innerWidth <= 767;
    const heroSection = document.querySelector('.hero-section');
    const newsSection = document.querySelector('.news-section');
    const aboutImage = document.querySelector('.about-image');
    
    if (heroSection) {
        if (isMobile) {
            heroSection.className = 'hero-section hero-bg-mobile';
        } else {
            heroSection.className = 'hero-section hero-bg-desktop';
        }
    }
    
    if (newsSection) {
        if (isMobile) {
            newsSection.className = 'news-section news-bg-mobile';
        } else {
            newsSection.className = 'news-section news-bg-desktop';
        }
    }
    
    if (aboutImage) {
        if (isMobile) {
            aboutImage.className = 'about-image about-bg-mobile';
        } else {
            aboutImage.className = 'about-image about-bg-desktop';
        }
    }
}

// ページ読み込み時とリサイズ時に背景画像を更新
window.addEventListener('load', updateBackgroundImages);
window.addEventListener('resize', updateBackgroundImages);

// Google Maps API エラーハンドリング
window.gm_authFailure = function() {
    const mapElement = document.getElementById('map');
    if (mapElement) {
        mapElement.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: center; height: 100%; background: #f0f0f0; color: #666; font-family: 'Noto Serif JP', serif;">
                <div style="text-align: center;">
                    <p>地図を表示するにはGoogle Maps APIキーが必要です</p>
                    <p style="font-size: 14px; margin-top: 10px;">住所: 東京都渋谷区神宮前1-2-3</p>
                </div>
            </div>
        `;
    }
};

// APIキーが設定されていない場合の代替表示
setTimeout(() => {
    if (!window.google || !window.google.maps) {
        gm_authFailure();
    }
}, 3000);

// デバッグ用ヘルパー関数
function updateDebugStatus(key, value) {
    const element = document.getElementById(key);
    if (element) {
        element.textContent = value;
    }
}

function logError(message, error) {
    console.error(message, error);
    updateDebugStatus('errorStatus', message);
}

// 初期化
let scrollMoon;

window.addEventListener('load', () => {
    console.log('ページ読み込み完了、初期化開始');
    
    // Three.jsの確認
    if (typeof THREE !== 'undefined') {
        console.log('Three.js バージョン:', THREE.REVISION);
        updateDebugStatus('threeStatus', `r${THREE.REVISION}`);
    } else {
        updateDebugStatus('threeStatus', '未読み込み');
    }
    
    // 3Dムーン初期化（ScrollMoonクラスが利用可能な場合）
    if (typeof ScrollMoon !== 'undefined') {
        try {
            scrollMoon = new ScrollMoon();
            scrollMoon.init();
        } catch (error) {
            logError('3D初期化失敗', error);
        }
    } else {
        updateDebugStatus('initStatus', 'ScrollMoonクラス未読み込み');
    }
    
    // メインサイト機能初期化
    setupMainSite();
    
    console.log('初期化処理完了');
});

// リサイズ対応
window.addEventListener('resize', () => {
    if (scrollMoon && scrollMoon.isInitialized) {
        scrollMoon.handleResize();
    }
});

// ページ離脱時のクリーンアップ
window.addEventListener('beforeunload', () => {
    if (scrollMoon) {
        scrollMoon.dispose();
    }
});