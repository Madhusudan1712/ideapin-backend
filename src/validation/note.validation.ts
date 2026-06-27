import { z } from 'zod';

export const createNoteSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(1, 'Content is required'),
  isPinned: z.boolean().optional(),
  visibility: z.enum(['private', 'public'] as const, {
    message: "Visibility must be 'private' or 'public'",
  }),
});

export const updateNoteSchema = z.object({
  title: z.string().min(1, 'Title cannot be empty').optional(),
  content: z.string().min(1, 'Content cannot be empty').optional(),
  isPinned: z.boolean().optional(),
  visibility: z.enum(['private', 'public'] as const).optional(),
});
