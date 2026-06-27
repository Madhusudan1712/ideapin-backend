import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import { AuthService } from '../services/auth.service';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  /**
   * GET /me
   * Fetches profile of the currently logged in user.
   */
  public async getCurrentUser(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id, email } = req.user;
      const userProfile = await this.authService.fetchCurrentUserProfile(id, email);

      res.status(200).json({
        success: true,
        data: userProfile,
        message: 'User profile retrieved successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}
