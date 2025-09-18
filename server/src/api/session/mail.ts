// send mail before session start

import { Session, User, Group } from "@prisma/client";

interface SessionWithDetails extends Session {
  creator: User;
  group: Group;
}

export const generateSessionReminderEmail = (session: SessionWithDetails) => {
  const sessionTime = new Date(session.time).toLocaleString();

  return {
    subject: `Reminder: ${session.name} starts in 30 minutes`,
    html: `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>StudyWise - Your Learning Adventure Awaits!</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 0; ">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <!-- Brand Header -->
        <div style="text-align: center; padding: 30px 0; background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: white; border-radius: 16px; margin-bottom: 25px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
            <div style="font-size: 32px; font-weight: bold; margin-bottom: 10px;">📚 StudyWise</div>
            <h2 style="margin: 0; font-size: 24px;">Your Learning Journey Continues!</h2>
        </div>

        <!-- Excitement Builder -->
        <div style="text-align: center; margin: 25px 0; padding: 25px; background-color: white; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
            <h3 style="color: #1e40af; font-size: 22px; margin-bottom: 15px;">🌟 Adventure Awaits!</h3>
            <p style="font-size: 16px; color: #1e293b;">Get ready to embark on an exciting learning journey. Your next knowledge-packed session is coming up!</p>
        </div>

        <!-- Session Details -->
        <div style="background-color: white; padding: 30px; border-radius: 16px; margin: 25px 0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
            <h3 style="color: #1e40af; font-size: 22px; margin-bottom: 20px;">⭐ Your Session Details</h3>
            
            <div style="display: flex; margin: 15px 0; padding: 15px; background-color: #f0f9ff; border-radius: 10px;">
                <span style="color: #3b82f6; font-weight: bold; min-width: 100px;">When:</span>
                <span>${sessionTime}</span>
            </div>
            
            <div style="display: flex; margin: 15px 0; padding: 15px; background-color: #f0f9ff; border-radius: 10px;">
                <span style="color: #3b82f6; font-weight: bold; min-width: 100px;">Group:</span>
                <span>${session.group.name}</span>
            </div>
            
            <div style="display: flex; margin: 15px 0; padding: 15px; background-color: #f0f9ff; border-radius: 10px;">
                <span style="color: #3b82f6; font-weight: bold; min-width: 100px;">Host:</span>
                <span>${session.creator.name}</span>
            </div>

            ${
              session.description
                ? `
            <div style="display: flex; margin: 15px 0; padding: 15px; background-color: #f0f9ff; border-radius: 10px;">
                <span style="color: #3b82f6; font-weight: bold; min-width: 100px;">What:</span>
                <span>${session.description}</span>
            </div>
            `
                : ""
            }
        </div>

        <!-- Quick Tips -->
        <div style="background-color: white; padding: 25px; border-radius: 16px; margin: 25px 0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
            <h3 style="color: #1e40af; font-size: 22px; text-align: center; margin-bottom: 20px;">🚀 Power Tips for Success</h3>
            <div style="padding: 10px; background-color: #f0f9ff; border-radius: 10px; margin-bottom: 10px;">
                ⏰ Join 5 minutes early to settle in
            </div>
            <div style="padding: 10px; background-color: #f0f9ff; border-radius: 10px; margin-bottom: 10px;">
                📝 Have your notes ready to capture insights
            </div>
            <div style="padding: 10px; background-color: #f0f9ff; border-radius: 10px;">
                💡 Come with your questions prepared
            </div>
        </div>

        <!-- Footer -->
        <div style="text-align: center; color: #64748b; font-size: 12px; padding: 20px;">
            <p>© 2025 StudyWise • Making Learning Awesome!</p>
        </div>
    </div>
</body>
</html>

    `,
  };
};
