import { NoteModel, INote } from '../models/note.model';
import { SyncLogModel } from '../models/syncLog.model';
import { SyncOperationDto } from '../validation/sync.validation';
import { resolveSyncLWW } from '../utils/sync.utility';

export interface SyncResult {
  updatedNotes: INote[];
  conflicts: string[]; // Conflicted note IDs
}

export class SyncService {
  /**
   * Processes a batch of offline note operations.
   */
  public async processSync(userId: string, operations: SyncOperationDto[]): Promise<SyncResult> {
    if (operations.length === 0) {
      const updatedNotes = await NoteModel.find({ userId, isDeleted: false });
      return { updatedNotes, conflicts: [] };
    }

    // 1. Deduplicate operations in the batch payload itself
    const uniqueOpsMap = new Map<string, SyncOperationDto>();
    for (const op of operations) {
      uniqueOpsMap.set(op.operationId, op);
    }
    const uniqueOps = Array.from(uniqueOpsMap.values());

    const noteIds = uniqueOps.map((op) => op.noteId);
    const opIds = uniqueOps.map((op) => op.operationId);

    // 2. Bulk fetch existing logs and notes
    const [existingLogs, existingNotes] = await Promise.all([
      SyncLogModel.find({ operationId: { $in: opIds } }),
      NoteModel.find({ _id: { $in: noteIds }, userId }),
    ]);

    const appliedOpIds = new Set(existingLogs.map((l) => l.operationId));
    const noteMap = new Map<string, INote>(existingNotes.map((n) => [n._id.toString(), n]));

    const writeOps: any[] = [];
    const syncLogsToSave: any[] = [];
    const conflictedNoteIdsSet = new Set<string>();

    // 3. Process each operation
    for (const op of uniqueOps) {
      // Idempotency check: skip already processed operations
      if (appliedOpIds.has(op.operationId)) {
        continue;
      }

      const existingNote = noteMap.get(op.noteId);

      if (op.type === 'CREATE') {
        if (!existingNote) {
          // Normal creation
          writeOps.push({
            insertOne: {
              document: {
                _id: op.noteId,
                userId,
                title: op.title || '',
                content: op.content || '',
                isPinned: op.isPinned ?? false,
                visibility: op.visibility ?? 'private',
                isDeleted: false,
                version: 1,
                createdAt: new Date(op.timestamp),
                updatedAt: new Date(op.timestamp),
              },
            },
          });
          syncLogsToSave.push({
            operationId: op.operationId,
            userId,
            status: 'applied',
            timestamp: new Date(op.timestamp),
          });
        } else {
          // Document already exists, resolve via LWW conflict rules
          const resolution = resolveSyncLWW(op.timestamp, existingNote.updatedAt);
          if (resolution === 'apply') {
            writeOps.push({
              updateOne: {
                filter: { _id: op.noteId },
                update: {
                  $set: {
                    title: op.title ?? existingNote.title,
                    content: op.content ?? existingNote.content,
                    visibility: op.visibility ?? existingNote.visibility,
                    isPinned: op.isPinned ?? existingNote.isPinned,
                    isDeleted: false,
                    updatedAt: new Date(op.timestamp),
                  },
                  $inc: { version: 1 },
                },
              },
            });
            syncLogsToSave.push({
              operationId: op.operationId,
              userId,
              status: 'applied',
              timestamp: new Date(op.timestamp),
            });
          } else if (resolution === 'conflict') {
            conflictedNoteIdsSet.add(op.noteId);
            syncLogsToSave.push({
              operationId: op.operationId,
              userId,
              status: 'conflict',
              timestamp: new Date(op.timestamp),
            });
          } else {
            // resolution === 'skip'
            syncLogsToSave.push({
              operationId: op.operationId,
              userId,
              status: 'applied',
              timestamp: new Date(op.timestamp),
            });
          }
        }
      } else if (op.type === 'UPDATE') {
        if (existingNote) {
          const resolution = resolveSyncLWW(op.timestamp, existingNote.updatedAt);
          if (resolution === 'apply') {
            writeOps.push({
              updateOne: {
                filter: { _id: op.noteId },
                update: {
                  $set: {
                    title: op.title ?? existingNote.title,
                    content: op.content ?? existingNote.content,
                    visibility: op.visibility ?? existingNote.visibility,
                    isPinned: op.isPinned ?? existingNote.isPinned,
                    updatedAt: new Date(op.timestamp),
                  },
                  $inc: { version: 1 },
                },
              },
            });
            syncLogsToSave.push({
              operationId: op.operationId,
              userId,
              status: 'applied',
              timestamp: new Date(op.timestamp),
            });
          } else if (resolution === 'conflict') {
            conflictedNoteIdsSet.add(op.noteId);
            syncLogsToSave.push({
              operationId: op.operationId,
              userId,
              status: 'conflict',
              timestamp: new Date(op.timestamp),
            });
          } else {
            // resolution === 'skip'
            syncLogsToSave.push({
              operationId: op.operationId,
              userId,
              status: 'applied',
              timestamp: new Date(op.timestamp),
            });
          }
        } else {
          // Re-create note if it does not exist on the server (LWW fallback)
          writeOps.push({
            insertOne: {
              document: {
                _id: op.noteId,
                userId,
                title: op.title || '',
                content: op.content || '',
                isPinned: op.isPinned ?? false,
                visibility: op.visibility ?? 'private',
                isDeleted: false,
                version: 1,
                createdAt: new Date(op.timestamp),
                updatedAt: new Date(op.timestamp),
              },
            },
          });
          syncLogsToSave.push({
            operationId: op.operationId,
            userId,
            status: 'applied',
            timestamp: new Date(op.timestamp),
          });
        }
      } else if (op.type === 'DELETE') {
        if (existingNote && !existingNote.isDeleted) {
          const resolution = resolveSyncLWW(op.timestamp, existingNote.updatedAt);
          if (resolution === 'apply') {
            writeOps.push({
              updateOne: {
                filter: { _id: op.noteId },
                update: {
                  $set: {
                    isDeleted: true,
                    updatedAt: new Date(op.timestamp),
                  },
                  $inc: { version: 1 },
                },
              },
            });
            syncLogsToSave.push({
              operationId: op.operationId,
              userId,
              status: 'applied',
              timestamp: new Date(op.timestamp),
            });
          } else if (resolution === 'conflict') {
            conflictedNoteIdsSet.add(op.noteId);
            syncLogsToSave.push({
              operationId: op.operationId,
              userId,
              status: 'conflict',
              timestamp: new Date(op.timestamp),
            });
          } else {
            // resolution === 'skip'
            syncLogsToSave.push({
              operationId: op.operationId,
              userId,
              status: 'applied',
              timestamp: new Date(op.timestamp),
            });
          }
        } else {
          // Already deleted or never existed, mark processed
          syncLogsToSave.push({
            operationId: op.operationId,
            userId,
            status: 'applied',
            timestamp: new Date(op.timestamp),
          });
        }
      }
    }

    // 4. Execute writes in bulk (bypassing auto-timestamps overrides)
    if (writeOps.length > 0) {
      await NoteModel.bulkWrite(writeOps, { timestamps: false });
    }

    // 5. Insert Sync Audits in bulk
    if (syncLogsToSave.length > 0) {
      await SyncLogModel.insertMany(syncLogsToSave);
    }

    // 6. Fetch fresh active user notes state
    const updatedNotes = await NoteModel.find({ userId, isDeleted: false });

    return {
      updatedNotes,
      conflicts: Array.from(conflictedNoteIdsSet),
    };
  }
}
