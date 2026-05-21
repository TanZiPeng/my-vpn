import express from 'express'
import multer from 'multer'
import { readFileSync, writeFileSync, existsSync, mkdirSync, unlinkSync, readdirSync, statSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = 3001
const UPLOAD_DIR = join(__dirname, 'dev-uploads')

if (!existsSync(UPLOAD_DIR)) mkdirSync(UPLOAD_DIR, { recursive: true })

const upload = multer({ dest: UPLOAD_DIR })
const ORDER_FILE = join(__dirname, 'dev-uploads', '.order.json')

function loadOrder() {
  if (existsSync(ORDER_FILE)) {
    try { return JSON.parse(readFileSync(ORDER_FILE, 'utf-8')) } catch { /* ignore */ }
  }
  return []
}

function saveOrder(names) {
  writeFileSync(ORDER_FILE, JSON.stringify(names), 'utf-8')
}

app.use(express.json())

app.get('/api/configs', (req, res) => {
  const files = readdirSync(UPLOAD_DIR).filter(f => f.endsWith('.yml') || f.endsWith('.yaml'))
  const configs = files.map(name => {
    const filePath = join(UPLOAD_DIR, name)
    const stat = statSync(filePath)
    return {
      name,
      size: stat.size,
      uploadedAt: stat.mtime.toISOString()
    }
  })
  const order = loadOrder()
  configs.sort((a, b) => {
    const ia = order.indexOf(a.name)
    const ib = order.indexOf(b.name)
    if (ia === -1 && ib === -1) return new Date(b.uploadedAt) - new Date(a.uploadedAt)
    if (ia === -1) return 1
    if (ib === -1) return -1
    return ia - ib
  })
  res.json(configs)
})

app.put('/api/order', (req, res) => {
  const { names } = req.body
  if (!Array.isArray(names)) return res.status(400).json({ error: 'names required' })
  saveOrder(names)
  res.json({ ok: true })
})

app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file' })
  const name = req.file.originalname
  const dest = join(UPLOAD_DIR, name)
  const src = req.file.path
  const content = readFileSync(src)
  writeFileSync(dest, content)
  unlinkSync(src)
  res.json({ ok: true, name })
})

app.get('/api/download/:name', (req, res) => {
  const name = req.params.name
  const filePath = join(UPLOAD_DIR, name)
  if (!existsSync(filePath)) return res.status(404).send('Not found')
  res.setHeader('Content-Type', 'application/x-yaml; charset=utf-8')
  res.setHeader('Content-Disposition', `attachment; filename="${name}"`)
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.send(readFileSync(filePath))
})

app.delete('/api/configs/:name', (req, res) => {
  const name = req.params.name
  const filePath = join(UPLOAD_DIR, name)
  if (existsSync(filePath)) unlinkSync(filePath)
  res.json({ ok: true })
})

app.listen(PORT, () => {
  console.log(`Dev API server running at http://localhost:${PORT}`)
})
