import { RGBColor, RGBToLuminance, RGBToHex, createColorVariant, RGBToHSL, HSLToRGB, rotateHue, hexToRGB, HSLColor } from "./color";

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
            HSLToRGB(rotateHue(RGBToHSL(primary), 180))
        );


        this.foreground = Theme.generateContrastingColor(this.primary, this.secondary);
        this.background = Theme.generateContrastingColor(this.foreground)

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
                return RGBToLuminance(this.rgb, 0);
            }
        }
    }

    static generateColorVariants(rgb: RGBColor, count: number, direction: -1 | 1 = 1): Array<Color> {
        let variants: Array<Color> = [];
        let sum = rgb[0] + rgb[1] + rgb[2];
        let step = Math.floor(sum / count);

        for (let i = 1; i <= count; i++) {
            variants.push(
                this.initColor(createColorVariant(rgb, step * i * direction))
            )
        }

        return variants;
    }

    static initColorWithVariants(rgb: RGBColor, count = 6): ColorWithVariants {
        return {
            ...this.initColor(rgb),
            variants: this.generateColorVariants(rgb, count)
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

    static contrastRatio({ luminance }: Color, { luminance: lum }: Color) {
        // https://www.w3.org/WAI/GL/wiki/Contrast_ratio
        let min = Math.min(luminance, lum),
            max = Math.max(luminance, lum);
        return (max + 0.05) / (min + 0.05);
    }

    static generateContrastingColor(...colors: Array<Color>): ColorWithVariants {
        const ATTEMPT_LIMIT = 10_000,
            MIN_CONTRAST = 4.8;

        const generateRandomColor = (): ColorWithVariants => {
            return this.initColorWithVariants(HSLToRGB([
                Math.random(),
                Math.random(),
                Math.random()
            ]));
        }

        for (let attempts = 0; attempts < ATTEMPT_LIMIT; attempts++) {
            let bool = true, randomColor = generateRandomColor();
            for (let color of colors) {
                if (bool && this.contrastRatio(color, randomColor) < MIN_CONTRAST) {
                    bool = false;
                }
            }

            if (bool) {
                return randomColor;
            }
        }
        console.warn("No Contrasting Color Found.")
        return this.initColorWithVariants([255, 255, 255, 0]);
    }
}


export {
    Theme
};