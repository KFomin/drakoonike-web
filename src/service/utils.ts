import base64 from "base-64";

/**
 * Decodes a Base64 encoded string.
 */
export function decode(encodedText: string): string {
    return base64.decode(encodedText);
}

/**
 * Decodes a ROT13 encoded string.
 */
export function decodeROT13(encodedText: string): string {
    let decoded = '';
    for (let c of encodedText) {
        if (/[a-zA-Z]/.test(c)) {
            const base = c <= 'Z' ? 'A' : 'a';
            c = String.fromCharCode(((c.charCodeAt(0) - base.charCodeAt(0) + 13) % 26) + base.charCodeAt(0));
        }
        decoded += c;
    }
    return decoded;
}

/**
 * Try to get gameData from localStorage.
 */
export function getLocalStorageGameData(): object | null {
    const retrievedData = localStorage.getItem('gameData');
    return retrievedData ? JSON.parse(retrievedData) : null;
}

/**
 * Update/set gameData in localstorage.
 */
export function setLocalStorageGameData(gameData: object): void {
    localStorage.setItem('gameData', JSON.stringify(gameData));
}

/**
 * Remove gameData from localstorage.
 */
export function deleteLocalStorageGameData(): void {
    localStorage.removeItem('gameData');
}
