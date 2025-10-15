import ActionPopupWindow from "../actionPopupWindow/ActionPopupWindow";
import { useInventory } from "../../contexts/InventoryContext";
import React, { useEffect, useState } from "react";

interface UpdateProductPopupProps {
    item: IItem | null;
    onClose: () => void;
}

const UpdateProductPopup: React.FC<UpdateProductPopupProps> = ({item, onClose}) => {
    if (!item) return null;
    const { updateProduct } = useInventory();


    const [updatedProduct, setUpdatedProduct] = useState(item);
    const [isChanged, setIsChanged] = useState(false);

    useEffect(() => {
        setIsChanged(
        item.name !== updatedProduct.name ||
        item.internalPrice !== updatedProduct.internalPrice ||
        item.icon !== updatedProduct.icon ||
        item.available !== updatedProduct.available
        );
    }, [updatedProduct, item]);

    const handleUpdate = async () => {
        const successful = await updateProduct(updatedProduct);
        if (successful) handleExit();
        else console.error("Failed to update item");
    };

    const handleExit = () => {
        setUpdatedProduct(item);
        onClose();
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setUpdatedProduct((prev) => ({
        ...prev,
        [name]:
            type === "checkbox" ? checked : type === "number" ? parseFloat(value) : value,
        }));
    };

    return (
        <ActionPopupWindow
            title={`Uppdatera`}
            acceptButtonText="Update"
            isOpen={true}
            onClose={handleExit}
            acceptButtonDisabled={!isChanged}
            onAccept={handleUpdate}
        >
            <div className="inputdiv">
                <label htmlFor="name">Namn: </label>
                <input
                type="text"
                name="name"
                value={updatedProduct.name}
                onChange={handleChange}
                />
            </div>

            <div className="inputdiv">
                <label htmlFor="price">Pris: </label>
                <input
                type="number"
                name="internalPrice"
                value={updatedProduct.internalPrice}
                onChange={handleChange}
                />
            </div>

            <div className="inputdiv">
                <label htmlFor="icon">Bildlänk: </label>
                <input
                type="text"
                name="icon"
                value={updatedProduct.icon}
                onChange={handleChange}
                />
            </div>

            <div>
                <label htmlFor="available">Tillgänglig: </label>
                <input
                type="checkbox"
                name="available"
                checked={updatedProduct.available}
                onChange={handleChange}
                />
            </div>
        </ActionPopupWindow>
    );
};

export default UpdateProductPopup;
