import ActionPopupWindow from "../actionPopupWindow/ActionPopupWindow";

interface ConfirmDialogProps {
    isOpen: boolean;
    title: string;
    message: string;
    confirmButtonText?: string;
    onConfirm: () => void;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
    isOpen,
    title,
    message,
    confirmButtonText = "Godkänn",
    onConfirm,
}) => {
    return (
        <ActionPopupWindow
            isOpen={isOpen}
            title={title}
            acceptButtonText={confirmButtonText}
            onAccept={onConfirm}
            onClose={() => {}}
        >
            <p>{message}</p>
        </ActionPopupWindow>
    );
};

export default ConfirmDialog;