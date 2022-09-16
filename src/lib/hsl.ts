/* https://stackoverflow.com/questions/2353211/hsl-to-rgb-color-conversion */
/* https://stackoverflow.com/questions/2348597/why-doesnt-this-javascript-rgb-to-hsl-code-work/54071699#54071699 */
import { HSLColor, RGBColor } from "./color";


export const RGBToHSL = ([red, green, blue]: RGBColor): HSLColor => {
    red /= 255; green /= 255; blue /= 255;
    let max = Math.max(red, green, blue),
        min = Math.min(red, green, blue);
    let hue = 0,
        saturation,
        lightness = (max + min) / 2;


    if (max === min) {
        hue = saturation = 0;
    } else {
        let diff = max - min;
        saturation = lightness > 0.5 ? diff / (2 - max - min) : diff / (max + min);

        switch (max) {
            case red:
                hue = (green - blue) / diff + (green < blue ? 6 : 0);
                break;
            case green:
                hue = (blue - red) / diff + 2;
                break;
            case blue:
                hue = (red - green) / diff + 4;
                break;
        }

        hue = hue / 6;
    }

    return [hue, saturation, lightness];
}

export const HSLToRGB = ([hue, saturation, lightness]: HSLColor): RGBColor => {
    hue = Math.round(hue * 360);

    let a = saturation * Math.min(lightness, 1 - lightness);
    let f = (
        n: number,
        k = (n + (hue / 30)) % 12
    ) => lightness - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));

    return [
        Math.ceil(f(0) * 255),
        Math.ceil(f(8) * 255),
        Math.ceil(f(4) * 255),
        1
    ]
}

export const rotateHue = ([hue, ...rest]: HSLColor, amount: number): HSLColor => {
    return [(hue + amount / 360) % 1, ...rest];
}
