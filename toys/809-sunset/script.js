const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const timeSlider = document.getElementById('timeSlider');

canvas.width = 370;
canvas.height = 300;

let time = 0;

function lerp(a, b, t) {
    return a + (b - a) * t;
}

function lerpColor(color1, color2, t) {
    return color1.map((c, i) => Math.round(lerp(c, color2[i], t)));
}

function draw() {
    const progress = timeSlider.value / 100;

    const skyTop1 = [135, 206, 235];
    const skyTop2 = [25, 25, 112];
    const skyMid1 = [255, 165, 0];
    const skyMid2 = [139, 0, 0];
    const skyBottom1 = [255, 99, 71];
    const skyBottom2 = [25, 25, 50];

    const topColor = lerpColor(skyTop1, skyTop2, progress);
    const midColor = lerpColor(skyMid1, skyMid2, progress);
    const bottomColor = lerpColor(skyBottom1, skyBottom2, progress);

    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, `rgb(${topColor.join(',')})`);
    gradient.addColorStop(0.4, `rgb(${midColor.join(',')})`);
    gradient.addColorStop(0.7, `rgb(${bottomColor.join(',')})`);
    gradient.addColorStop(1, `rgb(${lerpColor([255, 200, 150], [20, 20, 40], progress).join(',')})`);

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const sunY = lerp(80, canvas.height + 50, progress);
    const sunRadius = 40;
    const sunX = canvas.width / 2;

    if (sunY < canvas.height + sunRadius) {
        const sunGradient = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, sunRadius * 2);
        sunGradient.addColorStop(0, `rgba(255, 255, 200, ${1 - progress * 0.5})`);
        sunGradient.addColorStop(0.3, `rgba(255, 200, 100, ${0.8 - progress * 0.4})`);
        sunGradient.addColorStop(0.6, `rgba(255, 150, 50, ${0.3 - progress * 0.2})`);
        sunGradient.addColorStop(1, 'transparent');

        ctx.fillStyle = sunGradient;
        ctx.beginPath();
        ctx.arc(sunX, sunY, sunRadius * 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = `rgb(255, ${lerp(220, 100, progress)}, ${lerp(50, 0, progress)})`;
        ctx.beginPath();
        ctx.arc(sunX, sunY, sunRadius, 0, Math.PI * 2);
        ctx.fill();
    }

    if (progress > 0.3) {
        const starAlpha = (progress - 0.3) / 0.7;
        for (let i = 0; i < 30; i++) {
            const x = (i * 73) % canvas.width;
            const y = (i * 47) % (canvas.height * 0.5);
            const twinkle = Math.sin(time * 3 + i) * 0.3 + 0.7;
            ctx.fillStyle = `rgba(255, 255, 255, ${starAlpha * twinkle})`;
            ctx.beginPath();
            ctx.arc(x, y, 1, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    ctx.fillStyle = `rgb(${lerpColor([50, 50, 50], [10, 10, 20], progress).join(',')})`;
    ctx.beginPath();
    ctx.moveTo(0, canvas.height);
    for (let x = 0; x <= canvas.width; x += 10) {
        const y = canvas.height - 30 - Math.sin(x * 0.02) * 15 - Math.sin(x * 0.05) * 10;
        ctx.lineTo(x, y);
    }
    ctx.lineTo(canvas.width, canvas.height);
    ctx.fill();

    ctx.fillStyle = 'rgba(255, 150, 50, 0.3)';
    const reflectionY = canvas.height - 20;
    for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.ellipse(sunX, reflectionY + i * 3, 30 - i * 5, 3, 0, 0, Math.PI * 2);
        ctx.fill();
    }

    time += 0.02;
    requestAnimationFrame(draw);
}

draw();
