<h4 align="right"><a href="README.md">简体中文</a> | <strong>English</strong></h4>

<p align="center">
  <img src="/public/favicon.svg" width="138" alt="logo">
</p>
<h1 align="center">Vector Forge</h1>

<p align="center"><strong>Vector Forge is a browser-based SVG editor that lets you drag in SVG files, inspect, select, and tweak layers in real time.</strong></p>

<div align="center">
  <a href="https://reactjs.org/"><img src="https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB" alt="React"></a>
  <a href="https://vitejs.dev/"><img src="https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=white" alt="Vite"></a>
  <a href="./LICENSE"><img src="https://img.shields.io/badge/license-AGPL%20v3-blue.svg" alt="License"></a>
</div>

<div align="center">
    <a href="https://vector-forge.wangruofeng007.com/" target="_blank">Try it live</a>
</div>

## Features

### Import & Browse
- Drag-and-drop or choose an SVG file to import
- Left-side layer tree displays SVG internal elements; groups are expandable/collapsible
- Click elements in the preview to auto-select the corresponding layer
- Show/hide layers

### Layer Editing
- Add layers: rectangle, circle, ellipse, line, polyline, polygon, path, text
- Insert from the built-in SVG asset library: company logos, animation examples, loaders, creative animations, and other presets — click to import onto the canvas
- Copy / paste / delete layers
- Drag layers to reorder
- Select a text layer and edit its content directly on the canvas

### Canvas
- Drag the SVG image to pan
- Pinch, trackpad, or mouse wheel zoom
- Vector elements support resize handles; rectangles can adjust corner radius
- Cmd/Ctrl multi-select layers with 2D preview showing each layer and combined bounding box

### Inspector Panel
- Live edit fill color, stroke color, opacity, stroke width
- Collapsible property inspector

### Source & History
- Preview / Source view with syntax highlighting and one-click format to a collapsible hierarchical tree — click a source element to select the corresponding layer
- Edit history with undo / redo
- Export the edited SVG

### Misc
- Simplified Chinese / English bilingual UI

## Shortcuts

| Shortcut | Action |
|----------|--------|
| <kbd>⌘</kbd> + <kbd>Z</kbd> / <kbd>Ctrl</kbd> + <kbd>Z</kbd> | Undo |
| <kbd>⌘</kbd> + <kbd>Shift</kbd> + <kbd>Z</kbd> / <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>Z</kbd> | Redo |
| <kbd>⌘</kbd> + <kbd>C</kbd> / <kbd>V</kbd> / <kbd>Ctrl</kbd> + <kbd>C</kbd> / <kbd>V</kbd> | Copy / Paste layer |
| <kbd>Delete</kbd> / <kbd>Backspace</kbd> | Delete selected layer |

## Tech Stack

- React
- Vite
- Cloudflare Pages
- Wrangler

## Local Development

```bash
npm install
npm run dev
```

After startup, open the local address printed in the terminal — usually `http://localhost:5173`.

## Build

```bash
npm run build
npm run preview
```

## Deploy to Cloudflare Pages

The project uses Cloudflare Pages Direct Upload to ship the Vite build output:

```bash
npm run build
npx wrangler pages deploy dist --project-name vector-forge --branch main
```

Sign in to Cloudflare with Wrangler before deploying:

```bash
npx wrangler login
```

## Project Structure

The app entry point handles orchestration. SVG parsing/geometry/transforms, shared copy, panel components, and state hooks are each split by responsibility. Styles remain centralized in `src/styles.css`.

```text
.
├── public/
│   ├── favicon.svg              # SVG favicon
│   ├── apple-touch-icon.png     # iOS touch icon (180×180)
│   ├── icon-192.png             # PWA icon (192×192)
│   ├── icon-512.png             # PWA icon (512×512)
│   ├── icon-maskable-512.png    # PWA maskable icon (512×512)
│   ├── og-image.png             # Social share image (1200×630)
│   ├── manifest.json            # PWA manifest
│   ├── robots.txt               # Crawl policy (overrides Cloudflare-hosted default)
│   ├── sitemap.xml              # Sitemap
│   ├── _headers                 # Cloudflare Pages cache rules
│   └── 404.html                 # Static 404 page (fixes SPA soft-404)
├── src/
│   ├── main.jsx     # App entry & business orchestration
│   ├── app/copy.js  # Bilingual copy and display names
│   ├── components/  # LayerPanel, CanvasPanel, InspectorPanel, Icon
│   ├── editor/      # SVG parser, geometry, transforms
│   ├── hooks/       # Document state and canvas interaction hooks
│   └── styles.css   # Global styles
├── docs/
│   ├── product-roadmap.md          # Product roadmap
│   ├── browser-smoke-checklist.md  # Manual browser acceptance checklist
│   └── web-storage-options.md      # Web data persistence options
├── index.html
└── package.json
```

## License

Copyright (c) 2026 wangruofeng. This project is open-sourced under the [GNU AGPL v3](./LICENSE).

- Anyone is free to use, modify, and distribute this project, including for commercial purposes.
- However, any **distribution** or **network-based service** (SaaS) of derivative works must be **open-sourced under AGPL v3 in full**, with a way for users to obtain the source code.
- If you need to use this project in a commercial setting where **open-sourcing derivative code is not permitted**, please contact us via email for a separate commercial license.