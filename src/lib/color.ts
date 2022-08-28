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

    let value = num.toString(16);

    if (num < 16) {
        value = "0" + value;
    }

    return value;
}

export const RGBToHex = ([red, green, blue, alpha]: RGBColor): string => {
    let hex = "#";
    hex += numToHexValue(red);
    hex += numToHexValue(green);
    hex += numToHexValue(blue);

    if (alpha) {
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

export const generateVariants = (rgb: RGBColor, stepSize: number, variantCount = 10): RGBColor[] => {
    let variants: Array<RGBColor> = []
    let half = Math.floor(variantCount / 2);
    while (variants.length <= variantCount) {
        if (variants.length === half) {
            variants.push(rgb);
        } else if (variants.length < half) {
            variants.push(
                createColorVariant(rgb, variants.length * stepSize)
            )
        } else {
            variants.push(
                createColorVariant(rgb, variants.length * -stepSize)
            )
        }
    }

    return variants;
}

export * from "./hsl";