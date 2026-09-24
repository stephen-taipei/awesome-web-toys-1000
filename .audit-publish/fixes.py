from pathlib import Path
import re,json
ROOT=Path.cwd()
def file(prefix): return next(ROOT.glob('toys/'+prefix+'*/script.js'))
def change(prefix,old,new):
 p=file(prefix); s=p.read_text(); assert old in s,(prefix,old); p.write_text(s.replace(old,new))
change('113-', '[[1,1],[−1,1],[1,−1],[−1,−1],[1,0],[−1,0],[0,1],[0,−1]]', '[[1,1],[-1,1],[1,-1],[-1,-1],[1,0],[-1,0],[0,1],[0,-1]]')
change('101-', 'for (let i = 0; i < 5; i++) {\n            ctx.beginPath();\n            ctx.ellipse', 'for (let i = 0; i < 5 && width / 2 - i * 8 > 0 && height / 2 - i * 3 > 0; i++) {\n            ctx.beginPath();\n            ctx.ellipse')
change('101-', 'for (let i = 1; i < 4; i++) {\n            ctx.beginPath();\n            ctx.arc(x + width / 2', 'for (let i = 1; i < 4 && height / 2 - i * 3 > 0; i++) {\n            ctx.beginPath();\n            ctx.arc(x + width / 2')
change('483-', "infoEl.textContent = child ? '點擊區塊深入查看' : '已達最底層';", "infoEl.textContent = '點擊區塊深入查看';")
change('483-', "const x = e.clientX - rect.left;\n    const y = e.clientY - rect.top;", "const x = (e.clientX - rect.left) * canvas.width / rect.width;\n    const y = (e.clientY - rect.top) * canvas.height / rect.height;")
p=file('292-'); s=p.read_text().replace('let board = [], current', 'let board = Array.from({ length: rows }, () => Array(cols).fill(0)), current')
s=s.replace('let score = 0, lines = 0, isPlaying', 'let hasStarted = false;\nlet score = 0, lines = 0, isPlaying')
s=s.replace("    switch(e.key) {", "    if (['ArrowLeft', 'ArrowRight', 'ArrowDown', 'ArrowUp'].includes(e.key)) e.preventDefault();\n    switch(e.key) {")
s=s.replace('    spawnPiece();\n    isPlaying = true;', '    hasStarted = true;\n    isPlaying = true;\n    spawnPiece();\n    draw();')
s=s.replace('function canMove(dx, dy, piece = current) {', 'function canMove(dx, dy, piece = current) {\n    if (!piece) return false;')
for name,args in [('move','dx'),('rotate',''),('drop','')]:
 s=s.replace(f'function {name}({args}) {{',f'function {name}({args}) {{\n    if (!isPlaying || !current) return;')
s=s.replace('    isPlaying = false;\n}', '    isPlaying = false;\n    current = null;\n    draw();\n}')
s=s.replace('if (!isPlaying && score > 0)', 'if (!isPlaying && hasStarted)')
s += "\nwindow.addEventListener('pagehide', endGame);\n"
p.write_text(s)
p=file('019-'); s=p.read_text(); start=s.index('// ==================== WebGL 設定')
s=s[:start]+"(function () {\n'use strict';\n\n"+s[start:]+"\n})();\n"
s=s.replace("if (!gl) {\n    alert('您的瀏覽器不支援 WebGL，請使用現代瀏覽器');\n}", """function showGraphicsError(message) {
    const notice = document.createElement('p');
    notice.setAttribute('role', 'status');
    notice.textContent = message;
    const controls = document.querySelector('.controls') || document.body;
    controls.prepend(notice);
    controls.querySelectorAll('input, select, button').forEach(control => { control.disabled = true; });
}

if (!gl) {
    showGraphicsError('目前無法使用 WebGL，請確認瀏覽器與硬體加速設定後重新載入。');
    return;
}""")
s=s.replace("        console.error('程式連結失敗:', gl.getProgramInfoLog(program));\n        return null;", "        console.error('程式連結失敗:', gl.getProgramInfoLog(program));\n        gl.deleteProgram(program);\n        return null;")
s=s.replace('const program = createProgram(gl, vertexShader, fragmentShader);', """if (!vertexShader || !fragmentShader) {
    if (vertexShader) gl.deleteShader(vertexShader);
    if (fragmentShader) gl.deleteShader(fragmentShader);
    showGraphicsError('圖形著色器無法編譯，請更新瀏覽器或圖形驅動程式後重試。');
    return;
}
const program = createProgram(gl, vertexShader, fragmentShader);
gl.deleteShader(vertexShader);
gl.deleteShader(fragmentShader);
if (!program) {
    showGraphicsError('圖形程式初始化失敗，請更新瀏覽器後重試。');
    return;
}""")
p.write_text(s)
label_counts={}
pattern=re.compile(r'<label>([^<]*(?:<span\b[^>]*>.*?</span>[^<]*)*)</label>(\s*<(?:input|select|textarea)\b[^>]*\bid=[\"\']([^\"\']+)[\"\'])',re.S)
for p in sorted(ROOT.glob('toys/*/index.html')):
 s=p.read_text(); s,n=pattern.subn(lambda m:f'<label for="{m[3]}">{m[1]}</label>{m[2]}',s)
 if n: p.write_text(s); label_counts[str(p.relative_to(ROOT))]=n
print('Label associations',sum(label_counts.values()),'pages',len(label_counts))
p=ROOT/'index.html'; s=p.read_text(); assert 'href="/llms.txt"' in s; p.write_text(s.replace('href="/llms.txt"','href="llms.txt"'))
