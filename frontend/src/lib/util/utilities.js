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