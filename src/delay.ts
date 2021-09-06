/**
 * Adds a delay to allow for other promises to finish.
 * @param ms delay in ms.  Defaults to 10 ms
 * @returns Promise
 */
export function delay(ms = 10): Promise<void> {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve();
        }, ms);
    });
}
