import { rm, cp, writeFile } from 'fs/promises'
import { existsSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { execSync } from 'child_process'

const __dirname = dirname(fileURLToPath(import.meta.url))
const repositoryRoot = join(__dirname, '..')

const version = process.argv[2]
if (!version) {
  console.error('Usage: node scripts/dev_version.mjs <version>')
  console.error('Example: node scripts/dev_version.mjs latest')
  process.exit(1)
}

const validVersions = ['latest', 'starter-kit', 'standard-kit', 'advanced-kit']
if (!validVersions.includes(version)) {
  console.error(`Invalid version: ${version}`)
  console.error(`Valid versions: ${validVersions.join(', ')}`)
  process.exit(1)
}

const projectName = 'daabit-ai'
const docsBase = `/projects/${projectName}/en/${version}/`

console.log(`\n========== Dev: ${version} ==========`)
console.log(`DOCS_BASE: ${docsBase}`)

// 1. Copy content to docs working directory
const contentDir = join(repositoryRoot, 'content', version)
const docsDir = join(repositoryRoot, 'docs')
const docsDocsDir = join(docsDir, 'docs')
const docsStaticDir = join(docsDir, '_static')
const docsRootIndex = join(docsDir, 'index.md')
const contentRootIndex = join(contentDir, 'index.md')

console.log('\n[1/2] Copying content files...')
await rm(docsDocsDir, { recursive: true, force: true })
await rm(docsStaticDir, { recursive: true, force: true })
if (existsSync(docsRootIndex)) {
  await rm(docsRootIndex, { force: true })
}
await cp(join(contentDir, 'docs'), docsDocsDir, { recursive: true })
await cp(join(contentDir, '_static'), docsStaticDir, { recursive: true })
if (existsSync(contentRootIndex)) {
  await cp(contentRootIndex, docsRootIndex)
} else {
  await writeFile(
    docsRootIndex,
    `---\nlayout: page-redirect\nredirectTo: /docs/index.html\n---\n\nRedirecting to content page...\n`,
    'utf-8'
  )
}
console.log('  Done.')

// 2. Start VitePress dev server
console.log('\n[2/2] Starting VitePress dev server...')
execSync('npx vitepress dev docs', {
  stdio: 'inherit',
  cwd: repositoryRoot,
  env: { ...process.env, DOCS_BASE: docsBase, DOCS_VERSION: version }
})
