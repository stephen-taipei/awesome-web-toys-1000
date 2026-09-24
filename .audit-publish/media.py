from pathlib import Path
import re
ROOT=Path.cwd()

def span(s,name):
 m=re.search(r'(?:async )?function '+name+r'\([^\n]*\) \{',s)
 assert m,name
 end=s.index('\n}',m.end())+2
 return m.start(),end,s[m.start():end]

def replace(s,name,body):
 a,b,_=span(s,name); return s[:a]+body+s[b:]

for prefix in ['030-','062-','064-','065-','066-','141-','143-','144-','145-','146-','147-','148-','149-','187-','494-']:
 p=next(ROOT.glob('toys/'+prefix+'*/script.js')); s=p.read_text()
 is_simple=prefix in ['141-','143-','144-','145-','146-','147-','148-','149-']
 context='audioCtx' if prefix=='187-' else 'audioContext'
 running='isRecording' if prefix=='187-' else 'isAudioActive' if prefix=='030-' else 'isRunning'
 button_id='micBtn' if prefix=='030-' else 'startBtn'
 start='startAudio' if prefix=='141-' else 'startMicrophone' if is_simple else 'initAudio' if prefix=='030-' else 'startRecording' if prefix=='187-' else 'startAudio'
 stop='stopMicrophone' if is_simple else 'stopRecording' if prefix=='187-' else 'stopAudio'
 _,_,original=span(s,start)
 body=original.split('    try {\n',1)[1].split('    } catch',1)[0]
 old="        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });"
 assert old in body,p
 body=body.replace(old,old+"""
        // A permission prompt may resolve after stop, demo mode, or pagehide.
        if (request !== microphoneRequest) {
            stream.getTracks().forEach(track => track.stop());
            return false;
        }
        microphoneStream = stream;""")
 if is_simple:
  body=body.replace(".textContent = '運行中';", ".textContent = '停止麥克風';").replace(".textContent = '偵測中';", ".textContent = '停止麥克風';")
 fallback=""
 if prefix=='494-':
  fallback="""        simulationMode = true;
        dataArray = new Uint8Array(128);
        infoEl.textContent = '模擬模式 (無法使用麥克風)';
"""
 else:
  fallback="""        button.textContent = '重試麥克風';
        button.title = '請使用 HTTPS，確認裝置與麥克風權限後重試。';
"""
  if prefix=='030-':
   fallback=fallback.replace("button.textContent = '重試麥克風';", "document.querySelector('.mic-text').textContent = '重試麥克風';")
  if prefix in ['062-','064-','065-','066-']:
   fallback+="        document.getElementById('statusDisplay').textContent = '無法使用麥克風，可重試';\n"
  if prefix=='187-': fallback+='        return false;\n'
 guard=f'    if (microphoneStarting || {running}) return false;\n'
 if is_simple:
  guard="    if (microphoneStarting) return false;\n    if (audioContext) { stopMicrophone(); return false; }\n"
 fixed=f"""async function {start}() {{
{guard}    const request = ++microphoneRequest;
    const button = document.getElementById('{button_id}');
    microphoneStarting = true;
    button.disabled = true;
    button.setAttribute('aria-busy', 'true');
    button.removeAttribute('title');
    try {{
        if (!navigator.mediaDevices?.getUserMedia) throw new Error('Microphone API unavailable');
{body}    }} catch (error) {{
        if (request !== microphoneRequest) return false;
        {stop}();
        console.warn('Microphone unavailable:', error.message);
{fallback}    }} finally {{
        if (request === microphoneRequest) {{
            microphoneStarting = false;
            button.disabled = false;
            button.removeAttribute('aria-busy');
        }}
    }}"""
 if prefix=='494-':
  fixed+="""
    isRunning = true;
    startBtn.textContent = '停止';
    startBtn.classList.add('active');
    draw();"""
 fixed+='\n}'
 s=replace(s,start,fixed)
 declaration=re.search(r'let '+context+r'(?: = null)?;',s)
 assert declaration,p
 s=s[:declaration.end()]+"""
let microphoneStream = null;
let microphoneStarting = false;
let microphoneRequest = 0;
"""+s[declaration.end():]
 has_source=bool(re.search(r'let microphone = null;',s))
 helper=f"""
// Release the capture tracks, not only the Web Audio graph.
function releaseMicrophone() {{
    microphoneRequest++;
    microphoneStarting = false;
    {running} = false;
    if (microphoneStream) {{
        microphoneStream.getTracks().forEach(track => track.stop());
        microphoneStream = null;
    }}
"""
 if has_source:
  helper+="    if (microphone) { microphone.disconnect(); microphone = null; }\n"
 helper+=f"""    const previousContext = {context};
    {context} = null;
    analyser = null;
    if (previousContext && previousContext.state !== 'closed') {{
        previousContext.close().catch(error => console.warn('Audio cleanup:', error.message));
    }}
    const button = document.getElementById('{button_id}');
    button.disabled = false;
    button.removeAttribute('aria-busy');
}}
"""
 if prefix=='030-':
  stopbody="""function stopAudio() {
    releaseMicrophone();
    volumeLevel = bassLevel = midLevel = highLevel = 0;
    frequencyData.fill(0);
    document.getElementById('micBtn').classList.remove('active');
    document.querySelector('.mic-text').textContent = '啟動麥克風';
}"""
  s=replace(s,'toggleAudio',"""function toggleAudio() {
    if (isAudioActive || microphoneStarting) stopAudio();
    else initAudio();
}""")
  s+='\n'+stopbody+'\n'
 elif is_simple:
  demo=""
  if 'let isDemoMode = false;' in s:
   demo="    isDemoMode = false;\n    document.getElementById('demoBtn').textContent = '演示模式';\n"
   s=s.replace('function startDemo() {','function startDemo() {\n    stopMicrophone();')
  stopbody=f"""function stopMicrophone() {{
    releaseMicrophone();
{demo}    document.getElementById('startBtn').textContent = '開始麥克風';
}}"""
  s+='\n'+stopbody+'\n'
 elif prefix=='187-':
  s=replace(s,stop,"""function stopRecording() {
    releaseMicrophone();
    const button = document.getElementById('startBtn');
    button.textContent = '開始錄音';
    button.classList.remove('recording');
    const status = document.getElementById('micStatus');
    status.classList.remove('active');
    status.querySelector('.status-text').textContent = '點擊開始錄音';
}""")
 elif prefix=='494-':
  s=s.replace('let simulationMode = false;','let simulationMode = false;\nlet animationFrame = null;')
  s=s.replace('requestAnimationFrame(draw);','animationFrame = requestAnimationFrame(draw);')
  s=replace(s,stop,"""function stopAudio() {
    releaseMicrophone();
    if (animationFrame !== null) cancelAnimationFrame(animationFrame);
    animationFrame = null;
    startBtn.textContent = '開啟麥克風';
    startBtn.classList.remove('active');
    infoEl.textContent = '已停止';
}""")
 else:
  _,_,oldstop=span(s,stop)
  ui=oldstop[oldstop.index("    document.getElementById('statusDisplay')"):]
  s=replace(s,stop,'function stopAudio() {\n    releaseMicrophone();\n'+ui)
 if prefix=='148-':
  for name in ['currentLevel','smoothedLevel','peakLevel','avgLevel']:
   s=s.replace(f'let {name} = 0;',f'let {name} = -60;')
 s+='\n'+helper+f"\nwindow.addEventListener('pagehide', {stop});\n"
 p.write_text(s)
 print('fixed',p.relative_to(ROOT))
