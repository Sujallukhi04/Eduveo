import express from "express";
import { authenticateToken } from "../middleware/auth";
import { pushSubscriptionSchema } from "../types";
import { db } from "../prismaClient";
import { Request, Response } from "express";
import z from "zod";
import { TokenPayload } from "../types";

const app = express();

export const setupPushSubscriptionRoutes = (app: express.Application) => {
  app.post(
    "/push-subscription",
    //@ts-ignore
    authenticateToken,
    async (req: Request, res: Response) => {
      try {
        const validatedData = pushSubscriptionSchema.parse(req.body);
        const { endpoint, auth, p256dh } = validatedData;
        const { id } = req.user as TokenPayload;

        const existingSubscription = await db.pushSubscription.findUnique({
          where: { endpoint },
        });

        if (existingSubscription) {
          await db.pushSubscription.update({
            where: { id: existingSubscription.id },
            data: {
              auth,
              p256dh,
            },
          });
        } else {
          await db.pushSubscription.create({
            data: {
              endpoint,
              auth,
              p256dh,
              userId: id,
            },
          });
        }

        res.status(200).json({
          message: "Push subscription created successfully",
        });
      } catch (error) {
        if (error instanceof z.ZodError) {
          return res.status(400).json({ errors: error.errors });
        }
        console.error("Error creating push subscription:", error);
        res.status(500).json({ message: "Internal server error" });
      }
    }
  );

  app.delete(
    "/push-subscription",
    //@ts-ignore
    authenticateToken,
    async (req: Request, res: Response) => {
      try {
        const validatedData = pushSubscriptionSchema.parse(req.body);
        const { endpoint } = validatedData;
        const { id } = req.user as TokenPayload;
        const subscription = await db.pushSubscription.findUnique({
          where: { endpoint },
        });

        if (!subscription) {
          return res.status(404).json({ message: "Subscription not found" });
        }

        if (subscription.userId !== id) {
          return res
            .status(403)
            .json({ message: "Unauthorized to delete this subscription" });
        }

        await db.pushSubscription.delete({
          where: { endpoint },
        });

        res
          .status(200)
          .json({ message: "Push subscription deleted successfully" });
      } catch (error) {
        if (error instanceof z.ZodError) {
          return res.status(400).json({ errors: error.errors });
        }
        console.error("Error deleting push subscription:", error);
        res.status(500).json({ message: "Internal server error" });
      }
    }
  );
};
