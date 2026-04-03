/** Raw input after the https:// addon: optional www., dotted host, optional /path segments. */
export const HIDDEN_LINK_INPUT_REGEX =
    /^(www\.)?[a-z0-9-]+(\.[a-z0-9-]+)+(\/[a-z0-9._~-]+)*\/?$/i;

export const DISALLOWED_SCHEME_PREFIX = /^https?:\/\//i;

/** Empty optional; otherwise no scheme and must match {@link HIDDEN_LINK_INPUT_REGEX}. */
export function isValidHiddenLinkRawInput(val: string): boolean {
    const trimmed = val.trim();
    if (!trimmed) return true;
    if (DISALLOWED_SCHEME_PREFIX.test(trimmed)) return false;
    return HIDDEN_LINK_INPUT_REGEX.test(trimmed);
}

/** Stored full https URL must parse and match the same host/path shape (no query or hash). */
export function isValidStoredHiddenLink(url: string): boolean {
    const trimmed = url.trim();
    if (!trimmed) return true;
    try {
        const u = new URL(trimmed);
        if (u.protocol !== "https:" || !u.hostname) return false;
        if (u.search || u.hash) return false;
        const path = u.pathname === "/" ? "" : u.pathname;
        const synthetic = path ? `${u.hostname}${path}` : u.hostname;
        return HIDDEN_LINK_INPUT_REGEX.test(synthetic);
    } catch {
        return false;
    }
}
