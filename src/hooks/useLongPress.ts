// hooks/useLongPress.ts
import { useRef, useCallback } from 'react';

interface LongPressOptions {
    onLongPress: () => void;
    onClick?: () => void;
    ms?: number;
}

export function useLongPress({ onLongPress, onClick, ms = 500 }: LongPressOptions) {
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const triggeredRef = useRef(false);

    const start = useCallback(() => {
        triggeredRef.current = false;
        timerRef.current = setTimeout(() => {
            triggeredRef.current = true;
            onLongPress();
        }, ms);
    }, [onLongPress, ms]);

    const clear = useCallback(() => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }
    }, []);

    const handleClick = useCallback(() => {
        if (triggeredRef.current) {
            triggeredRef.current = false; // swallow the click after a long press
            return;
        }
        onClick?.();
    }, [onClick]);

    return {
        onMouseDown: start,
        onMouseUp: clear,
        onMouseLeave: clear,
        onTouchStart: start,
        onTouchEnd: clear,
        onClick: handleClick,
    };
}