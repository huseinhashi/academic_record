import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import axios from "@/lib/axios";

export const useNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [allNotifications, setAllNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingAll, setLoadingAll] = useState(false);
  const [error, setError] = useState(null);

  const fetchNotifications = useCallback(async () => {
    try {
      const response = await axios.get("/notifications?limit=5");
      setNotifications(response.data.data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }, []);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await axios.get("/notifications/unread/count");
      setUnreadCount(response.data.count);
    } catch (err) {
      console.error("Error fetching unread count:", err);
    }
  }, []);

  const fetchAllNotifications = useCallback(async () => {
    try {
      setLoadingAll(true);
      const response = await axios.get("/notifications");
      setAllNotifications(response.data.data);
      setLoadingAll(false);
    } catch (err) {
      setError(err.message);
      setLoadingAll(false);
    }
  }, []);

  const markAsRead = async (notificationId) => {
    try {
      await axios.patch(`/notifications/${notificationId}/read`);
      setNotifications((prev) =>
        prev.map((notification) =>
          notification._id === notificationId
            ? { ...notification, isRead: true }
            : notification
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Error marking notification as read:", err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.patch("/notifications/read-all");
      setNotifications((prev) =>
        prev.map((notification) => ({ ...notification, isRead: true }))
      );
      setUnreadCount(0);
    } catch (err) {
      console.error("Error marking all notifications as read:", err);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await axios.delete(`/notifications/${notificationId}`);
      setNotifications((prev) =>
        prev.filter((notification) => notification._id !== notificationId)
      );
      if (!notifications.find((n) => n._id === notificationId)?.isRead) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error("Error deleting notification:", err);
    }
  };

  const deleteAllNotifications = async () => {
    try {
      await axios.delete("/notifications");
      setNotifications([]);
      setUnreadCount(0);
    } catch (err) {
      console.error("Error deleting all notifications:", err);
    }
  };

  // Initial fetch
  useEffect(() => {
    if (user) {
      fetchNotifications();
      fetchUnreadCount();
    }
  }, [user, fetchNotifications, fetchUnreadCount]);

  // Poll for new notifications every minute
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      fetchUnreadCount();
    }, 60000); // 1 minute

    return () => clearInterval(interval);
  }, [user, fetchUnreadCount]);

  return {
    notifications,
    allNotifications,
    unreadCount,
    loading,
    loadingAll,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications,
    refreshNotifications: fetchNotifications,
    fetchAllNotifications,
  };
};
