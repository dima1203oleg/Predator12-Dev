// Mock type definitions for mcp-core to resolve TypeScript errors.
// This assumes mcp-core is an ES module.

// Define types for the tools
interface FileSystemTools {
  readFile: (params: { path: string }) => Promise<string>;
  writeFile: (params: { path: string; content: string }) => Promise<void>;
  listDir: (params: { path: string }) => Promise<string[]>;
}

interface GitTools {
  gitStatus: (params: { cwd: string }) => Promise<string>;
  gitDiff: (params: { cwd: string }) => Promise<string>;
}

interface HttpFetchTools {
  fetch: (params: { url: string; method?: string; headers?: Record<string, string>; body?: any }) => Promise<any>; // Simplified return type
}

type AllTools = FileSystemTools & GitTools & HttpFetchTools; // Extend as needed

// Define policy types
interface Policy {
  fsRoot: string;
  httpAllowList: string[];
  gitAllowWrite: boolean;
}

// Define server options type
interface ServerOptions {
  transport: "stdio" | "websocket";
  tools: AllTools;
  policy: Policy;
  secrets: string[];
  logging: { level: string; json: boolean };
  timeouts: { toolMs: number; sessionMs: number };
}

// Define the Server type
interface Server {
  start: () => Promise<void>;
}

// Mock createServer function signature
declare function createServer(options: ServerOptions): Promise<Server>;

// Export the mock createServer function
export { createServer };
