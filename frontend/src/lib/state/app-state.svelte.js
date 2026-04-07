import { fetchFileTree } from '../services/files-api'

export const appState = $state({
    fileTree: {},

    async loadFiles() {
        try {
            this.fileTree = await fetchFileTree();
        } catch (e) {
        }
    }
});