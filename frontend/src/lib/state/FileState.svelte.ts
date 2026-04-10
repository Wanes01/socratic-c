import * as filesApi from '../services/files-api';
import type { EditorView } from 'codemirror';
import type { FileNode, OpenedFile } from '../types';

class FileState {
    fileTree = $state<FileNode | {}>({});
    selectedExercise = $state<string | null>(null);
    openedFiles = $state<OpenedFile[]>([]);
    selectedFile = $state<OpenedFile | null>(null);
    
    editorViews = $state<Record<string, EditorView>>({});

    // gets the content of an already open file
    getContent = (path: string): string | null => {
       return this.editorViews[path]?.state.doc.toString() ?? null;
    }

    // loads the file tree
    loadFiles = async(): Promise<void> => {
        try {
            this.fileTree = await filesApi.fetchFileTree();
        } catch (e) {
            this.fileTree = {};
        }
    }

    // reads the content of a file on the server
    openFile = async (file: FileNode): Promise<void> => {
        // checks if the file to open already exists
        const alreadyOpen = this.openedFiles.find(f => f.path === file.path);
        if (!alreadyOpen) {
            try {
                const data = await filesApi.readFile(file.path);
                const fileData = {
                    path: file.path,
                    name: file.name,
                    extension: file.extension ?? '',
                    initialContent: data.content
                };
                this.openedFiles.push(fileData);
                this.selectedFile = fileData;
            } catch (err) {
                console.error("Errore nel caricamento del file", err);
            }
        } else {
            this.selectedFile = alreadyOpen;
        }
    }

    // saves the file content on the server
    saveFile = async (file: OpenedFile): Promise<void> => {
        const content = this.getContent(file.path);
        if (content !== null) {
            await filesApi.saveFileContent(file.path, content);
        }
    }

    // renames a file/directory
    renameNode = async (node: FileNode, replName: string): Promise<void> => {
        const oldPath = node.path;
        const newName = replName.trim();
        // compute the new path in the original directory
        const pathParts = oldPath.split('/');
        pathParts[pathParts.length - 1] = newName;
        const newPath = pathParts.join('/');

        try {
            // renames the file server-side
            await filesApi.renameFile(oldPath, newPath);

            // updates the file name locally, without refreshing
            const openedFile = this.openedFiles.find(f => f.path === oldPath);
            if (openedFile) {
                openedFile.path = newPath;
                openedFile.name = newName;
                openedFile.extension = newName.includes('.') ? `.${newName.split('.').pop()}` : '';

                // it the renamed file is the selected one then refreshes the editor
                if (this.selectedFile?.path === oldPath) {
                    this.selectedFile = openedFile;
                }
            }

            // reloads the file tree
            await this.loadFiles();

        } catch (err) {
            console.error("Impossibile rinominare il file");
        }
    }

    // deletes a file/directory (recursively)
    deleteNode = async (node: FileNode): Promise<void> => {
        try {
            await filesApi.deleteFile(node.path);

            const isDir = node.type === 'directory';

            if (isDir) {
                this.openedFiles = this.openedFiles.filter(f =>
                    !f.path.startsWith(node.path + '/') && f.path !== node.path
                );
            } else {
                this.openedFiles = this.openedFiles.filter(f => f.path !== node.path);
            }

            const isSelectedInsideDeleted = this.selectedFile?.path.startsWith(node.path + '/')
                || this.selectedFile?.path === node.path;

            if (isSelectedInsideDeleted) {
                this.selectedFile = this.openedFiles[0] || null;
            }

            await this.loadFiles();

        } catch (err: any) {
            console.error("Errore durante l'eliminazione: " + err.message);
        }
    }

    // creates a new file/directory
    createNode = async (path: string, type: 'file' | 'directory'): Promise<void> => {
        try {
            await filesApi.createNodeApi(path, type);

            // relaods the file tree
            await this.loadFiles();

        } catch (err) {
            console.error("Errore creazione nodo:", err);
        }
    }
}

export const fs = new FileState();