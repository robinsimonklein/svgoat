export const isFigmaUrl = (text: string) => /figma\.com\/(?:file|design)\/[^/?]+[^?]*\?.*node-id=/.test(text);
