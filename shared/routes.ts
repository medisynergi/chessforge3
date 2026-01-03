import { z } from 'zod';
import { insertGameSchema, games, analysis } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  games: {
    create: {
      method: 'POST' as const,
      path: '/api/games',
      input: z.object({ pgn: z.string() }),
      responses: {
        201: z.custom<typeof games.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    list: {
      method: 'GET' as const,
      path: '/api/games',
      responses: {
        200: z.array(z.custom<typeof games.$inferSelect & { analysis?: typeof analysis.$inferSelect }>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/games/:id',
      responses: {
        200: z.custom<typeof games.$inferSelect & { analysis?: typeof analysis.$inferSelect }>(),
        404: errorSchemas.notFound,
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
