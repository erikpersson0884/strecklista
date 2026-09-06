import { describe, it, expect } from 'vitest';
import userAdapter from '@/adapters/userAdapter';
import { ApiGroupUser, ApiGroupMember, ApiGroup } from '@/schemas/api';

describe('userAdapter', () => {
    describe('apiUserToUser', () => {
        it('adapts a group user, combining first and last name', () => {
            const apiGroupUser: ApiGroupUser = {
                user: {
                    id: 1,
                    gammaId: 'g-1',
                    firstName: 'Ada',
                    lastName: 'Lovelace',
                    nick: 'ada',
                    avatarUrl: 'ada.png',
                },
                group: { id: 1, gammaId: 'grp-1', prettyName: 'Göken', avatarUrl: 'bird.png' },
                balance: 100,
            };

            expect(userAdapter.apiUserToUser(apiGroupUser)).toEqual({
                id: '1',
                firstName: 'Ada',
                lastName: 'Lovelace',
                name: 'Ada Lovelace',
                nick: 'ada',
                icon: 'ada.png',
                balance: 100,
            });
        });
    });

    describe('apiGroupMemberToUser', () => {
        it('adapts a group member, including the external id when present', () => {
            const member: ApiGroupMember = {
                id: 2,
                gammaId: 'g-2',
                firstName: 'Alan',
                lastName: 'Turing',
                nick: 'alan',
                avatarUrl: 'alan.png',
                balance: 50,
                externalId: 'ext-1',
            };

            expect(userAdapter.apiGroupMemberToUser(member)).toEqual({
                id: '2',
                firstName: 'Alan',
                lastName: 'Turing',
                name: 'Alan Turing',
                nick: 'alan',
                icon: 'alan.png',
                balance: 50,
                externalId: 'ext-1',
            });
        });

        it('leaves externalId undefined when not present', () => {
            const member: ApiGroupMember = {
                id: 3,
                gammaId: 'g-3',
                firstName: 'Grace',
                lastName: 'Hopper',
                nick: 'grace',
                avatarUrl: 'grace.png',
                balance: 0,
            };

            expect(userAdapter.apiGroupMemberToUser(member).externalId).toBeUndefined();
        });
    });

    describe('apiGroupToGroupInfo', () => {
        it('adapts a group into group info', () => {
            const group: ApiGroup = { id: 1, gammaId: 'grp-1', prettyName: 'Göken', avatarUrl: 'bird.png' };

            expect(userAdapter.apiGroupToGroupInfo(group)).toEqual({
                id: '1',
                name: 'Göken',
                avatarUrl: 'bird.png',
                gammaId: 'grp-1',
            });
        });
    });
});
