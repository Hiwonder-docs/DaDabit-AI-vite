import { createHash } from 'node:crypto'
import { cp, mkdir, readFile, readdir, rm, stat, writeFile } from 'node:fs/promises'
import { dirname, extname, join, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

// Package already-built projects, keeping source files out of the Pages artifact.
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const output = join(root, '.pages-dist')
const versions = ['latest', 'starter-kit', 'standard-kit', 'advanced-kit']
const sitePath = 'projects/daabit-ai/en'
const mediaExtensions = new Set(['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.mp4', '.webm', '.ico'])
const textExtensions = new Set(['.html', '.js', '.css', '.json', '.xml', '.txt'])
const basePath = (process.env.PAGES_BASE_PATH || '').replace(/\/$/, '')
if (basePath && !/^\/[A-Za-z0-9_.\/-]+$/.test(basePath)) {
  throw new Error('PAGES_BASE_PATH must be an absolute URL path, such as /DaDabit-AI-vite')
}

async function listFiles(directory) {
  const files = []
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name)
    if (entry.isSymbolicLink()) throw new Error(`Symlink cannot be published: ${path}`)
    if (entry.isDirectory()) files.push(...await listFiles(path))
    else if (entry.isFile()) files.push(path)
  }
  return files
}

const files = []
for (const version of versions) {
  await stat(join(root, sitePath, version, 'index.html'))
  files.push(...await listFiles(join(root, sitePath, version)))
}
files.push(join(root, 'index.html'), join(root, '.nojekyll'))
try { await stat(join(root, 'CNAME')); files.push(join(root, 'CNAME')) } catch (error) {
  if (error.code !== 'ENOENT') throw error
}

const groups = new Map()
let originalBytes = 0
for (const file of files) {
  const size = (await stat(file)).size
  originalBytes += size
  const path = relative(root, file).split(sep).join('/')
  if (!mediaExtensions.has(extname(file).toLowerCase())) continue
  const match = path.match(/^projects\/daabit-ai\/en\/[^/]+\/assets\/(.+)$/)
  if (!match) continue
  const key = `${match[1]}:${size}`
  if (!groups.has(key)) groups.set(key, [])
  groups.get(key).push({ file, path, asset: match[1] })
}

const shared = new Map()
const replacements = new Map()
for (const entries of groups.values()) {
  if (entries.length < 2) continue
  const hashes = await Promise.all(entries.map(async ({ file }) =>
    createHash('sha256').update(await readFile(file)).digest('hex')))
  if (!hashes.every(hash => hash === hashes[0])) continue
  const target = `${sitePath}/shared-assets/${entries[0].asset}`
  if (shared.has(target)) throw new Error(`Shared media collision: ${target}`)
  shared.set(target, entries[0].file)
  for (const entry of entries) replacements.set('/' + entry.path, '/' + target)
}

// Only this generated staging directory may be removed. Source and projects stay intact.
if (resolve(output) !== resolve(root, '.pages-dist')) throw new Error('Invalid output directory')
await rm(output, { recursive: true, force: true })
await mkdir(output, { recursive: true })
let publishedBytes = 0
let publishedFiles = 0
const assetUrl = /\/projects\/daabit-ai\/en\/(?:latest|starter-kit|standard-kit|advanced-kit)\/assets\/[^"'`\s\\<>\)\?#]+/g
async function publish(source, path, rewrite) {
  const target = join(output, path)
  await mkdir(dirname(target), { recursive: true })
  if (rewrite && textExtensions.has(extname(source).toLowerCase())) {
    let text = await readFile(source, 'utf8')
    text = text.replace(assetUrl, url => replacements.get(url) || url)
    if (basePath) text = text.replaceAll('/projects/daabit-ai/', `${basePath}/projects/daabit-ai/`)
    await writeFile(target, text)
    publishedBytes += Buffer.byteLength(text)
  } else {
    await cp(source, target)
    publishedBytes += (await stat(source)).size
  }
  publishedFiles++
}
for (const file of files) {
  const path = relative(root, file).split(sep).join('/')
  if (!replacements.has('/' + path)) await publish(file, path, true)
}
for (const [path, file] of shared) await publish(file, path, false)

const report = { originalBytes, publishedBytes, savedBytes: originalBytes - publishedBytes,
  sharedMediaFiles: shared.size, replacedMediaUrls: replacements.size, publishedFiles, basePath }
await writeFile(join(root, '.pages-report.json'), JSON.stringify(report, null, 2) + '\n')
console.log(JSON.stringify(report, null, 2))
if (publishedBytes >= 1_000_000_000) {
  throw new Error('Pages site still exceeds 1 GB; reduce published media before deployment')
}
