# DaDabit AI Documentation

This repository contains the DaDabit AI VitePress documentation site.

## Versions

- `latest`
- `starter-kit`
- `standard-kit`
- `advanced-kit`

## Development

```bash
npm ci
npm run dev:latest
npm run dev:starter-kit
npm run dev:standard-kit
npm run dev:advanced-kit
```

Use the version-specific dev commands so `DOCS_BASE` matches the deployed route.

## Build

```bash
npm run build:all
```

Build output is generated under:

```text
projects/daabit-ai/en/
```

Production routes:

```text
https://wiki.hiwonder.com/projects/daabit-ai/en/latest/
https://wiki.hiwonder.com/projects/daabit-ai/en/starter-kit/
https://wiki.hiwonder.com/projects/daabit-ai/en/standard-kit/
https://wiki.hiwonder.com/projects/daabit-ai/en/advanced-kit/
```

## GitHub Pages

The full repository contains source media as well as built media and is too large
to publish directly with the default branch deployment. The workflow in
`.github/workflows/deploy-pages.yml` publishes only the committed site, sharing
byte-identical images between versions without recompressing them.

After committing and pushing this workflow, select **Settings → Pages → Build and
deployment → Source → GitHub Actions**, then run **Deploy documentation to Pages**
from the Actions tab. Subsequent pushes to `main` deploy automatically.

To check the package locally in PowerShell:

```powershell
$env:PAGES_BASE_PATH = '/DaDabit-AI-vite'
npm run pages:prepare
```

This writes `.pages-dist/` and `.pages-report.json`, which are ignored by Git.
The workflow reads the actual Pages base path so repository URLs and custom
domains both work. Only staging files are rewritten; `content/` and `projects/`
are preserved. Continue to run `npm run build:all` before committing changes to
documentation or theme source, since this deployment publishes built files.
