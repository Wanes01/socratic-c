const FILES_API_BASE_URL = '/api/files';

export async function fetchFileTree() {
    const res = await fetch(`${FILES_API_BASE_URL}/tree`);
    if (!res.ok) {
        throw new Error('Could not retrieve files tree');
    }
    return await res.json();
}

export async function readFile(relPath) {
    const encodedPath = encodeURIComponent(relPath);
    const res = await fetch(`${FILES_API_BASE_URL}/read?path=${encodedPath}`);
    if (!res.ok) {
        throw new Error('Could not read file');
    }
    return await res.json();
}

export async function saveFileContent(relPath, content) {
    const res = await fetch(`${FILES_API_BASE_URL}/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            content,
            relPath
        })
    });
    if (!res.ok) {
        throw new Error('Could not save the file');
    }
    return await res.json();
}

export async function renameFile(oldPath, newPath) {
    const res = await fetch(`${FILES_API_BASE_URL}/rename`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            oldPath,
            newPath
        })
    });

    if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Errore nella rinomina');
    }

    return await res.json();
}

export async function deleteFile(path) {
    const encodedPath = encodeURIComponent(path);

    const res = await fetch(`${FILES_API_BASE_URL}/delete?path=${encodedPath}`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
        }
    });

    if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Errore durante l'eliminazione");
    }

    return await res.json();
}