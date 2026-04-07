const FILES_API_BASE_URL = '/api/files';

export async function fetchFileTree() {
    const res = await fetch(`${FILES_API_BASE_URL}/tree`);
    if (!res.ok) {
        throw new Error('Could not retrieve files tree');
    }
    return await res.json();
}