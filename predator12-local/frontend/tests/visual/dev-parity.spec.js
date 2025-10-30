"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const test_1 = require("@playwright/test");
const routes = [
    { name: 'bridge-overview', path: '/' },
    { name: 'orbital-node', path: '/orbital' },
    { name: 'etl-factory', path: '/etl' },
    { name: 'chrono-4d', path: '/chrono' },
    { name: 'reality-sim', path: '/simulator' },
    { name: 'analytics-deck', path: '/analytics' },
    { name: 'ai-self-improve', path: '/self-improve' },
    { name: 'agents-panel', path: '/agents' }
];
test_1.test.describe('DEV parity visual tests', () => {
    for (const route of routes) {
        (0, test_1.test)(`page-${route.name} matches snapshot`, ({ page }) => __awaiter(void 0, void 0, void 0, function* () {
            yield page.goto(route.path);
            yield page.waitForTimeout(1000);
            const screenshot = yield page.screenshot({ fullPage: true });
            (0, test_1.expect)(screenshot).toMatchSnapshot(`${route.name}.png`, { maxDiffPixels: Math.floor(0.01 * 1440 * 900) });
        }));
    }
});
