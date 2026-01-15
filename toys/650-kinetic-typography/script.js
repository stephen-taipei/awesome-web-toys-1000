const stage = document.getElementById('stage');
const playBtn = document.getElementById('playBtn');
const styleButtons = document.querySelectorAll('.controls button[data-style]');
let currentStyle = 'bounce';

function play() {
    stage.className = 'kinetic-stage';
    void stage.offsetWidth;
    stage.classList.add(currentStyle);
}

playBtn.addEventListener('click', play);

styleButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        currentStyle = btn.dataset.style;
        styleButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        play();
    });
});

setTimeout(play, 500);
