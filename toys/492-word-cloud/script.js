const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const textInput = document.getElementById('textInput');
const generateBtn = document.getElementById('generateBtn');
const infoEl = document.getElementById('info');

const defaultText = '數據 視覺化 JavaScript 網頁 設計 創意 程式 藝術 互動 使用者 體驗 前端 開發 數據 視覺化 數據 藝術 創意 設計 網頁 JavaScript 互動';

const colors = ['#e74c3c', '#3498db', '#2ecc71', '#9b59b6', '#f39c12', '#1abc9c', '#e67e22', '#34495e'];

function countWords(text) {
    const words = text.toLowerCase().split(/\s+/).filter(w => w.length > 1);
    const counts = {};
    words.forEach(word => {
        counts[word] = (counts[word] || 0) + 1;
    });
    return Object.entries(counts)
        .map(([word, count]) => ({ word, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 30);
}

function generateWordCloud(text) {
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const wordCounts = countWords(text);
    if (wordCounts.length === 0) {
        ctx.fillStyle = '#999';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('請輸入一些文字', canvas.width / 2, canvas.height / 2);
        return;
    }

    const maxCount = wordCounts[0].count;
    const placedWords = [];

    wordCounts.forEach((item, index) => {
        const fontSize = Math.max(12, Math.min(48, 12 + (item.count / maxCount) * 36));
        ctx.font = `bold ${fontSize}px Arial`;
        const metrics = ctx.measureText(item.word);
        const wordWidth = metrics.width;
        const wordHeight = fontSize;

        // Try to place word
        let placed = false;
        for (let attempt = 0; attempt < 100 && !placed; attempt++) {
            const x = 20 + Math.random() * (canvas.width - wordWidth - 40);
            const y = 30 + Math.random() * (canvas.height - wordHeight - 40);

            // Check overlap
            let overlaps = false;
            for (const pw of placedWords) {
                if (x < pw.x + pw.width + 5 &&
                    x + wordWidth + 5 > pw.x &&
                    y - wordHeight < pw.y &&
                    y > pw.y - pw.height) {
                    overlaps = true;
                    break;
                }
            }

            if (!overlaps) {
                ctx.fillStyle = colors[index % colors.length];
                ctx.fillText(item.word, x, y);
                placedWords.push({ x, y, width: wordWidth, height: wordHeight });
                placed = true;
            }
        }
    });

    infoEl.textContent = `已生成 ${placedWords.length} 個詞彙`;
}

generateBtn.addEventListener('click', () => {
    const text = textInput.value.trim() || defaultText;
    generateWordCloud(text);
});

textInput.value = defaultText;
generateWordCloud(defaultText);
