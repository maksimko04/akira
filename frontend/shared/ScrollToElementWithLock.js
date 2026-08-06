export default (container, targetElement, onComplete) => {
    return new Promise((resolve) => {
        if (!container || !targetElement) {
            if (typeof onComplete === 'function') onComplete(false, () => {});
            return resolve({ isSuccess: false, unlock: () => {} });
        }

        // 1. Обчислюємо точну цільову позицію для центрування (block: 'center')
        const containerRect = container.getBoundingClientRect();
        const targetRect = targetElement.getBoundingClientRect();

        const startScrollTop = container.scrollTop;
        const targetScrollTop = startScrollTop + (targetRect.top - containerRect.top) - (containerRect.height / 2) + (targetRect.height / 2);
        const distance = targetScrollTop - startScrollTop;

        // Якщо рухатися не потрібно
        if (Math.abs(distance) < 2) {
            if (typeof onComplete === 'function') onComplete(true, () => {});
            return resolve({ isSuccess: true, unlock: () => {} });
        }

        // 2. Створюємо оверлей для блокування кліків та курсора
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0; left: 0; width: 100vw; height: 100vh;
            z-index: 999999;
            background: transparent;
            touch-action: none;
        `;
        document.body.appendChild(overlay);

        const prevent = (e) => {
            if (e.cancelable) e.preventDefault();
        };

        window.addEventListener('wheel', prevent, { passive: false, capture: true });
        window.addEventListener('touchmove', prevent, { passive: false, capture: true });

        let isUnlocked = false;
        let animationFrameId = null;

        // 3. Розблокування
        const unlock = () => {
            if (isUnlocked) return;
            isUnlocked = true;

            if (animationFrameId) cancelAnimationFrame(animationFrameId);
            if (overlay.parentNode) overlay.parentNode.removeChild(overlay);

            window.removeEventListener('wheel', prevent, { capture: true });
            window.removeEventListener('touchmove', prevent, { capture: true });
        };

        // 4. Математика плавності (Ease-InOut Quad)
        const duration = Math.min(Math.max(Math.abs(distance) * 0.4, 300), 500); // Динамічний час (300-500мс)
        let startTime = null;

        const easeInOutQuad = (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

        // 5. Кадр за кадром контролюємо скрол
        const step = (currentTime) => {
            if (!startTime) startTime = currentTime;
            const timeElapsed = currentTime - startTime;
            const progress = Math.min(timeElapsed / duration, 1);

            // Жорстко переписуємо scrollTop на кожному кадрі!
            // Будь-яка спроба користувача проскролити миттєво перезаписується сюди:
            container.scrollTop = startScrollTop + distance * easeInOutQuad(progress);

            if (progress < 1) {
                animationFrameId = requestAnimationFrame(step);
            } else {
                // Фінальна точна фіксація
                container.scrollTop = targetScrollTop;

                if (typeof onComplete !== 'function') {
                    unlock();
                } else {
                    onComplete(true, unlock);
                }
                resolve({ isSuccess: true, unlock });
            }
        };

        // Запускаємо анімацію
        animationFrameId = requestAnimationFrame(step);
    });
};