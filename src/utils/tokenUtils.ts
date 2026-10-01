export interface TokenPayload {
    exp?: number;
    user?: unknown;
    client?: unknown;
    [key: string]: unknown;
}

export const getTokenPayload = (token: string): TokenPayload | null => {
    try {
        const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
        return JSON.parse(atob(base64));
    } catch (err) {
        console.error("Error parsing token", err);
        return null;
    }
};

/** Milliseconds until the token expires (negative if already expired), or null if it has no `exp`. */
export const getMsUntilExpiry = (token: string): number | null => {
    const payload = getTokenPayload(token);
    if (typeof payload?.exp !== "number") return null;
    return payload.exp * 1000 - Date.now();
};

export const isTokenValid = (token: string): boolean => {
    const msLeft = getMsUntilExpiry(token);
    return msLeft !== null && msLeft > 0;
};
