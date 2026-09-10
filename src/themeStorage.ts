const STORAGE_PREFIX = "theme:";

const isCustomProperty = (name: string): boolean => name.startsWith("--");

export const readStoredColor = (cssVariable: string): string | null =>
    localStorage.getItem(`${STORAGE_PREFIX}${cssVariable}`);

export const writeStoredColor = (cssVariable: string, color: string): void => {
    localStorage.setItem(`${STORAGE_PREFIX}${cssVariable}`, color);
};

const readCssVar = (cssVariable: string): string => {
    if (isCustomProperty(cssVariable)) {
        return getComputedStyle(document.documentElement)
            .getPropertyValue(cssVariable)
            .trim();
    }
    return (document.documentElement.style as any)[cssVariable] || "";
};

export const applyCssVar = (cssVariable: string, color: string): void => {
    if (isCustomProperty(cssVariable)) {
        document.documentElement.style.setProperty(cssVariable, color);
    } else {
        (document.documentElement.style as any)[cssVariable] = color;
    }
};


const trueDefaults = new Map<string, string>();

export const getTrueDefault = (cssVariable: string): string => {
    if (!trueDefaults.has(cssVariable)) {
        trueDefaults.set(cssVariable, readCssVar(cssVariable));
    }
    return trueDefaults.get(cssVariable)!;
};

/**
 * Applies every saved theme override to the DOM. Call this ONCE, as early as
 * possible (before React renders), so:
 *  - saved colors are visible immediately on every page, not just the
 *    settings page, and
 *  - each variable's true default gets cached from the stylesheet BEFORE
 *    the override overwrites it inline.
 */
export const initTheme = (): void => {
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (!key || !key.startsWith(STORAGE_PREFIX)) continue;

        const cssVariable = key.slice(STORAGE_PREFIX.length);
        const savedColor = localStorage.getItem(key);
        if (!savedColor) continue;

        getTrueDefault(cssVariable); // cache real default first
        applyCssVar(cssVariable, savedColor); // then apply override
    }
};