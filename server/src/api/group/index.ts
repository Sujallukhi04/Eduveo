import { authenticateToken } from '../../middleware/auth';
import * as controller from './controller';
import { Router } from 'express';

const router = Router();

// @ts-ignore
router.post('/create',authenticateToken  ,controller.createGroup);
//@ts-ignore
router.get('/created' ,authenticateToken ,controller.getUserGroups);

//@ts-ignore
router.get('/joined' ,authenticateToken ,controller.getGroupMembers);

//@ts-ignore
router.post('/join',authenticateToken,controller.joinGroup);

//@ts-ignore
router.get('/join-request',authenticateToken,controller.getJoinRequests);

//@ts-ignore
router.post('/accept-join-request',authenticateToken,controller.acceptJoinRequest);

//@ts-ignore
router.post('/reject-join-request',authenticateToken,controller.rejectJoinRequest);

//@ts-ignore
router.post('/group-details',authenticateToken,controller.getGroupById);

//@ts-ignore
router.post('/leave-group',authenticateToken,controller.leaveGroup);

//@ts-ignore
router.post('/delete-group',authenticateToken,controller.deleteGroup);

//@ts-ignore
router.get('/:groupId/messages',authenticateToken,controller.getGroupMessages);

// @ts-ignore
router.get('/:groupId/files', authenticateToken, controller.getGroupFiles);

// @ts-ignore
router.post('/:groupId/board/create', authenticateToken, controller.createBoard);
// @ts-ignore
router.get('/:groupId/board/list', authenticateToken, controller.getBoards);
// @ts-ignore
router.get('/:groupId/board/favorites/:id', authenticateToken, controller.getFavoriteBoards);
// @ts-ignore
router.post('/:groupId/board/favorite/:id', authenticateToken, controller.favoriteBoard);
// @ts-ignore
router.post('/:groupId/board/unfavorite/:id', authenticateToken, controller.unfavoriteBoard);
// @ts-ignore
router.post('/:groupId/board/rename/:id', authenticateToken, controller.updateBoard);
// @ts-ignore
router.post('/:groupId/board/delete/:id', authenticateToken, controller.deleteBoard);
// @ts-ignore
router.get('/:groupId/board/:id', authenticateToken, controller.getBoardById);

export default router;