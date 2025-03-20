import React from "react";
import PopupDiv from "../../../components/PopupDiv/PopupDiv";
import "./AddProductPopup.css";

import { useInventory } from "../../../contexts/InventoryContext";

interface AddProductPopupProps {
    closePopup?: () => void;
    setShowPopupDiv: React.Dispatch<React.SetStateAction<boolean>>;
    showPopupDiv: boolean;
}

const AddProductPopup: React.FC<AddProductPopupProps> = ({ closePopup = () => {}, setShowPopupDiv, showPopupDiv }) => {
    const { addProduct } = useInventory();

    const [ name, setName ] = React.useState<string>("");
    const [ price, setPrice ] = React.useState<number>(0);
    const [ amountInStock, setAmountInStock ] = React.useState<number>(0);
    const [ icon, seticon ] = React.useState<string>("");
    const [ available, setAvailable ] = React.useState<boolean>(true);

    const handleAddProduct = async () => {
        await addProduct(name, [{ displayName: "P.R.I.T.", price: price }], icon);
        setShowPopupDiv(false);
    };

    return (
        <PopupDiv 
            title="Lägg till vara" 
            doAction={handleAddProduct} 
            showPopupDiv={showPopupDiv} 
            setShowPopupDiv={setShowPopupDiv}
            cancelAction={closePopup}
            className="add-product-popup"
        >
            <div className="inputdiv">
                <label>Varunamn</label>
                <input type="text" name="name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>

            <div className="inputdiv">
                <label>Pris</label>
                <input type="number" name="price" value={price} onChange={(e) => setPrice(Number(e.target.value))} />
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
        </PopupDiv>
    );
}

export default AddProductPopup;
