const iconItems = document.querySelectorAll('.icon-item');

iconItems.forEach(item => {
    item.addEventListener('click', () => {
        const iconType = item.dataset.icon;

        if (iconType === 'loading' || iconType === 'bell') {
            // Toggle animation
            item.classList.toggle('active');

            // Auto stop bell after animation
            if (iconType === 'bell' && item.classList.contains('active')) {
                setTimeout(() => item.classList.remove('active'), 500);
            }
        } else if (iconType === 'check') {
            // Reset and replay animation
            item.classList.remove('active');
            setTimeout(() => item.classList.add('active'), 50);
        } else {
            // Simple toggle
            item.classList.toggle('active');
        }
    });
});
