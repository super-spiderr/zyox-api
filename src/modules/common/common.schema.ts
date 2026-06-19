import { z } from "zod";

export const paginationQuerySchema = z.object({
  page: z.coerce.number().min(1).optional().default(1),
  limit: z.coerce.number().min(1).max(100).optional().default(10),
  search: z.string().optional(),
});

export type PaginationQueryInput = z.infer<typeof paginationQuerySchema>;
