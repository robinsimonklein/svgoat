export const isFigmaUrl = (text: string) => /figma\.com\/(?:file|design)\/[^/?]+[^?]*\?.*node-id=/.test(text);

export const parseFigmaClipboard = (html: string): { fileKey: string; nodeId: string } | null => {
  const match = html.match(/\(figmeta\)([\w+/=]+)\(\/figmeta\)/);

  if (!match?.[1]) return null;

  try {
    const decoded = JSON.parse(atob(match[1]));
    const { fileKey, selectedNodeData } = decoded;
    if (!fileKey || !selectedNodeData) return null;

    const nodeId = String(selectedNodeData).split('|')[0];
    if (!nodeId) return null;

    return { fileKey, nodeId };
  } catch {
    return null;
  }
};
