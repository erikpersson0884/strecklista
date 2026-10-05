import { describe, it, expect, vi, beforeEach } from 'vitest';
import api from '@/api/axiosInstance';
import clientApi from '@/api/clientApi';

vi.mock('@/api/axiosInstance');

const mockedApi = api as unknown as {
    get: ReturnType<typeof vi.fn>;
    post: ReturnType<typeof vi.fn>;
    patch: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
};

const apiClient = {
    id: 'client-1',
    scope: 'items.read transactions.create',
    group: { id: 1, gammaId: 'grp-1', prettyName: 'Göken', avatarUrl: 'bird.png' },
    owner: { id: 1, gammaId: 'g-1', firstName: 'Ada', lastName: 'Lovelace', nick: 'ada', avatarUrl: 'ada.png' },
    displayName: 'Kiosk',
    description: null,
};

describe('clientApi', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.spyOn(console, 'error').mockImplementation(() => {});
    });

    describe('getScopes', () => {
        it('returns the supported scopes from /meta', async () => {
            mockedApi.get.mockResolvedValueOnce({
                data: { data: { version: '0.6.1', supportedScopes: ['items.read', 'group.read'] } },
            });

            await expect(clientApi.getScopes()).resolves.toEqual(['items.read', 'group.read']);
            expect(mockedApi.get).toHaveBeenCalledWith('/meta');
        });

        it('throws when the scopes have an unexpected shape', async () => {
            mockedApi.get.mockResolvedValueOnce({ data: { data: { supportedScopes: 'items.read' } } });
            await expect(clientApi.getScopes()).rejects.toThrow('Failed to parse scopes');
        });
    });

    describe('getClients / getClient', () => {
        it('returns all clients', async () => {
            mockedApi.get.mockResolvedValueOnce({ data: { data: { clients: [apiClient] } } });

            await expect(clientApi.getClients()).resolves.toEqual([apiClient]);
            expect(mockedApi.get).toHaveBeenCalledWith('/group/client');
        });

        it('throws when a client has an unexpected shape', async () => {
            mockedApi.get.mockResolvedValueOnce({ data: { data: { clients: [{ id: 1 }] } } });
            await expect(clientApi.getClients()).rejects.toThrow('Failed to parse clients');
        });

        it('returns one client by id', async () => {
            mockedApi.get.mockResolvedValueOnce({ data: { data: { client: apiClient } } });

            await expect(clientApi.getClient('client-1')).resolves.toEqual(apiClient);
            expect(mockedApi.get).toHaveBeenCalledWith('/group/client/client-1');
        });

        it('throws when the client has an unexpected shape', async () => {
            mockedApi.get.mockResolvedValueOnce({ data: { data: { client: {} } } });
            await expect(clientApi.getClient('client-1')).rejects.toThrow('Failed to parse client');
        });
    });

    describe('createClient', () => {
        it('creates a client and returns it together with its secret', async () => {
            mockedApi.post.mockResolvedValueOnce({
                data: { data: { client: { ...apiClient, secret: 'top-secret' } } },
            });

            const result = await clientApi.createClient('Kiosk', 'Shop terminal', 'items.read');

            expect(mockedApi.post).toHaveBeenCalledWith('/group/client', {
                displayName: 'Kiosk',
                description: 'Shop terminal',
                scope: 'items.read',
            });
            expect(result.secret).toBe('top-secret');
            expect(result.client).toMatchObject({ id: 'client-1', displayName: 'Kiosk' });
        });

        it('throws when the backend returns no secret', async () => {
            mockedApi.post.mockResolvedValueOnce({ data: { data: { client: apiClient } } });
            await expect(clientApi.createClient('Kiosk', '', 'items.read')).rejects.toThrow('retrieve secret');
        });

        it('throws when the response has an unexpected shape', async () => {
            mockedApi.post.mockResolvedValueOnce({ data: { data: { client: { secret: 'x' } } } });
            await expect(clientApi.createClient('Kiosk', '', 'items.read')).rejects.toThrow('Failed to parse created client');
        });
    });

    describe('updateClient', () => {
        it('patches the client and returns the updated one', async () => {
            const updated = { ...apiClient, displayName: 'Kiosk 2' };
            mockedApi.patch.mockResolvedValueOnce({ data: { data: { client: updated } } });

            const result = await clientApi.updateClient('client-1', 'Kiosk 2', 'desc', 'items.read');

            expect(mockedApi.patch).toHaveBeenCalledWith('/group/client/client-1', {
                displayName: 'Kiosk 2',
                description: 'desc',
                scope: 'items.read',
            });
            expect(result.displayName).toBe('Kiosk 2');
        });

        it('rethrows request errors', async () => {
            mockedApi.patch.mockRejectedValueOnce(new Error('Forbidden'));
            await expect(clientApi.updateClient('client-1', 'a', 'b', 'c')).rejects.toThrow('Forbidden');
        });

        it('throws when the response has an unexpected shape', async () => {
            mockedApi.patch.mockResolvedValueOnce({ data: { data: { client: {} } } });
            await expect(clientApi.updateClient('client-1', 'a', 'b', 'c')).rejects.toThrow('Failed to parse updated client');
        });
    });

    describe('deleteClient', () => {
        it('deletes the client', async () => {
            mockedApi.delete.mockResolvedValueOnce({ data: {} });

            await expect(clientApi.deleteClient('client-1')).resolves.toBeUndefined();
            expect(mockedApi.delete).toHaveBeenCalledWith('/group/client/client-1');
        });

        // Fails until deleteClient awaits the request (fix 1 above).
        it('rejects when the request fails', async () => {
            mockedApi.delete.mockRejectedValueOnce(new Error('Forbidden'));
            await expect(clientApi.deleteClient('client-1')).rejects.toThrow('Forbidden');
        });
    });
});
