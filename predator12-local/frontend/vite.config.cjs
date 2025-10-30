// Compatibility wrapper: export CommonJS config when package.json uses "type": "module"
// This file makes Vite load the existing transpiled config without changing project settings.
try {
    const cfg = require('./vite.config.js');
    module.exports = cfg && cfg.__esModule && cfg.default ? cfg.default : cfg;
} catch (err) {
    // Fallback: rethrow with context
    console.error('Failed to load ./vite.config.js from vite.config.cjs:', err);
    throw err;
}
