#!/usr/bin/env ts-node
import express from 'express'
import axios from 'axios'
import { execSync } from 'child_process'

const app = express()

app.get('/verify', async (req, res) => {
  const runId = req.query.runId || 'unknown'
  try {
    const prom = process.env.PROM_URL || 'http://prometheus-server.monitoring.svc.cluster.local/api/v1/query'
    const q1 = 'sum(rate(http_requests_total{job="predator-analytics",status=~"5.."}[2m])) / sum(rate(http_requests_total{job="predator-analytics"}[2m]))'
    const r1 = await axios.get(prom, { params: { query: q1 } })
    const errRate = r1.data.data.result?.[0]?.value?.[1] || 0
    const q2 = 'histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket{job="predator-frontend"}[2m])) by (le))'
    const r2 = await axios.get(prom, { params: { query: q2 } })
    const p95 = r2.data.data.result?.[0]?.value?.[1] || 0
    const q3 = 'avg_over_time(up{job="predator-analytics"}[2m])'
    const r3 = await axios.get(prom, { params: { query: q3 } })
    const uptime = r3.data.data.result?.[0]?.value?.[1] || 1

    try { execSync('curl -fsS http://predator-frontend.default.svc.cluster.local/health -m 5') } catch (e) { return res.json({ status: 'fail', reason: 'smoke failed', runId }) }

    if (parseFloat(errRate) < 0.005 && parseFloat(p95) < 0.300 && parseFloat(uptime) > 0.995) {
      return res.json({ status: 'ok', runId, metrics: { errRate, p95, uptime } })
    } else {
      return res.json({ status: 'fail', runId, metrics: { errRate, p95, uptime } })
    }
  } catch (e) {
    return res.json({ status: 'error', msg: e.toString(), runId })
  }
})

app.listen(5002, () => console.log('verify service listening on 5002'))
