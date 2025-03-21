import { Notification } from './notification';
import { useNotifications } from './notifications-store';
import { Toaster } from "sonner";

export const Notifications = () => {
  const { notifications, dismissNotification } = useNotifications();

  return (
    <div
      aria-live="assertive"
      className="pointer-events-none fixed inset-0 z-[9999] flex flex-col items-end space-y-4 px-4 py-6 sm:items-start sm:p-6"
    >
      {notifications.filter(item => !item.toast).map((notification) => (
        <Notification
          key={notification.id}
          notification={notification}
          onDismiss={dismissNotification}
        />
      ))}
      <Toaster position='bottom-right' theme='system' 
        toastOptions={{
          classNames: {
            toast: "z-[9999] rounded-lg shadow-lg",
            success: "z-[9999] border-none bg-green-500 text-white hover:bg-green-400",
            error: "z-[9999] border-none bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
            warning: "z-[9999] border-none bg-yellow-500 text-yellow-900 hover:bg-yellow-400 text-white",
            info: "z-[9999] border-none bg-blue-500 text-blue-900 hover:bg-blue-400 text-white",
          },
        }}/>
    </div>
  );
};
