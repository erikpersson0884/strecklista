import React, { useEffect, useState } from "react";
import ActionPopupWindow from "@/components/actionPopupWindow/ActionPopupWindow";

import { useInventoryContext } from "@/contexts/InventoryContext";
import { useNotificationContext } from '@/contexts/NotificationContext';
import { useModalContext } from '@/contexts/ModalContext';


interface UpdateItemPopupProps {
    item: Item;
}

const UpdateItemPopup: React.FC<UpdateItemPopupProps> = ({ item }) => {
    const { updateItem } = useInventoryContext();
    const { notify } = useNotificationContext();
    const { closeModal } = useModalContext();

    const [updatedItem, setUpdatedItem] = useState(item);
    const [isChanged, setIsChanged] = useState(false);

    useEffect(() => {
        setIsChanged(
            item.name !== updatedItem.name ||
            item.internalPrice !== updatedItem.internalPrice ||
            item.icon !== updatedItem.icon ||
            item.available !== updatedItem.available
        );
    }, [updatedItem, item]);

    const handleUpdate = async () => {
        const changes: Partial<Item> = {};

        if (item.name !== updatedItem.name)                     changes.name = updatedItem.name;
        if (item.internalPrice !== updatedItem.internalPrice)   changes.internalPrice = updatedItem.internalPrice;
        if (item.icon !== updatedItem.icon)                     changes.icon = updatedItem.icon;
        if (item.available !== updatedItem.available)           changes.available = updatedItem.available;

        const successful = await updateItem(item.id, changes);

        if (successful) closeModal();
        else notify(`Misslyckades med att uppdatera`, 'error');
    };


    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;

        setUpdatedItem((prev) => ({
            ...prev,
            [name]:
                type === "checkbox"
                    ? checked
                    : type === "number"
                        ? parseFloat(value)
                        : value,
        }));
    };

    return (
        <ActionPopupWindow
            title="Uppdatera"
            acceptButtonText="Update"
            acceptButtonDisabled={!isChanged}
            onAccept={handleUpdate}
        >
            <div className="inputdiv">
                <label htmlFor="name">Namn: </label>
                <input
                    id="name"
                    type="text"
                    name="name"
                    value={updatedItem.name}
                    onChange={handleChange}
                />
            </div>

            <div className="inputdiv">
                <label htmlFor="internalPrice">Pris: </label>
                <input
                    id="internalPrice"
                    type="number"
                    name="internalPrice"
                    value={updatedItem.internalPrice}
                    onChange={handleChange}
                />
            </div>

            <div className="inputdiv">
                <label htmlFor="icon">Bildlänk: </label>
                <input
                    id="icon"
                    type="text"
                    name="icon"
                    value={updatedItem.icon}
                    onChange={handleChange}
                />
            </div>

            <div>
                <label htmlFor="available">Tillgänglig: </label>
                <input
                    id="available"
                    type="checkbox"
                    name="available"
                    checked={updatedItem.available}
                    onChange={handleChange}
                />
            </div>
        </ActionPopupWindow>
    );
};

export default UpdateItemPopup;