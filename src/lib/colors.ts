import { RGBColor, RGBToLuminance } from "./color";

export type ColorEntry = {
    rgb: RGBColor;
    luminance: number;
};
export type ColorEntries = Array<ColorEntry>

export const colors: ColorEntries = (() => {
    const STEP_SIZE = 15;
    const entries: ColorEntries = [];

    for (let r = 0; r <= 255; r += STEP_SIZE) {
        for (let g = 0; g <= 255; g += STEP_SIZE) {
            for (let b = 0; b <= 255; b += STEP_SIZE) {
                entries.unshift({
                    rgb: [r, g, b],
                    luminance: RGBToLuminance([r, g, b])
                })
            }
        }
    }

    return entries;
})()
