import { Router } from 'express';
import { register, login } from '../controllers/auth.controller.js';
import { createRateLimiter } from '../middleware/rate-limit.js';

const router = Router();
const authRateLimiter = createRateLimiter({ windowMs: 15 * 60 * 1000, maxRequests: 30 });

// POST /api/register
router.post('/register', authRateLimiter, register);

// POST /api/login
router.post('/login', authRateLimiter, login);

export default router;
