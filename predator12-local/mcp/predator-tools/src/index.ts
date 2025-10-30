import { exec } from "child_process";
import { promises as fs } from "fs";
import { createServer } from "mcp-core";
import path from "path";
import { promisify } from "util";

const execAsync = promisify(exec);

// Helper function to secure file paths against directory traversal
function getSafePath(fsRoot: string, userPath: string): string {
  const resolvedPath = path.resolve(fsRoot, userPath);
  if (!resolvedPath.startsWith(fsRoot)) {
    throw new Error("Forbidden: Path is outside the allowed root directory.");
  }
  return resolvedPath;
}

async function main() {
  // The server instance holds policies and other configurations
  const server = await createServer({
    transport: "stdio",
    tools: {
      // 1) Filesystem Tools (with security checks)
      readFile: async ({ path: userPath }) => {
        const safePath = getSafePath(server.policy.fsRoot, userPath);
        return await fs.readFile(safePath, "utf-8");
      },
      writeFile: async ({ path: userPath, content }) => {
        if (server.policy.readOnly) {
            throw new Error("Forbidden: Write operations are disabled in read-only mode.");
        }
        const safePath = getSafePath(server.policy.fsRoot, userPath);
        await fs.writeFile(safePath, content, "utf-8");
        return { success: true, path: safePath };
      },
      listDir: async ({ path: userPath }) => {
        const safePath = getSafePath(server.policy.fsRoot, userPath || ".");
        const entries = await fs.readdir(safePath, { withFileTypes: true });
        return entries.map(entry => ({
          name: entry.name,
          isDirectory: entry.isDirectory(),
        }));
      },

      // 2) Git Tools (read-only by default)
      gitStatus: async ({ cwd }) => {
        const safeCwd = getSafePath(server.policy.fsRoot, cwd || "");
        const { stdout, stderr } = await execAsync("git status --porcelain", { cwd: safeCwd });
        if (stderr) throw new Error(stderr);
        return stdout;
      },
      gitDiff: async ({ cwd }) => {
        const safeCwd = getSafePath(server.policy.fsRoot, cwd || "");
        const { stdout, stderr } = await execAsync("git diff", { cwd: safeCwd });
        if (stderr) throw new Error(stderr);
        return stdout;
      },

      // 3) HTTP Fetch with Allow-List
      fetch: async ({ url, method, headers, body }) => {
        const parsedUrl = new URL(url);
        const allowed = server.policy.httpAllowList.some(domain => parsedUrl.hostname === domain || parsedUrl.hostname.endsWith('.' + domain));

        if (!allowed) {
            throw new Error(`Forbidden: Domain ${parsedUrl.hostname} is not in the allow-list.`);
        }

        const response = await fetch(url, { method, headers, body: body ? JSON.stringify(body) : undefined });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status} ${response.statusText}`);
        }

        // Handle different content types, default to JSON
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
            return await response.json();
        }
        return await response.text();
      },

      // 4) Code Fixer Tool
      runFixer: async ({ script }) => {
        if (!server.policy.shellAllowList.includes(script)) {
          throw new Error(`Forbidden: The script '${script}' is not in the allow-list.`);
        }
        const safeCwd = getSafePath(server.policy.fsRoot, "");
        const { stdout, stderr } = await execAsync(`npm run ${script}`, { cwd: safeCwd });
        if (stderr && !stderr.startsWith("npm WARN")) { // Ignore npm warnings
            throw new Error(stderr);
        }
        return stdout || "Command executed successfully.";
      },
    },
    policy: {
      fsRoot: process.env.PREDATOR_HOME || "/Users/dima/Projects/PredatorAnalytics",
      httpAllowList: ["api.github.com", "registry.npmjs.org"],
      readOnly: false, // Set to false to allow writeFile, simulating 'Editor' role
      shellAllowList: ["lint:fix", "format"], // Only allow these npm scripts to be run
    },
    secrets: ["OPENAI_API_KEY", "OPENSEARCH_API_KEY"],
    logging: { level: "info", json: true },
    timeouts: { toolMs: 120000, sessionMs: 7200000 },
  });

  await server.start();
}

main().catch((e) => {
  console.error("MCP server failed:", e);
  process.exit(1);
});
