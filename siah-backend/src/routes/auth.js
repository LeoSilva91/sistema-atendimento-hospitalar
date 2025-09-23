import express from 'express';
import { AuthController } from '../controllers/authController.js';
import { validate } from '../middlewares/validation.js';
import { authRateLimiter } from '../middlewares/rateLimiter.js';
import { 
  loginSchema, 
  registerSchema, 
  refreshTokenSchema 
} from '../dto/auth.dto.js';

const router = express.Router();
const authController = new AuthController();

// POST /api/auth/login - Login
router.post('/login', 
  authRateLimiter,
  validate(loginSchema),
  (req, res, next) => authController.login(req, res, next)
);

// POST /api/auth/register - Registro
router.post('/register', 
  validate(registerSchema),
  (req, res, next) => authController.register(req, res, next)
);

// POST /api/auth/refresh - Renovar token
router.post('/refresh', 
  validate(refreshTokenSchema),
  (req, res, next) => authController.refreshToken(req, res, next)
);

// POST /api/auth/logout - Logout
router.post('/logout', 
  (req, res, next) => authController.logout(req, res, next)
);

export default router;