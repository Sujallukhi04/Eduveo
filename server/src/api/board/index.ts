import { Router } from "express";
import { authenticateToken } from "../../middleware/auth";
import { liveblocksAuth } from "./controller";
const router = Router();
//@ts-ignore
router.post("/liveblocks-auth", authenticateToken, liveblocksAuth);

export default router;
