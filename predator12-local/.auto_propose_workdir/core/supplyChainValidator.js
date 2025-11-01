#!/usr/bin/env node
// Simple supply-chain validator mock — placeholder for Trivy/Cosign integration
const fs = require('fs')

function validate() {
  // naive: if package lists contain 'vulnerable-lib' => return findings
  const files = ['requirements.txt', 'package.json']
  const findings = []
  files.forEach((f) => {
    if (fs.existsSync(f)) {
      const c = fs.readFileSync(f, 'utf8')
      if (c.includes('vulnerable-lib')) {
        findings.push({ file: f, vuln: 'vulnerable-lib', severity: 'CRITICAL' })
      }
    }
  })
  return findings
}

const result = validate()
console.log(JSON.stringify({ findings: result }))
process.exit(result.length > 0 ? 2 : 0)
