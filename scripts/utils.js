/**
 * Returns a value as a `pixel`-denominated string.
 *
 * @param value
 *
 * @returns {string}
 */
export function asPx(value) {
    return `${value}px`;
}

/**
 * Calculates how much of the `targetRect` is overlapped by the `overlappingRect`. Returns an object with top, right,
 * bottom, and left values indicating the boundaries of the overlap relative to the `targetRect`.
 *
 * @param overlappingRect {DOMRect} The rectangle that may be overlapping the target
 * @param targetRect {DOMRect} The target rectangle that we want to check for overlap
 *
 * @returns {{top: number, right: number, bottom: number, left: number}|null} Overlap measurements, or null if no
 * overlap is present.
 */
export function overlappingBounds(overlappingRect, targetRect) {
    // Is there any overlap at all?
    if (overlappingRect.right < targetRect.left ||
        overlappingRect.bottom < targetRect.top ||
        overlappingRect.left > targetRect.right ||
        overlappingRect.top > targetRect.bottom) {
        return null;
    }

    const left = Math.min(targetRect.width, Math.max(0, overlappingRect.left - targetRect.left));
    const right = Math.max(0, Math.min(targetRect.width, overlappingRect.right - targetRect.left));
    const top = Math.max(0, overlappingRect.top - targetRect.top);
    const bottom = Math.min(targetRect.height, targetRect.bottom - Math.max(0, targetRect.bottom - overlappingRect.bottom));

    return { top, right, left, bottom };
}
