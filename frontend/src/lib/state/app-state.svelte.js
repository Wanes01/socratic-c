import { fetchFileTree, readFile } from '../services/files-api'

export const appState = $state({
    fileTree: {},
    selectedExercise: null,
    selectedFilePath: null,
    openedFiles: [],

    async loadFiles() {
        try {
            this.fileTree = await fetchFileTree();
        } catch (e) {
            this.fileTree = {};
        }
    },
});