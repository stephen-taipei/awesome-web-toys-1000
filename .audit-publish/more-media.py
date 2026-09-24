from pathlib import Path
import re
ROOT=Path.cwd()
for prefix in ['201-','203-','204-','205-','207-','208-','209-']:
 p=next(ROOT.glob('toys/'+prefix+'*/script.js'));s=p.read_text()
 s="let microphoneRequest = 0;\nlet microphoneStarting = false;\n"+s
 old='            micStream = await navigator.mediaDevices.getUserMedia({ audio: true });' if prefix in ['201-','207-'] else '        micStream = await navigator.mediaDevices.getUserMedia({ audio: true });'
 assert old in s,p
 indent=' '*(len(old)-len(old.lstrip()))
 s=s.replace(old,indent+"if (!navigator.mediaDevices?.getUserMedia) throw new Error('Microphone API unavailable');\n"+indent+"const stream = await navigator.mediaDevices.getUserMedia({ audio: true });\n"+indent+"if (request !== microphoneRequest) {\n"+indent+"    stream.getTracks().forEach(track => track.stop());\n"+indent+"    return;\n"+indent+"}\n"+indent+"micStream = stream;")
 name='toggleMicrophone' if prefix in ['201-','207-'] else 'startMicrophone'
 s=s.replace(f'async function {name}() {{',f'async function {name}() {{\n    if (microphoneStarting) return;')
 if prefix=='201-':
  s=s.replace("async function toggleMicrophone() {\n    if (microphoneStarting) return;\n    initAudio();", "async function toggleMicrophone() {\n    if (microphoneStarting) return;")
 if prefix in ['201-','207-']:
  start=s.index('async function toggleMicrophone()');end=s.index('\n}',start)+2
  block=s[start:end]
  block=block.replace('    if (isMicActive) {','    if (isMicActive) {\n        releaseMicrophone();')
  block=block.replace('        try {',"        const request = ++microphoneRequest;\n        microphoneStarting = true;\n        btn.disabled = true;\n        btn.setAttribute('aria-busy', 'true');\n        try {"+("\n            initAudio();\n            analyser.disconnect();" if prefix=='201-' else ''))
  block=re.sub(r"            alert\([^\n]*\);", "            if (request !== microphoneRequest) return;\n            releaseMicrophone();\n            btn.title = '請確認 HTTPS、麥克風裝置與使用權限後重試。';\n            console.warn('Microphone unavailable:', err.message);",block)
  marker='        }\n    }\n}'
  assert block.endswith(marker),prefix
  block=block[:-len(marker)]+"""        } finally {
            if (request === microphoneRequest) {
                microphoneStarting = false;
                btn.disabled = false;
                btn.removeAttribute('aria-busy');
            }
        }
    }
}"""
  s=s[:start]+block+s[end:]
  if prefix=='201-':
   s=s.replace('function toggleTone() {','function toggleTone() {\n    if (microphoneStarting) releaseMicrophone();')
 else:
  s=s.replace('function setMode(newMode) {',"function setMode(newMode) {\n    if (newMode !== 'mic') releaseMicrophone();")
  s=s.replace('async function startMicrophone() {\n    if (microphoneStarting) return;',"""async function startMicrophone() {
    if (microphoneStarting || micStream) return;
    const request = ++microphoneRequest;
    const button = document.getElementById('micBtn');
    microphoneStarting = true;
    button.disabled = true;
    button.setAttribute('aria-busy', 'true');""")
  if prefix=='208-':
   s=s.replace("    setupAudio();\n\n    try {\n        if (!navigator.mediaDevices", "    try {\n        setupAudio();\n        // Do not route live microphone input back to the speakers.\n        analyser.disconnect();\n        if (!navigator.mediaDevices")
  s=s.replace("        alert('無法存取麥克風');", "        if (request !== microphoneRequest) return;\n        releaseMicrophone();\n        button.title = '請確認 HTTPS、麥克風裝置與使用權限後重試。';\n        console.warn('Microphone unavailable:', err.message);")
  mode='tone' if prefix=='208-' else 'demo'
  old="        setMode('"+mode+"');\n    }\n}"
  assert old in s,p
  s=s.replace(old,"        setMode('"+mode+"');\n"+"""    } finally {
        if (request === microphoneRequest) {
            microphoneStarting = false;
            button.disabled = false;
            button.removeAttribute('aria-busy');
        }
    }
}""")
 cleanup="""
// A mode change invalidates pending permission results as well as active capture.
function releaseMicrophone() {
    microphoneRequest++;
    microphoneStarting = false;
    if (micStream) {
        micStream.getTracks().forEach(track => track.stop());
        micStream = null;
    }
    if (source) { source.disconnect(); source = null; }
    const button = document.getElementById('micBtn');
    button.disabled = false;
    button.removeAttribute('aria-busy');
}

window.addEventListener('pagehide', () => {
    releaseMicrophone();
"""
 if prefix in ['201-','207-']: cleanup+='    isMicActive = false;\n'
 if prefix in ['201-','208-']: cleanup+="    if (oscillator) { oscillator.stop(); oscillator = null; }\n"
 if prefix=='201-':cleanup+='    isPlaying = false;\n'
 cleanup+="""    const previousContext = audioContext;
    audioContext = null;
    analyser = null;
    if (previousContext && previousContext.state !== 'closed') {
        previousContext.close().catch(error => console.warn('Audio cleanup:', error.message));
    }
});
"""
 s+=cleanup;p.write_text(s)
 print('fixed',p.relative_to(ROOT))
