import { authenticateToken } from '../../middleware/auth';
import * as controller from './controller';
import { Router } from 'express';

const router = Router();

// Create session
// @ts-ignore
router.post('/', authenticateToken, controller.createSession);

// Get all sessions for a group
// @ts-ignore
router.get('/group/:groupId', authenticateToken, controller.getAllSessions);


// @ts-ignore   
router.delete('/:sessionId', authenticateToken, controller.deleteSession);

// Update session by ID
// @ts-ignore
router.put('/:sessionId', authenticateToken, controller.updateSession);

// New routes for session management
// @ts-ignore
router.post('/:sessionId/start', authenticateToken, controller.startSession);
// @ts-ignore
router.post('/:sessionId/end', authenticateToken, controller.endSession);


export default router;