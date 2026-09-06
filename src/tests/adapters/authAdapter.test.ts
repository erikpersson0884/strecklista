import { describe, it, expect } from 'vitest';
import authAdapter from '@/adapters/authAdapter';
import { ApiUserLoginResponse } from '@/schemas/api';

const baseResponse: ApiUserLoginResponse = {
    access_token: 'token-123',
    token_type: 'bearer',
    iss: 'issuer',
    iat: 0,
    nbf: 0,
    exp: 1000,
    jti: 'jti-1',
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

describe('authAdapter', () => {
    describe('adaptLoginResponse', () => {
        it('extracts the token and adapts the user', () => {
            const result = authAdapter.adaptLoginResponse(baseResponse);

            expect(result.token).toBe('token-123');
            expect(result.user).toEqual({
                id: '1',
                icon: 'ada.png',
                name: 'Ada Lovelace',
                nick: 'ada',
                firstName: 'Ada',
                lastName: 'Lovelace',
                balance: 100,
                externalId: undefined,
            });
        });

        it('passes through the externalId when present', () => {
            const result = authAdapter.adaptLoginResponse({ ...baseResponse, externalId: 'ext-1' });
            expect(result.user.externalId).toBe('ext-1');
        });

        it('defaults a null externalId to undefined', () => {
            const result = authAdapter.adaptLoginResponse({ ...baseResponse, externalId: null });
            expect(result.user.externalId).toBeUndefined();
        });
    });
});
