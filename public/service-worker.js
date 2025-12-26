// Minimal service worker for SAT Tracker MVP.
// Notifications are triggered from the client via registration.showNotification.

self.addEventListener("install", (event) => {
  // Activate immediately on install for MVP.
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  // Take control of uncontrolled clients as soon as possible.
  event.waitUntil(self.clients.claim());
});


