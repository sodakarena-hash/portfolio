// ==========================================
// Fade In Animation on Scroll
// ==========================================
document.addEventListener('DOMContentLoaded', function() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, observerOptions);

  // Observe all elements with fade-in class
  const fadeElements = document.querySelectorAll('.fade-in');
  fadeElements.forEach(function(element) {
    observer.observe(element);
  });
});

// ==========================================
// Modal Functionality
// ==========================================
const modal = document.getElementById('modal');
const modalImage = document.getElementById('modalImage');
const closeBtn = document.getElementById('closeBtn');
const zoomInBtn = document.getElementById('zoomIn');
const zoomOutBtn = document.getElementById('zoomOut');
const resetZoomBtn = document.getElementById('resetZoom');
const zoomLevelDisplay = document.getElementById('zoomLevel');

let currentZoom = 100;

// Open modal when design comp is clicked
document.addEventListener('DOMContentLoaded', function() {
  const designCompWrapper = document.querySelector('.image-wrapper');
  
  if (designCompWrapper) {
    designCompWrapper.addEventListener('click', function() {
      const imageSrc = this.getAttribute('data-image');
      openModal(imageSrc);
    });
  }
});

function openModal(imageSrc) {
  modal.classList.add('active');
  modalImage.src = imageSrc;
  currentZoom = 100;
  translateX = 0;  // 追加
  translateY = 0;  // 追加
  updateZoom();
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  modal.classList.remove('active');
  modalImage.src = '';
  document.body.style.overflow = '';
}

function updateZoom() {
  modalImage.style.transform = `translate(${translateX}px, ${translateY}px) scale(${currentZoom / 100})`;
  zoomLevelDisplay.textContent = currentZoom + '%';
}

// Close modal
closeBtn.addEventListener('click', closeModal);

// Close modal when clicking outside the image
modal.addEventListener('click', function(e) {
  if (e.target === modal) {
    closeModal();
  }
});

// Zoom In
zoomInBtn.addEventListener('click', function(e) {
  e.stopPropagation();
  if (currentZoom < 500) {
    currentZoom += 25;
    updateZoom();
  }
});

// Zoom Out
zoomOutBtn.addEventListener('click', function(e) {
  e.stopPropagation();
  if (currentZoom > 50) {
    currentZoom -= 25;
    updateZoom();
  }
});

// Reset Zoom
resetZoomBtn.addEventListener('click', function(e) {
  e.stopPropagation();
  currentZoom = 100;
  updateZoom();
});

// Keyboard shortcuts for modal
document.addEventListener('keydown', function(e) {
  if (modal.classList.contains('active')) {
    switch(e.key) {
      case 'Escape':
        closeModal();
        break;
      case '+':
      case '=':
        if (currentZoom < 300) {
          currentZoom += 25;
          updateZoom();
        }
        break;
      case '-':
        if (currentZoom > 50) {
          currentZoom -= 25;
          updateZoom();
        }
        break;
      case '0':
        currentZoom = 100;
        updateZoom();
        break;
    }
  }
});

// マウスホイールでズーム
modalContent.addEventListener('wheel', function(e) {
  if (modal.classList.contains('active')) {
    e.preventDefault();
    
    if (e.deltaY < 0) {
      // ホイール上 = ズームイン
      if (currentZoom < 500) {
        currentZoom += 10;
        updateZoom();
      }
    } else {
      // ホイール下 = ズームアウト
      if (currentZoom > 50) {
        currentZoom -= 10;
        updateZoom();
      }
    }
  }
}, { passive: false });

// ドラッグで画像移動
let isDragging = false;
let startX, startY;
let translateX = 0, translateY = 0;

modalImage.addEventListener('mousedown', function(e) {
  if (modal.classList.contains('active')) {
    isDragging = true;
    startX = e.clientX - translateX;
    startY = e.clientY - translateY;
    modalImage.style.cursor = 'grabbing';
    e.preventDefault();
  }
});

document.addEventListener('mousemove', function(e) {
  if (isDragging) {
    translateX = e.clientX - startX;
    translateY = e.clientY - startY;
    modalImage.style.transform = `translate(${translateX}px, ${translateY}px) scale(${currentZoom / 100})`;
  }
});

document.addEventListener('mouseup', function() {
  if (isDragging) {
    isDragging = false;
    modalImage.style.cursor = 'grab';
  }
});

// ドラッグで画像移動（マウス）
modalImage.addEventListener('mousedown', function(e) {
  if (modal.classList.contains('active')) {
    isDragging = true;
    startX = e.clientX - translateX;
    startY = e.clientY - translateY;
    modalImage.style.cursor = 'grabbing';
    e.preventDefault();
  }
});

// タッチ開始（スマホ）
modalImage.addEventListener('touchstart', function(e) {
  if (modal.classList.contains('active')) {
    isDragging = true;
    const touch = e.touches[0];
    startX = touch.clientX - translateX;
    startY = touch.clientY - translateY;
    e.preventDefault();
  }
}, { passive: false });

// マウス移動
document.addEventListener('mousemove', function(e) {
  if (isDragging) {
    translateX = e.clientX - startX;
    translateY = e.clientY - startY;
    modalImage.style.transform = `translate(${translateX}px, ${translateY}px) scale(${currentZoom / 100})`;
  }
});

// タッチ移動（スマホ）
document.addEventListener('touchmove', function(e) {
  if (isDragging) {
    const touch = e.touches[0];
    translateX = touch.clientX - startX;
    translateY = touch.clientY - startY;
    modalImage.style.transform = `translate(${translateX}px, ${translateY}px) scale(${currentZoom / 100})`;
  }
}, { passive: false });

// マウスアップ
document.addEventListener('mouseup', function() {
  if (isDragging) {
    isDragging = false;
    modalImage.style.cursor = 'grab';
  }
});

// タッチ終了（スマホ）
document.addEventListener('touchend', function() {
  if (isDragging) {
    isDragging = false;
  }
});

// ==========================================
// Floating Banner
// ==========================================
const floatingBanner = document.getElementById('floatingBanner');
const bannerClose = document.getElementById('bannerClose');

if (bannerClose) {
  bannerClose.addEventListener('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    floatingBanner.classList.add('hidden');
    
    // Save banner state to sessionStorage
    sessionStorage.setItem('bannerClosed', 'true');
  });
}

// Check if banner was previously closed in this session
document.addEventListener('DOMContentLoaded', function() {
  if (sessionStorage.getItem('bannerClosed') === 'true') {
    if (floatingBanner) {
      floatingBanner.classList.add('hidden');
    }
  }
});

// ==========================================
// Smooth Scroll for Links
// ==========================================
document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
  anchor.addEventListener('click', function(e) {
    const href = this.getAttribute('href');
    if (href !== '#' && document.querySelector(href)) {
      e.preventDefault();
      const target = document.querySelector(href);
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  });
});

// ==========================================
// Image Loading Effect
// ==========================================
document.addEventListener('DOMContentLoaded', function() {
  const images = document.querySelectorAll('img');
  
  images.forEach(function(img) {
    img.style.opacity = '0';
    img.style.transition = 'opacity 0.5s ease';
    
    if (img.complete) {
      img.style.opacity = '1';
    } else {
      img.addEventListener('load', function() {
        this.style.opacity = '1';
      });
    }
  });
});

// ==========================================
// Console Log - Development Info
// ==========================================
console.log('%c🐠 おさかな日和 Portfolio Site', 'font-size: 20px; color: #03a9f4; font-weight: bold;');
console.log('%cWelcome to the project portfolio page!', 'font-size: 14px; color: #0277bd;');
console.log('%cThis is an aquarium summer event landing page design.', 'font-size: 12px; color: #424242;');