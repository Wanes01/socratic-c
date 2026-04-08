import { fetchFileTree, readFile } from '../services/files-api'

export const appState = $state({
    fileTree: {},
    selectedExercise: null,
    selectedFilePath: null,
    openedFiles: [],

    // loads the file tree
    async loadFiles() {
        try {
            this.fileTree = await fetchFileTree();
        } catch (e) {
            this.fileTree = {};
        }
    },

    // loads the content of file, making it open
    async openFile(file) {
        this.selectedFilePath = file.path;

        // checks if it's already open
        const existing = this.openedFiles.find(f => f.path === file.path);

        if (!existing) {
            try {
                const data = await readFile(file.path);
                this.openedFiles.push({
                    path: file.path,
                    name: file.name,
                    content: data.content
                });
            } catch (err) {
                console.error("Errore nel caricamento del file", err);
            }
        }
    }
});