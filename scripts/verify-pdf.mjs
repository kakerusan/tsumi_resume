// Requires Vite on :5173 and isolated headless Chrome with CDP on :9333.
// Verification artifacts are written to /tmp.
import { writeFileSync } from 'node:fs'
import assert from 'node:assert/strict'
const tabs = await (await fetch('http://127.0.0.1:9333/json')).json()
const ws = new WebSocket(tabs[0].webSocketDebuggerUrl)
await new Promise(resolve => ws.addEventListener('open', resolve, { once: true }))
let id = 0
const pending = new Map()
ws.addEventListener('message', ({ data }) => {
  const message = JSON.parse(data)
  if (message.id) {
    const { resolve, reject } = pending.get(message.id)
    pending.delete(message.id)
    message.error ? reject(message.error) : resolve(message.result)
  }
})
function call(method, params = {}) {
  return new Promise((resolve, reject) => {
    pending.set(++id, { resolve, reject })
    ws.send(JSON.stringify({ id, method, params }))
  })
}
async function evaluate(expression) {
  const result = await call('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true })
  if (result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails))
  return result.result.value
}
try {
  await call('Page.navigate', { url: 'http://127.0.0.1:5173' })
  for (let n = 0; n < 100; n++) {
    if (await evaluate('Boolean(document.querySelector("#app")?.__vue_app__?._instance?.setupState?.resume)')) break
    await new Promise(resolve => setTimeout(resolve, 100))
  }
  await evaluate(`(async () => {
    const {createDemoResume} = await import('/src/modules/resume/templates.js')
    const app = document.querySelector('#app').__vue_app__._instance.setupState
    app.importResumeData(createDemoResume())
    await new Promise(r => setTimeout(r, 300))
    await document.fonts.ready
  })()`)
  for (const variant of ['short', 'long']) {
    if (variant === 'long') await evaluate(`(async () => {
      const app = document.querySelector('#app').__vue_app__._instance.setupState
      const project = JSON.parse(JSON.stringify(app.resume.projects[0]))
      app.resume.projects = Array.from({length: 18}, (_, i) => ({...project, id: 'pdf-' + i, name: 'PDF-PROJECT-' + i, highlights: '验证中文文本与分页。Verification line ' + i + '\\n结果完整保留。END-MARKER-' + i}))
      await new Promise(r => setTimeout(r, 300))
    })()`)
    const pdf = await call('Page.printToPDF', { preferCSSPageSize: true, printBackground: true, displayHeaderFooter: false })
    writeFileSync('/tmp/tsumi-' + variant + '.pdf', Buffer.from(pdf.data, 'base64'))
  }
  const checks = await evaluate(`(async () => {
    const { waitForPrintResources } = await import('/src/modules/resume/pdf.js')
    const root = document.createElement('div')
    const img = document.createElement('img'); img.src = 'data:image/png;base64,broken'; root.append(img)
    let failed = false; try { await waitForPrintResources(root) } catch { failed = true }
    img.remove(); await waitForPrintResources(root)
    let timedOut = false
    try { await waitForPrintResources({querySelectorAll: () => [{ decode: () => new Promise(() => {}) }]}, 10) } catch { timedOut = true }
    return { failed, timedOut }
  })()`)
  assert.deepEqual(checks, { failed: true, timedOut: true })
  console.log('PDF fixtures generated; failed-image, retry and timeout checks passed.')
} finally { ws.close() }
