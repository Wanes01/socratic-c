export interface FileNode {
    path: string;
    name: string;
    type: 'file' | 'directory';
    extension?: string;
    children?: FileNode[];
}

export interface OpenedFile {
    path: string;
    name: string;
    extension: string;
    initialContent: string;
}

export interface ContextMenuOption {
    label: string;
    icon?: string;
    action: () => void | Promise<void>;
}

export interface ContextMenuState {
    x: number;
    y: number;
    options: ContextMenuOption[];
}

export interface ModalState {
    title: string;
    message: string;
    onConfirm: () => void | Promise<void>;
    confirmText: string;
    cancelText: string;
}