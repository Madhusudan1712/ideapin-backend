import { z } from 'zod';

export const syncOperationSchema = z.object({
  operationId: z.string().uuid(),
  type: z.enum(['CREATE', 'UPDATE', 'DELETE'] as const),
  noteId: z.string(),
  title: z.string().optional(),
  content: z.string().optional(),
  visibility: z.enum(['private', 'public'] as const).optional(),
  isPinned: z.boolean().optional(),
  timestamp: z.number(), // milliseconds timestamp of client edit
});

export const batchSyncSchema = z.object({
  operations: z.array(syncOperationSchema),
});

export type SyncOperationDto = z.infer<typeof syncOperationSchema>;
export type BatchSyncDto = z.infer<typeof batchSyncSchema>;
