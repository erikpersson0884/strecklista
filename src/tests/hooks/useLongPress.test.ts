import { act, renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useLongPress } from '@/hooks/useLongPress';

describe('useLongPress', () => {
    const onLongPress = vi.fn();
    const onClick = vi.fn();

    beforeEach(() => {
        vi.useFakeTimers();
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    const setup = (ms?: number) =>
        renderHook(() => useLongPress({ onLongPress, onClick, ms })).result;

    describe('long press', () => {
        it('fires after 500 ms by default, and not before', () => {
            const result = setup();

            act(() => result.current.onMouseDown());
            act(() => { vi.advanceTimersByTime(499); });
            expect(onLongPress).not.toHaveBeenCalled();

            act(() => { vi.advanceTimersByTime(1); });
            expect(onLongPress).toHaveBeenCalledTimes(1);
        });

        it('respects a custom delay', () => {
            const result = setup(1000);

            act(() => result.current.onMouseDown());
            act(() => { vi.advanceTimersByTime(999); });
            expect(onLongPress).not.toHaveBeenCalled();

            act(() => { vi.advanceTimersByTime(1); });
            expect(onLongPress).toHaveBeenCalledTimes(1);
        });

        it('fires only once per press', () => {
            const result = setup();

            act(() => result.current.onMouseDown());
            act(() => { vi.advanceTimersByTime(5000); });

            expect(onLongPress).toHaveBeenCalledTimes(1);
        });

        it('works with touch', () => {
            const result = setup();

            act(() => result.current.onTouchStart());
            act(() => { vi.advanceTimersByTime(500); });

            expect(onLongPress).toHaveBeenCalledTimes(1);
        });
    });

    describe('cancelling', () => {
        it.each([
            ['mouse up', 'onMouseUp'],
            ['mouse leave', 'onMouseLeave'],
            ['touch end', 'onTouchEnd'],
        ] as const)('releasing early (%s) cancels the long press', (_name, handler) => {
            const result = setup();

            act(() => result.current.onMouseDown());
            act(() => { vi.advanceTimersByTime(300); });
            act(() => result.current[handler]());
            act(() => { vi.advanceTimersByTime(1000); });

            expect(onLongPress).not.toHaveBeenCalled();
        });

        // The tests below need the updated hook above.
        it('scrolling (touch move) cancels the long press', () => {
            const result = setup();

            act(() => result.current.onTouchStart());
            act(() => { vi.advanceTimersByTime(300); });
            act(() => result.current.onTouchMove());
            act(() => { vi.advanceTimersByTime(1000); });

            expect(onLongPress).not.toHaveBeenCalled();
        });

        it('a touch cancel cancels the long press', () => {
            const result = setup();

            act(() => result.current.onTouchStart());
            act(() => result.current.onTouchCancel());
            act(() => { vi.advanceTimersByTime(1000); });

            expect(onLongPress).not.toHaveBeenCalled();
        });

        it('pressing twice without releasing still fires only once', () => {
            const result = setup();

            act(() => result.current.onTouchStart());
            act(() => { vi.advanceTimersByTime(200); });
            act(() => result.current.onMouseDown()); // emulated mouse event after a touch
            act(() => { vi.advanceTimersByTime(1000); });

            expect(onLongPress).toHaveBeenCalledTimes(1);
        });

        it('does not fire after the component unmounts', () => {
            const { result, unmount } = renderHook(() => useLongPress({ onLongPress, onClick }));

            act(() => result.current.onMouseDown());
            unmount();
            act(() => { vi.advanceTimersByTime(1000); });

            expect(onLongPress).not.toHaveBeenCalled();
        });
    });

    describe('click', () => {
        it('calls onClick for a normal click', () => {
            const result = setup();

            act(() => result.current.onMouseDown());
            act(() => { vi.advanceTimersByTime(100); });
            act(() => result.current.onMouseUp());
            act(() => result.current.onClick());

            expect(onClick).toHaveBeenCalledTimes(1);
            expect(onLongPress).not.toHaveBeenCalled();
        });

        it('swallows the click that follows a long press, but only that one', () => {
            const result = setup();

            act(() => result.current.onMouseDown());
            act(() => { vi.advanceTimersByTime(500); });
            act(() => result.current.onMouseUp());
            act(() => result.current.onClick());
            expect(onClick).not.toHaveBeenCalled();

            act(() => result.current.onClick());
            expect(onClick).toHaveBeenCalledTimes(1);
        });

        it('a new press after a long press resets the swallow flag', () => {
            const result = setup();

            act(() => result.current.onMouseDown());
            act(() => { vi.advanceTimersByTime(500); });
            act(() => result.current.onMouseUp()); // no click arrives, e.g. released elsewhere

            act(() => result.current.onMouseDown());
            act(() => result.current.onMouseUp());
            act(() => result.current.onClick());

            expect(onClick).toHaveBeenCalledTimes(1);
        });

        it('does not crash when no onClick is given', () => {
            const { result } = renderHook(() => useLongPress({ onLongPress }));

            expect(() => act(() => result.current.onClick())).not.toThrow();
        });
    });
});