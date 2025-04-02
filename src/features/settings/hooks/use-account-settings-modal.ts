import { useQueryState, parseAsBoolean } from "nuqs";

export const useAccountSettingsModal = () => {
    const [isOpen, setIsOpen] = useQueryState(
        "account-settings",
        parseAsBoolean.withDefault(false).withOptions({ clearOnDefault: true })
    );

    const open = () => setIsOpen(true);
    const close = () => setIsOpen(false);

    return {
        isOpen, 
        open, 
        close, 
        setIsOpen
    };
};