import { FC, useState } from 'react';
import "./StylePage.css";
import CssVarColorPicker from "@/components/colorPickerField/CssVarColorPicker";
import clearIcon from "@/assets/clear.png";
import { useNotificationContext } from '@/contexts/NotificationContext';


interface Setting {
    cssVariable: string;
    label: string;
    defaultColor?: string;
}

const STORAGE_PREFIX = "theme:";

const settings: Setting[] = [
    { cssVariable: "--background-color", label: "Background Färg" },
    { cssVariable: "--card-color", label: "Card Färg" },
    { cssVariable: "--accent-color", label: "Accent färg" },

    { cssVariable: "--text-color", label: "Text Färg" },
    { cssVariable: "--faint-text-color", label: "Faint Text Färg" },
    { cssVariable: "--link-color", label: "Link Färg" },
    
    { cssVariable: "--button-color", label: "Button Färg" },
    { cssVariable: "--button-hover-color", label: "Button Hover Färg" },

    { cssVariable: "--success-color", label: "Success Färg" },
    { cssVariable: "--info-color", label: "Info Färg" },
    { cssVariable: "--destructive-color", label: "Destruktiv Färg" },

    
    { cssVariable: "--border-color", label: "Border Färg" },
];

const StylePage: FC = () => {
        const { notify } = useNotificationContext();
    // Bump this to force all pickers to re-read their default CSS values after a reset.
    const [resetKey, setResetKey] = useState<number>(0);

    const handleReset = () => {
        settings.forEach(({ cssVariable }) => {
            localStorage.removeItem(`${STORAGE_PREFIX}${cssVariable}`);
            document.documentElement.style.removeProperty(cssVariable);
        });
        setResetKey((prev) => prev + 1); // remount every picker so they re-read fresh CSS values
        notify("Custom styles cleared", "info");
    };

    return (
        <div className="style-page page">
            <header className="style-manager-header">
                <h1>Style Manager</h1>
                <button onClick={handleReset} className="reset-button">
                    <img src={clearIcon} alt="Clear styling" height={24} title='Clear custom styles' />
                </button>
            </header>

            <ul className='page-list'>
                {settings.map((setting) => (
                    <li className="list-item" key={`${setting.cssVariable}-${resetKey}`}>
                        <CssVarColorPicker
                            cssVariable={setting.cssVariable}
                            label={setting.label}
                        />
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default StylePage;
