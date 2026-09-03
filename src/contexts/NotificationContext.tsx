import React from "react";

const NOTIFICATION_DURATION = 3_000; // 3 seconds

type Notification = {
    id: number;
    message: string;
    type?: "success" | "error" | "info";
    color?: string;
};

type NotificationContextType = {
    notify: (message: string, type?: Notification["type"], color?: string) => void;
};

const NotificationContext = React.createContext<NotificationContextType | null>(null);

export const useNotificationContext = () => {
    const ctx = React.useContext(NotificationContext);
    if (!ctx) throw new Error("useNotification must be used inside provider");
    return ctx;
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [notifications, setNotifications] = React.useState<Notification[]>([]);

    const notify = (message: string, type: Notification["type"] = "info", color?: string) => {
        const id = Date.now();

        setNotifications((prev) => [...prev, { id, message, type, color }]);

        setTimeout(() => {
            setNotifications((prev) => prev.filter((n) => n.id !== id));
        }, NOTIFICATION_DURATION);
    };

    return (
        <NotificationContext.Provider value={{ notify }}>
            {children}

            <div className="notification-container">
                {notifications.map((n) => (
                    <div key={n.id} className={`notification-popup ${n.type}`} style={n.color ? { background: n.color } : undefined}>
                        {n.message}
                    </div>
                ))}
            </div>
        </NotificationContext.Provider>
    );
};