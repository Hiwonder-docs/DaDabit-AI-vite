import { rm, cp, writeFile } from 'fs/promises'
import { existsSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { execSync } from 'child_process'

const __dirname = dirname(fileURLToPath(import.meta.url))
const repositoryRoot = join(__dirname, '..')

const version = process.argv[2]
if (!version) {
  console.error('Usage: node scripts/build_version.mjs <version>')
  console.error('Example: node scripts/build_version.mjs latest')
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

console.log(`\n========== Building ${version} ==========`)
console.log(`DOCS_BASE: ${docsBase}`)

// 1. Copy content to docs working directory
const contentDir = join(repositoryRoot, 'content', version)
const docsDir = join(repositoryRoot, 'docs')
const docsDocsDir = join(docsDir, 'docs')
const docsStaticDir = join(docsDir, '_static')
const docsRootIndex = join(docsDir, 'index.md')
const contentRootIndex = join(contentDir, 'index.md')

console.log('\n[1/3] Copying content files...')
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

// 2. Build with VitePress
console.log('\n[2/3] Building with VitePress...')
execSync('npx vitepress build docs', {
  stdio: 'inherit',
  cwd: repositoryRoot,
  env: { ...process.env, DOCS_BASE: docsBase, DOCS_VERSION: version }
})
console.log('  Done.')

// 3. Stage to projects directory
console.log('\n[3/3] Staging to projects directory...')
execSync('node scripts/stage_main_site.mjs', {
  stdio: 'inherit',
  cwd: repositoryRoot,
  env: { ...process.env, DOCS_VERSION: version }
})
console.log('  Done.')


console.log(`\n========== ${version} build complete ==========\n`)
