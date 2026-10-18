import React from "react";
import ActionPopupWindow from "@/components/actionPopupWindow/ActionPopupWindow";

import useInventoryContext from "@/contexts/InventoryContext";
import useModalContext from "@/contexts/ModalContext";
import Switch from "../switch/Switch";

const AddProductPopup: React.FC = () => {
    const { addItem } = useInventoryContext();
    const { closeModal } = useModalContext();

    const [ name, setName ] = React.useState<string>("");
    const [ internalPrice, setInternalPrice ] = React.useState<number>(0);
    const [ amountInStock, setAmountInStock ] = React.useState<number>(0);
    const [ icon, seticon ] = React.useState<string>("");
    const [ available, setAvailable ] = React.useState<boolean>(true);

    const handleNumberInputChange = (e: React.ChangeEvent<HTMLInputElement>, setValue: React.Dispatch<React.SetStateAction<number>>) => {
        const value = e.target.value;
        const parsed = Number.parseFloat(value);

        if (value.trim() === '' || Number.isNaN(parsed))  return;
        else setValue(parsed);
    }

    const handleAddProduct = async () => {
        const updatedItem: Item | null = await addItem(name, internalPrice, icon);
        if (updatedItem) closeModal();
    };

    return (
        <ActionPopupWindow 
            title="Lägg till vara" 
            onAccept={handleAddProduct} 
            className="add-item-popup"
            acceptButtonText="Lägg till"
        >
            <div className="inputdiv">
                <label htmlFor="addProductPopupNameInput">Varunamn</label>
                <input type="text" id="addProductPopupNameInput" name="name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>

            <div className="inputdiv">
                <label htmlFor="itemPriceInput">Pris (Internt)</label>
                <input 
                    id="itemPriceInput" 
                    type="string" 
                    value={internalPrice} 
                    onChange={e => handleNumberInputChange(e, setInternalPrice)} 
                    placeholder="Ange belopp här..."
                />  
            </div>

            <div className="inputdiv">
                <label htmlFor="amountInStockInput">Antal i lager</label>
                <input 
                    type="string" 
                    id="amountInStockInput"
                    name="amountInStock" 
                    value={amountInStock} 
                    onChange={e => handleNumberInputChange(e, setAmountInStock)}
                    placeholder="Ange antal i lager..." 
                    min="0"
                />
            </div>

            <div className="inputdiv">
                <label htmlFor="itemIconInput">Bild URL</label>
                <input type="text" id="itemIconInput" name="icon" value={icon} onChange={(e) => seticon(e.target.value)} />
            </div>

            <div className="inputdiv-row">
                <label htmlFor="item-is-available">Finns i lager:</label>
                <Switch id="item-is-available"/>
            </div>
        </ActionPopupWindow>
    );
}

export default AddProductPopup;
