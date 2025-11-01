# Voice Controls (UA) — VS Code extension

This lightweight extension opens a Webview panel that exposes simple TTS and STT controls using the browser Web Speech API. It defaults to Ukrainian locale (`uk-UA`).

How to use

- Open this workspace in VS Code.
- Open the Debug view and run "Launch Extension" (Run Extension) to start a new Extension Development Host window.
- In the new window run the command palette and execute `Voice Controls: Open`.
- Use the panel to play selected text (TTS) or start dictation (STT). Recognized final results are inserted into the active editor.

Notes

- STT relies on browser `SpeechRecognition` - available in Chromium-based editors and may be prefixed (`webkitSpeechRecognition`). The extension uses the WebView context which has access to browser APIs.
- TTS uses `speechSynthesis` and attempts to pick a Ukrainian voice if available on the OS.
