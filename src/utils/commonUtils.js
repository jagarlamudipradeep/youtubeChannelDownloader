/**
 * Splits an array into chunks of a specified size.
 * @param {Array} array - The array to split.
 * @param {number} k - The size of each chunk.
 * @returns {Array} - An array of chunks.
 */
function splitArrayIntoChunks(array, k) {
    if (!Array.isArray(array) || typeof k !== 'number' || k <= 0) {
        throw new Error("Invalid input. Expected an array and a positive number for chunk size.");
    }

    const result = [];
    for (let i = 0; i < array.length; i += k) {
        const chunk = array.slice(i, i + k);
        result.push(chunk);
    }

    return result;
}

/**
 * Replaces special characters in a string with hyphens.
 * @param {string} str - The input string.
 * @returns {string} - The string with special characters replaced by hyphens.
 */
function replaceString(str) {
    if (typeof str !== 'string') {
        throw new Error('Invalid input. Expected a string.');
    }

    return str.replace(/[/\\?%*:|"<>]/g, '-');
}

export { splitArrayIntoChunks, replaceString };
