# Roadmap

### Presets
Named configuration system, similar to paragraph styles in word processors.

- [ ] `Preset` type + store (localStorage)
- [ ] Selector with "None" + preset list
- [ ] (•••) menu on hover: Rename, Update with current settings, Delete
- [ ] Fixed "Save current settings as preset…" entry in the selector
- [ ] Dirty state (asterisk) when current config diverges from active preset
- [ ] Actions in dirty state: Reset / Update preset
- [ ] Confirmation before overwriting a non-active preset

### Export / Import
- [ ] Export: download active config as JSON (filename based on active preset name + `(modified)` if dirty)
- [ ] Import: apply a JSON → reset preset to "None" + "Save as preset?" toast

### UX
- [ ] Batch: open source code in a modal for an individual SVG
- [ ] Keyboard shortcuts modal
- [ ] Favorite settings: star on hover, pinned favorites list at the top
- [ ] About modal (credits, licenses)
- [ ] Link to GitHub

### Quality
- [ ] Unit tests (priority: `cleanFilename`, `migrateSettings`, `extractSvgs`, `formatBytes`)

## Future ideas
- Preset sync via GitHub Gist (cross-device, no custom user account needed)
