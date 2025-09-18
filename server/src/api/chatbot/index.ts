import { Router } from 'express';
import { authenticateToken } from '../../middleware/auth';
import { generateResponse } from './controller';

const router = Router();
//@ts-ignore
router.post('/chat', authenticateToken, generateResponse);

export default router;
