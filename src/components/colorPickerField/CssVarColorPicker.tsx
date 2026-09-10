import { useState, useEffect, useRef } from "react";
import ColorPickerField from "./ColorPickerField";
import { readStoredColor, writeStoredColor, applyCssVar, getTrueDefault } from "@/themeStorage";

interface CssVarColorPickerProps {
    cssVariable: string;
    label?: string;
}

const normalize = (c: string) => c.trim().toLowerCase();

const CssVarColorPicker: React.FC<CssVarColorPickerProps> = ({
    cssVariable,
    label = "Color",
}) => {
    const [color, setColor] = useState<string>(() => {
        const trueDefault = getTrueDefault(cssVariable);
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
    }, [cssVariable]);

    useEffect(() => {
        if (skipNextWrite.current) {
            skipNextWrite.current = false;
            return;
        }
        applyCssVar(cssVariable, color);
        writeStoredColor(cssVariable, color);
    }, [color, cssVariable]);

    const isCustomized = normalize(color) !== normalize(getTrueDefault(cssVariable));
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