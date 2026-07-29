# Irina Bilinskaia — desktop portfolio

An interactive portfolio presented as a small Linux-style desktop.

## Features

- Matrix-inspired welcome screen
- animated grain wallpaper
- movable desktop icons and selection marquee
- independent draggable, minimizable, and maximizable windows
- five project views with project-specific content
- embedded CV with a PDF download
- keyboard controls and responsive mobile layouts

## Run locally

Requirements: Node.js 20.19 or newer.

```bash
npm install
npm run dev
```

## Checks

```bash
npm test
```

This runs the TypeScript check, ESLint, the production build, and the export
integrity tests.

## Production build

```bash
npm run build
```

The static site is written to `dist/` and can be hosted on GitHub Pages,
Netlify, Vercel, or any other static host.
