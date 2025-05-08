import React from "react";
import PopupDiv from "../../../components/PopupDiv/PopupDiv";

import { useInventory } from "../../../contexts/InventoryContext";

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
        <PopupDiv 
            title="Lägg till vara" 
            onAccept={() => addProduct(name, internalPrice, icon)} 
            isOpen={isOpen} 
            onClose={handleClose}
            className="add-product-popup"
        >
            <div className="inputdiv">
                <label>Varunamn</label>
                <input type="text" name="name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>

            <div className="inputdiv">
                <label>Pris (Internt)</label>
                <input type="number" name="price" value={internalPrice} onChange={(e) => setInternalPrice(Number(e.target.value))} />
            </div>

            <div className="inputdiv">
                <label>Antal i lager</label>
                <input type="number" name="amountInStock" value={amountInStock} onChange={(e) => setAmountInStock(Number(e.target.value))} />
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
        </PopupDiv>
    );
}

export default AddProductPopup;
