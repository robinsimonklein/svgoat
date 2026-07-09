import type { CustomPlugin } from 'svgo/browser';

const COLOR_ATTRS = ['fill', 'stroke', 'stop-color', 'flood-color', 'lighting-color'];

const SKIP_VALUES = new Set(['none', 'currentColor', 'inherit', 'transparent']);

const isColorValue = (value: string): boolean => {
  const v = value.trim();
  if (!v || SKIP_VALUES.has(v)) return false;
  if (v.startsWith('url(')) return false;
  return true;
};

const CSS_COLOR_RE = new RegExp(`(${COLOR_ATTRS.join('|')})\\s*:\\s*([^;}{]+)`, 'g');

const replaceCssColors = (css: string): string =>
  css.replace(CSS_COLOR_RE, (match, prop: string, value: string) =>
    isColorValue(value.trim()) ? `${prop}: currentColor` : match,
  );

export const convertColorsToCurrentColor: CustomPlugin = {
  name: 'convertColorsToCurrentColor',
  fn: () => ({
    element: {
      enter: node => {
        for (const attr of COLOR_ATTRS) {
          if (attr in node.attributes && isColorValue(node.attributes[attr])) {
            node.attributes[attr] = 'currentColor';
          }
        }

        if (node.attributes.style) {
          node.attributes.style = replaceCssColors(node.attributes.style);
        }
      },
    },
    text: {
      enter: (node, parentNode) => {
        if (parentNode.type === 'element' && parentNode.name === 'style') {
          node.value = replaceCssColors(node.value);
        }
      },
    },
  }),
};

// --- removeViewBoxClipPath -------------------------------------------------
// Removes the "frame" clip-paths Figma always adds: a <clipPath> whose only
// child is a rect covering the whole viewBox. Since <svg> already clips to its
// viewport, such a clip hides nothing.

type Rect = { x: number; y: number; w: number; h: number };

type El = {
  type: 'element';
  name: string;
  attributes: Record<string, string>;
  children: AnyNode[];
};

type AnyNode = El | { type: string; children?: AnyNode[] };

const EPS = 1e-3;

const isEl = (node: AnyNode): node is El => node.type === 'element';

const toNum = (v: string | undefined, fallback = NaN): number => {
  if (v == null) return fallback;
  const n = parseFloat(v);
  return Number.isNaN(n) ? fallback : n;
};

const URL_REF_RE = /url\(\s*['"]?#([^)'"\s]+)['"]?\s*\)/;

const refId = (value: string | undefined): string | null => {
  if (!value) return null;
  const m = value.match(URL_REF_RE);
  return m?.[1] ?? null;
};

const parseViewBox = (svg: El): Rect | null => {
  const vb = svg.attributes.viewBox;
  if (vb) {
    const [x, y, w, h] = vb
      .trim()
      .split(/[\s,]+/)
      .map(Number);
    if ([x, y, w, h].every(n => n !== undefined && Number.isFinite(n))) {
      return { x: x!, y: y!, w: w!, h: h! };
    }
  }
  const w = toNum(svg.attributes.width);
  const h = toNum(svg.attributes.height);
  if (Number.isFinite(w) && Number.isFinite(h)) return { x: 0, y: 0, w, h };
  return null;
};

const rectFromRect = (el: El): Rect | null => {
  if ('rx' in el.attributes || 'ry' in el.attributes) return null;
  const x = toNum(el.attributes.x, 0);
  const y = toNum(el.attributes.y, 0);
  const w = toNum(el.attributes.width);
  const h = toNum(el.attributes.height);
  if (!Number.isFinite(w) || !Number.isFinite(h)) return null;
  return { x, y, w, h };
};

// Renvoie le rectangle décrit par un `d` *uniquement* s'il s'agit d'un
// rectangle aligné sur les axes (M/L/H/V/Z). Toute courbe (C, S, Q, A…) → null.
const rectFromPath = (d: string | undefined): Rect | null => {
  if (!d) return null;
  const tokens = d.match(/[MmLlHhVvZz]|-?\d*\.?\d+(?:e[-+]?\d+)?/g);
  if (!tokens) return null;

  let i = 0;
  let cx = 0;
  let cy = 0;
  let sx = 0;
  let sy = 0;
  const pts: Array<[number, number]> = [];
  const isCmd = (t: string) => /[MmLlHhVvZz]/.test(t);
  const next = (): number | null => {
    const t = tokens[i];
    if (t === undefined || isCmd(t)) return null;
    i++;
    return parseFloat(t);
  };

  while (i < tokens.length) {
    const cmd = tokens[i++];
    switch (cmd) {
      case 'M':
      case 'm': {
        const rel = cmd === 'm';
        const a = next();
        const b = next();
        if (a == null || b == null) return null;
        cx = rel ? cx + a : a;
        cy = rel ? cy + b : b;
        sx = cx;
        sy = cy;
        pts.push([cx, cy]);
        for (;;) {
          const x = next();
          if (x == null) break;
          const y = next();
          if (y == null) return null;
          cx = rel ? cx + x : x;
          cy = rel ? cy + y : y;
          pts.push([cx, cy]);
        }
        break;
      }
      case 'L':
      case 'l': {
        const rel = cmd === 'l';
        let any = false;
        for (;;) {
          const x = next();
          if (x == null) break;
          const y = next();
          if (y == null) return null;
          cx = rel ? cx + x : x;
          cy = rel ? cy + y : y;
          pts.push([cx, cy]);
          any = true;
        }
        if (!any) return null;
        break;
      }
      case 'H':
      case 'h': {
        const rel = cmd === 'h';
        let any = false;
        for (;;) {
          const x = next();
          if (x == null) break;
          cx = rel ? cx + x : x;
          pts.push([cx, cy]);
          any = true;
        }
        if (!any) return null;
        break;
      }
      case 'V':
      case 'v': {
        const rel = cmd === 'v';
        let any = false;
        for (;;) {
          const y = next();
          if (y == null) break;
          cy = rel ? cy + y : y;
          pts.push([cx, cy]);
          any = true;
        }
        if (!any) return null;
        break;
      }
      case 'Z':
      case 'z':
        cx = sx;
        cy = sy;
        break;
      default:
        return null;
    }
  }

  if (pts.length < 4) return null;
  const xs = pts.map(p => p[0]);
  const ys = pts.map(p => p[1]);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const w = maxX - minX;
  const h = maxY - minY;
  if (w <= EPS || h <= EPS) return null;

  const onEdge = (p: [number, number]) =>
    (Math.abs(p[0] - minX) < EPS || Math.abs(p[0] - maxX) < EPS) &&
    (Math.abs(p[1] - minY) < EPS || Math.abs(p[1] - maxY) < EPS);
  if (!pts.every(onEdge)) return null;

  const hasCorner = (x: number, y: number) => pts.some(p => Math.abs(p[0] - x) < EPS && Math.abs(p[1] - y) < EPS);
  if (!hasCorner(minX, minY) || !hasCorner(maxX, minY) || !hasCorner(minX, maxY) || !hasCorner(maxX, maxY)) {
    return null;
  }

  return { x: minX, y: minY, w, h };
};

const coversViewBox = (clip: Rect, vb: Rect): boolean =>
  clip.x <= vb.x + EPS &&
  clip.y <= vb.y + EPS &&
  clip.x + clip.w >= vb.x + vb.w - EPS &&
  clip.y + clip.h >= vb.y + vb.h - EPS;

const collectRefs = (el: El, into: Set<string>): void => {
  const re = new RegExp(URL_REF_RE.source, 'g');
  for (const value of Object.values(el.attributes)) {
    let m: RegExpExecArray | null;
    while ((m = re.exec(value))) if (m[1]) into.add(m[1]);
  }
  for (const child of el.children) if (isEl(child)) collectRefs(child, into);
};

export const removeViewBoxClipPath: CustomPlugin = {
  name: 'removeViewBoxClipPath',
  fn: root => {
    const r = root as unknown as { children: AnyNode[] };
    const svg = r.children.find(isEl);
    if (!svg || svg.name !== 'svg') return {};
    const vb = parseViewBox(svg);
    if (!vb) return {};

    // Passe 1 : repérer les <clipPath> « frame » éligibles.
    const eligible = new Set<string>();
    const clipPathNodes = new Map<string, { node: El; parent: El }>();

    const findClipPaths = (node: AnyNode, parent: El | null): void => {
      if (isEl(node) && node.name === 'clipPath') {
        const id = node.attributes.id;
        const units = node.attributes.clipPathUnits;
        const kids = node.children.filter(isEl);
        const child = kids[0];
        if (
          id &&
          parent &&
          (!units || units === 'userSpaceOnUse') &&
          !node.attributes.transform &&
          kids.length === 1 &&
          child &&
          !child.attributes.transform
        ) {
          const rect =
            child.name === 'rect'
              ? rectFromRect(child)
              : child.name === 'path'
                ? rectFromPath(child.attributes.d)
                : null;
          if (rect && coversViewBox(rect, vb)) {
            eligible.add(id);
            clipPathNodes.set(id, { node, parent });
          }
        }
      }
      const children = (node as { children?: AnyNode[] }).children;
      if (children) {
        const nextParent = isEl(node) ? node : parent;
        for (const child of children) findClipPaths(child, nextParent);
      }
    };
    findClipPaths(svg, null);
    if (eligible.size === 0) return {};

    // Passe 2 : retirer clip-path sur les éléments dont la chaîne est sans transform.
    const visit = (el: El, transformAbove: boolean): void => {
      const transformHere = transformAbove || !!el.attributes.transform;
      const id = refId(el.attributes['clip-path']);
      if (id && eligible.has(id) && !transformHere) {
        delete el.attributes['clip-path'];
      }
      for (const child of el.children) if (isEl(child)) visit(child, transformHere);
    };
    visit(svg, !!svg.attributes.transform);

    // Supprimer les <clipPath> devenus orphelins (par sécurité, on revérifie
    // qu'aucune référence — quelle qu'elle soit — ne subsiste).
    const stillReferenced = new Set<string>();
    collectRefs(svg, stillReferenced);
    for (const id of eligible) {
      if (stillReferenced.has(id)) continue;
      const entry = clipPathNodes.get(id);
      if (!entry) continue;
      const idx = entry.parent.children.indexOf(entry.node);
      if (idx !== -1) entry.parent.children.splice(idx, 1);
    }

    return {};
  },
};

export const CUSTOM_PLUGINS: Record<string, CustomPlugin> = {
  convertColorsToCurrentColor,
  removeViewBoxClipPath,
};
