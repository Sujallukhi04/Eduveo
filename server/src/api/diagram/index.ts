import { Router } from "express";
import { authenticateToken } from "../../middleware/auth";
import { generateDiagram } from "./controller";

const router = Router();
//@ts-ignore
router.post("/diagram", authenticateToken, generateDiagram);

export default router;
