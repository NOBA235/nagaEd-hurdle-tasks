import { Router } from 'express';
import { register, login } from '../controllers/auth.controller.js';

const router = Router();

// POST /api/register
router.post('/register', register);

// POST /api/login
router.post('/login', login);

export default router;
