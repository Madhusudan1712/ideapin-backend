import { Schema, model, Document } from 'mongoose';

export interface INote extends Document {
  userId: string;
  title: string;
  content: string;
  isPinned: boolean;
  visibility: 'private' | 'public';
  isDeleted: boolean;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

const noteSchema = new Schema<INote>(
  {
    userId: { type: String, required: true },
    title: { type: String, required: true },
    content: { type: String, required: true },
    isPinned: { type: Boolean, default: false },
    visibility: { type: String, enum: ['private', 'public'], required: true },
    isDeleted: { type: Boolean, default: false },
    version: { type: Number, default: 1 },
  },
  { timestamps: true }
);

// Optimize search queries by indexing key lookup fields
noteSchema.index({ userId: 1 });
noteSchema.index({ isDeleted: 1 });

export const NoteModel = model<INote>('Note', noteSchema);
