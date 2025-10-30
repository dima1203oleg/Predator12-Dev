"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const test_1 = require("@playwright/test");
exports.default = (0, test_1.defineConfig)({
    testDir: './tests',
    timeout: 60000,
    expect: { timeout: 10000 },
    reporter: [['list']],
    use: {
        baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:5173',
        trace: 'off'
    },
    projects: [
        { name: 'chromium-lg', use: Object.assign(Object.assign({}, test_1.devices['Desktop Chrome']), { viewport: { width: 1440, height: 900 } }) },
        { name: 'chromium-md', use: Object.assign(Object.assign({}, test_1.devices['Desktop Chrome']), { viewport: { width: 1024, height: 768 } }) },
        { name: 'chromium-sm', use: Object.assign(Object.assign({}, test_1.devices['Desktop Chrome']), { viewport: { width: 390, height: 844 } }) }
    ]
});
