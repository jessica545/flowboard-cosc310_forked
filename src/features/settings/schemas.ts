import {z} from 'zod';

export const settingsSchema = z.object({
    theme: z.enum(['light', 'dark']),
    autoSave: z.boolean(),
    customTheme: z.boolean().optional().default(false),
    customColors: z.object({
        background: z.string(), 
        text: z.string(),
    }),
});