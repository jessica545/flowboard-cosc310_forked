"use client";

import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";

export interface Notification {
  id: string;
  message: string;
  timestamp: string;
  read: boolean;
  taskId?: string;
}

// Make sure we have access to localStorage
const isClient = typeof window !== 'undefined';

// Debounce function to prevent rapid localStorage updates
const debounce = (func: Function, wait: number) => {
  let timeout: NodeJS.Timeout;
  return (...args: any[]) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

export const useTaskNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loaded, setLoaded] = useState(false);
  
  // Load notifications on component mount
  useEffect(() => {
    if (!isClient) return;
    
    const loadNotifications = () => {
      try {
        const storedNotifications = localStorage.getItem("notifications");
        if (storedNotifications) {
          const parsedNotifications = JSON.parse(storedNotifications);
          setNotifications(parsedNotifications);
        } else {
          setNotifications([]);
        }
      } catch (error) {
        localStorage.removeItem("notifications");
        setNotifications([]);
      } finally {
        setLoaded(true);
      }
    };

    loadNotifications();

    // Listen for storage events from other tabs
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'notifications' && e.newValue !== null) {
        try {
          const newNotifications = JSON.parse(e.newValue);
          setNotifications(newNotifications);
        } catch (error) {
          // Handle error silently
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Debounced save to localStorage
  const debouncedSave = debounce((notifs: Notification[]) => {
    if (!isClient) return;
    try {
      localStorage.setItem("notifications", JSON.stringify(notifs));
    } catch (error) {
      // Handle error silently
    }
  }, 1000);

  // Save notifications when they change
  useEffect(() => {
    if (!loaded) return;
    debouncedSave(notifications);
  }, [notifications, loaded]);

  const addNotification = (message: string, taskId?: string) => {
    const newNotification: Notification = {
      id: uuidv4(),
      message,
      timestamp: new Date().toISOString(),
      read: false,
      taskId
    };
    
    setNotifications(prev => [newNotification, ...prev]);
    return newNotification;
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true } 
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => 
      prev.filter(notification => notification.id !== id)
    );
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    if (isClient) {
      localStorage.removeItem("notifications");
    }
  };
  
  const getUnreadCount = () => {
    return notifications.filter(n => !n.read).length;
  };

  return {
    notifications,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAllNotifications,
    getUnreadCount
  };
}; 