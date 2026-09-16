import { createContext, useCallback, useContext, useEffect, useRef, useState, ReactNode } from 'react';
import api from '@/api/axiosInstance';

// Adjust to match your backend's actual route.
const HEALTH_ENDPOINT = '/health';

// How often to poll while the tab is visible.
const POLL_INTERVAL_MS = 60000;

// Require this many consecutive failures before flipping to "offline", so a
// single dropped request doesn't flash the banner. Only one success is needed
// to flip back to "online" - recovering should feel immediate.
const FAILURES_BEFORE_OFFLINE = 2;

interface ConnectionContextProps {
    isConnected: boolean;
    isChecking: boolean;
    lastCheckedAt: Date | null;
    checkNow: () => Promise<void>;
}

const ConnectionContext = createContext<ConnectionContextProps | undefined>(undefined);

export const ConnectionProvider = ({ children }: { children: ReactNode }) => {
    const [isConnected, setIsConnected] = useState<boolean>(true);
    const [isChecking, setIsChecking] = useState<boolean>(false);
    const [lastCheckedAt, setLastCheckedAt] = useState<Date | null>(null);

    // Not exposed in the context value - consumers only need to know the
    // resulting isConnected boolean, not how many failures led to it.
    const consecutiveFailures = useRef<number>(0);

    const checkNow = useCallback(async () => {
        setIsChecking(true);
        try {
            await api.get(HEALTH_ENDPOINT);
            consecutiveFailures.current = 0;
            setIsConnected(true);
        } catch {
            consecutiveFailures.current += 1;
            if (consecutiveFailures.current >= FAILURES_BEFORE_OFFLINE) {
                setIsConnected(false);
            }
        } finally {
            setLastCheckedAt(new Date());
            setIsChecking(false);
        }
    }, []);

    useEffect(() => {
        checkNow();

        const interval = setInterval(checkNow, POLL_INTERVAL_MS);

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') checkNow();
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('focus', checkNow);

        return () => {
            clearInterval(interval);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('focus', checkNow);
        };
    }, [checkNow]);

    return (
        <ConnectionContext.Provider value={{ isConnected, isChecking, lastCheckedAt, checkNow }}>
            {children}
        </ConnectionContext.Provider>
    );
};

export const useConnectionContext = (): ConnectionContextProps => {
    const context = useContext(ConnectionContext);
    if (!context) {
        throw new Error('useConnectionContext must be used within a ConnectionProvider');
    }
    return context;
};

export default useConnectionContext;