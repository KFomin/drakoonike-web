import base64 from "base-64";

/**
 * Decodes a Base64 encoded string.
 * @param {string} encodedText The Base64 encoded text to decode.
 * @returns {string} The decoded string.
 */
export function decode(encodedText) {
    return base64.decode(encodedText);
}

/**
 * Decodes a ROT13 encoded string.
 * @param {string} encodedText The ROT13 encoded text to decode.
 * @returns {string} The decoded string.
 */
export function decodeROT13(encodedText) {
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
export function getLocalStorageGameData() {
    const retrievedData = localStorage.getItem('gameData');
    return retrievedData ? JSON.parse(retrievedData) : null;
}

/**
 * Update/set gameData in localstorage.
 */
export function setLocalStorageGameData(gameData) {
    localStorage.setItem('gameData', JSON.stringify(gameData));
}

/**
 * Remove gameData from localstorage.
 */
export function deleteLocalStorageGameData(){
    localStorage.removeItem('gameData');
}
