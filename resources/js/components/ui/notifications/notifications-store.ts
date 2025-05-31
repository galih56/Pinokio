import { nanoid } from 'nanoid';
import { useEffect } from 'react';
import { toast } from 'sonner';
import { create } from 'zustand';

export type Notification = {
  id: string;
  type: 'info' | 'warning' | 'success' | 'error';
  title: string;
  message?: string;
  createdAt: number;
};

type NotificationsStore = {
  notifications: Notification[];
  addNotification: ( notification: Omit<Notification, "id" | "createdAt"> ) => void;
  dismissNotification: (id: string) => void;
  dismissEarliestNotification: () => void;
};

export const useNotifications = create<NotificationsStore>((set) => ({
    notifications: [],
    
    addNotification: (notification) => {
      const newNotification = { 
        id: nanoid(), 
        createdAt: Date.now(), 
        ...notification 
      };

      set((state) => ({
        notifications: [...state.notifications, newNotification],
      }));

      const toastOptions =  {
        description: notification.message,
        duration: 5000, // Auto-dismiss in 5s
      };

      switch (notification.type) {
        case 'success':
          toast.success(notification.title, toastOptions);
          break;
        case 'error':
          toast.error(notification.title, toastOptions);
          break;
        default:
          toast(notification.title, toastOptions);
          break;
      }
    },
    dismissNotification: (id) =>
      set((state) => ({
        notifications: state.notifications.filter(
          (notification) => notification.id !== id,
        ),
    })),
    dismissEarliestNotification: () =>
      set((state) => ({
        notifications: state.notifications
          .slice()
          .sort((a, b) => a.createdAt - b.createdAt)
          .slice(1), 
      })),
}));

