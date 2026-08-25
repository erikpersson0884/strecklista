

export function userAdapter(apiUser: any): User {
    if (!apiUser || typeof apiUser !== 'object') {
        throw new TypeError('Invalid ApiUser: the user object is missing');
    }

    const invalidFields: string[] = [];

    if (typeof apiUser.id !== 'number') invalidFields.push('id');
    if (typeof apiUser.firstName !== 'string') invalidFields.push('firstName');
    if (typeof apiUser.lastName !== 'string') invalidFields.push('lastName');
    if (typeof apiUser.nick !== 'string') invalidFields.push('nick');
    if (typeof apiUser.avatarUrl !== 'string') invalidFields.push('avatarUrl');
    if (typeof apiUser.balance !== 'number') invalidFields.push('balance');

    if (invalidFields.length > 0) {
        throw new TypeError(
            `Invalid ApiUser: missing or invalid field(s): ${invalidFields.join(', ')}`,
        );
    }

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
