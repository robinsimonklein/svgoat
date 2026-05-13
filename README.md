# SVGOAT

> SVG optimizer inspired by [SVGOMG](https://svgomg.net/)

A client-side SVG optimizer built with [Nuxt](https://nuxt.com), [Nuxt UI](https://ui.nuxt.com), and [SVGO](https://github.com/svg/svgo).
Everything runs in the browser, your files never leave your machine.

## Features

- ✂️ **Optimize** - clean and compress SVG files with fine-grained SVGO plugin control
- 🎨 **`currentColor`** - force fill and stroke colors to `currentColor` for seamless icon theming
- 📦 **Batch mode** - drop multiple SVGs at once and download them all as a ZIP
- 🖼️ **Figma import** - connect your Figma account and pull SVG assets directly from any file or frame

## Usage

Drag and drop one or more SVG files, or paste SVG markup directly (`Cmd+V`). Tweak the settings in the sidebar, then copy or download the result.

For Figma, click **Connect Figma**, paste a node URL, and import the exported SVGs in one step.

## Development

```bash
npm install
npm run dev
```
