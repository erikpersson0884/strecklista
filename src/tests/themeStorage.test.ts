import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

type ThemeModule = typeof import('@/themeStorage');

let theme: ThemeModule;
let styleEl: HTMLStyleElement;

const resetDom = () => {
    localStorage.clear();
    document.documentElement.removeAttribute('style');
};

describe('themeStorage', () => {
    beforeEach(async () => {
        // The module caches true defaults in a module-level Map, so load a fresh copy per test.
        vi.resetModules();
        theme = await import('@/themeStorage');

        resetDom();
        styleEl = document.createElement('style');
        styleEl.textContent = ':root { --main-color: #111111; --accent: #222222; }';
        document.head.appendChild(styleEl);
    });

    afterEach(() => {
        styleEl.remove();
        resetDom();
    });

    describe('stored colors', () => {
        it('returns null when nothing is saved', () => {
            expect(theme.readStoredColor('--main-color')).toBeNull();
        });

        it('saves a color and reads it back', () => {
            theme.writeStoredColor('--main-color', '#ff0000');

            expect(theme.readStoredColor('--main-color')).toBe('#ff0000');
        });

        it('stores under a "theme:" prefix and keeps variables separate', () => {
            theme.writeStoredColor('--main-color', '#ff0000');
            theme.writeStoredColor('--accent', '#00ff00');

            expect(localStorage.getItem('theme:--main-color')).toBe('#ff0000');
            expect(localStorage.getItem('theme:--accent')).toBe('#00ff00');
            expect(theme.readStoredColor('--accent')).toBe('#00ff00');
        });

        it('overwrites an earlier value', () => {
            theme.writeStoredColor('--main-color', '#ff0000');
            theme.writeStoredColor('--main-color', '#0000ff');

            expect(theme.readStoredColor('--main-color')).toBe('#0000ff');
        });
    });

    describe('applyCssVar', () => {
        it('sets a custom property on the root element', () => {
            theme.applyCssVar('--main-color', '#ff0000');

            expect(document.documentElement.style.getPropertyValue('--main-color')).toBe('#ff0000');
        });

        it('sets a regular style property directly', () => {
            theme.applyCssVar('backgroundColor', 'blue');

            expect(document.documentElement.style.backgroundColor).toBe('blue');
        });
    });

    describe('getTrueDefault', () => {
        it('returns the value from the stylesheet for a custom property', () => {
            expect(theme.getTrueDefault('--main-color')).toBe('#111111');
        });

        it('returns an empty string for an unknown variable', () => {
            expect(theme.getTrueDefault('--does-not-exist')).toBe('');
        });

        it('keeps returning the original value after an override is applied', () => {
            expect(theme.getTrueDefault('--main-color')).toBe('#111111');

            theme.applyCssVar('--main-color', '#ff0000');

            expect(theme.getTrueDefault('--main-color')).toBe('#111111');
        });

        it('returns the override if the default was never cached first (why initTheme must cache first)', () => {
            theme.applyCssVar('--main-color', '#ff0000');

            expect(theme.getTrueDefault('--main-color')).toBe('#ff0000');
        });

        it('reads a regular property from the inline style', () => {
            document.documentElement.style.backgroundColor = 'blue';

            expect(theme.getTrueDefault('backgroundColor')).toBe('blue');
            expect(theme.getTrueDefault('color')).toBe('');
        });
    });

    describe('initTheme', () => {
        it('applies every saved override', () => {
            localStorage.setItem('theme:--main-color', '#ff0000');
            localStorage.setItem('theme:--accent', '#00ff00');

            theme.initTheme();

            const style = document.documentElement.style;
            expect(style.getPropertyValue('--main-color')).toBe('#ff0000');
            expect(style.getPropertyValue('--accent')).toBe('#00ff00');
        });

        it('ignores localStorage keys that are not theme entries', () => {
            localStorage.setItem('rememberMe', 'true');
            localStorage.setItem('authToken', 'abc');
            localStorage.setItem('other:--main-color', '#ff0000');

            theme.initTheme();

            expect(document.documentElement.style.getPropertyValue('--main-color')).toBe('');
        });

        it('skips entries with an empty value', () => {
            localStorage.setItem('theme:--main-color', '');

            theme.initTheme();

            expect(document.documentElement.style.getPropertyValue('--main-color')).toBe('');
        });

        it('caches the true default before applying the override', () => {
            localStorage.setItem('theme:--main-color', '#ff0000');

            theme.initTheme();

            expect(document.documentElement.style.getPropertyValue('--main-color')).toBe('#ff0000');
            expect(theme.getTrueDefault('--main-color')).toBe('#111111');
        });

        it('keeps the original default when called twice', () => {
            localStorage.setItem('theme:--main-color', '#ff0000');

            theme.initTheme();
            theme.initTheme();

            expect(theme.getTrueDefault('--main-color')).toBe('#111111');
        });

        it('handles a variable that is not defined in any stylesheet', () => {
            localStorage.setItem('theme:--custom-extra', '#abcdef');

            theme.initTheme();

            expect(document.documentElement.style.getPropertyValue('--custom-extra')).toBe('#abcdef');
            expect(theme.getTrueDefault('--custom-extra')).toBe('');
        });

        it('does nothing when no theme is saved', () => {
            expect(() => theme.initTheme()).not.toThrow();
            expect(document.documentElement.getAttribute('style')).toBeNull();
        });
    });
});