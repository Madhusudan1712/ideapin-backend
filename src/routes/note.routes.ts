import { Router, RequestHandler } from 'express';
import { NoteController } from '../controllers/note.controller';
import { verifyAuth } from '../middlewares/auth.middleware';
import { validateBody } from '../middlewares/validation.middleware';
import { createNoteSchema, updateNoteSchema } from '../validation/note.validation';

const router = Router();
const controller = new NoteController();

// All note routes require user authentication
router.use(verifyAuth as unknown as RequestHandler);

router.post(
  '/',
  validateBody(createNoteSchema),
  controller.createNote.bind(controller) as unknown as RequestHandler
);

router.get(
  '/',
  controller.getNotes.bind(controller) as unknown as RequestHandler
);

router.put(
  '/:id',
  validateBody(updateNoteSchema),
  controller.updateNote.bind(controller) as unknown as RequestHandler
);

router.delete(
  '/:id',
  controller.deleteNote.bind(controller) as unknown as RequestHandler
);

export default router;
