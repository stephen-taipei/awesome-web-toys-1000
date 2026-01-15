const accordionItems = document.querySelectorAll('.accordion-item');

accordionItems.forEach(item => {
    const header = item.querySelector('.accordion-header');

    header.addEventListener('click', () => {
        const isActive = item.classList.contains('active');

        // Close all items
        accordionItems.forEach(i => i.classList.remove('active'));

        // Open clicked item if it was closed
        if (!isActive) {
            item.classList.add('active');
        }
    });
});
