<h4 align="right"><a href="README.md">简体中文</a> | <strong>English</strong></h4>

<p align="center">
  <img src="/public/favicon.svg" width="138" alt="logo">
</p>
<h1 align="center">Vecsy</h1>

<p align="center"><strong>Vecsy is a browser-based SVG editor that lets you drag in SVG files, inspect, select, and tweak layers in real time.</strong></p>

<div align="center">
  <a href="https://reactjs.org/"><img src="https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB" alt="React"></a>
  <a href="https://vitejs.dev/"><img src="https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=white" alt="Vite"></a>
  <a href="./LICENSE"><img src="https://img.shields.io/badge/license-AGPL%20v3-blue.svg" alt="License"></a>
</div>

<div align="center">
    <a href="https://vecsy.top/" target="_blank">Try it live</a>
</div>

## Features

### Import & Browse
- Drag-and-drop or choose an SVG file to import
- Left-side layer tree displays SVG internal elements; groups are expandable/collapsible
- Click elements in the preview to auto-select the corresponding layer
- Show/hide layers

### Layer Editing
- Add layers: rectangle, circle, ellipse, line, arrow, polygon, heart, star, text
- Insert from the built-in SVG asset library: company logos, animation examples, loaders, creative animations, and other presets — click to import onto the canvas
- Copy / paste / delete layers; multi-select can be grouped in one step
- Drag layers to reorder
- Right-click menu on layer rows and canvas elements (rename / copy / delete / show-hide)
- Select a text layer and edit its content directly on the canvas

### Canvas
- Select (V) / Pan (H) tool switching; pan by dragging with the Pan tool; pinch, trackpad, or mouse wheel zoom
- Drag on empty space to marquee-select; press inside a group or multi-selection box to drag it as a whole
- Four-corner resize handles (Shift for proportional); rectangles can adjust corner radius
- Align and distribute tools when multiple layers are selected
- Hold Alt to show distance guides between the hovered layer and the current selection

### Inspector Panel
- Live edit fill color, stroke color, opacity, stroke width
- Gradient fill for text layers; independent start/end endpoint styles for lines (caps and arrow ornaments)
- Collapsible property inspector

### Source & History
- Preview / Source view with syntax highlighting and one-click format to a collapsible hierarchical tree — click a source element to select the corresponding layer
- Edit history with undo / redo
- Export panel with SVG / PNG / WebP formats, scale options, and size optimization

### Misc
- Simplified Chinese / Traditional Chinese / English / Japanese UI

## Shortcuts

| Mac | Windows/Linux | Action |
|-----|---------------|--------|
| <kbd>⌘</kbd> + <kbd>Z</kbd> | <kbd>Ctrl</kbd> + <kbd>Z</kbd> | Undo |
| <kbd>⌘</kbd> + <kbd>⇧</kbd> + <kbd>Z</kbd> | <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>Z</kbd> | Redo |
| <kbd>⌘</kbd> + <kbd>C</kbd> / <kbd>⌘</kbd> + <kbd>V</kbd> | <kbd>Ctrl</kbd> + <kbd>C</kbd> / <kbd>Ctrl</kbd> + <kbd>V</kbd> | Copy / Paste layer |
| <kbd>⌘</kbd> + <kbd>A</kbd> | <kbd>Ctrl</kbd> + <kbd>A</kbd> | Select all layers |
| <kbd>⌘</kbd> + <kbd>G</kbd> | <kbd>Ctrl</kbd> + <kbd>G</kbd> | Group layers |
| <kbd>Delete</kbd> / <kbd>⌫</kbd> | <kbd>Delete</kbd> / <kbd>Backspace</kbd> | Delete selected layer |
| <kbd>Arrow keys</kbd> | <kbd>Arrow keys</kbd> | Move selected layers (Shift for bigger steps) |
| <kbd>Esc</kbd> | <kbd>Esc</kbd> | Deselect |

Press <kbd>?</kbd> in the app for the full shortcut list.

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

The project is connected to Cloudflare Pages via Git integration: pushes to `main` build and deploy automatically (CI runs tests first), and [vecsy.top](https://vecsy.top) always matches `main`.

You can also ship the Vite build output manually via Direct Upload:

```bash
npm run build
npx wrangler pages deploy dist --project-name vecsy --branch main
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
│   ├── _headers                 # Cloudflare Pages security & cache rules
│   └── 404.html                 # Static 404 page (fixes SPA soft-404)
├── src/
│   ├── main.jsx     # App entry & business orchestration
│   ├── app/copy.js  # Quad-lingual copy (en/zh-CN/zh-TW/ja) and display names
│   ├── components/  # LayerPanel, CanvasPanel, InspectorPanel, Icon
│   ├── editor/      # SVG parser, geometry, transforms, security
│   ├── hooks/       # Document state and canvas interaction hooks
│   └── styles.css   # Global styles
├── tests/
│   ├── unit/        # Pure function unit tests (security, matrix, storage)
│   ├── browser/     # Browser integration tests (parser, geometry, drag)
│   └── fixtures/    # SVG test fixtures
├── docs/
│   ├── v0.5/        # v0.5 Foundation docs (PRD, roadmap, release notes)
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
