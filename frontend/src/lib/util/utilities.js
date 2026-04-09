// maps a string to a color
export const stringToColor = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }

    const h = Math.abs(hash % 360);
    const s = 60 + (Math.abs(hash >> 8) % 20);
    const l = 55 + (Math.abs(hash >> 16) % 15);

    return `hsl(${h}, ${s}%, ${l}%)`;
};

// checks if a name can be used a file/directory identifier 
export const isValidFileName = (name) => {
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