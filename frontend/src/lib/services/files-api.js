const FILES_API_BASE_URL = '/api/files';

export async function fetchFileTree() {
    const res = await fetch(`${FILES_API_BASE_URL}/tree`);
    if (!res.ok) {
        throw new Error('Could not retrieve files tree');
    }
    return await res.json();
}

export async function readFile(relPath) {
    const res = await fetch(`${FILES_API_BASE_URL}/read?path=${relPath}`);
    if (!res.ok) {
        throw new Error('Could not read file');
    }
    return await res.json();
}