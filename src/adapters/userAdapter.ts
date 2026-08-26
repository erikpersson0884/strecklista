import { ApiGroupUser, ApiGroupMember } from '../schemas/api'; 


export function userAdapter(apiGroupUser: ApiGroupUser): User {
    return {
        id: String(apiGroupUser.user.id),
        firstName: apiGroupUser.user.firstName,
        lastName: apiGroupUser.user.lastName,
        name: `${apiGroupUser.user.firstName} ${apiGroupUser.user.lastName}`,
        nick: apiGroupUser.user.nick,
        icon: apiGroupUser.user.avatarUrl,
        balance: apiGroupUser.balance,
    };
}

export function groupMemberAdapter(apiGroupMember: ApiGroupMember): User {
    return {
        id: String(apiGroupMember.id),
        firstName: apiGroupMember.firstName,
        lastName: apiGroupMember.lastName,
        name: `${apiGroupMember.firstName} ${apiGroupMember.lastName}`,
        nick: apiGroupMember.nick,
        icon: apiGroupMember.avatarUrl,
        balance: apiGroupMember.balance,
    };
}