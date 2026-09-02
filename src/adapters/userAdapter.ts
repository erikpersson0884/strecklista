import { ApiGroupUser, ApiGroupMember, ApiGroup } from '../schemas/api'; 


const userAdapter = {
    apiUserToUser(apiGroupUser: ApiGroupUser): User {
        return {
            id: String(apiGroupUser.user.id),
            firstName: apiGroupUser.user.firstName,
            lastName: apiGroupUser.user.lastName,
            name: `${apiGroupUser.user.firstName} ${apiGroupUser.user.lastName}`,
            nick: apiGroupUser.user.nick,
            icon: apiGroupUser.user.avatarUrl,
            balance: apiGroupUser.balance,
        };
    },

    apiGroupMemberToUser(apiGroupMember: ApiGroupMember): User {
        return {
            id: String(apiGroupMember.id),
            firstName: apiGroupMember.firstName,
            lastName: apiGroupMember.lastName,
            name: `${apiGroupMember.firstName} ${apiGroupMember.lastName}`,
            nick: apiGroupMember.nick,
            icon: apiGroupMember.avatarUrl,
            balance: apiGroupMember.balance,
            externalId: apiGroupMember.externalId
        };
    },

    apiGroupToGroupInfo(apiGroup: ApiGroup): GroupInfo {
        return {
            id: String(apiGroup.id),
            name: apiGroup.prettyName,
            avatarUrl: apiGroup.avatarUrl,
            gammaId: apiGroup.gammaId
        };
    }
};

export default userAdapter;
