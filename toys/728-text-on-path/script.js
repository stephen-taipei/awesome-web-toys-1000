const textOnPath = document.getElementById('textOnPath');
const textInput = document.getElementById('textInput');
const svg = document.getElementById('svgDemo');

let currentPath = 'curvePath';

function updatePath(pathId) {
    currentPath = pathId;
    textOnPath.setAttribute('href', `#${pathId}`);

    // Update visible path
    const use = svg.querySelector('use');
    use.setAttribute('href', `#${pathId}`);
}

document.querySelectorAll('.toolbar button').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.toolbar button').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        updatePath(btn.dataset.path);
    });
});

textInput.addEventListener('input', (e) => {
    textOnPath.textContent = e.target.value;
});
