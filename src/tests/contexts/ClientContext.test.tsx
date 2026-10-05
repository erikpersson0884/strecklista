import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ClientProvider, useClientContext } from '@/contexts/ClientContext';

const { mockApi, mockNotify, authState } = vi.hoisted(() => ({
    mockApi: {
        getClients: vi.fn(),
        getScopes: vi.fn(),
        createClient: vi.fn(),
        updateClient: vi.fn(),
        deleteClient: vi.fn(),
    },
    mockNotify: vi.fn(),
    // One stable object, so the context's effects don't re-run on every render.
    authState: { isAuthenticated: true, currentUser: { id: '1' } as unknown },
}));

vi.mock('@/api/clientApi', () => ({
    default: {
        getClients: (...a: unknown[]) => mockApi.getClients(...a),
        getScopes: (...a: unknown[]) => mockApi.getScopes(...a),
        createClient: (...a: unknown[]) => mockApi.createClient(...a),
        updateClient: (...a: unknown[]) => mockApi.updateClient(...a),
        deleteClient: (...a: unknown[]) => mockApi.deleteClient(...a),
    },
}));

vi.mock('@/contexts/AuthContext', () => ({
    default: () => authState,
    useAuthContext: () => authState,
}));

vi.mock('@/contexts/NotificationContext', () => ({
    default: () => ({ notify: mockNotify }),
    useNotificationContext: () => ({ notify: mockNotify }),
}));

const makeClient = (id: string, displayName = `Client ${id}`) =>
    ({ id, displayName, scope: 'items.read', description: null }) as unknown as Client;

const clientA = makeClient('a');
const clientB = makeClient('b');

const setup = async () => {
    const hook = renderHook(() => useClientContext(), { wrapper: ClientProvider });
    await waitFor(() => expect(hook.result.current.clients).toHaveLength(2));
    return hook;
};

describe('ClientContext', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.spyOn(console, 'error').mockImplementation(() => {});
        authState.isAuthenticated = true;
        authState.currentUser = { id: '1' };
        mockApi.getClients.mockResolvedValue([clientA, clientB]);
        mockApi.getScopes.mockResolvedValue(['items.read', 'group.read']);
    });

    describe('loading', () => {
        it('loads clients and scopes for a logged-in user', async () => {
            const { result } = await setup();

            expect(result.current.clients).toEqual([clientA, clientB]);
            await waitFor(() => expect(result.current.availableScope).toEqual(['items.read', 'group.read']));
            expect(result.current.isLoadingClients).toBe(false);
        });

        it('does not load clients when not authenticated, but still loads scopes', async () => {
            authState.isAuthenticated = false;
            authState.currentUser = null;

            const { result } = renderHook(() => useClientContext(), { wrapper: ClientProvider });
            await waitFor(() => expect(result.current.availableScope).toHaveLength(2));

            expect(mockApi.getClients).not.toHaveBeenCalled();
            expect(result.current.clients).toEqual([]);
        });

        it('does not load clients when logged in as a client (no user)', async () => {
            authState.currentUser = null;

            const { result } = renderHook(() => useClientContext(), { wrapper: ClientProvider });
            await waitFor(() => expect(result.current.availableScope).toHaveLength(2));

            expect(mockApi.getClients).not.toHaveBeenCalled();
        });

        it('stays empty and stops loading when fetching clients fails', async () => {
            mockApi.getClients.mockRejectedValue(new Error('boom'));

            const { result } = renderHook(() => useClientContext(), { wrapper: ClientProvider });

            await waitFor(() => expect(mockApi.getClients).toHaveBeenCalled());
            await waitFor(() => expect(result.current.isLoadingClients).toBe(false));
            expect(result.current.clients).toEqual([]);
        });

        it('has no scopes when fetching scopes fails', async () => {
            mockApi.getScopes.mockRejectedValue(new Error('boom'));

            const { result } = await setup();

            expect(result.current.availableScope).toEqual([]);
        });
    });

    describe('createClient', () => {
        it('creates a client, adds it to the list and returns it with its secret', async () => {
            const { result } = await setup();
            const created = makeClient('c');
            mockApi.createClient.mockResolvedValueOnce({ client: created, secret: 's3cret' });

            let returned: { client: Client; secret: string } | undefined;
            await act(async () => {
                returned = await result.current.createClient('Kiosk', 'Shop terminal', 'items.read');
            });

            expect(mockApi.createClient).toHaveBeenCalledWith('Kiosk', 'Shop terminal', 'items.read');
            expect(returned).toEqual({ client: created, secret: 's3cret' });
            expect(result.current.clients).toEqual([clientA, clientB, created]);
            expect(mockNotify).toHaveBeenCalledWith('Client created successfully', 'success');
        });

        it.each([
            ['name', '', 'items.read'],
            ['scope', 'Kiosk', ''],
        ])('rejects a missing %s without calling the API', async (_field, name, scope) => {
            const { result } = await setup();

            await act(async () => {
                await expect(result.current.createClient(name, 'desc', scope)).rejects.toThrow('required');
            });

            expect(mockApi.createClient).not.toHaveBeenCalled();
            expect(mockNotify).toHaveBeenCalledWith('Failed to create client', 'error');
            expect(result.current.clients).toHaveLength(2);
        });

        it('notifies and rethrows when the API fails, leaving the list unchanged', async () => {
            const { result } = await setup();
            mockApi.createClient.mockRejectedValueOnce(new Error('Forbidden'));

            await act(async () => {
                await expect(result.current.createClient('Kiosk', 'desc', 'items.read')).rejects.toThrow('Forbidden');
            });

            expect(mockNotify).toHaveBeenCalledWith('Failed to create client', 'error');
            expect(result.current.clients).toEqual([clientA, clientB]);
        });
    });

    describe('updateClient', () => {
        it('replaces the client in place', async () => {
            const { result } = await setup();
            const updated = makeClient('a', 'Renamed');
            mockApi.updateClient.mockResolvedValueOnce(updated);

            let returned: Client | undefined;
            await act(async () => {
                returned = await result.current.updateClient('a', 'Renamed', 'desc', 'items.read');
            });

            expect(mockApi.updateClient).toHaveBeenCalledWith('a', 'Renamed', 'desc', 'items.read');
            expect(returned).toEqual(updated);
            expect(result.current.clients).toEqual([updated, clientB]);
        });

        it('rethrows and keeps the list when the API fails', async () => {
            const { result } = await setup();
            mockApi.updateClient.mockRejectedValueOnce(new Error('Forbidden'));

            await act(async () => {
                await expect(result.current.updateClient('a', 'x', 'y', 'z')).rejects.toThrow('Forbidden');
            });

            expect(result.current.clients).toEqual([clientA, clientB]);
        });
    });

    describe('deleteClient', () => {
        it('removes the client from the list', async () => {
            const { result } = await setup();
            mockApi.deleteClient.mockResolvedValueOnce(undefined);

            await act(async () => { await result.current.deleteClient('a'); });

            expect(mockApi.deleteClient).toHaveBeenCalledWith('a');
            expect(result.current.clients).toEqual([clientB]);
        });

        it('keeps the client and rethrows when the API fails', async () => {
            const { result } = await setup();
            mockApi.deleteClient.mockRejectedValueOnce(new Error('Forbidden'));

            await act(async () => {
                await expect(result.current.deleteClient('a')).rejects.toThrow('Forbidden');
            });

            expect(result.current.clients).toEqual([clientA, clientB]);
        });
    });

    it('useClientContext throws outside the provider', () => {
        expect(() => renderHook(() => useClientContext())).toThrow('ClientProvider');
    });
});
