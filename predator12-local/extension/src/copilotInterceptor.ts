// Lightweight copilot interceptor stub — optional hook for suggestions/autopatch review
import fs from 'fs'

export function captureSuggestion(runId: string, suggestion: string) {
  const dir = process.env.STATE_DIR || './manifests/.autodeploy'
  const p = `${dir}/suggestions.log`
  fs.mkdirSync(dir, { recursive: true })
  fs.appendFileSync(p, JSON.stringify({ runId, suggestion, ts: new Date().toISOString() }) + '\n')
}
