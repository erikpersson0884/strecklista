import React from "react";
import ActionPopupWindow from "../../components/actionPopupWindow/ActionPopupWindow";

import { useInventory } from "../../contexts/InventoryContext";

interface AddProductPopupProps {
    isOpen: boolean;
    closePopup: () => void;
}

const AddProductPopup: React.FC<AddProductPopupProps> = ({ isOpen, closePopup }) => {
    const { addProduct } = useInventory();

    const [ errorText, setErrorText ] = React.useState<string | null>(null);
    const [ name, setName ] = React.useState<string>("");
    const [ internalPrice, setInternalPrice ] = React.useState<number>(0);
    const [ amountInStock, setAmountInStock ] = React.useState<number>(0);
    const [ icon, seticon ] = React.useState<string>("");
    const [ available, setAvailable ] = React.useState<boolean>(true);

    const handleNumberInputChange = (e: React.ChangeEvent<HTMLInputElement>, setValue: React.Dispatch<React.SetStateAction<number>>) => {
        const value = e.target.value;
        const parsed = parseFloat(value);

        if (value.trim() === '' || isNaN(parsed)) {
            return;
        } else {
            setValue(parsed);
        }
    }

    const handleAddProduct = async () => {
        const wasSuccessfull: boolean = await addProduct(name, internalPrice, icon);
        if (wasSuccessfull) handleClose();
        else setErrorText("Det gick inte att lägga till varan. Kontrollera att alla fält är ifyllda korrekt.");
    };

    const handleClose = () => {
        setName("");
        setInternalPrice(0);
        setAmountInStock(0);
        seticon("");
        setAvailable(true);
        setErrorText(null);
        closePopup();
    };

    return (
        <ActionPopupWindow 
            title="Lägg till vara" 
            onAccept={handleAddProduct} 
            isOpen={isOpen} 
            onClose={handleClose}
            className="add-item-popup"
        >
            <div className="inputdiv">
                <label>Varunamn</label>
                <input type="text" name="name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>

            <div className="inputdiv">
                <label>Pris (Internt)</label>
                <input 
                    id="amount" 
                    type="string" 
                    value={internalPrice} 
                    onChange={e => handleNumberInputChange(e, setInternalPrice)} 
                    placeholder="Ange belopp här..."
                />  
            </div>

            <div className="inputdiv">
                <label>Antal i lager</label>
                <input 
                    type="string" 
                    name="amountInStock" 
                    value={amountInStock} 
                    onChange={e => handleNumberInputChange(e, setAmountInStock)}
                    placeholder="Ange antal i lager..." 
                    min="0"
                />
            </div>

            <div className="inputdiv">
                <label>Bild URL</label>
                <input type="text" name="icon" value={icon} onChange={(e) => seticon(e.target.value)} />
            </div>

            <div className="availibility-container">
                <label>Finns i lager</label>
                <input type="checkbox" name="available" checked={available} onChange={(e) => setAvailable(e.target.checked)} />
            </div>

            {errorText && <p className="error-message">{errorText}</p>}
        </ActionPopupWindow>
    );
}

export default AddProductPopup;
