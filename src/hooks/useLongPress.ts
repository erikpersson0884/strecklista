import { useRef, useCallback, useEffect } from 'react';

interface LongPressOptions {
    onLongPress: () => void;
    onClick?: () => void;
    ms?: number;
}

export function useLongPress({ onLongPress, onClick, ms = 500 }: LongPressOptions) {
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const triggeredRef = useRef(false);

    const clear = useCallback(() => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }
    }, []);

    const start = useCallback(() => {
        clear(); // never leave an earlier timer running
        triggeredRef.current = false;
        timerRef.current = setTimeout(() => {
            timerRef.current = null;
            triggeredRef.current = true;
            onLongPress();
        }, ms);
    }, [onLongPress, ms, clear]);

    useEffect(() => clear, [clear]); // no long press after unmount

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
        onTouchMove: clear,   // scrolling is not a long press
        onTouchCancel: clear,
        onClick: handleClick,
    };
}