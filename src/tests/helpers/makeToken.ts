export const makeToken = (payload: object): string => {
    const encode = (obj: object) =>
        btoa(JSON.stringify(obj)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    return `${encode({ alg: "HS256", typ: "JWT" })}.${encode(payload)}.signature`;
};
