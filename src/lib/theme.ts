import { RGBColor, colorLuminance, RGBToHex, createColorVariant, RGBToHSL, HSLToRGB, rotateHue, hexToRGB } from "./color";

interface Color {
    rgb: RGBColor;
    get luminance(): number;
    get hex(): string;
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

        this.background = Theme.initColorWithVariants(
            hexToRGB("#232353")
        )
        this.foreground = Theme.initColorWithVariants(
            hexToRGB("#e3e3e3")
        )

        this.info = Theme.initColor(
            hexToRGB("#17a2b8")
        );
        this.warning = Theme.initColor(
            hexToRGB("#ffc107")
        );
        this.danger = Theme.initColor(
            hexToRGB("#dc3545")
        );
        this.success = Theme.initColor(
            hexToRGB("#28a745")
        );

    }


    static initColor(rgb: RGBColor): Color {
        return {
            rgb,
            get luminance() {
                return colorLuminance(this.rgb);
            },
            get hex() {
                return RGBToHex(this.rgb)
            }
        }
    }

    static generateColorVariants(rgb: RGBColor, count: number, direction: -1 | 1 = 1): Array<Color> {
        let variants: Array<Color> = [];
        let sum = rgb[0] + rgb[1] + rgb[2];
        let step = Math.floor(sum / count);

        for (let i = 1; i <= count; i++) {
            variants.push(
                Theme.initColor(createColorVariant(rgb, step * i * direction))
            )
        }

        return variants;
    }

    static initColorWithVariants(rgb: RGBColor, count = 6): ColorWithVariants {
        return {
            ...Theme.initColor(rgb),
            variants: Theme.generateColorVariants(rgb, count)
        }
    }
}

export {
    Theme
};