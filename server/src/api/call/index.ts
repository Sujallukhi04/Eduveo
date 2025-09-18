import { Router } from 'express';
import { authenticateToken } from '../../middleware/auth';
import {tokenProvider}  from './controller';

const router = Router();
//@ts-ignore
router.post('/get-token', authenticateToken, tokenProvider);

export default router;
