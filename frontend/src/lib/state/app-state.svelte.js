import { fetchFileTree, readFile, saveFileContent, renameFile } from '../services/files-api'

export const appState = $state({
    fileTree: {},
    selectedFile: null,
    openedFiles: [], // { path, name, extension, initialContent }
    editorViews: {}, // path -> CodeMirror's EditorView
    contextMenu: null, // treats the context menu as a singleton

    closeContextMenu() {
        this.contextMenu = null;
    },

    openContextMenu(x, y, options) {
        this.contextMenu = { x, y, options };
    },

    // gets the content of an already open file
    getContent(path) {
        return this.editorViews[path]?.state.doc.toString() ?? null;
    },

    // loads the file tree
    async loadFiles() {
        try {
            this.fileTree = await fetchFileTree();
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
                const data = await readFile(file.path);
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
            await saveFileContent(file.path, content);
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
            await renameFile(oldPath, newPath);

            // updates the file name locally, without refreshing
            const openedFile = this.openedFiles.find(f => f.path === oldPath);
            if (openedFile) {
                // moves the CodeMirror's view to its new key
                if (this.editorViews[oldPath]) {
                    this.editorViews[newPath] = this.editorViews[oldPath];
                    delete this.editorViews[oldPath];
                }
                openedFile.path = newPath;
                openedFile.name = newName;
                // updates the file extension
                openedFile.extension = newName.includes('.') ? `.${newName.split('.').pop()}` : '';
            }

            // reloads the file tree
            await this.loadFiles();

        } catch (err) {
            console.error("Impossibile rinominare il file");
        }
    }
});