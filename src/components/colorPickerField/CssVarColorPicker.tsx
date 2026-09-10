import { useState, useEffect, useRef } from "react";
import ColorPickerField from "./ColorPickerField";

interface CssVarColorPickerProps {
    cssVariable: string;
    label?: string;
}

const isCustomProperty = (name: string): boolean => name.startsWith("--");
const STORAGE_PREFIX = "theme:";

const readStoredColor = (cssVariable: string): string | null =>
    localStorage.getItem(`${STORAGE_PREFIX}${cssVariable}`);

const writeStoredColor = (cssVariable: string, color: string): void => {
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

const applyCssVar = (cssVariable: string, color: string): void => {
    if (isCustomProperty(cssVariable)) {
        document.documentElement.style.setProperty(cssVariable, color);
    } else {
        (document.documentElement.style as any)[cssVariable] = color;
    }
};

// Module-level cache of each variable's TRUE default (from the stylesheet,
// before any saved override is ever applied). Captured once, lazily, the
// first time each variable is touched — survives remounts/StrictMode.
const trueDefaults = new Map<string, string>();

const getTrueDefault = (cssVariable: string): string => {
    if (!trueDefaults.has(cssVariable)) {
        // Only safe to read this BEFORE applyCssVar has ever run for this variable.
        trueDefaults.set(cssVariable, readCssVar(cssVariable));
    }
    return trueDefaults.get(cssVariable)!;
};

const normalize = (c: string) => c.trim().toLowerCase();

const CssVarColorPicker: React.FC<CssVarColorPickerProps> = ({
    cssVariable,
    label = "Color",
}) => {
    // Capture the true default BEFORE applying any stored override.
    const defaultColorRef = useRef<string>("");
    if (!trueDefaults.has(cssVariable)) {
        defaultColorRef.current = getTrueDefault(cssVariable);
    } else {
        defaultColorRef.current = trueDefaults.get(cssVariable)!;
    }

    const [color, setColor] = useState<string>(() => {
        const trueDefault = getTrueDefault(cssVariable); // caches if not already
        const saved = readStoredColor(cssVariable);
        return saved ?? trueDefault;
    });

    const skipNextWrite = useRef(true);

    useEffect(() => {
        const trueDefault = getTrueDefault(cssVariable);
        const saved = readStoredColor(cssVariable);
        const initial = saved ?? trueDefault;
        skipNextWrite.current = true;
        setColor(initial);
        applyCssVar(cssVariable, initial);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [cssVariable]);

    useEffect(() => {
        if (skipNextWrite.current) {
            skipNextWrite.current = false;
            return;
        }
        applyCssVar(cssVariable, color);
        writeStoredColor(cssVariable, color);
    }, [color, cssVariable]);

    const isCustomized = normalize(color) !== normalize(defaultColorRef.current);
    const inputId = `css-var-color-${cssVariable}`;

    return (
        <>
            <label htmlFor={inputId}>
                {label}
                {isCustomized && "*"} :
            </label>
            <ColorPickerField id={inputId} color={color} onChange={setColor} />
        </>
    );
};

export default CssVarColorPicker;