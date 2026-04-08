import { fetchFileTree } from '../services/files-api'

export const appState = $state({
    fileTree: {},
    selectedExercise: null,
    selectedFilePath: null,

    async loadFiles() {
        try {
            this.fileTree = await fetchFileTree();
        } catch (e) {
        }
    }
});