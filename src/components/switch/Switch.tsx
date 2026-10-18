import React from 'react';
import './Switch.css';

type SwitchProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'>;

/**
 * A toggle switch built on a native checkbox.
 *
 * The real <input> covers the whole switch (invisible), so it receives the clicks itself.
 * No wrapping <label> is needed. Name it with an external <label htmlFor={id}> or aria-label.
 * Pass role="switch" for settings that apply immediately.
 */
const Switch: React.FC<SwitchProps> = ({ className, ...inputProps }) => (
    <span className={`switch ${className ?? ''}`.trim()}>
        <input {...inputProps} type="checkbox" />
        <span className="slider" aria-hidden="true" />
    </span>
);

export default Switch;
