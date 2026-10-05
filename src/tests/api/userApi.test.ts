import { describe, it, expect, vi, beforeEach } from 'vitest';
import api from '@/api/axiosInstance';
import userApi from '@/api/userApi';

vi.mock('@/api/axiosInstance');

const mockedApi = api as unknown as { get: ReturnType<typeof vi.fn> };

const apiGroup = { id: 7, gammaId: 'grp-7', prettyName: 'Göken', avatarUrl: 'bird.png' };

const apiGroupUser = {
    user: { id: 1, gammaId: 'g-1', firstName: 'Ada', lastName: 'Lovelace', nick: 'ada', avatarUrl: 'ada.png' },
    group: apiGroup,
    balance: 50,
};

const apiMember = (overrides: Record<string, unknown> = {}) => ({
    id: 1,
    gammaId: 'g-1',
    firstName: 'Ada',
    lastName: 'Lovelace',
    nick: 'ada',
    avatarUrl: 'ada.png',
    balance: 50,
    ...overrides,
});

describe('userApi', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.spyOn(console, 'error').mockImplementation(() => {});
    });

    describe('getCurrentUser', () => {
        it('fetches /user and returns the adapted user', async () => {
            mockedApi.get.mockResolvedValueOnce({ data: { data: apiGroupUser } });

            const user = await userApi.getCurrentUser();

            expect(mockedApi.get).toHaveBeenCalledWith('/user');
            expect(user).toEqual({
                id: '1',
                firstName: 'Ada',
                lastName: 'Lovelace',
                name: 'Ada Lovelace',
                nick: 'ada',
                icon: 'ada.png',
                balance: 50,
            });
        });

        it('throws when the response has an unexpected shape', async () => {
            mockedApi.get.mockResolvedValueOnce({ data: { data: { user: {} } } });
            await expect(userApi.getCurrentUser()).rejects.toThrow('Failed to parse user data');
        });

        it('lets network errors propagate', async () => {
            const error = new Error('Network Error');
            mockedApi.get.mockRejectedValueOnce(error);
            await expect(userApi.getCurrentUser()).rejects.toBe(error);
        });
    });

    describe('getUsers', () => {
        it('fetches /group and adapts every member', async () => {
            mockedApi.get.mockResolvedValueOnce({
                data: { data: { members: [apiMember(), apiMember({ id: 2, nick: 'bob', externalId: 'EXT-2' })] } },
            });

            const users = await userApi.getUsers();

            expect(mockedApi.get).toHaveBeenCalledWith('/group');
            expect(users).toHaveLength(2);
            expect(users[0]).toMatchObject({ id: '1', name: 'Ada Lovelace', balance: 50 });
            expect(users[1]).toMatchObject({ id: '2', nick: 'bob', externalId: 'EXT-2' });
        });

        it('returns an empty list when the group has no members', async () => {
            mockedApi.get.mockResolvedValueOnce({ data: { data: { members: [] } } });
            await expect(userApi.getUsers()).resolves.toEqual([]);
        });

        it('throws when a member has an unexpected shape', async () => {
            mockedApi.get.mockResolvedValueOnce({ data: { data: { members: [apiMember({ balance: 'lots' })] } } });
            await expect(userApi.getUsers()).rejects.toThrow('Failed to parse group members');
        });
    });

    describe('getGroupInfo', () => {
        it('fetches /group and returns the adapted group info', async () => {
            mockedApi.get.mockResolvedValueOnce({ data: { data: { group: apiGroup } } });

            await expect(userApi.getGroupInfo()).resolves.toEqual({
                id: '7',
                name: 'Göken',
                avatarUrl: 'bird.png',
                gammaId: 'grp-7',
            });
        });

        it('throws when the group has an unexpected shape', async () => {
            mockedApi.get.mockResolvedValueOnce({ data: { data: { group: { id: 'x' } } } });
            await expect(userApi.getGroupInfo()).rejects.toThrow('Failed to parse group info');
        });
    });
});
