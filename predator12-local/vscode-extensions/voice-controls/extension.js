const vscode = require('vscode');

/**
 * Activate extension
 */
function activate(context) {
  const disposable = vscode.commands.registerCommand('voiceControls.open', () => {
    const panel = vscode.window.createWebviewPanel(
      'voiceControls',
      'Voice Controls (UA)',
      vscode.ViewColumn.Beside,
      {
        enableScripts: true,
        retainContextWhenHidden: true
      }
    );

    panel.webview.html = getWebviewContent();

    // Handle messages from the webview
    panel.webview.onDidReceiveMessage(async (message) => {
      switch (message.type) {
        case 'insert': {
          const editor = vscode.window.activeTextEditor;
          if (editor) {
            await editor.edit((editBuilder) => {
              editBuilder.insert(editor.selection.active, message.text);
            });
          }
          break;
        }
        case 'getSelection': {
          const editor = vscode.window.activeTextEditor;
          const text = editor ? editor.document.getText(editor.selection) : '';
          panel.webview.postMessage({ type: 'selection', text });
          break;
        }
      }
    });
  });

  context.subscriptions.push(disposable);
}

function deactivate() {}

function escapeHtml(unsafe) {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function getWebviewContent() {
  // A small webview UI that uses browser Speech APIs (TTS/STT)
  return `<!doctype html>
<html lang="uk">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Voice Controls (UA)</title>
  <style>
    body { font-family: var(--vscode-font-family); color: var(--vscode-foreground); background: var(--vscode-editor-background); padding: 12px }
    button { margin-right: 8px }
    #transcript { margin-top: 12px; white-space: pre-wrap }
  </style>
</head>
<body>
  <h3>Voice Controls — українська</h3>
  <div>
    <button id="speakSelection">Програти виділене</button>
    <button id="speakExample">Програти приклад</button>
  </div>

  <div style="margin-top:10px">
    <button id="start">Почати диктування</button>
    <button id="stop" disabled>Зупинити</button>
  </div>

  <div id="status" style="margin-top:10px">Статус: готово</div>
  <div id="transcript"></div>

  <script>
    const vscode = acquireVsCodeApi();

    function isTtsSupported() {
      return typeof window !== 'undefined' && 'speechSynthesis' in window;
    }

    function isSttSupported() {
      return typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition);
    }

    async function speak(text) {
      if (!isTtsSupported()) {
        alert('TTS не підтримується у цьому середовищі');
        return;
      }
      // ensure voices loaded
      const voices = window.speechSynthesis.getVoices();
      if (!voices || voices.length === 0) {
        await new Promise((res) => {
          const h = () => { window.speechSynthesis.removeEventListener('voiceschanged', h); res(); };
          window.speechSynthesis.addEventListener('voiceschanged', h);
          setTimeout(h, 500);
        });
      }

      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = 'uk-UA';
      const uk = (window.speechSynthesis.getVoices() || []).find(v => (v.lang || '').toLowerCase().startsWith('uk'));
      if (uk) utter.voice = uk;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utter);
    }

    let recognition = null;

    document.getElementById('speakSelection').addEventListener('click', () => {
      vscode.postMessage({ type: 'getSelection' });
    });

    document.getElementById('speakExample').addEventListener('click', () => {
      speak('Привіт! Це диктант і синтез мовлення українською.');
    });

    document.getElementById('start').addEventListener('click', () => {
      if (!isSttSupported()) { alert('STT не підтримується у цьому середовищі'); return; }
      recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
      recognition.lang = 'uk-UA';
      recognition.interimResults = true;
      recognition.continuous = false;

      recognition.onstart = () => { document.getElementById('status').textContent = 'Статус: прослуховування...'; document.getElementById('stop').disabled = false; };
      recognition.onresult = (ev) => {
        let interim = '';
        let final = '';
        for (let i = ev.resultIndex; i < ev.results.length; ++i) {
          const r = ev.results[i];
          if (r.isFinal) final += r[0].transcript;
          else interim += r[0].transcript;
        }
        document.getElementById('transcript').textContent = (final || interim) || '';
        if (final) {
          // insert into editor
          vscode.postMessage({ type: 'insert', text: final + '\n' });
        }
      };
      recognition.onerror = (e) => { document.getElementById('status').textContent = 'Статус: помилка: ' + (e.error || e.message || e); };
      recognition.onend = () => { document.getElementById('status').textContent = 'Статус: завершено'; document.getElementById('stop').disabled = true; };
      recognition.start();
    });

    document.getElementById('stop').addEventListener('click', () => {
      if (recognition) try { recognition.stop(); } catch (e) {}
    });

    // Handle messages from extension
    window.addEventListener('message', event => {
      const msg = event.data;
      if (msg.type === 'selection') {
        const txt = msg.text || '';
        if (txt) speak(txt);
        else alert('Немає виділеного тексту в редакторі');
      }
    });
  </script>
</body>
</html>`;
}

module.exports = {
  activate,
  deactivate
};
