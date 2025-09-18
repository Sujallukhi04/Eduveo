import { authenticateToken } from "../../middleware/auth";
import * as controller from "./controller";
import { Router } from "express";

const OGrouter = Router();

// @ts-ignore
OGrouter.get("/og-data", authenticateToken, controller.getOgData);

export default OGrouter;
