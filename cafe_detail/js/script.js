    // Floating Banner Close Function
    const floatingBanner = document.getElementById('floatingBanner');
    const bannerClose = document.getElementById('bannerClose');

    bannerClose.addEventListener('click', function (e) {
      e.preventDefault();
      floatingBanner.style.animation = 'slideOut 0.3s ease-out forwards';
      setTimeout(() => {
        floatingBanner.style.display = 'none';
      }, 300);
    });

    // ★ ここを修正 ★
    const imageWrappers = document.querySelectorAll('.image-wrapper'); // 全ての画像を取得
    const modal = document.getElementById('modal');
    const modalImage = document.getElementById('modalImage');
    const closeBtn = document.getElementById('closeBtn');
    const zoomInBtn = document.getElementById('zoomIn');
    const zoomOutBtn = document.getElementById('zoomOut');
    const resetZoomBtn = document.getElementById('resetZoom');
    const zoomLevelDisplay = document.getElementById('zoomLevel');
    const modalContent = document.getElementById('modalContent');

    let scale = 1;
    let translateX = 0;
    let translateY = 0;
    let isDragging = false;
    let startX, startY;
    let initialDistance = 0;
    let initialScale = 1;

    // ★ 各画像にクリックイベントを追加 ★
    imageWrappers.forEach(wrapper => {
      wrapper.addEventListener('click', () => {
        const imageSrc = wrapper.getAttribute('data-image');
        modalImage.src = imageSrc;
        modal.classList.add('active');
        resetTransform();
      });
    });

    // 閉じる
    closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
      if (e.target === modal || e.target === modalContent) {
        closeModal();
      }
    });

    function closeModal() {
      modal.classList.remove('active');
      resetTransform();
    }

    // 変換を更新
    function updateTransform() {
      modalImage.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
      zoomLevelDisplay.textContent = `${Math.round(scale * 100)}%`;
    }

    function resetTransform() {
      scale = 1;
      translateX = 0;
      translateY = 0;
      updateTransform();
    }

    // ズームボタン
    zoomInBtn.addEventListener('click', () => {
      scale = Math.min(scale + 0.25, 5);
      updateTransform();
    });

    zoomOutBtn.addEventListener('click', () => {
      scale = Math.max(scale - 0.25, 0.5);
      updateTransform();
    });

    resetZoomBtn.addEventListener('click', resetTransform);

    // マウスホイールでズーム
    modalContent.addEventListener('wheel', (e) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      scale = Math.min(Math.max(scale + delta, 0.5), 5);
      updateTransform();
    });

    // ドラッグで移動
    modalImage.addEventListener('mousedown', startDrag);
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', endDrag);

    function startDrag(e) {
      if (scale > 1) {
        isDragging = true;
        modalImage.classList.add('dragging');
        startX = e.clientX - translateX;
        startY = e.clientY - translateY;
      }
    }

    function drag(e) {
      if (isDragging) {
        translateX = e.clientX - startX;
        translateY = e.clientY - startY;
        updateTransform();
      }
    }

    function endDrag() {
      isDragging = false;
      modalImage.classList.remove('dragging');
    }

    // タッチイベント(ピンチズーム)
    let touches = [];

    modalContent.addEventListener('touchstart', (e) => {
      touches = Array.from(e.touches);

      if (touches.length === 2) {
        initialDistance = getDistance(touches[0], touches[1]);
        initialScale = scale;
      } else if (touches.length === 1 && scale > 1) {
        isDragging = true;
        startX = touches[0].clientX - translateX;
        startY = touches[0].clientY - translateY;
      }
    });

    modalContent.addEventListener('touchmove', (e) => {
      e.preventDefault();
      touches = Array.from(e.touches);

      if (touches.length === 2) {
        const currentDistance = getDistance(touches[0], touches[1]);
        scale = Math.min(Math.max((currentDistance / initialDistance) * initialScale, 0.5), 5);
        updateTransform();
      } else if (touches.length === 1 && isDragging) {
        translateX = touches[0].clientX - startX;
        translateY = touches[0].clientY - startY;
        updateTransform();
      }
    });

    modalContent.addEventListener('touchend', () => {
      isDragging = false;
    });

    function getDistance(touch1, touch2) {
      const dx = touch1.clientX - touch2.clientX;
      const dy = touch1.clientY - touch2.clientY;
      return Math.sqrt(dx * dx + dy * dy);
    }

    // ESCキーで閉じる
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeModal();
      }
    });