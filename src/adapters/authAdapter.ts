import { ApiUserLoginResponse } from "../schemas/api";

const authAdapter = {
    adaptLoginResponse: (response: ApiUserLoginResponse): { token: string; user: User } => {
        const token = response.access_token;
        const user: User = {
            id: response.user.id.toString(),
            icon: response.user.avatarUrl,
            name: response.user.firstName + " " + response.user.lastName,
            nick: response.user.nick,
            firstName: response.user.firstName,
            lastName: response.user.lastName,
            balance: response.balance,
            externalId: response.externalId ?? undefined,
        };
        return { token, user };
    }
};

export default authAdapter;
