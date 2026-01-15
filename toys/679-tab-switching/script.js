const tabs = document.querySelectorAll('.tab');
const contents = document.querySelectorAll('.content');
const indicator = document.getElementById('indicator');

function updateIndicator(tab) {
    indicator.style.width = `${tab.offsetWidth}px`;
    indicator.style.left = `${tab.offsetLeft}px`;
}

// Initialize indicator
updateIndicator(document.querySelector('.tab.active'));

tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        const tabId = tab.dataset.tab;

        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        updateIndicator(tab);

        contents.forEach(content => {
            if (content.classList.contains('active')) {
                content.classList.add('exit-left');
            }
            content.classList.remove('active');
        });

        setTimeout(() => {
            contents.forEach(content => content.classList.remove('exit-left'));
            document.querySelector(`.content[data-content="${tabId}"]`).classList.add('active');
        }, 150);
    });
});

window.addEventListener('resize', () => {
    updateIndicator(document.querySelector('.tab.active'));
});
