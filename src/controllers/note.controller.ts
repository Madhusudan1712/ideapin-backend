import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import { NoteService } from '../services/note.service';

export class NoteController {
  private noteService: NoteService;

  constructor() {
    this.noteService = new NoteService();
  }

  /**
   * POST /notes
   * Creates a note.
   */
  public async createNote(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id: userId } = req.user;
      const note = await this.noteService.createNote(userId, req.body);

      res.status(201).json({
        success: true,
        data: note,
        message: 'Note created successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /notes
   * Fetches all non-deleted notes belonging to the authenticated user.
   */
  public async getNotes(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id: userId } = req.user;
      const notes = await this.noteService.fetchUserNotes(userId);

      res.status(200).json({
        success: true,
        data: notes,
        message: 'Notes retrieved successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /notes/:id
   * Updates an existing note owned by the user.
   */
  public async updateNote(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const { id: userId } = req.user;

      if (!id || typeof id !== 'string') {
        res.status(400).json({
          success: false,
          error: { message: 'Note ID is required and must be a string' }
        });
        return;
      }

      const note = await this.noteService.updateUserNote(id, userId, req.body);

      res.status(200).json({
        success: true,
        data: note,
        message: 'Note updated successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /notes/:id
   * Soft deletes a note owned by the user.
   */
  public async deleteNote(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const { id: userId } = req.user;

      if (!id || typeof id !== 'string') {
        res.status(400).json({
          success: false,
          error: { message: 'Note ID is required and must be a string' }
        });
        return;
      }

      const note = await this.noteService.deleteUserNote(id, userId);

      res.status(200).json({
        success: true,
        data: note,
        message: 'Note deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}
