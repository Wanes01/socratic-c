import { fetchFileTree, readFile, saveFileContent } from '../services/files-api'

export const appState = $state({
    fileTree: {},
    selectedFile: null,
    openedFiles: [], // { path, name, extension, initialContent }
    editorViews: {}, // path -> CodeMirror's EditorView

    // loads the file tree
    async loadFiles() {
        try {
            this.fileTree = await fetchFileTree();
        } catch (e) {
            this.fileTree = {};
        }
    },

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

    // gets the content of an already open file
    getContent(path) {
        return this.editorViews[path]?.state.doc.toString() ?? null;
    },

    // saves the file content on the server
    async saveFile(file) {
        const content = this.getContent(file.path);
        if (content !== null) {
            await saveFileContent(file.path, content);
        }
    }
});