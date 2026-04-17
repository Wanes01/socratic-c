
import type { FileNode } from '../types/files-types';
import { apiFetch } from '../util/utilities';

const FILES_API_BASE_URL = '/api/files';

/**
 * Fetches the complete file tree structure of the exercises directory
 * @returns a promise that resolves to the root node of the file tree
 */
export const fetchFileTree = (): Promise<FileNode> => apiFetch(FILES_API_BASE_URL, '/tree');

/**
 * Reads the content of a specific file.
 * @param relPath the relative path of the file to read from the exercise folder
 * @returns a promise that resolves to the file content
 */
export const readFile = (relPath: string): Promise<{ content: string; }> =>
    apiFetch(FILES_API_BASE_URL, `/read?path=${encodeURIComponent(relPath)}`);

/**
 * Updates the content of an existing file
 * @param relPath the relative path from the exercise folder of the file to save
 * @param content the new content to write into the file
 * @returns a promise indicating the result of the operation
 */
export const saveFileContent = (relPath: string, content: string): Promise<{ success: boolean; }> =>
    apiFetch(FILES_API_BASE_URL, '/save', {
        method: 'POST',
        body: JSON.stringify({ relPath, content })
    });

/**
 * Renames a file or directory
 * @param oldPath the current relative path of the node from the exercise dir
 * @param newPath the new relative path for the node from the exercise dir
 * @returns a promise indicating the result of the operation
 */
export const renameFile = (oldPath: string, newPath: string): Promise<{ success: boolean; }> =>
    apiFetch(FILES_API_BASE_URL, '/rename', {
        method: 'PATCH',
        body: JSON.stringify({ oldPath, newPath })
    });

/**
 * Deletes a file or directory
 * @param filePath the relative path of the node from the exercise dir
 * @returns a promise indicating the result of the operation
 */
export const deleteFile = (filePath: string): Promise<{ success: boolean; }> =>
    apiFetch(FILES_API_BASE_URL, `/delete?path=${encodeURIComponent(filePath)}`, {
        method: 'DELETE'
    });

/**
 * Creates a file or directory
 * @param filePath the relative path of the node from the exercise dir
 * @returns a promise indicating the result of the operation
 */
export const createNodeApi = (filePath: string, type: string): Promise<{ success: boolean; }> =>
    apiFetch(FILES_API_BASE_URL, '/create', {
        method: 'POST',
        body: JSON.stringify({ path: filePath, type })
    });

/**
 * Triggers a browser download of a specific exercise as a ZIP archive.
 * This method creates a temporary anchor element to initiate the download.
 * @param exerciseName the name of the exercise folder to compress and download
 */
export function downloadExerciseZip(exerciseName: string): void {
    const url = `${FILES_API_BASE_URL}/download?name=${encodeURIComponent(exerciseName)}`;

    // creates a temporary element to start the download
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${exerciseName}.zip`);
    document.body.appendChild(link);
    link.click();
    link.remove();
}