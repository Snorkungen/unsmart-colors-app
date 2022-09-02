import { RGBColor, RGBToLuminance, RGBToHex, createColorVariant, RGBToHSL, HSLToRGB, rotateHue, hexToRGB, HSLColor, createRandomColor } from "./color";

interface Color {
    rgb: RGBColor;
    get hsl(): HSLColor;
    get hex(): string;
    get luminance(): number;
}

interface ColorWithVariants extends Color {
    variants: Array<Color>;
}

/* 
    Todo 

    create a foreground which has ok contrast with primary & secondary
    create a background which has ok contrast with primary & secondary

    figure out how to make (info, warning, danger, success) colors match the theme

*/

export default class Theme {
    primary: ColorWithVariants;
    secondary: ColorWithVariants;
    background: ColorWithVariants;
    foreground: ColorWithVariants;
    info: Color;
    warning: Color;
    danger: Color;
    success: Color;

    constructor(primary: RGBColor) {
        this.primary = Theme.initColorWithVariants(primary);
        this.secondary = Theme.initColorWithVariants(
            HSLToRGB(rotateHue(RGBToHSL(primary), 60 * 3))
        );

        this.foreground = Theme.generateContrastingColor(this.primary)
        this.background = Theme.generateContrastingColor(this.foreground, 7)
        this.info = Theme.info;
        this.warning = Theme.warning;
        this.danger = Theme.danger;
        this.success = Theme.success;
    }


    // !!! Below only static !!!

    static initColor(rgb: RGBColor): Color {
        return {
            rgb,
            get hsl() {
                return RGBToHSL(this.rgb);
            },
            get hex() {
                return RGBToHex(this.rgb);
            },
            get luminance() {
                return RGBToLuminance(this.rgb);
            }
        }
    }

    static initColorWithVariants(rgb: RGBColor, count = 6): ColorWithVariants {
        let color = this.initColor(rgb);

        // generate variants
        let [hue, saturation, lightness] = color.hsl;
        let lightnessModifier = lightness / (count + 1);

        if (lightness > 0.5) {
            lightnessModifier * -1;
        }

        let variants: Array<Color> = [];

        for (let i = 1; i <= count; i++) {
            variants.push(
                this.initColor(HSLToRGB([hue, saturation, Math.min(
                    lightness + (lightnessModifier * i),
                    1
                )]))
            )
        }

        return {
            ...color,
            variants
        }
    }

    // Info is "cyan"
    static info = this.initColor(
        hexToRGB("#17a2b8")
    );
    // Warning is "yellow"
    static warning = this.initColor(
        hexToRGB("#ffc107")
    );
    // Danger is "red"
    static danger = this.initColor(
        hexToRGB("#dc3545")
    );
    // succes is "green"
    static success = this.initColor(
        hexToRGB("#28a745")
    );

    static CONTRAST_RATIO_NUM = 0.05;
    static MAX_LUMINANCE = RGBToLuminance([255, 255, 255]) + 0.01;
    static MIN_LUMINANCE = 0;
    static BLACK_RGB: RGBColor = [0, 0, 0, 1];
    static WHITE_RGB: RGBColor = [255, 255, 255, 1];

    static contrastRatio(...colors: [Color, Color]) {
        // https://www.w3.org/WAI/GL/wiki/Contrast_ratio
        let lums = colors.map(({ luminance }) => luminance);
        let dark = Math.min(...lums),
            light = Math.max(...lums);
        return (light + this.CONTRAST_RATIO_NUM) / (dark + this.CONTRAST_RATIO_NUM);
    }

    static derriveLuminance(ratio: number, luminance: number) {
        // ( x + 0.05 )/( 0 + 0.05 )= 21 || x ~~ 1
        let dark_lum = ratio * (luminance + this.CONTRAST_RATIO_NUM) - this.CONTRAST_RATIO_NUM;
        if (dark_lum < this.MAX_LUMINANCE) return dark_lum;
        // ( 1 + 0.05 ) / ( x + 0.05) = 21 || x ~~ 0
        let n = 1 / (luminance + this.CONTRAST_RATIO_NUM);
        return 1 / (ratio - n * this.CONTRAST_RATIO_NUM) / n - this.CONTRAST_RATIO_NUM;
    }

    static generateContrastingColor(color: Color, ratio = 4.5, n = 0): ColorWithVariants {
        let targetLuminance = this.derriveLuminance(ratio, color.luminance);

        if (n >= 10) {

            return this.initColorWithVariants(targetLuminance < 0.5 ? this.BLACK_RGB : this.WHITE_RGB);

        }
        if (targetLuminance < this.MIN_LUMINANCE) {
            return this.initColorWithVariants(this.BLACK_RGB)
        } else if (targetLuminance > this.MAX_LUMINANCE) {
            return this.initColorWithVariants(this.WHITE_RGB);
        }
        let newColorIsDarker = color.luminance > targetLuminance;
        let randomInteger = (min: number, max: number) => (Math.floor(Math.random() * (max - min) + min))


        let minSum = 0, maxSum = 255 * 3;

        if (newColorIsDarker) {
            maxSum = maxSum * targetLuminance;
        } else {
            minSum = maxSum * targetLuminance
        }

        const RED_M = 0.2126,
            GREEN_M = 0.7152,
            BLUE_M = 0.0722;

        if (newColorIsDarker) {
            let cc = [randomInteger(0, maxSum * RED_M + 1),
            randomInteger(0, maxSum * GREEN_M + 1),
            randomInteger(0, maxSum * BLUE_M + 1)
            ] as RGBColor;

            if (RGBToLuminance(cc) < targetLuminance) {
                return this.initColorWithVariants(cc);
            }


        } else {
            // Generate Color Try to fix fail
            const MAX_ATTEMPTS = 50;
            let attempts = 0;
            let rStart = (255 * targetLuminance) * (1 - RED_M),
                gStart = (255 * targetLuminance) * (1 - GREEN_M),
                bStart = (255 * targetLuminance) * (1 - BLUE_M);

            while (attempts < MAX_ATTEMPTS) {
                let cc = [
                    randomInteger(rStart, 256),
                    randomInteger(gStart, 256),
                    randomInteger(bStart, 256)
                ] as RGBColor;

                if (RGBToLuminance(cc) > targetLuminance) {
                    return this.initColorWithVariants(cc);
                }

                if (rStart < 255) {
                    rStart += 1 / RED_M;
                } else if (gStart < 255) {
                    gStart += 1 / GREEN_M;
                } else {
                    bStart += 1 / BLUE_M;
                }



                attempts++;
            }
        }

        return this.generateContrastingColor(color, ratio, n + 1)

    }
}


export {
    Theme
};