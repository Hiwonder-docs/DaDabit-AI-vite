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
