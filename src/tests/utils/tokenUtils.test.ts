import { describe, it, expect, vi, beforeEach } from "vitest";
import { getTokenPayload, getMsUntilExpiry, isTokenValid } from "@/utils/tokenUtils";

const makeToken = (payload: object): string => {
    const encode = (obj: object) =>
        btoa(JSON.stringify(obj)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    return `${encode({ alg: "HS256", typ: "JWT" })}.${encode(payload)}.signature`;
};

const nowSeconds = () => Math.floor(Date.now() / 1000);

describe("tokenUtils", () => {
    beforeEach(() => {
        vi.spyOn(console, "error").mockImplementation(() => {});
    });

    it("parses a valid payload", () => {
        const token = makeToken({ user: { id: 1 }, exp: 123 });
        expect(getTokenPayload(token)).toEqual({ user: { id: 1 }, exp: 123 });
    });

    it("returns null for garbage", () => {
        expect(getTokenPayload("not-a-token")).toBeNull();
        expect(getTokenPayload("")).toBeNull();
    });

    it("treats a future exp as valid", () => {
        expect(isTokenValid(makeToken({ exp: nowSeconds() + 3600 }))).toBe(true);
    });

    it("treats a past exp as invalid", () => {
        expect(isTokenValid(makeToken({ exp: nowSeconds() - 10 }))).toBe(false);
    });

    it("treats a token without exp as invalid", () => {
        expect(isTokenValid(makeToken({ user: {} }))).toBe(false);
        expect(getMsUntilExpiry(makeToken({ user: {} }))).toBeNull();
    });

    it("returns roughly the right milliseconds until expiry", () => {
        const ms = getMsUntilExpiry(makeToken({ exp: nowSeconds() + 60 }))!;
        expect(ms).toBeGreaterThan(58_000);
        expect(ms).toBeLessThanOrEqual(60_000);
    });
});