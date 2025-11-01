# Predator MCP Server Setup

This directory contains the necessary files to set up a local MCP server for use with Cline in VS Code.

## 1. VS Code Configuration

To connect Cline to this MCP server, you need to add the following configuration to your VS Code settings. You can typically do this by opening your `settings.json` file or by searching for "MCP Servers" in the Cline extension settings.

**Copy the content from `mcp/predator-tools/vscode-mcp-config.json` and add it to your VS Code settings.**

The content of `mcp/predator-tools/vscode-mcp-config.json` is:
```json
{
  "mcpServers": {
    "predator-tools": {
      "command": "ts-node",
      "args": [
        "src/index.ts"
      ],
      "transport": "stdio",
      "env": {
        "PREDATOR_HOME": "/Users/dima/Projects/PredatorAnalytics",
        "OPENAI_API_KEY": "${env:OPENAI_API_KEY}",
        "OPENSEARCH_API_KEY": "${env:OPENSEARCH_API_KEY}"
      },
      "timeoutMs": 120000
    }
  }
}
```

**Important Notes:**
*   Ensure the `command` (`ts-node`) and `args` (`src/index.ts`) are correct for your environment.
*   The `PREDATOR_HOME` environment variable should point to your main project directory.
*   `OPENAI_API_KEY` and `OPENSEARCH_API_KEY` should be set in your system's environment variables or VS Code's secrets.

## 2. Running the Server (Development)

For development, you can run the server directly using `ts-node`:

1.  Navigate to the `mcp/predator-tools` directory in your terminal.
2.  Run: `ts-node src/index.ts`

This will start the MCP server, which Cline will then connect to.

## 3. Troubleshooting

If you encounter issues with the connection, please refer to the troubleshooting steps in the main task documentation or check the Cline agent logs for specific error messages.
