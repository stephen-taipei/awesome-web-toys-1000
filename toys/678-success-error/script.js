const statusDisplay = document.getElementById('statusDisplay');
const statusText = document.getElementById('statusText');

document.getElementById('successBtn').addEventListener('click', () => {
    statusDisplay.classList.remove('error');
    statusDisplay.classList.add('success');
    statusText.textContent = '操作成功！';
});

document.getElementById('errorBtn').addEventListener('click', () => {
    statusDisplay.classList.remove('success');
    statusDisplay.classList.add('error');
    statusText.textContent = '操作失敗！';
});

document.getElementById('resetBtn').addEventListener('click', () => {
    statusDisplay.classList.remove('success', 'error');
    statusText.textContent = '點擊按鈕';
});
