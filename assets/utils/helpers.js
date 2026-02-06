/**
 * Utility: Helpers
 * Collection of pure functions for general purpose usage.
 */

/**
 * Shuffles an array in place (Fisher-Yates algorithm).
 * @param {Array} array 
 * @returns {Array} Shuffled array
 */
export function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

/**
 * Normalizes a string for comparison (removes accents, lowercase).
 * @param {string} str 
 * @returns {string} Normalized string
 */
export function normalizeString(str) {
    return str
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // Remove accents
        .replace(/-/g, " ") // Hyphens to spaces
        .trim();
}

/**
 * Animates a numeric value change on a DOM element.
 * @param {HTMLElement} element 
 * @param {number} start 
 * @param {number} end 
 * @param {number} duration 
 */
export function animateValue(element, start, end, duration) {
    if (start === end) return;
    const range = end - start;
    let current = start;
    const increment = end > start ? 1 : -1;
    const stepTime = Math.abs(Math.floor(duration / range));

    const timer = setInterval(() => {
        current += increment;
        element.textContent = current;
        if (current === end) {
            clearInterval(timer);
        }
    }, Math.max(stepTime, 10)); // Min 10ms per frame
}

/**
 * Triggers device vibration if supported.
 * @param {number|number[]} pattern 
 */
export function vibrate(pattern) {
    if (navigator.vibrate) {
        navigator.vibrate(pattern);
    }
}
