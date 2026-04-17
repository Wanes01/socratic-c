/**
 * The representation of a file or directory in the filesystem
 */
export interface FileNode {
    path: string;
    name: string;
    type: 'file' | 'directory';
    extension?: string;
    children?: FileNode[];
}

/**
 * The display of a file opened in the text editor
 */
export interface OpenedFile {
    path: string;
    name: string;
    extension: string;
    initialContent: string;
}