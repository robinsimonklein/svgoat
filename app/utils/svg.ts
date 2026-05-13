export type ParsedSvg = {
  markup: string;
  width: number;
  height: number;
};

export const createInput = (parsed: ParsedSvg, source: SvgSource, filename?: string): SvgInput => ({
  id: crypto.randomUUID(),
  text: parsed.markup,
  width: parsed.width,
  height: parsed.height,
  source,
  ...(filename ? { filename } : {}),
});

const extractDimensions = (svg: Element): { width: number; height: number } => {
  const width = parseFloat(svg.getAttribute('width') ?? '');
  const height = parseFloat(svg.getAttribute('height') ?? '');
  if (width > 0 && height > 0) return { width, height };

  const viewBox = svg.getAttribute('viewBox');
  if (viewBox) {
    const parts = viewBox.split(/,\s*|\s+/);
    const vbWidth = parseFloat(parts[2]);
    const vbHeight = parseFloat(parts[3]);
    if (vbWidth > 0 && vbHeight > 0) return { width: vbWidth, height: vbHeight };
  }

  return { width: 0, height: 0 };
};

export const parseSvg = (text: string): ParsedSvg => {
  const doc = new DOMParser().parseFromString(text, 'image/svg+xml');

  const parserError = doc.querySelector('parsererror');
  if (parserError) throw new Error('Invalid XML: the file could not be parsed');

  const svg = doc.documentElement;
  if (svg.tagName !== 'svg') throw new Error('The file is valid XML but not an SVG document');

  const markup = svg.outerHTML;
  const { width, height } = extractDimensions(svg);

  return { markup, width, height };
};

const RASTER_IMAGE_RE =
  /<image\b[^>]*\b(?:xlink:href|href)\s*=\s*["'](?:data:image\/(?:png|jpe?g|gif|webp|bmp|avif|tiff)|[^"']*\.(?:png|jpe?g|gif|webp|bmp|avif|tiff?))/i;

export const hasRasterImage = (svg: string): boolean => RASTER_IMAGE_RE.test(svg);

export const buildSvgPreviewUrl = (svg: string, currentColor: string): string => {
  const rendered = svg.replaceAll('currentColor', currentColor);
  return URL.createObjectURL(new Blob([rendered], { type: 'image/svg+xml' }));
};

export const extractSvgs = (text: string): ParsedSvg[] => {
  const doc = new DOMParser().parseFromString(`<body>${text}</body>`, 'text/html');
  const svgElements = doc.querySelectorAll('body > svg');

  if (svgElements.length === 0) {
    const single = parseSvg(text);
    return [single];
  }

  return Array.from(svgElements).map(svg => {
    const markup = svg.outerHTML;
    const { width, height } = extractDimensions(svg);
    return { markup, width, height };
  });
};
