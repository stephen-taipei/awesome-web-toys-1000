const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const regenerateBtn = document.getElementById('regenerateBtn');
const infoEl = document.getElementById('info');

const sections = {
    intro: { color: '#3498db', label: 'Intro', minBars: 4, maxBars: 8 },
    verse: { color: '#2ecc71', label: 'Verse', minBars: 8, maxBars: 16 },
    preChorus: { color: '#f39c12', label: 'Pre-Chorus', minBars: 4, maxBars: 8 },
    chorus: { color: '#e74c3c', label: 'Chorus', minBars: 8, maxBars: 16 },
    bridge: { color: '#9b59b6', label: 'Bridge', minBars: 4, maxBars: 8 },
    outro: { color: '#1abc9c', label: 'Outro', minBars: 4, maxBars: 8 }
};

function generateSongStructure() {
    const structures = [
        ['intro', 'verse', 'chorus', 'verse', 'chorus', 'bridge', 'chorus', 'outro'],
        ['intro', 'verse', 'preChorus', 'chorus', 'verse', 'preChorus', 'chorus', 'chorus', 'outro'],
        ['verse', 'verse', 'chorus', 'verse', 'chorus', 'bridge', 'chorus'],
        ['intro', 'verse', 'chorus', 'verse', 'chorus', 'outro']
    ];

    const structure = structures[Math.floor(Math.random() * structures.length)];

    return structure.map(section => ({
        type: section,
        bars: sections[section].minBars + Math.floor(Math.random() * (sections[section].maxBars - sections[section].minBars + 1))
    }));
}

let songStructure = [];
let playhead = 0;

function draw() {
    ctx.fillStyle = '#0f0f1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (songStructure.length === 0) return;

    const totalBars = songStructure.reduce((sum, s) => sum + s.bars, 0);
    const barWidth = (canvas.width - 40) / totalBars;

    // Title
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('歌曲結構分析', canvas.width / 2, 25);

    // Draw timeline
    let x = 20;
    const timelineY = 60;
    const timelineHeight = 40;

    songStructure.forEach((section, i) => {
        const width = section.bars * barWidth;
        const sectionData = sections[section.type];

        // Section block
        ctx.fillStyle = sectionData.color;
        ctx.fillRect(x, timelineY, width - 2, timelineHeight);

        // Section label
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 10px Arial';
        ctx.textAlign = 'center';
        if (width > 30) {
            ctx.fillText(sectionData.label, x + width / 2, timelineY + 25);
        }

        x += width;
    });

    // Draw waveform simulation
    const waveY = 130;
    const waveHeight = 60;

    x = 20;
    songStructure.forEach(section => {
        const width = section.bars * barWidth;
        const sectionData = sections[section.type];
        const intensity = section.type === 'chorus' ? 1 : section.type === 'verse' ? 0.6 : 0.4;

        for (let i = 0; i < width; i += 3) {
            const h = (Math.random() * 0.5 + 0.5) * intensity * waveHeight;
            ctx.fillStyle = sectionData.color + '88';
            ctx.fillRect(x + i, waveY + (waveHeight - h) / 2, 2, h);
        }

        x += width;
    });

    // Draw bar markers
    x = 20;
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '8px Arial';
    let barCount = 0;

    songStructure.forEach(section => {
        for (let i = 0; i < section.bars; i++) {
            if (barCount % 4 === 0) {
                ctx.textAlign = 'center';
                ctx.fillText(barCount + 1, x + i * barWidth + barWidth / 2, 115);
            }
            barCount++;
        }
        x += section.bars * barWidth;
    });

    // Energy graph
    const energyY = 210;
    ctx.beginPath();
    x = 20;

    songStructure.forEach((section, i) => {
        const width = section.bars * barWidth;
        const energy = section.type === 'chorus' ? 50 :
                       section.type === 'preChorus' ? 35 :
                       section.type === 'verse' ? 25 :
                       section.type === 'bridge' ? 30 : 15;

        if (i === 0) ctx.moveTo(x, energyY - energy);
        ctx.lineTo(x + width / 2, energyY - energy);
        x += width;
    });

    ctx.strokeStyle = '#ff6b6b';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.font = '10px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('能量', 25, energyY + 15);

    // Legend
    const legendY = canvas.height - 35;
    let legendX = 20;

    Object.entries(sections).slice(0, 4).forEach(([key, data]) => {
        ctx.fillStyle = data.color;
        ctx.fillRect(legendX, legendY, 12, 12);
        ctx.fillStyle = 'rgba(255,255,255,0.8)';
        ctx.font = '9px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(data.label, legendX + 15, legendY + 10);
        legendX += 80;
    });

    // Playhead animation
    const totalWidth = canvas.width - 40;
    const playX = 20 + (playhead / 100) * totalWidth;
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(playX, 50);
    ctx.lineTo(playX, 200);
    ctx.stroke();

    playhead = (playhead + 0.2) % 100;
    requestAnimationFrame(draw);
}

function regenerate() {
    songStructure = generateSongStructure();
    const totalBars = songStructure.reduce((sum, s) => sum + s.bars, 0);
    const duration = Math.floor(totalBars * 2); // Assume 2 seconds per bar
    infoEl.textContent = `${songStructure.length} 段落 | ${totalBars} 小節 | 約 ${Math.floor(duration / 60)}:${(duration % 60).toString().padStart(2, '0')}`;
}

regenerateBtn.addEventListener('click', regenerate);
regenerate();
draw();
