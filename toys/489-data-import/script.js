const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const infoEl = document.getElementById('info');

let importedData = [];

const sampleCsv = `name,value
一月,85
二月,92
三月,78
四月,105
五月,88
六月,95`;

const sampleJson = [
    { name: '產品A', value: 120 },
    { name: '產品B', value: 85 },
    { name: '產品C', value: 150 },
    { name: '產品D', value: 95 },
    { name: '產品E', value: 110 }
];

function parseCsv(text) {
    const lines = text.trim().split('\n');
    const headers = lines[0].split(',');
    return lines.slice(1).map(line => {
        const values = line.split(',');
        return {
            name: values[0],
            value: parseFloat(values[1])
        };
    });
}

function parseJson(text) {
    const data = JSON.parse(text);
    return data.map(item => ({
        name: item.name || item.label || Object.values(item)[0],
        value: parseFloat(item.value || item.amount || Object.values(item)[1])
    }));
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (importedData.length === 0) {
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('尚未匯入數據', canvas.width / 2, canvas.height / 2);
        return;
    }

    const chartLeft = 50;
    const chartRight = canvas.width - 20;
    const chartTop = 30;
    const chartBottom = canvas.height - 30;

    const maxValue = Math.max(...importedData.map(d => d.value));
    const barWidth = (chartRight - chartLeft) / importedData.length - 8;

    // Draw bars
    const colors = ['#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6', '#1abc9c'];
    importedData.forEach((d, i) => {
        const x = chartLeft + i * (barWidth + 8);
        const barHeight = (d.value / maxValue) * (chartBottom - chartTop);
        const y = chartBottom - barHeight;

        ctx.fillStyle = colors[i % colors.length];
        ctx.fillRect(x, y, barWidth, barHeight);

        // Value
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(d.value, x + barWidth / 2, y - 5);

        // Label
        ctx.font = '9px Arial';
        ctx.fillText(d.name.substring(0, 4), x + barWidth / 2, chartBottom + 12);
    });
}

function handleFile(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const text = e.target.result;
            if (file.name.endsWith('.csv')) {
                importedData = parseCsv(text);
            } else {
                importedData = parseJson(text);
            }
            draw();
            infoEl.textContent = `成功匯入 ${importedData.length} 筆數據`;
        } catch (err) {
            infoEl.textContent = '解析錯誤：請確認檔案格式';
        }
    };
    reader.readAsText(file);
}

dropZone.addEventListener('click', () => fileInput.click());

fileInput.addEventListener('change', (e) => {
    if (e.target.files.length) {
        handleFile(e.target.files[0]);
    }
});

dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('dragover');
});

dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('dragover');
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('dragover');
    if (e.dataTransfer.files.length) {
        handleFile(e.dataTransfer.files[0]);
    }
});

document.getElementById('sampleCsv').addEventListener('click', () => {
    importedData = parseCsv(sampleCsv);
    draw();
    infoEl.textContent = `載入範例 CSV (${importedData.length} 筆)`;
});

document.getElementById('sampleJson').addEventListener('click', () => {
    importedData = sampleJson.map(d => ({ ...d }));
    draw();
    infoEl.textContent = `載入範例 JSON (${importedData.length} 筆)`;
});

draw();
