import { useState, useEffect, FC } from 'react';
import QRCode from 'react-qr-code';
import './SwishQRCode.css';
import swishLogo from '@/assets/images/swish-logo.svg';
import Switch from '@/components/switch/Switch';

// const PHONE_EDITABLE = 1;
const AMOUNT_EDITABLE = 2;
const MESSAGE_EDITABLE = 4;

interface SwishQRCodeProps {
    item: Item;
    payeeNumber: string;
}

function buildSwishQrString({
    number,
    amount,
    message = '',
    editable = MESSAGE_EDITABLE,
}: {
    number: string;
    amount: number;
    message?: string;
    editable?: number;
}): string {
    return `C${number};${amount};${message};${editable}`;
}

const SwishQRCode: FC<SwishQRCodeProps> = ({ item, payeeNumber }) => {
    const [allowPriceChange, setAllowPriceChange] = useState(localStorage.getItem('swish-allow-price-change') === 'true');

    const editable = MESSAGE_EDITABLE | (allowPriceChange ? AMOUNT_EDITABLE : 0);

    const qrValue = buildSwishQrString({
        number: payeeNumber,
        amount: item.internalPrice,
        message: item.name,
        editable,
    });

    useEffect(() => {
        localStorage.setItem('swish-allow-price-change', allowPriceChange.toString());
    }, [allowPriceChange]);

    return (
        <div className="swish-qr">
            <div className="swish-qr-badge">
                <img src={swishLogo} alt="Swish" className="swish-qr-logo" />
                <span>Betala med Swish</span>
            </div>

            <h2>{item.name}</h2>
            <p className="swish-qr-price">{item.internalPrice}:-</p>

            <div className="swish-qr-code-frame">
                <QRCode value={qrValue} size={180} />
            </div>

            <div className="swish-qr-toggle-row">
                <label htmlFor="swish-qr-allow-price-change">Tillåt att ändra pris</label>
                <Switch
                    id="swish-qr-allow-price-change"
                    checked={allowPriceChange}
                    onChange={(e) => setAllowPriceChange(e.target.checked)}
                />
            </div>
        </div>
    );
}

export default SwishQRCode;
