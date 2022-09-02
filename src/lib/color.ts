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

export const generateVariants_2 = (rgb: RGBColor, direction: -1 | 1 = 1, count = 10): Array<RGBColor> => {
    let sum = rgb[0] + rgb[1] + rgb[2], white = 255 * 3, black = 30 * 3, diff;

    if (direction < 0) {
        diff = sum - black;
    } else {
        diff = white - sum;
    }

    let step = Math.floor(sum / count);
    let variants: Array<RGBColor> = [];
    for (let i = 1; i <= count; i++) {
        variants.push(
            createColorVariant(rgb,
                (step * i) * direction
            )
        )
    }

    return variants;
}

export const ruinColor = ([red, green, blue, alpha]: RGBColor): RGBColor => {
    const sum = red + green + blue;
    const max = Math.max(red, green, blue),
        min = Math.min(red, green, blue)

    if (max > (sum / 2)) {
        switch (max) {
            case red:
                red = min;
            case green:
                green = min;
            case blue:
                blue = min;
        }
    } else {
        switch (min) {
            case red:
                red = max;
            case green:
                green = max;
            case blue:
                blue = max;
        }
    }

    return [red, green, blue, alpha];
}
export const ruinColor_2 = ([red, green, blue, alpha]: RGBColor): RGBColor => {
    const sum = red + green + blue;
    const max = Math.max(red, green, blue),
        min = Math.min(red, green, blue)


    switch (max) {
        case red:
            red = 0;
        case green:
            green = 0;
        case blue:
            blue = 0;
    }


    return [red, green, blue, alpha];
}

export const colorLuminance = ([red, green, blue]: RGBColor) => {
    const a = [red, green, blue].map((n) => {
        n /= 255;
        return n <= 0.03928 ?
            n / 12.92 :
            Math.pow((n + 0.055) / 1.055, 2.4)
    });

    return (a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722);
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

export const RGBToLuminance = ([red, green, blue]: RGBColor): number => {
    // https://stackoverflow.com/questions/596216/formula-to-determine-perceived-brightness-of-rgb-color#answer-56678483

    let linear = (val: number) => val <= 0.04045 ?
        val / 12.92 :
        Math.pow((val + 0.055) / 1.055, 2.4);

    let vR = red / 255,
        vG = green / 255,
        vB = blue / 255;

    return (
        0.2126 * linear(vR) + 0.7152 * linear(vG) + 0.0722 * linear(vB)
    );
}

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
