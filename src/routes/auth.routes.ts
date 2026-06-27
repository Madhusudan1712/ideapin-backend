import { Router, RequestHandler } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { verifyAuth } from '../middlewares/auth.middleware';

const router = Router();
const controller = new AuthController();

// Protect GET /me route with verifyAuth middleware and strictly cast custom Request types using RequestHandler
router.get(
  '/me',
  verifyAuth as unknown as RequestHandler,
  controller.getCurrentUser.bind(controller) as unknown as RequestHandler
);

export default router;
