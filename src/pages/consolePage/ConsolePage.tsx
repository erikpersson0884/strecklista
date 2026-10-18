import type { FC } from 'react';
import './ConsolePage.css';

import { useConsole } from './useConsole';

const ConsolePage: FC = () => {
    const { output, command, setCommand, promptLabel, onKeyDown, outputRef, inputRef } = useConsole();

    return (
        <div className="console-page page">
            <div
                className="console-output"
                ref={outputRef}
                role="presentation"
                onClick={() => inputRef.current?.focus()}
            >
                {output.map((line, index) => (
                    line.type === 'input'
                        ? <p key={index} className="console-line console-line-input"><span className="console-prompt">&gt;</span> {line.text}</p>
                        : <p key={index} className={`console-line console-line-${line.type}`}>{line.text}</p>
                ))}

                {/* The live prompt lives inside the scroll buffer, like a real terminal - not in a separate box below it. */}
                <div className="console-input-row">
                    <span className="console-prompt">IT:{promptLabel} &gt;</span>
                    <input
                        ref={inputRef}
                        type="text"
                        autoComplete="off"
                        spellCheck={false}
                        value={command}
                        onChange={(e) => setCommand(e.target.value)}
                        onKeyDown={onKeyDown}
                    />
                </div>
            </div>
        </div>
    );
};

export default ConsolePage;
