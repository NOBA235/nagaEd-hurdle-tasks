import { Router } from 'express';
import { getUserProfile } from '../controllers/users.controller.js';
import { authenticate } from '../middleware/authenticate.js';

const router = Router();

// GET /api/users/:id (Protected: Requires Bearer JWT)
router.get('/:id', authenticate, getUserProfile);

export default router;

