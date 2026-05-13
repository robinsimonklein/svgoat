import { z } from 'zod';

const querySchema = z.object({
  url: z.url(),
});

const parseFigmaUrl = (url: string) => {
  const match = url.match(/figma\.com\/(?:file|design)\/([^/?]+)[^?]*\?.*node-id=([^&]+)/);
  if (!match?.length) return null;

  return {
    fileKey: match[1],
    nodeId: decodeURIComponent(match[2]!).replaceAll('-', ':'),
  };
};

type FigmaNodesResponse = {
  nodes: Record<string, { document: FigmaNode }>;
};

export default defineEventHandler(async event => {
  const { url } = await getValidatedQuery(event, querySchema.parse);

  const parsed = parseFigmaUrl(url);
  if (!parsed) throw createError('Invalid Figma URL');

  const { fileKey, nodeId } = parsed;

  const data = await useFigma(event).fetch<FigmaNodesResponse>(`/files/${fileKey}/nodes`, {
    query: { ids: nodeId },
  });

  const node = data.nodes[nodeId]?.document;
  if (!node) throw createError({ status: 404, message: 'Unable to find node' });

  return {
    key: fileKey,
    node: { ...node, children: node.children?.map(c => ({ id: c.id, name: c.name, type: c.type })) ?? [] },
  };
});
