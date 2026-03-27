import '@testing-library/jest-dom/vitest';

// Polyfill CSS.escape for jsdom (which doesn't implement it)
if (typeof globalThis.CSS === 'undefined') {
    (globalThis as any).CSS = {};
}
if (typeof globalThis.CSS.escape !== 'function') {
    // W3C spec polyfill: https://drafts.csswg.org/cssom/#the-css.escape()-method
    globalThis.CSS.escape = function (value: string): string {
        const string = String(value);
        const length = string.length;
        let result = '';
        for (let i = 0; i < length; i++) {
            const codeUnit = string.charCodeAt(i);
            if (codeUnit === 0x0000) {
                result += '\uFFFD';
                continue;
            }
            if (
                (codeUnit >= 0x0001 && codeUnit <= 0x001f) ||
                codeUnit === 0x007f ||
                (i === 0 && codeUnit >= 0x0030 && codeUnit <= 0x0039) ||
                (i === 1 && codeUnit >= 0x0030 && codeUnit <= 0x0039 && string.charCodeAt(0) === 0x002d)
            ) {
                result += '\\' + codeUnit.toString(16) + ' ';
                continue;
            }
            if (i === 0 && codeUnit === 0x002d && length === 1) {
                result += '\\' + string.charAt(i);
                continue;
            }
            if (
                codeUnit >= 0x0080 ||
                codeUnit === 0x002d ||
                codeUnit === 0x005f ||
                (codeUnit >= 0x0030 && codeUnit <= 0x0039) ||
                (codeUnit >= 0x0041 && codeUnit <= 0x005a) ||
                (codeUnit >= 0x0061 && codeUnit <= 0x007a)
            ) {
                result += string.charAt(i);
                continue;
            }
            result += '\\' + string.charAt(i);
        }
        return result;
    };
}
