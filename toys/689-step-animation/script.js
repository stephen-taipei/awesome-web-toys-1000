const steps = document.querySelectorAll('.step');
const progressBar = document.getElementById('progressBar');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
let currentStep = 1;

function updateSteps() {
    steps.forEach((step, index) => {
        const stepNum = index + 1;
        step.classList.remove('active', 'completed');

        if (stepNum < currentStep) {
            step.classList.add('completed');
        } else if (stepNum === currentStep) {
            step.classList.add('active');
        }
    });

    const progress = ((currentStep - 1) / (steps.length - 1)) * 100;
    progressBar.style.width = `${progress}%`;
}

prevBtn.addEventListener('click', () => {
    if (currentStep > 1) {
        currentStep--;
        updateSteps();
    }
});

nextBtn.addEventListener('click', () => {
    if (currentStep < steps.length) {
        currentStep++;
        updateSteps();
    }
});

updateSteps();
