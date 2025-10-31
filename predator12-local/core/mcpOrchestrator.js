#!/usr/bin/env node
// Simple mock MCP orchestrator — returns JSON risk decision
const argv = require('yargs').argv

function analyze() {
  // if env FORCE_MCP_HIGH=true -> high
  if (process.env.FORCE_MCP_HIGH === '1') {
    return { risk: 'high', confidence: 0.2 }
  }
  // small heuristic: if CHANGED_FILES env contains 'migrations' -> high
  const changes = process.env.CHANGED_FILES || ''
  if (changes.includes('migrations')) {
    return { risk: 'high', confidence: 0.6 }
  }
  return { risk: 'low', confidence: 0.9 }
}

if (argv.analyze) {
  console.log(JSON.stringify(analyze()))
  process.exit(0)
} else {
  console.log(JSON.stringify({ risk: 'low', confidence: 0.9 }))
  process.exit(0)
}
