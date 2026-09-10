import React, { useEffect, useRef } from 'react';
import { useCartContext } from '@/contexts/CartContext';
import useUsersContext from '@/contexts/UsersContext';
import useInventoryContext from '@/contexts/InventoryContext';

const SCAN_CHAR_TIMEOUT = 50;   // ms — max gap between chars to still count as "same scan"
const SCAN_IDLE_TIMEOUT = 100;  // ms — if no new char for this long, treat scan as finished
const RESULT_COOLDOWN = 200;   // ms — ignore new scans right after processing one

interface ScannerComponentProps {
    className?: string;
}

const ScannerComponent: React.FC<ScannerComponentProps> = ({className}) => {
    const { setPayingUser, addItemToCart, purchaseCart, emptyCart, payingUser, itemsInCart } = useCartContext();
    const { users } = useUsersContext();
    const { items: inventory } = useInventoryContext();

    const inputRef = useRef<HTMLInputElement>(null);
    const bufferRef = useRef<string>("");
    const lastCharTimeRef = useRef<number>(0);
    const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const cooldownRef = useRef<boolean>(false);

    const clearBuffer = () => {
        bufferRef.current = "";
        if (inputRef.current) inputRef.current.value = "";
        if (idleTimerRef.current) {
            clearTimeout(idleTimerRef.current);
            idleTimerRef.current = null;
        }
    };

    const processBuffer = () => {
        const barcode = bufferRef.current.replace(/[\r\n!]/g, ''); // remove newlines and exclamation marks

        clearBuffer();

        if (cooldownRef.current || barcode.length === 0) return;

        const matchingItem = inventory.find(i => String(i.externalId) === barcode);
        const matchingUser = users.find(u => String(u.externalId) === barcode);

        if (matchingItem) {
            addItemToCart(matchingItem);
        } else if (matchingUser) {
            setPayingUser(matchingUser);
        } else if (barcode === "checkout" && payingUser !== null && itemsInCart.length > 0) {
            purchaseCart();
        } else if (barcode === "emptyCart") {
            emptyCart();
        } else {
            // unrecognized scan — just discard, nothing else to do
            return;
        }

        cooldownRef.current = true;
        setTimeout(() => {
            cooldownRef.current = false;
        }, RESULT_COOLDOWN);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        const now = performance.now();

        // Enter = scanner signaling end-of-scan (most common config)
        if (e.key === "Enter") {
            e.preventDefault();
            processBuffer();
            return;
        }

        // ignore modifier/control keys etc, only care about printable chars
        if (e.key.length !== 1) return;

        const gap = now - lastCharTimeRef.current;
        lastCharTimeRef.current = now;

        // if the gap since the last char is too large, this keystroke
        // starts a *new* scan/input — throw away whatever was buffered
        // (this is what discards accidental partial garbage)
        if (gap > SCAN_CHAR_TIMEOUT && bufferRef.current.length > 0) {
            bufferRef.current = "";
        }

        bufferRef.current += e.key;
        if (inputRef.current) inputRef.current.value = bufferRef.current;

        // reset idle timer — if no new char arrives soon, treat as finished
        // (fallback for scanners that don't send Enter)
        if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
        idleTimerRef.current = setTimeout(() => {
            processBuffer();
        }, SCAN_IDLE_TIMEOUT);
    };

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    const handleBlur = () => {
        requestAnimationFrame(() => {
            if (document.activeElement === document.body) {
                inputRef.current?.focus();
            }
        });
    };

    return (
        <input
           className={className}
            type="text"
            defaultValue=""
            placeholder="Scan barcode..."
            autoFocus
            ref={inputRef}
            onKeyDown={handleKeyDown}
            onChange={() => {}} // value is driven imperatively via bufferRef, not React state
            onBlur={handleBlur}
        />
    );
};

export default ScannerComponent;