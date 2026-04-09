import { fetchFileTree, readFile } from '../services/files-api'

export const appState = $state({
    fileTree: {},
    selectedExercise: null,
    selectedFile: null,
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

        // checks if it's already open
        const openedFile = this.openedFiles.find(f => f.path === file.path);

        if (!openedFile) {
            try {
                const data = await readFile(file.path);
                const fileData = {
                    path: file.path,
                    name: file.name,
                    extension: file.extension,
                    content: data.content
                };
                this.selectedFile = fileData;
                this.openedFiles.push(fileData);
            } catch (err) {
                console.error("Errore nel caricamento del file", err);
            }
            // if the file already exists retrive it
        } else {
            this.selectedFile = openedFile;
        }
    }
});