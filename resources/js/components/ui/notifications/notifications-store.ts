import { nanoid } from 'nanoid';
import { useEffect } from 'react';
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
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  dismissNotification: (id: string) => void;
  dismissEarliestNotification: () => void;
};

export const useNotifications = create<NotificationsStore>((set) => ({
  notifications: [],
  addNotification: (notification) =>
    set((state) => ({
      notifications: [
        ...state.notifications,
        { id: nanoid(), ...notification },
      ],
    })),
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


export const useAutoDismissNotifications = (interval: number) => {
  useEffect(() => {
    const dismissInterval = setInterval(() => {
      const { notifications, dismissEarliestNotification } = useNotifications.getState();
      if (notifications.length > 0) {
        dismissEarliestNotification();
      }
    }, interval);

    return () => clearInterval(dismissInterval); 
  }, [interval]);
};