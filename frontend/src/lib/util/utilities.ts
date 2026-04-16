// checks if a name can be used a file/directory identifier 
export const isValidFileName = (name: string): boolean => {
    // can't be empty or use only spaces
    if (!name || name.trim().length === 0) return false;

    // can't use forbidden characters
    const invalidChars = /[<>:"\/\\|?*\x00-\x1F]/;
    if (invalidChars.test(name)) return false;

    // can't use reserved names
    const reservedNames = /^(con|prn|aux|nul|com[1-9]|lpt[1-9])(\..*)?$/i;
    if (reservedNames.test(name)) return false;

    // can't surpass the file's name max length
    if (name.length > 255) return false;

    return true;
}

// generic api helper
export const apiFetch = async <T>(
    apiBase: string,
    endpoint: string,
    options?: RequestInit,
    errorMessage?: string
): Promise<T> => {
    const res = await fetch(`${apiBase}${endpoint}`, {
        headers: { 'Content-Type': 'application/json' },
        ...options
    });

    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || errorMessage || 'Errore nella richiesta');
    }

    return res.json();
}