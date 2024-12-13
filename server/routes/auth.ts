import { Router } from 'express';
import { loginUser } from '../services/auth';
import { asyncHandler } from '../middleware/async';
import { ensureDatabaseConnection } from '../middleware/database';

const router = Router();

// Ensure database connection for all auth routes
router.use(ensureDatabaseConnection);

router.post('/login', asyncHandler(async (req, res) => {
  const { username, password } = req.body;
  const result = await loginUser(username, password);
  res.json(result);
}));

export { router as authRouter };