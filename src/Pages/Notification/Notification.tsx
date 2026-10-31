


import { useEffect, useState } from "react";
import axios from "axios";

type NotificationItem = Record<string, unknown>;

type FilterType = "all" | "unread";

const API_URL = "https://route-posts.routemisr.com";

const getRecord = (value: unknown): NotificationItem =>
  value && typeof value === "object" ? (value as NotificationItem) : {};

const getText = (value: unknown): string =>
  typeof value === "string" ? value : "";

const getNotificationId = (notification: NotificationItem): string =>
  getText(notification._id) || getText(notification.id);

const getSender = (notification: NotificationItem): NotificationItem =>
  getRecord(
    notification.sender ||
      notification.user ||
      notification.actor ||
      notification.from,
  );

const getNotificationName = (notification: NotificationItem): string => {
  const sender = getSender(notification);
  return getText(sender.name) || getText(sender.username) || "Someone";
};

const getNotificationPhoto = (notification: NotificationItem): string => {
  const sender = getSender(notification);
  return (
    getText(sender.photo) ||
    getText(sender.profilePhoto) ||
    "/default-profile.png"
  );
};

const getNotificationMessage = (notification: NotificationItem): string => {
  return (
    getText(notification.message) ||
    getText(notification.content) ||
    getText(notification.text) ||
    "interacted with your account"
  );
};

const getNotificationType = (notification: NotificationItem): string =>
  getText(notification.type).toLowerCase();

const isNotificationRead = (notification: NotificationItem): boolean =>
  Boolean(notification.isRead ?? notification.read ?? false);

const getNotificationTime = (dateValue: unknown): string => {
  const date = getText(dateValue);
  if (!date) return "";

  const timestamp = new Date(date).getTime();
  if (Number.isNaN(timestamp)) return "";

  const seconds = Math.floor((Date.now() - timestamp) / 1000);

  if (seconds < 60) return "now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d`;

  return `${Math.floor(seconds / 604800)}w`;
};

const getNotificationIcon = (type: string): string => {
  if (type.includes("comment")) return "💬";
  if (type.includes("like")) return "👍";
  if (type.includes("follow")) return "👤";
  if (type.includes("share")) return "↗";
  return "🔔";
};

export default function Notification() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [filter, setFilter] = useState<FilterType>("all");
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);
  const [, setReadingId] = useState<string | null>(null);

  const token = localStorage.getItem("token");

  const headers = {
    Authorization: `Bearer ${token}`,
  };

const fetchNotifications = async (currentFilter: FilterType) => {
  if (!token) {
    setLoading(false);
    return;
  }

  try {
    setLoading(true);

    const response = await axios.get(`${API_URL}/notifications`, {
      headers,
      params: {
        unread: currentFilter === "unread",
        page: 1,
        limit: 10,
      },
    });

    const responseData = getRecord(response.data);
    const data = getRecord(responseData.data);

    const list = Array.isArray(data.notifications)
      ? data.notifications
      : Array.isArray(responseData.notifications)
        ? responseData.notifications
        : Array.isArray(responseData.data)
          ? responseData.data
          : [];

    setNotifications(list as NotificationItem[]);
  } catch (error) {
    console.error("Notifications error:", error);
    setNotifications([]);
  } finally {
    setLoading(false);
  }
};

  const fetchUnreadCount = async () => {
    if (!token) return;

    try {
      const response = await axios.get(
        `${API_URL}/notifications/unread-count`,
        { headers },
      );

      const responseData = getRecord(response.data);
      const data = getRecord(responseData.data);

      const count =
        data.unreadCount ??
        data.count ??
        responseData.unreadCount ??
        responseData.count ??
        0;

      setUnreadCount(typeof count === "number" ? count : 0);
    } catch (error) {
      console.error("Unread count error:", error);
    }
  };

  useEffect(() => {
    fetchNotifications("all");
    fetchUnreadCount();
  }, []);

  const handleFilterChange = (newFilter: FilterType) => {
    setFilter(newFilter);
    fetchNotifications(newFilter);
  };


 const handleMarkAsRead = async (notification: NotificationItem) => {
   const id = getNotificationId(notification);
   if (!id || isNotificationRead(notification)) return;

   try {
     setReadingId(id);

     await axios.patch(`${API_URL}/notifications/${id}/read`, {}, { headers });

     if (filter === "unread") {
       setNotifications((prev) =>
         prev.filter((item) => getNotificationId(item) !== id),
       );
     } else {
      setNotifications((prev) =>
        prev.map((item) =>
          getNotificationId(item) === id
            ? { ...item, isRead: true, read: true }
            : item,
        ),
      );
     }

     setUnreadCount((prev) => Math.max(0, prev - 1));
   } catch (error) {
     console.error("Mark notification as read error:", error);
   } finally {
     setReadingId(null);
   }
 };

 const handleMarkAllAsRead = async () => {
   try {
     setMarkingAll(true);

     await axios.patch(`${API_URL}/notifications/read-all`, {}, { headers });

     if (filter === "unread") {
       setNotifications([]);
     } else {
      setNotifications((prev) =>
        prev.map((item) => ({
          ...item,
          isRead: true,
          read: true,
        })),
      );
      setUnreadCount(0);
     }

     setUnreadCount(0);
   } catch (error) {
     console.error("Mark all as read error:", error);
   } finally {
     setMarkingAll(false);
   }
  };
  const displayedNotifications =
    filter === "unread"
      ? notifications.filter((item) => !isNotificationRead(item))
      : notifications;

  return (
    <div className="mx-auto max-w-7xl px-3 py-3.5">
      <main className="min-w-0">
        <section className="rounded-xl border border-slate-200 bg-white shadow-sm sm:rounded-2xl">
          <div className="border-b border-slate-200 p-4 sm:p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-black text-slate-900 sm:text-2xl">
                  Notifications
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Realtime updates for likes, comments, shares, and follows.
                </p>
                <p className="mt-1 text-xs font-semibold text-slate-500">
                  {unreadCount} unread notifications
                </p>
              </div>

              <button
                type="button"
                onClick={handleMarkAllAsRead}
                disabled={markingAll || unreadCount === 0}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              >
                <span>✓✓</span>
                {markingAll ? "Marking..." : "Mark all as read"}
              </button>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2 sm:flex sm:items-center">
              <button
                type="button"
                onClick={() => handleFilterChange("all")}
                className={`rounded-full px-4 py-1.5 text-sm font-bold transition ${
                  filter === "all"
                    ? "bg-[#1877f2] text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                All
              </button>

              <button
                type="button"
                onClick={() => handleFilterChange("unread")}
                className={`inline-flex items-center justify-center gap-2 rounded-full px-4 py-1.5 text-sm font-bold transition ${
                  filter === "unread"
                    ? "bg-[#1877f2] text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                Unread
                {unreadCount > 0 && (
                  <span className="rounded-full bg-white/20 px-1.5 text-xs">
                    {unreadCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          <div className="space-y-2 p-3 sm:p-4">
            {loading ? (
              <div className="py-10 text-center text-sm font-semibold text-slate-500">
                Loading notifications...
              </div>
            ) : displayedNotifications.length === 0 ? (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-8 text-center">
                <p className="text-sm font-semibold text-slate-500">
                  No notifications yet.
                </p>
              </div>
            ) : (
              notifications.map((notification, index) => {
                const id = getNotificationId(notification) || String(index);
                const read = isNotificationRead(notification);
                const type = getNotificationType(notification);

                return (
                  <article
                    key={id}
                    className={`group relative flex gap-3 rounded-xl border p-3 transition sm:rounded-2xl sm:p-4 ${
                      read
                        ? "border-slate-200 bg-white"
                        : "border-[#dbeafe] bg-[#edf4ff]"
                    }`}
                  >
                    <div className="relative shrink-0">
                      <button type="button" className="block cursor-pointer">
                        <img
                          alt={getNotificationName(notification)}
                          className="h-11 w-11 rounded-full object-cover"
                          src={getNotificationPhoto(notification)}
                        />
                      </button>

                      <span className="absolute -bottom-1 -right-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-white text-xs ring-2 ring-white">
                        {getNotificationIcon(type)}
                      </span>
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-start justify-between gap-1.5 sm:gap-2">
                        <p className="text-sm leading-6 text-slate-800">
                          <span className="font-extrabold">
                            {getNotificationName(notification)}
                          </span>{" "}
                          {getNotificationMessage(notification)}
                        </p>

                        <div className="flex items-center gap-1.5 sm:gap-2">
                          <span className="text-xs font-semibold text-slate-500">
                            {getNotificationTime(
                              notification.createdAt || notification.created_at,
                            )}
                          </span>

                          {!read && (
                            <span className="text-xl leading-none text-[#1877f2]">
                              ·
                            </span>
                          )}
                        </div>
                      </div>

                      {read ? (
                        <span className="text-xs font-bold text-slate-500">
                          Read
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleMarkAsRead(notification)}
                          className="inline-flex items-center gap-1.5 rounded-md bg-white px-2.5 py-1 text-xs font-bold text-[#1877f2] ring-1 ring-[#dbeafe]"
                        >
                          ✓ Mark as read
                        </button>
                      )}
                    </div>
                  </article>
                );
              })
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

