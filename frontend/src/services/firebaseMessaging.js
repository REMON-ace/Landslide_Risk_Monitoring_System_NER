import { getApp, getApps, initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { registerNotificationDevice } from '../api/client';

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};
const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;

function isConfigured() {
  return Boolean(vapidKey && Object.values(config).every(Boolean));
}

const firebaseApp = isConfigured()
  ? (getApps().length ? getApp() : initializeApp(config))
  : null;

export async function enableLiveNotifications(onForegroundMessage) {
  if (!('Notification' in window) || !('serviceWorker' in navigator)) {
    throw new Error('This browser does not support push notifications.');
  }
  if (!isConfigured()) {
    throw new Error('Live notifications are not configured yet.');
  }
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    throw new Error('Notification permission was not granted.');
  }

  const query = new URLSearchParams(config).toString();
  const registration = await navigator.serviceWorker.register(`/firebase-messaging-sw.js?${query}`);
  const messaging = getMessaging(firebaseApp);
  const token = await getToken(messaging, { vapidKey, serviceWorkerRegistration: registration });
  if (!token) throw new Error('Unable to create a notification subscription.');

  await registerNotificationDevice(token);
  if (onForegroundMessage) onMessage(messaging, onForegroundMessage);
  return token;
}

export function listenForForegroundNotifications(callback) {
  if (!firebaseApp) return () => {};
  return onMessage(getMessaging(firebaseApp), callback);
}
