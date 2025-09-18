import { getReadyServiceWorker } from "@/lib/serviceWorker";
import axios from "axios";

export async function getCurrentPushSubscription(): Promise<PushSubscription | null> {
  const sw = await getReadyServiceWorker();
  return sw.pushManager.getSubscription();
}

const PUBLIC_KEY = import.meta.env.VITE_PUBLIC_VAPID_KEY as string;
const API = import.meta.env.VITE_API_URL as string;

export async function registerPushNotifications() {
  if (!("PushManager" in window)) {
    throw Error("Push notifications are not supported by this browser");
  }

  const existingSubscription = await getCurrentPushSubscription();
  if (existingSubscription) {
    throw Error("Push notifications are already enabled");
  }
  const sw = await getReadyServiceWorker();

  const subscription = await sw.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: PUBLIC_KEY,
  });

  await sendPushSubscriptionToServer(subscription);
}

export async function unregisterPushNotification() {
  const existingSubscription = await getCurrentPushSubscription();
  if (!existingSubscription) {
    throw Error("Push notifications are not enabled");
  }

  await deletePushSubscriptionFromServer(existingSubscription);

  await existingSubscription.unsubscribe();
}

export async function sendPushSubscriptionToServer(
  subscription: PushSubscription
) {
  const { endpoint } = subscription;
  const key = subscription.getKey("p256dh");
  const auth = subscription.getKey("auth");

  const body = {
    endpoint,
    p256dh: key ? btoa(String.fromCharCode(...new Uint8Array(key))) : "",
    auth: auth ? btoa(String.fromCharCode(...new Uint8Array(auth))) : "",
  };

  try {
    const response = await axios.post(`${API}/push-subscription`, body, {
      withCredentials: true,
    });

    if (response.status !== 200) {
      throw Error("Failed to send push subscription to server");
    }
  } catch (error) {
    console.error("Error sending push subscription:", error);
    throw Error("Failed to send push subscription to server");
  }
}

export async function deletePushSubscriptionFromServer(
  subscription: PushSubscription
) {
  const { endpoint } = subscription;
  const key = subscription.getKey("p256dh");
  const auth = subscription.getKey("auth");

  const body = {
    endpoint,
    p256dh: key ? btoa(String.fromCharCode(...new Uint8Array(key))) : "",
    auth: auth ? btoa(String.fromCharCode(...new Uint8Array(auth))) : "",
  };

  try {
    const response = await axios.delete(`${API}/push-subscription`, {
      data: body,
      withCredentials: true,
    });

    if (response.status !== 200) {
      throw Error("Failed to delete push subscription from server");
    }
  } catch (error) {
    console.error("Error deleting push subscription:", error);
    throw Error("Failed to delete push subscription from server");
  }
}
