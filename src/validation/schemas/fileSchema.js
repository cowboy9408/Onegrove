import { z } from "zod";

export const fileSchema = z
  .object({
    name: z.string(),
    url: z.string().url(),
    size: z.number(),
  })
  .refine((file) => !!file.name && !!file.url && file.size > 0, {
    message: "파일을 등록해주세요.",
    path: [],
  });
