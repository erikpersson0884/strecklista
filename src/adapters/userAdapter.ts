

export function userAdapter(apiUser: ApiUser): User {
    return {
        id: apiUser.id,
        firstName: apiUser.firstName,
        lastName: apiUser.lastName,
        name: `${apiUser.firstName} ${apiUser.lastName}`,
        nick: apiUser.nick,
        icon: apiUser.avatarUrl,
        balance: apiUser.balance,
    };
}
