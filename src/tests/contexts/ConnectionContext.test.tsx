import { act, renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import api from '@/api/axiosInstance';
import { ConnectionProvider, useConnectionContext } from '@/contexts/ConnectionContext';

vi.mock('@/api/axiosInstance');

const mockedApi = api as unknown as { get: ReturnType<typeof vi.fn> };

const POLL_INTERVAL_MS = 60_000;

const setup = async () => {
    const hook = renderHook(() => useConnectionContext(), { wrapper: ConnectionProvider });
    await act(async () => {}); // let the check that runs on mount settle
    return hook;
};

const setVisibility = (state: 'visible' | 'hidden') => {
    Object.defineProperty(document, 'visibilityState', { value: state, configurable: true });
};

describe('ConnectionContext', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2026-01-01T12:00:00Z'));
        vi.clearAllMocks();
        mockedApi.get.mockReset();
        mockedApi.get.mockResolvedValue({ data: {} });
        setVisibility('visible');
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    describe('initial check', () => {
        it('starts connected and checks the health endpoint on mount', async () => {
            const { result } = await setup();

            expect(mockedApi.get).toHaveBeenCalledTimes(1);
            expect(mockedApi.get).toHaveBeenCalledWith('/health');
            expect(result.current.isConnected).toBe(true);
            expect(result.current.isChecking).toBe(false);
            expect(result.current.lastCheckedAt).toEqual(new Date('2026-01-01T12:00:00Z'));
        });

        it('is checking while the request is pending', async () => {
            let resolveRequest!: (value: unknown) => void;
            mockedApi.get.mockReturnValueOnce(new Promise(r => { resolveRequest = r; }));

            const { result } = renderHook(() => useConnectionContext(), { wrapper: ConnectionProvider });
            expect(result.current.isChecking).toBe(true);

            await act(async () => { resolveRequest({ data: {} }); });
            expect(result.current.isChecking).toBe(false);
        });
    });

    describe('going offline and recovering', () => {
        it('stays connected after a single failure', async () => {
            mockedApi.get.mockRejectedValueOnce(new Error('blip'));

            const { result } = await setup();

            expect(result.current.isConnected).toBe(true);
        });

        it('goes offline after two consecutive failures', async () => {
            mockedApi.get.mockRejectedValue(new Error('down'));

            const { result } = await setup(); // failure 1 (on mount)
            expect(result.current.isConnected).toBe(true);

            await act(async () => { await result.current.checkNow(); }); // failure 2
            expect(result.current.isConnected).toBe(false);
        });

        it('recovers immediately after a single success', async () => {
            mockedApi.get.mockRejectedValue(new Error('down'));
            const { result } = await setup();
            await act(async () => { await result.current.checkNow(); });
            expect(result.current.isConnected).toBe(false);

            mockedApi.get.mockResolvedValue({ data: {} });
            await act(async () => { await result.current.checkNow(); });

            expect(result.current.isConnected).toBe(true);
        });

        it('a success resets the failure count', async () => {
            mockedApi.get.mockRejectedValueOnce(new Error('blip')); // failure 1 on mount
            const { result } = await setup();

            await act(async () => { await result.current.checkNow(); }); // success, resets the count

            mockedApi.get.mockRejectedValueOnce(new Error('blip'));
            await act(async () => { await result.current.checkNow(); }); // failure 1 again

            expect(result.current.isConnected).toBe(true);
        });

        it('updates lastCheckedAt even when the check fails', async () => {
            mockedApi.get.mockRejectedValue(new Error('down'));
            const { result } = await setup();

            vi.setSystemTime(new Date('2026-01-01T12:05:00Z'));
            await act(async () => { await result.current.checkNow(); });

            expect(result.current.lastCheckedAt).toEqual(new Date('2026-01-01T12:05:00Z'));
        });
    });

    describe('triggers', () => {
        it('polls every 60 seconds', async () => {
            await setup();
            expect(mockedApi.get).toHaveBeenCalledTimes(1);

            await act(async () => { await vi.advanceTimersByTimeAsync(POLL_INTERVAL_MS - 1); });
            expect(mockedApi.get).toHaveBeenCalledTimes(1);

            await act(async () => { await vi.advanceTimersByTimeAsync(1); });
            expect(mockedApi.get).toHaveBeenCalledTimes(2);

            await act(async () => { await vi.advanceTimersByTimeAsync(POLL_INTERVAL_MS); });
            expect(mockedApi.get).toHaveBeenCalledTimes(3);
        });

        it('checks when the window regains focus', async () => {
            await setup();

            await act(async () => { window.dispatchEvent(new Event('focus')); });

            expect(mockedApi.get).toHaveBeenCalledTimes(2);
        });

        it('checks when the tab becomes visible', async () => {
            await setup();

            setVisibility('visible');
            await act(async () => { document.dispatchEvent(new Event('visibilitychange')); });

            expect(mockedApi.get).toHaveBeenCalledTimes(2);
        });

        it('does not check when the tab becomes hidden', async () => {
            await setup();

            setVisibility('hidden');
            await act(async () => { document.dispatchEvent(new Event('visibilitychange')); });

            expect(mockedApi.get).toHaveBeenCalledTimes(1);
        });

        it('stops polling and listening after unmount', async () => {
            const { unmount } = await setup();
            unmount();

            await act(async () => {
                await vi.advanceTimersByTimeAsync(POLL_INTERVAL_MS * 3);
                window.dispatchEvent(new Event('focus'));
                document.dispatchEvent(new Event('visibilitychange'));
            });

            expect(mockedApi.get).toHaveBeenCalledTimes(1);
        });
    });

    it('useConnectionContext throws outside the provider', () => {
        vi.spyOn(console, 'error').mockImplementation(() => {});
        expect(() => renderHook(() => useConnectionContext())).toThrow('ConnectionProvider');
    });
});