import { RGBColor, RGBToLuminance, RGBToHex, createColorVariant, RGBToHSL, HSLToRGB, rotateHue, hexToRGB, HSLColor, createRandomColor } from "./color";
import { ColorEntries, colors } from "./colors";

interface Color {
    rgb: RGBColor;
    get hsl(): HSLColor;
    get hex(): string;
    get luminance(): number;
}

interface ColorWithVariants extends Color {
    variants: Array<Color>;
}

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
        this.secondary = Theme.initColorWithVariants(HSLToRGB(rotateHue(this.primary.hsl, 60 * 3)))
        this.foreground = Theme.generateContrastingColor(this.primary, 4.6)
        this.background = Theme.generateContrastingColor(this.foreground, 7.1)
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

    static initColorWithVariants(rgb: RGBColor, count = 4): ColorWithVariants {
        let color = this.initColor(rgb);

        // generate variants
        let [hue, saturation, lightness] = color.hsl;
        let lightnessModifier = lightness / (count);

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

    static generateContrastingColor(color: Color, ratio = 4.5): ColorWithVariants {
        let targetLuminance = this.derriveLuminance(ratio, color.luminance);

        if (targetLuminance < this.MIN_LUMINANCE) {
            return this.initColorWithVariants(this.BLACK_RGB)
        } else if (targetLuminance > this.MAX_LUMINANCE) {
            return this.initColorWithVariants(this.WHITE_RGB);
        }
        let newColorIsDarker = color.luminance > targetLuminance;

        let colorEntries = colors.reduce<ColorEntries>((found, entry) => {
            let [, , luminance] = entry;
            if (
                (newColorIsDarker && luminance < targetLuminance && luminance > targetLuminance - 0.05) ||
                (!newColorIsDarker && luminance > targetLuminance && luminance < targetLuminance + 0.05)
            ) return [...found, entry];
            return found;
        }, []);

        if (colorEntries.length) {
            let entry = newColorIsDarker ? colorEntries[colorEntries.length - 1] : colorEntries[0]
            return this.initColorWithVariants(entry[0]);
        }

        return this.initColorWithVariants(targetLuminance < 0.5 ? this.BLACK_RGB : this.WHITE_RGB);
    }

}


export {
    Theme
};