import type { ContextMenuState, ModalState, ContextMenuOption } from "../types"

class UIState {
    contextMenu = $state<ContextMenuState | null>(null);
    modal = $state<ModalState | null>(null);

    // closes the context menu
    closeContextMenu(): void {
        this.contextMenu = null;
    }

    // opens the context menu in a specific position
    openContextMenu(x: number, y: number, options: ContextMenuOption[]): void {
        this.contextMenu = { x, y, options };
    }

    // shows the confirmation modal
    showModal(
        title: string, 
        message: string, 
        onConfirm: () => void | Promise<void>, 
        confirmText: string = "Conferma", 
        cancelText: string = "Annulla"
    ): void {
        this.modal = { title, message, onConfirm, confirmText, cancelText };
    }

    // closes the confirmation modal
    closeModal(): void {
        this.modal = null;
    }
}

export const ui = new UIState();