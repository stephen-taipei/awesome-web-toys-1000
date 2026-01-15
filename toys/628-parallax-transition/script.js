const container = document.querySelector('.parallax-container');
const contentTitle = document.getElementById('contentTitle');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');

let currentScene = 1;
const totalScenes = 3;

function setScene(num) {
    container.className = `parallax-container scene-${num}`;
    contentTitle.style.opacity = 0;
    setTimeout(() => {
        contentTitle.textContent = `Scene ${num}`;
        contentTitle.style.opacity = 1;
    }, 300);
    currentScene = num;
}

function nextScene() {
    const next = currentScene >= totalScenes ? 1 : currentScene + 1;
    setScene(next);
}

function prevScene() {
    const prev = currentScene <= 1 ? totalScenes : currentScene - 1;
    setScene(prev);
}

prevBtn.addEventListener('click', prevScene);
nextBtn.addEventListener('click', nextScene);

setScene(1);
