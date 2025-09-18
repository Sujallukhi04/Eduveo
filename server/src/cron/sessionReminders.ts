import cron from "node-cron";
import { sendSessionReminders } from "../api/session/notification.service";

// Run every 1 minutes
export const initializeSessionReminders = () => {
  cron.schedule("25 * * * *", async () => {
    console.log("Checking for upcoming sessions...", new Date().toISOString());
    try {
      await sendSessionReminders();
    } catch (error) {
      console.error("Error in session reminder cron:", error);
    }
  });
  
  console.log("Session reminder cron job initialized");
}; 