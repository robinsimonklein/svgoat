const FIGMA_COPY_SUFFIX = /\s*\(copy(?:\s+\d+)?\)/gi;
const TRAILING_NUMBER_SUFFIX = /\s*\(\d+\)(?=\s|\/|$)/g;
const FIGMA_PREFIX_TOKENS =
  /(^|[\s\-_/])(frame|group|rectangle|ellipse|vector|line|polygon|star|component|instance|slice|union|subtract|intersect|exclude)\s+\d+(?=[\s\-_/]|$)/gi;

const stripFigmaPrefixes = (s: string): string => {
  let prev;
  let out = s;
  do {
    prev = out;
    out = out.replace(FIGMA_PREFIX_TOKENS, '$1').trim();
  } while (out !== prev);
  return out;
};

const slugify = (s: string): string =>
  s
    .normalize('NFKD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

export const cleanFilename = (name: string): string => {
  const dot = name.lastIndexOf('.');
  const hasExt = dot > 0 && dot < name.length - 1 && !/[\s/]/.test(name.slice(dot));
  const stem = hasExt ? name.slice(0, dot) : name;
  const ext = hasExt ? name.slice(dot) : '';

  let cleaned = stem;
  cleaned = cleaned.replace(FIGMA_COPY_SUFFIX, '');
  cleaned = cleaned.replace(TRAILING_NUMBER_SUFFIX, '');
  cleaned = stripFigmaPrefixes(cleaned);
  cleaned = slugify(cleaned);

  if (!cleaned) cleaned = 'svg';

  return cleaned + ext;
};
