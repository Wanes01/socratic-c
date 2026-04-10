import * as filesApi from '../services/files-api';

export const appState = $state({
    fileTree: {},
    selectedFile: null,
    selectedExercise: null, // the selected exercise name
    openedFiles: [], // { path, name, extension, initialContent }
    editorViews: {}, // path -> CodeMirror's EditorView
    contextMenu: null, // treats the context menu as a singleton
    modal: null, // treats the modal as a singleton

    closeContextMenu() {
        this.contextMenu = null;
    },

    openContextMenu(x, y, options) {
        this.contextMenu = { x, y, options };
    },

    showModal(title, message, onConfirm, confirmText = "Conferma", cancelText = "Annulla") {
        this.modal = { title, message, onConfirm, confirmText, cancelText };
    },

    closeModal() {
        this.modal = null;
    },

    // gets the content of an already open file
    getContent(path) {
        return this.editorViews[path]?.state.doc.toString() ?? null;
    },

    // loads the file tree
    async loadFiles() {
        try {
            this.fileTree = await filesApi.fetchFileTree();
        } catch (e) {
            this.fileTree = {};
        }
    },

    // reads the content of a file on the server
    async openFile(file) {
        // checks if the file to open altready exists
        const alreadyOpen = this.openedFiles.find(f => f.path === file.path);
        if (!alreadyOpen) {
            try {
                const data = await filesApi.readFile(file.path);
                const fileData = {
                    path: file.path,
                    name: file.name,
                    extension: file.extension,
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
    },

    // saves the file content on the server
    async saveFile(file) {
        const content = this.getContent(file.path);
        if (content !== null) {
            await filesApi.saveFileContent(file.path, content);
        }
    },

    // renames a file/directory
    async renameNode(node, replName) {
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
    },

    // deletes a file/directory (recursively)
    async deleteNode(node) {
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

        } catch (err) {
            console.error("Errore durante l'eliminazione: " + err.message);
        }
    },

    // creates a new file/directory
    async createNode(path, type) {
        try {
            await filesApi.createNodeApi(path, type);

            // relaods the file tree
            await this.loadFiles();

        } catch (err) {
            console.error("Errore creazione nodo:", err);
        }
    }
});