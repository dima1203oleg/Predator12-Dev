import fs from 'fs'
import path from 'path'

const STATE_DIR = process.env.STATE_DIR || './manifests/.autodeploy'
const RETENTION_DAYS = 90

export function ensureStateDir() {
  if (!fs.existsSync(STATE_DIR)) fs.mkdirSync(STATE_DIR, { recursive: true })
}

export function appendRun(run: Record<string, any>) {
  ensureStateDir()
  const p = path.join(STATE_DIR, 'runs.log')
  fs.appendFileSync(p, JSON.stringify(run) + '\n')
}

export function redactSecrets(obj: any): any {
  const s = JSON.stringify(obj)
  return JSON.parse(s.replace(/(password|secret|token)\":\"[^\"]+/gi, '$1":"[REDACTED]'))
}

export function listRuns() {
  ensureStateDir()
  const p = path.join(STATE_DIR, 'runs.log')
  if (!fs.existsSync(p)) return []
  return fs.readFileSync(p, 'utf8').split(/\n/).filter(Boolean).map(l => {
    try { return JSON.parse(l) } catch (e) { return { raw: l } }
  })
}
