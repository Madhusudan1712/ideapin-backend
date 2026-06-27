import { NoteModel, INote } from '../models/note.model';
import { NotFoundError, ForbiddenError } from '../utils/appError';

export interface CreateNoteInput {
  title: string;
  content: string;
  isPinned?: boolean;
  visibility: 'private' | 'public';
}

export interface UpdateNoteInput {
  title?: string;
  content?: string;
  isPinned?: boolean;
  visibility?: 'private' | 'public';
}

export class NoteService {
  /**
   * Creates a new note for the user.
   */
  public async createNote(userId: string, input: CreateNoteInput): Promise<INote> {
    const note = new NoteModel({
      userId,
      title: input.title,
      content: input.content,
      isPinned: input.isPinned ?? false,
      visibility: input.visibility,
      version: 1,
    });
    return await note.save();
  }

  /**
   * Fetches all non-deleted notes belonging to a specific user.
   */
  public async fetchUserNotes(userId: string): Promise<INote[]> {
    return await NoteModel.find({ userId, isDeleted: false });
  }

  /**
   * Updates an existing note if the user is the owner.
   * Increments the document version.
   */
  public async updateUserNote(id: string, userId: string, input: UpdateNoteInput): Promise<INote> {
    const note = await NoteModel.findById(id);
    if (!note || note.isDeleted) {
      throw new NotFoundError('Note not found');
    }

    if (note.userId !== userId) {
      throw new ForbiddenError('You are not authorized to update this note');
    }

    if (input.title !== undefined) note.title = input.title;
    if (input.content !== undefined) note.content = input.content;
    if (input.isPinned !== undefined) note.isPinned = input.isPinned;
    if (input.visibility !== undefined) note.visibility = input.visibility;

    note.version += 1;
    return await note.save();
  }

  /**
   * Performs a soft delete of a note if the user is the owner.
   * Marks isDeleted = true and increments the document version.
   */
  public async deleteUserNote(id: string, userId: string): Promise<INote> {
    const note = await NoteModel.findById(id);
    if (!note || note.isDeleted) {
      throw new NotFoundError('Note not found');
    }

    if (note.userId !== userId) {
      throw new ForbiddenError('You are not authorized to delete this note');
    }

    note.isDeleted = true;
    note.version += 1;
    return await note.save();
  }
}
