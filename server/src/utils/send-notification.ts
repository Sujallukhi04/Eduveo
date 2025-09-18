import { db } from "prismaClient";
import webpush from "web-push";

// Configure web-push with your VAPID keys
webpush.setVapidDetails(
  "mailto:studywise.app.contact@gmail.com",
  process.env.PUBLIC_VAPID_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

interface NotificationPayload {
  title: string;
  body: string;
  type: "message" | "session" | "joinRequest" | "general";
  url?: string;
  data?: Record<string, any>;
}

export async function sendPushNotification(
  userId: string,
  notification: NotificationPayload
) {
  try {
    // Get all push subscriptions for the user
    const subscriptions = await db.pushSubscription.findMany({
      where: { userId },
    });

    if (!subscriptions.length) {
      console.log(`No push subscriptions found for user ${userId}`);
      return;
    }

    const notificationPayload = {
      title: notification.title,
      body: notification.body,
      type: notification.type,
      data: {
        url: notification.url || "/",
        type: notification.type,
        ...notification.data,
      },
    };

    const results = await Promise.allSettled(
      subscriptions.map(async (subscription) => {
        const pushSubscription = {
          endpoint: subscription.endpoint,
          keys: {
            auth: subscription.auth,
            p256dh: subscription.p256dh,
          },
        };

        try {
          await webpush.sendNotification(
            pushSubscription,
            JSON.stringify(notificationPayload)
          );

          return { success: true, subscriptionId: subscription.id };
        } catch (error: any) {
          if (error.statusCode === 404 || error.statusCode === 410) {
            await db.pushSubscription.delete({
              where: { id: subscription.id },
            });
          }

          return {
            success: false,
            subscriptionId: subscription.id,
            error: error.message,
          };
        }
      })
    );

    return results;
  } catch (error) {
    console.error("Error sending push notification:", error);
    throw error;
  }
}

// Helper function to send notification to a group
export async function sendGroupNotification(
  groupId: string,
  notification: Omit<NotificationPayload, "url">,
  excludeUserId?: string
) {
  try {
    // Get all members of the group
    const group = await db.group.findUnique({
      where: { id: groupId },
      include: {
        members: true,
      },
    });

    if (!group) {
      throw new Error(`Group ${groupId} not found`);
    }

    const memberIds = group.members
      .map((member) => member.id)
      .filter((id) => id !== excludeUserId);

    const results = await Promise.allSettled(
      memberIds.map((memberId) =>
        sendPushNotification(memberId, {
          ...notification,
          url: `/groups/${groupId}`,
        })
      )
    );

    return results;
  } catch (error) {
    console.error("Error sending group notification:", error);
    throw error;
  }
}

// Example usage for different notification types
export const NotificationService = {
  // Send new message notification
  async sendMessageNotification(
    groupId: string,
    messageContent: string,
    senderId: string,
    senderName: string
  ) {
    return sendGroupNotification(
      groupId,
      {
        title: `New message from ${senderName}`,
        body:
          messageContent.substring(0, 100) +
          (messageContent.length > 100 ? "..." : ""),
        type: "message",
        data: {
          senderId,
          groupId,
        },
      },
      senderId // Exclude sender from receiving the notification
    );
  },

  // Send session reminder notification
  async sendSessionReminder(
    groupId: string,
    sessionName: string,
    sessionTime: Date
  ) {
    return sendGroupNotification(groupId, {
      title: "Session Reminder",
      body: `"${sessionName}" starts in 15 minutes`,
      type: "session",
      data: {
        sessionTime: sessionTime.toISOString(),
        groupId,
      },
    });
  },

  // Send join request notification
  async sendJoinRequestNotification(
    groupId: string,
    userId: string,
    userName: string
  ) {
    const group = await db.group.findUnique({
      where: { id: groupId },
      select: { creatorId: true, name: true },
    });

    if (!group) {
      throw new Error("Group not found");
    }

    return sendPushNotification(group.creatorId, {
      title: "New Join Request",
      body: `${userName} wants to join "${group.name}"`,
      type: "joinRequest",
      url: `/groups/${groupId}/requests`,
      data: {
        userId,
        groupId,
      },
    });
  },
};
