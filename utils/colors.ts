export const getContrastColor = (hexColor: string) => {
    // If invalid hex, return default black
    if (!hexColor || !hexColor.startsWith('#')) return '#000000';

    // Remove hash
    const hex = hexColor.replace('#', '');

    // Parse RGB
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);

    // Calculate YIQ luminance
    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;

    // Returns black or white depending on luminance
    return yiq >= 128 ? '#000000' : '#ffffff';
};

export const isLightColor = (hexColor: string) => {
    if (!hexColor || !hexColor.startsWith('#')) return true;
    const hex = hexColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    return yiq >= 128;
};

export const hexToRgba = (hexColor: string, opacity: number = 1) => {
    if (!hexColor || !hexColor.startsWith('#')) return `rgba(0,0,0,${opacity})`;
    const hex = hexColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    return `rgba(${r},${g},${b},${opacity})`;
};
