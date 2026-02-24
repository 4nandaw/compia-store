export function getNotifications() {
  try {
    return JSON.parse(localStorage.getItem("compia_notifications") || "[]");
  } catch {
    return [];
  }
}

export function getNotificationsByRole(role) {
  return getNotifications().filter((n) => n.role === role);
}

export function addNotification(notification) {
  const existing = getNotifications();
  const withId = {
    id: notification.id || `notif-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: notification.createdAt || new Date().toISOString(),
    read: notification.read ?? false,
    ...notification,
  };
  const updated = [...existing, withId];
  localStorage.setItem("compia_notifications", JSON.stringify(updated));
  return withId;
}

export function markNotificationsAsReadByRole(role) {
  const all = getNotifications();
  const updated = all.map((n) =>
    n.role === role ? { ...n, read: true } : n
  );
  localStorage.setItem("compia_notifications", JSON.stringify(updated));
  return updated;
}

