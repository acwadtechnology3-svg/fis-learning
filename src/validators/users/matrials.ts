import { z } from "zod";

export const createMaterialSchema = z.object({body: z.object({
    name: z.string().optional(),
    courseId: z.string().min(1),
    file: z.instanceof(File),
}).strict()});


