import { HSLToRGB } from "./hsl";

export type RGBColor = [red: number, green: number, blue: number, alpha?: number];
export type HSLColor = [hue: number, saturation: number, lightness: number];


export const hexToRGB = (hex: string): RGBColor => {
    // Remove # if it exists
    if (hex.at(0) === "#") {
        hex = hex.slice(1);
    }
    // Validate color
    if (
        hex.length !== 3 &&
        hex.length !== 4 &&
        hex.length !== 6 &&
        hex.length !== 8
    ) {
        // Throw an error if i could be bothered
    }

    // Make shortversion to long version
    if (hex.length < 5) {
        let r = hex[0],
            g = hex[1],
            b = hex[2],
            a = hex.at(3);
        hex = (r + r) + (g + g) + (b + b);
        if (a) {
            hex += a + a;
        }
    }

    let red = parseInt(hex.slice(0, 2), 16),
        green = parseInt(hex.slice(2, 4), 16),
        blue = parseInt(hex.slice(4, 6), 16),
        alpha = 1;

    if (hex.length > 6) {
        alpha = parseInt(hex.slice(6, 8), 16) / 255;
    }

    return [red, green, blue, alpha]
}

const numToHexValue = (num: number): string => {
    if (num < 0 || num > 255) {
        // Throw error
    }

    let value = Math.round(num).toString(16);

    if (num < 16) {
        value = "0" + value;
    }

    return value;
}

export const RGBToHex = ([red, green, blue, alpha]: RGBColor, setAlpha = false): string => {
    let hex = "#";
    hex += numToHexValue(red);
    hex += numToHexValue(green);
    hex += numToHexValue(blue);

    if (setAlpha && alpha) {
        hex += numToHexValue(alpha * 255);
    }
    return hex;
}

export const createColorVariant = ([red, green, blue, alpha]: RGBColor, modifier: number): RGBColor => {
    const sum = red + green + blue;
    const targetSum = sum + modifier;
    if (sum === 0) return [red, green, blue, alpha]

    const modifyColor = (num: number): number => {
        let percentage = num / sum;
        num = Math.round(targetSum * percentage);
        if (num < 0) {
            return 0;
        };
        if (num > 255) {
            return 255;
        }
        return num;
    }

    return [
        modifyColor(red),
        modifyColor(green),
        modifyColor(blue),
        alpha
    ]
}

export const colorLuminance = ([red, green, blue]: RGBColor) => {
    red = (red & 0xff) / 255; red = red <= 0.03928 ? red / 12.92 : ((red + 0.055) / 1.055) ** 2.4
    green = (green & 0xff) / 255; green = green <= 0.03928 ? green / 12.92 : ((green + 0.055) / 1.055) ** 2.4
    blue = (blue & 0xff) / 255; blue = blue <= 0.03928 ? blue / 12.92 : ((blue + 0.055) / 1.055) ** 2.4

    return (red * 0.2126 + green * 0.7152 + blue * 0.0722);
}
const contrastRatio = (c1: RGBColor, c2: RGBColor) => {
    let l1 = colorLuminance(c1),
        l2 = colorLuminance(c2);
    let light = Math.max(l1, l2),
        dark = Math.min(l1, l2);

    return (light + 0.05) / (dark + 0.05);
}

export const createRandomColor = (): RGBColor => {
    return HSLToRGB([Math.random(), Math.random(), Math.random()]);
}

export const contrastingColor = (rgb: RGBColor) => {
    let attempts = 0, result = rgb;
    let attemptLimit = 2500;
    while (attempts < attemptLimit) {
        result = createRandomColor()
        if (contrastRatio(rgb, result) > 4) {
            break
        }
        attempts++;
    }
    
    if (attempts == attemptLimit) {
        return rgb
    }
    
    return result;
}


export const RGBToLuminance = colorLuminance;
export * from "./hsl";

/*
    Percieved Brightness
    http://alienryderflex.com/hsp.html
    Y = sqrt (0.299 * R² + 0.587 * G² + 0.114 * B²)
    return Math.sqrt(
        0.299 * Math.pow(red, 2) +
        0.587 * Math.pow(green, 2) +
        0.114 * Math.pow(blue, 2)
    )

*/
