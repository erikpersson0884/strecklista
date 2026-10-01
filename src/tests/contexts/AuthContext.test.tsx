import { act, renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AuthProvider, useAuthContext } from '@/contexts/AuthContext';
import { makeToken } from '../helpers/makeToken';

const { mockNotify, mockUserLogin, mockGetCurrentUser } = vi.hoisted(() => ({
    mockNotify: vi.fn(),
    mockUserLogin: vi.fn(),
    mockGetCurrentUser: vi.fn(),
}));

vi.mock('@/contexts/NotificationContext', () => ({
    default: () => ({ notify: mockNotify }),
    useNotificationContext: () => ({ notify: mockNotify }),
}));

vi.mock('@/api/axiosInstance', () => ({
    setAuthToken: vi.fn(),
    UNAUTHORIZED_EVENT: 'auth:unauthorized',
    default: {},
    api: {},
}));

vi.mock('@/api/authApi', () => ({
    default: {
        userLogin: (...args: unknown[]) => mockUserLogin(...args),
        userAuthenticate: vi.fn(),
        clientLogin: vi.fn(),
    },
}));

vi.mock('@/api/userApi', () => ({
    default: { getCurrentUser: (...args: unknown[]) => mockGetCurrentUser(...args) },
}));

const NOW = Date.UTC(2026, 0, 1);
const MIN = 60 * 1000;
const tokenExpiringIn = (ms: number) =>
    makeToken({ user: { id: 1 }, exp: Math.floor((NOW + ms) / 1000) });

const user = { id: '1', name: 'Ada Lovelace', nick: 'ada' } as User;

type AuthHook = { current: ReturnType<typeof useAuthContext> };

const login = async (result: AuthHook, token: string) => {
    mockUserLogin.mockResolvedValueOnce({ token, user });
    await act(async () => {
        await result.current.exchangeCodeForToken('code');
    });
};

const setup = async () => {
    const hook = renderHook(() => useAuthContext(), { wrapper: AuthProvider });
    await act(async () => {}); // let the initial token check settle
    return hook;
};

describe('AuthContext session timers', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(NOW);
        vi.clearAllMocks();
        localStorage.clear();
        mockGetCurrentUser.mockResolvedValue(user);
        vi.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.restoreAllMocks();
    });

    it('logs out and notifies when the token expires', async () => {
        const { result } = await setup();
        await login(result, tokenExpiringIn(10 * MIN));
        expect(result.current.isAuthenticated).toBe(true);

        act(() => { vi.advanceTimersByTime(10 * MIN); });

        expect(result.current.isAuthenticated).toBe(false);
        expect(mockNotify).toHaveBeenCalledWith('Session expired. Please log in again.', 'info');
    });

    it('warns 2 minutes before expiry', async () => {
        const { result } = await setup();
        await login(result, tokenExpiringIn(10 * MIN));

        act(() => { vi.advanceTimersByTime(8 * MIN); });

        expect(mockNotify).toHaveBeenCalledWith('Session will expire in 2 min', 'info');
        expect(result.current.isAuthenticated).toBe(true);
    });

    it("a second login cancels the first token's timers", async () => {
        const { result } = await setup();
        await login(result, tokenExpiringIn(10 * MIN));
        await login(result, tokenExpiringIn(60 * MIN));

        // Past the first token's expiry and warning: nothing should have fired.
        act(() => { vi.advanceTimersByTime(11 * MIN); });
        expect(result.current.isAuthenticated).toBe(true);
        expect(mockNotify).not.toHaveBeenCalled();

        // The second token's timer still works.
        act(() => { vi.advanceTimersByTime(49 * MIN); });
        expect(result.current.isAuthenticated).toBe(false);
    });

    it('logout() cancels pending timers', async () => {
        const { result } = await setup();
        await login(result, tokenExpiringIn(10 * MIN));

        act(() => { result.current.logout(); });
        act(() => { vi.advanceTimersByTime(11 * MIN); });

        expect(mockNotify).not.toHaveBeenCalled();
    });

    // Only passes if you added the "skip the warning when < 2 min remain" tweak.
    it('skips the warning when less than 2 minutes remain', async () => {
        const { result } = await setup();
        await login(result, tokenExpiringIn(1 * MIN));

        act(() => { vi.advanceTimersByTime(30 * 1000); });
        expect(mockNotify).not.toHaveBeenCalled();
    });
});

describe('AuthContext 401 handling', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(NOW);
        vi.clearAllMocks();
        localStorage.clear();
        mockGetCurrentUser.mockResolvedValue(user);
        vi.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.restoreAllMocks();
    });

    it('logs out once when the unauthorized event fires repeatedly', async () => {
        const { result } = await setup();
        await login(result, tokenExpiringIn(60 * MIN));

        act(() => {
            window.dispatchEvent(new Event('auth:unauthorized'));
            window.dispatchEvent(new Event('auth:unauthorized'));
            window.dispatchEvent(new Event('auth:unauthorized'));
        });

        expect(result.current.isAuthenticated).toBe(false);
        expect(mockNotify).toHaveBeenCalledTimes(1);
    });

    it('ignores the event when nobody is logged in', async () => {
        await setup();

        act(() => { window.dispatchEvent(new Event('auth:unauthorized')); });

        expect(mockNotify).not.toHaveBeenCalled();
    });
});