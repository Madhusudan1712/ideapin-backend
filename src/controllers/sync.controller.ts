import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import { SyncService } from '../services/sync.service';

export class SyncController {
  private syncService: SyncService;

  constructor() {
    this.syncService = new SyncService();
  }

  /**
   * Processes batch client synchronization requests.
   */
  public async sync(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user.id;
      const { operations } = req.body;

      const result = await this.syncService.processSync(userId, operations || []);

      res.status(200).json({
        success: true,
        data: {
          updatedNotes: result.updatedNotes,
          conflicts: result.conflicts,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}
