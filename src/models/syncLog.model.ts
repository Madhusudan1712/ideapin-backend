import { Schema, model, Document } from 'mongoose';

export interface ISyncLog extends Document {
  operationId: string;
  userId: string;
  status: 'applied' | 'conflict';
  timestamp: Date;
  createdAt: Date;
  updatedAt: Date;
}

const syncLogSchema = new Schema<ISyncLog>(
  {
    operationId: { type: String, required: true, unique: true },
    userId: { type: String, required: true },
    status: { type: String, enum: ['applied', 'conflict'], required: true },
    timestamp: { type: Date, required: true },
  },
  { timestamps: true }
);

// Index for high performance lookup by user and operation idempotency check
syncLogSchema.index({ userId: 1 });
syncLogSchema.index({ operationId: 1 }, { unique: true });

export const SyncLogModel = model<ISyncLog>('SyncLog', syncLogSchema);
