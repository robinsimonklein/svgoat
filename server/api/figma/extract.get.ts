import { z } from 'zod';

type FigmaImagesResponse = {
  err: string | null;
  images: Record<string, string | null>;
};

const querySchema = z.object({
  key: z.string(),
  ids: z.string(),
});

export default defineEventHandler(async event => {
  const { key, ids } = await getValidatedQuery(event, querySchema.parse);

  const data = await useFigma(event).fetch<FigmaImagesResponse>(`/images/${key}`, {
    query: {
      ids,
      format: 'svg',
    },
  });

  if (data.err) throw createError({ status: 500, message: data.err });

  return { images: data.images };
});
