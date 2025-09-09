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
document.querySelector('.form-box').addEventListener('submit', function(e) {
    e.preventDefault();
    alert('ご予約ありがとうございます。確認メールをお送りいたします。');
});

// モバイルメニュー（簡単な実装）
document.querySelector('.mobile-menu-toggle').addEventListener('click', function() {
    const navContainer = document.querySelector('.nav-container');
    navContainer.style.flexDirection = navContainer.style.flexDirection === 'column' ? 'row' : 'column';
});

// スクロール時のヘッダー効果
let lastScrollTop = 0;
const header = document.querySelector('.header');

window.addEventListener('scroll', function() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    if (scrollTop > 100) {
        header.style.background = 'rgba(24, 24, 24, 0.95)';
        header.style.backdropFilter = 'blur(10px)';
    } else {
        header.style.background = '#181818';
        header.style.backdropFilter = 'none';
    }
    
    lastScrollTop = scrollTop;
});

// 画像の遅延読み込み（Intersection Observer）
const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const img = entry.target;
            if (img.dataset.src) {
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                observer.unobserve(img);
            }
        }
    });
});

// アニメーション効果（スクロール時の要素表示）
const animationObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
});

// アニメーション対象の要素を設定
document.addEventListener('DOMContentLoaded', function() {
    const animatedElements = document.querySelectorAll('.menu-card, .news-item, .about-content, .benefits-box, .form-box, .contact-box');
    
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        animationObserver.observe(el);
    });
});