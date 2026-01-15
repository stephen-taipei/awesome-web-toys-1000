const progressBar = document.getElementById('progressBar');
const circleProgress = document.getElementById('circleProgress');
const progressText = document.getElementById('progressText');

function updateProgress() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = (scrollTop / docHeight) * 100;

    progressBar.style.width = progress + '%';

    const circumference = 2 * Math.PI * 45;
    const offset = circumference - (progress / 100) * circumference;
    circleProgress.style.strokeDashoffset = offset;

    progressText.textContent = Math.round(progress) + '%';
}

window.addEventListener('scroll', updateProgress);
updateProgress();
