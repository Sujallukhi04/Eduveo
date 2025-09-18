import { db } from "../../prismaClient";
import { generateSessionReminderEmail } from "./mail";
import nodemailer from "nodemailer";
import { addMinutes, subMinutes } from "date-fns";
import { toZonedTime } from 'date-fns-tz';

// Configure nodemailer with Gmail SMTP
const transporter = nodemailer.createTransport({
  service: 'gmail',  // Using Gmail service
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,     
    pass: process.env.SMTP_PASS      
  }
});

export const sendSessionReminders = async () => {
  try {
    const timeZone = 'Asia/Kolkata';
    const now = new Date();
    const istTime = toZonedTime(now, timeZone);
    const thirtyMinutesFromNow = addMinutes(istTime, 30);

    console.log(`Checking for sessions between ${istTime} and ${thirtyMinutesFromNow} IST`);

    const upcomingSessions = await db.session.findMany({
      where: {
        time: {
          // Only find sessions starting in the next 30 minutes
          gt: now,
          lte: thirtyMinutesFromNow,
        },
        isStarted: false,
        endedAt: null,
      },
      include: {
        creator: true,
        group: {
          include: {
            members: {
              select: {
                email: true,
                name: true,
              },
            },
          },
        },
      },
    });

    console.log(upcomingSessions);
    

    console.log(`Found ${upcomingSessions.length} upcoming sessions`);

    for (const session of upcomingSessions) {
      console.log(`Processing reminders for session: ${session.name}`);
      const emailContent = generateSessionReminderEmail(session);

      for (const member of session.group.members) {
        try {
          await transporter.sendMail({
            from: process.env.SMTP_USER,
            to: member.email,
            subject: emailContent.subject,
            html: emailContent.html,
          });
          console.log(`Sent reminder to ${member.email} for session ${session.name}`);
        } catch (error) {
          console.error(`Failed to send email to ${member.email}:`, error);
        }
      }
    }
  } catch (error) {
    console.error("Error in sendSessionReminders:", error);
    throw error;
  }
}; 