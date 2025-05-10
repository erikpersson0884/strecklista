import PopupDiv from "../../../components/PopupDiv/PopupDiv";
import React from "react";
import { useInventory } from "../../../contexts/InventoryContext";

interface DeleteProductPopupProps {
    product: ProductT;
    isOpen: boolean;
    onClose: () => void;
}

const DeleteProductPopup: React.FC<DeleteProductPopupProps> = ({product, isOpen, onClose}) => {
    const { deleteProduct } = useInventory();

    const [ errorText , setErrorText ] = React.useState<string>("");

    const handleDelete = async () => {
        try {
            await deleteProduct(product.id);
            handleClose();
        } catch (error) {
            setErrorText("Något gick fel, försök igen senare.");
        }
    }

    const handleClose = () => {
        setErrorText("");
        onClose();
    }

    return (
        <PopupDiv 
            isOpen={isOpen} 
            onClose={handleClose}
            title="Radera Product"
            acceptButtonText="Radera"
            onAccept={handleDelete}
        >
            <p>Är du säker på att du vill radera produkten?</p>
            <p>Produkt: <span className="red-text">{product.name}</span></p>
            {errorText && <div className="error-message">{errorText}</div>}
        </PopupDiv>
    )
}

export default DeleteProductPopup;
