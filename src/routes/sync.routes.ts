import { Router, RequestHandler } from 'express';
import { SyncController } from '../controllers/sync.controller';
import { verifyAuth } from '../middlewares/auth.middleware';
import { validateBody } from '../middlewares/validation.middleware';
import { batchSyncSchema } from '../validation/sync.validation';

const router = Router();
const controller = new SyncController();

// Sync endpoints require JWT authentication
router.use(verifyAuth as unknown as RequestHandler);

router.post(
  '/',
  validateBody(batchSyncSchema),
  controller.sync.bind(controller) as unknown as RequestHandler
);

export default router;
