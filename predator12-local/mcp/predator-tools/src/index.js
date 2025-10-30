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
const mcp_core_1 = require("mcp-core"); // назва пакету умовна — беріть з вашого SDK
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const server = yield (0, mcp_core_1.createServer)({
            transport: "stdio",
            tools: {
                // 1) Файлова система (обмежуємо корінь)
                readFile: ({ path }) => __awaiter(this, void 0, void 0, function* () { }),
                writeFile: ({ path, content }) => __awaiter(this, void 0, void 0, function* () { }),
                listDir: ({ path }) => __awaiter(this, void 0, void 0, function* () { }),
                // 2) Git
                gitStatus: ({ cwd }) => __awaiter(this, void 0, void 0, function* () { }),
                gitDiff: ({ cwd }) => __awaiter(this, void 0, void 0, function* () { }),
                // 3) HTTP fetch із allow-list
                fetch: ({ url, method, headers, body }) => __awaiter(this, void 0, void 0, function* () { }),
            },
            policy: {
                fsRoot: process.env.PREDATOR_HOME || "/Users/dima/Projects/PredatorAnalytics",
                httpAllowList: ["https://api.github.com", "https://registry.npmjs.org"],
                gitAllowWrite: false, // за замовчуванням RO
            },
            secrets: ["OPENAI_API_KEY", "OPENSEARCH_API_KEY"],
            logging: { level: "info", json: true },
            timeouts: { toolMs: 120000, sessionMs: 7200000 },
        });
        yield server.start();
    });
}
main().catch((e) => {
    console.error("MCP server failed:", e);
    process.exit(1);
});
