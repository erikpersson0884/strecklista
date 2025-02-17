import React from "react";
import PopupDiv from "../PopupDiv/PopupDiv";

import { useInventory } from "../../Contexts/InventoryContext";
import { Product } from "../../Types";

interface AddProductPopupProps {
    closePopup?: () => void;
    setShowPopupDiv: React.Dispatch<React.SetStateAction<boolean>>;
    showPopupDiv: boolean;
}

const AddProductPopup: React.FC<AddProductPopupProps> = ({ closePopup = () => {}, setShowPopupDiv, showPopupDiv }) => {
    const { addProduct } = useInventory();


    const [newProduct, setNewProduct] = React.useState<Product>(
        {
            id: "0",
            name: "",
            price: 0,
            amountInStock: 0,
            available: false,
            imageUrl: ""
        }
    );

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setNewProduct({
            ...newProduct,
            [name]: type === "checkbox" ? checked : type === "number" ? parseFloat(value) : value
        });
    };

    

    const handleAddProduct = () => {
        addProduct(newProduct);
        setShowPopupDiv(false);
    };

    return (
        <PopupDiv 
            title="Lägg till vara" 
            doAction={handleAddProduct} 
            showPopupDiv={showPopupDiv} 
            setShowPopupDiv={setShowPopupDiv}
            cancelAction={closePopup}
        >
            <div>
                <label>Varunamn</label>
                <input type="text" name="name" value={newProduct.name} onChange={handleInputChange} />
            </div>

            <div>
                <label>Pris</label>
                <input type="number" name="price" value={newProduct.price} onChange={handleInputChange} />
            </div>

            <div>
                <label>Antal i lager</label>
                <input type="number" name="amountInStock" value={newProduct.amountInStock} onChange={handleInputChange} />
            </div>
            
            <div>
                <label>Finns i lager</label>
                <input type="checkbox" name="available" checked={newProduct.available} onChange={handleInputChange} />
            </div>

            <div>
                <label>Bild URL</label>
                <input type="text" name="imageUrl" value={newProduct.imageUrl} onChange={handleInputChange} />
            </div>
        </PopupDiv>
    );
}

export default AddProductPopup;
