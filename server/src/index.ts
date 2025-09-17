import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import express, { Request, Response } from "express";
import session from "express-session";
//@ts-ignore
import cors from "cors";
import { createServer } from "http";
import morgan from "morgan";
import { Server } from "socket.io";
import OGrouter from "./api/ogData";
import groupRouter from "./api/group";
import sessionRouter from "./api/session";
import chat from "./api/chatbot";
import diagram from "./api/diagram";
import board from "./api/board";
import call from "./api/call";
import { setupAuthRoutes } from "./auth/route";
import { setupPushSubscriptionRoutes } from "./api/push-subscription";
import { authenticateToken } from "./middleware/auth";
import { initializeSessionReminders } from "./cron/sessionReminders";
import { initializeSocket } from "./socket";

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

// Initialize socket.io with all handlers
initializeSocket(io);

app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);

// Routes
app.use("/api/groups", groupRouter);
app.use("/api", OGrouter);
app.use("/api/sessions", sessionRouter);
app.use("/api/chatbot", chat);
app.use("/api/", diagram);
app.use("/api", board);
app.use("/api/call", call);
// Middleware for sessions
const SESSION_SECRET = process.env.SESSION_SECRET;
if (!SESSION_SECRET) {
  throw new Error("Missing SESSION_SECRET environment variable");
}

app.use(
  session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
  })
);

app.get("/", (_req: Request, res: Response) => {
  res.send("Express + TypeScript Server");
});

// Protected route example
//@ts-ignore
app.get("/me", authenticateToken, (req: Request, res: Response) => {
  //@ts-ignore
  res.json(req.user);
});

// Setup auth routes
setupAuthRoutes(app);

// Setup push subscription routes
setupPushSubscriptionRoutes(app);

// Initialize session reminders
initializeSessionReminders();

const port = process.env.PORT || 3000;
httpServer.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
