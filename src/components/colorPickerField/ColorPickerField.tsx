import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { HexColorPicker } from "react-colorful";
import "./ColorPickerField.css";

interface ColorPickerFieldProps {
    id?: string;
    color: string;
    onChange: (color: string) => void;
}

const ColorPickerField: React.FC<ColorPickerFieldProps> = ({ color, onChange, id }) => {
    const [ isOpen, setIsOpen ] = useState<boolean>(false);
    const [ position, setPosition ] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
    const swatchRef = useRef<HTMLButtonElement>(null);
    const popoverRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (
                popoverRef.current && !popoverRef.current.contains(e.target as Node) &&
                swatchRef.current && !swatchRef.current.contains(e.target as Node)
            ) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleToggle = () => {
        if (!isOpen && swatchRef.current) {
            const rect = swatchRef.current.getBoundingClientRect();
            setPosition({
                top: rect.top + window.scrollY, // opens upward, anchored above the swatch
                left: rect.left + window.scrollX - 8, // to the left of the swatch
            });
        }
        setIsOpen(!isOpen);
    };

    return (
        <div className="color-picker-field" id={id}>
            <button
                ref={swatchRef}
                type="button"
                className="color-picker-swatch"
                style={{ backgroundColor: color }}
                onClick={handleToggle}
            />
            {isOpen && createPortal(
                <div
                    ref={popoverRef}
                    className="color-picker-popover"
                    style={{ position: "absolute", top: position.top, left: position.left, transform: "translate(-100%, -50%)" }}
                >
                    <HexColorPicker color={color} onChange={onChange} />
                </div>,
                document.body
            )}
        </div>
    );
};

export default ColorPickerField;