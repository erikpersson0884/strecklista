import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import api from '@/api/axiosInstance';
import authApi from '@/api/authApi';

vi.mock('@/api/axiosInstance');

const mockedApi = api as unknown as { post: ReturnType<typeof vi.fn> };

const NO_AUTH_HEADER = { headers: { Authorization: false } };

const apiUserLoginResponse = {
    access_token: 'user-token',
    token_type: 'bearer',
    iss: 'issuer',
    iat: 0,
    nbf: 0,
    exp: 1000,
    jti: 'jti-1',
    sub: '1',
    user: { id: 1, gammaId: 'g-1', firstName: 'Ada', lastName: 'Lovelace', nick: 'ada', avatarUrl: 'ada.png' },
    group: { id: 1, gammaId: 'grp-1', prettyName: 'Göken', avatarUrl: 'bird.png' },
    balance: 100,
};

const apiClientLoginResponse = {
    access_token: 'client-token',
    token_type: 'bearer',
    aud: 'strecklista',
    iss: 'issuer',
    iat: 0,
    nbf: 0,
    exp: 1000,
    jti: 'jti-2',
    scope: 'items.read transactions.read',
    client: { id: 'client-1', displayName: 'Kiosk' },
    group: { id: 1, gammaId: 'grp-1' },
};

describe('authApi', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    describe('userAuthenticate', () => {
        it('redirects the browser to the OAuth2 authorize endpoint', async () => {
            vi.stubGlobal('location', { href: '' });

            await authApi.userAuthenticate();

            expect(window.location.href).toBe('/api/oauth2/authorize');
        });
    });

    describe('userLogin', () => {
        it('exchanges the code without sending the current token', async () => {
            mockedApi.post.mockResolvedValueOnce({ data: apiUserLoginResponse });

            const result = await authApi.userLogin('the-code');

            expect(mockedApi.post).toHaveBeenCalledWith(
                '/oauth2/token',
                { grant_type: 'authorization_code', code: 'the-code' },
                NO_AUTH_HEADER
            );
            expect(result.token).toBe('user-token');
            expect(result.user).toMatchObject({ id: '1', name: 'Ada Lovelace', nick: 'ada', balance: 100 });
        });

        it('throws when the response has an unexpected shape', async () => {
            mockedApi.post.mockResolvedValueOnce({ data: { access_token: 'x' } });

            await expect(authApi.userLogin('code')).rejects.toThrow('Failed to parse login response');
        });

        it('lets network errors propagate', async () => {
            const networkError = new Error('Network Error');
            mockedApi.post.mockRejectedValueOnce(networkError);

            await expect(authApi.userLogin('code')).rejects.toBe(networkError);
        });
    });

    describe('clientLogin', () => {
        it('sends credentials without the current token and returns token and client', async () => {
            mockedApi.post.mockResolvedValueOnce({ data: apiClientLoginResponse });

            const result = await authApi.clientLogin('client-1', 'secret');

            expect(mockedApi.post).toHaveBeenCalledWith(
                '/oauth2/token',
                { grant_type: 'client_credentials', client_id: 'client-1', client_secret: 'secret' },
                NO_AUTH_HEADER
            );
            expect(result).toEqual({
                token: 'client-token',
                client: { id: 'client-1', displayName: 'Kiosk', scope: 'items.read transactions.read' },
            });
        });

        it('throws a parse error when the response has an unexpected shape', async () => {
            mockedApi.post.mockResolvedValueOnce({ data: { access_token: 'x' } });

            await expect(authApi.clientLogin('id', 'secret')).rejects.toThrow(/Failed to parse/);
        });

        it('surfaces the backend error message and attaches the HTTP status', async () => {
            mockedApi.post.mockRejectedValueOnce({
                response: { status: 401, data: { error: { message: 'Invalid client credentials' } } },
                message: 'Request failed with status code 401',
            });

            await expect(authApi.clientLogin('id', 'wrong')).rejects.toMatchObject({
                message: 'Invalid client credentials',
                status: 401,
            });
        });

        it('uses status 0 when the server could not be reached', async () => {
            mockedApi.post.mockRejectedValueOnce({ request: {}, message: 'Network Error' });

            await expect(authApi.clientLogin('id', 's')).rejects.toMatchObject({
                message: 'Network Error',
                status: 0,
            });
        });

        it('has no status for non-HTTP errors such as parse failures', async () => {
            mockedApi.post.mockResolvedValueOnce({ data: { access_token: 'x' } });

            await expect(authApi.clientLogin('id', 's')).rejects.toMatchObject({ status: undefined });
        });

        it('falls back to response.data.message, then error.message', async () => {
            mockedApi.post.mockRejectedValueOnce({
                response: { status: 400, data: { message: 'Bad request body' } },
                message: 'Request failed',
            });
            await expect(authApi.clientLogin('id', 's')).rejects.toThrow('Bad request body');

            mockedApi.post.mockRejectedValueOnce(new Error('Something broke'));
            await expect(authApi.clientLogin('id', 's')).rejects.toThrow('Something broke');
        });

        it('uses a generic message when there is no error information at all', async () => {
            mockedApi.post.mockRejectedValueOnce({});

            await expect(authApi.clientLogin('id', 's')).rejects.toThrow(
                'Login failed, no additional error information available.'
            );
        });
    });
});