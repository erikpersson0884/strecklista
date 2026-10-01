import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import api, { setAuthToken, UNAUTHORIZED_EVENT } from '@/api/axiosInstance';

const failWith = (status: number) => {
    api.defaults.adapter = (config: InternalAxiosRequestConfig) =>
        Promise.reject(
            new AxiosError('failed', String(status), config, null, {
                status,
                statusText: '',
                data: {},
                headers: {},
                config,
            })
        );
};

describe('axios 401 interceptor', () => {
    const onUnauthorized = vi.fn();

    beforeEach(() => {
        onUnauthorized.mockClear();
        window.addEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
    });

    afterEach(() => {
        window.removeEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
        setAuthToken(null);
    });

    it('dispatches the event on a 401 when a token was sent', async () => {
        await setAuthToken('abc');
        failWith(401);

        await expect(api.get('/group/item')).rejects.toBeDefined();
        expect(onUnauthorized).toHaveBeenCalledTimes(1);
    });

    it('does not dispatch when no token was sent', async () => {
        failWith(401);

        await expect(api.get('/group/item')).rejects.toBeDefined();
        expect(onUnauthorized).not.toHaveBeenCalled();
    });

    it('does not dispatch for a failed login request', async () => {
        await setAuthToken('abc');
        failWith(401);

        await expect(api.post('/oauth2/token', {})).rejects.toBeDefined();
        expect(onUnauthorized).not.toHaveBeenCalled();
    });

    it('does not dispatch for other error statuses', async () => {
        await setAuthToken('abc');
        failWith(500);

        await expect(api.get('/group/item')).rejects.toBeDefined();
        expect(onUnauthorized).not.toHaveBeenCalled();
    });

    it('still rejects so callers can handle the error', async () => {
        await setAuthToken('abc');
        failWith(401);

        await expect(api.get('/x')).rejects.toMatchObject({ response: { status: 401 } });
    });
});