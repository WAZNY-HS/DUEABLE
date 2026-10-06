/** Prefers the service worker (required on Android Chrome), falls back to the Notification constructor. */
export async function notify(title, body) {
  try {
    const registration = await navigator.serviceWorker?.getRegistration()
    if (registration) await registration.showNotification(title, { body, icon: '/icons/icon.svg' })
    else new Notification(title, { body })
  } catch {
    // Notifications are best-effort; never break the app over them.
  }
}
