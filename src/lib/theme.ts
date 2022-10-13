import BigNumber from "bignumber.js";
import { RGBColor, RGBToLuminance, RGBToHex, createColorVariant, RGBToHSL, HSLToRGB, rotateHue, hexToRGB, HSLColor, createRandomColor } from "./color";
import { ColorEntries, ColorEntry, colors } from "./colors";


export interface HexOnlyTheme {
    primary: { [n: number]: string; };
    secondary: HexOnlyTheme["primary"];
    foreground: HexOnlyTheme["primary"];
    background: HexOnlyTheme["primary"];

    info: string;
    success: string;
    danger: string;
    warning: string;
}

export interface Color {
    rgb: RGBColor;
    get hsl(): HSLColor;
    get hex(): string;
    get luminance(): number;
}

export interface ColorWithVariants extends Color {
    variants: Array<Color>;
}

export interface ThemeConfigurationOptions {
    // FG & BG are going to have the largest contrast possible
    maxContrast?: boolean;
    fgMaxContrast?: boolean;
    bgMaxContrast?: boolean;

}

function createTheme(primary: string | RGBColor, options: ThemeConfigurationOptions = {}) {
    if (typeof primary === "string") primary = hexToRGB(primary);
    return new Theme(primary, options)
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

    constructor(primary: RGBColor, options: ThemeConfigurationOptions = {bgMaxContrast : true}) {
        const FG_RATIO = 7,
            BG_RATIO = 7.3;

        this.primary = Theme.initColorWithVariants(primary);
        this.secondary = Theme.initSecondaryColor(this.primary);
        this.foreground = Theme.initGroundColor(this.primary, FG_RATIO, options.fgMaxContrast ?? options.maxContrast);
        this.background = Theme.initGroundColor(this.foreground, BG_RATIO, options.bgMaxContrast ?? options.maxContrast);

        this.info = Theme.initSupportColor(this.foreground, 175, 201);
        this.success = Theme.initSupportColor(this.foreground, 80, 139);
        this.danger = Theme.initSupportColor(this.foreground, 340, 10)
        this.warning = Theme.initSupportColor(this.foreground, 24, 47);
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
        let lightnessModifier = 0.05 // lightness / (count);

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
    static MAX_LUMINANCE = RGBToLuminance([255, 255, 255]);
    static MIN_LUMINANCE = 0;
    static BLACK_RGB: RGBColor = [0, 0, 0, 1];
    static WHITE_RGB: RGBColor = [255, 255, 255, 1];

    static contrastRatio(...colors: Array<Color | number>) {
        // https://www.w3.org/WAI/GL/wiki/Contrast_ratio

        let lums: Array<number> = colors.map((v) => typeof v == "number" ? v : v.luminance);
        let dark = Math.min(...lums),
            light = Math.max(...lums);
        return (light + this.CONTRAST_RATIO_NUM) / (dark + this.CONTRAST_RATIO_NUM);
    }
    static derriveLuminanceUsingDark(luminance: number, ratio: number) {
        // (x + 0.05) / (0 + 0.05) = 21 || x = 1
        return BigNumber(ratio.toString())
            .times(BigNumber(luminance.toString()).plus(this.CONTRAST_RATIO_NUM))
            .minus(this.CONTRAST_RATIO_NUM).toNumber();
    }

    static derriveLuminanceUsingLight(luminance: number, ratio: number) {
        // (1 + 0.05) / (x + 0.05) = 21 || x = 0
        // https://www.geogebra.org/solver?i=(0.9%2B0.05)%2F(x%2B0.05)%3D4.5
        let r = BigNumber("1").div(BigNumber(ratio.toString()));
        let l = BigNumber("1").div(BigNumber(luminance).plus(this.CONTRAST_RATIO_NUM))
        let ll = l.times(this.CONTRAST_RATIO_NUM)
        return r.minus(ll).div(l).toNumber();
    }

    static derriveLuminance(ratio: number, luminance: number) {
        let derriveLuminanceUsingDark = (luminance: BigNumber, ratio: number) => {
            // (x + 0.05) / (0 + 0.05) = 21 || x = 1
            return BigNumber(ratio.toString())
                .times(BigNumber(luminance.toString()).plus(this.CONTRAST_RATIO_NUM))
                .minus(this.CONTRAST_RATIO_NUM)
        }

        let derriveLuminanceUsingLight = (luminance: BigNumber, ratio: number) => {
            // (1 + 0.05) / (x + 0.05) = 21 || x = 0
            // https://www.geogebra.org/solver?i=(0.9%2B0.05)%2F(x%2B0.05)%3D4.5
            let r = BigNumber("1").div(BigNumber(ratio.toString()));
            let l = BigNumber("1").div(BigNumber(luminance).plus(this.CONTRAST_RATIO_NUM))
            let ll = l.times(this.CONTRAST_RATIO_NUM)
            return r.minus(ll).div(l)
        }

        let bn = BigNumber(luminance.toString())
        let resultLuminance = derriveLuminanceUsingDark(bn, ratio).toNumber();

        if (resultLuminance <= 1) return resultLuminance;

        resultLuminance = derriveLuminanceUsingLight(bn, ratio).toNumber();

        if (resultLuminance >= 0) return resultLuminance;

        console.warn("Luminance not found")
        return -1;
    }

    static findUsingLuminance(targetLuminance: number, distance: number = 0.002) {
        return colors.filter(({ luminance }) => numsAreClose(luminance, targetLuminance, distance))
    }

    static initSecondaryColor(color: Color) {
        let colorEntries = this.findUsingLuminance(color.luminance)
        // .sort(({ rgb: a }, { rgb: b }) => diff(sumRGB(b), sumRGB(color.rgb)) - diff(sumRGB(a), sumRGB(color.rgb)));

        let entry = colorEntries.at(sumRGB(color.rgb) % colorEntries.length)

        return this.initColorWithVariants(
            entry?.rgb
            ?? color.rgb)
    }

    static initSupportColor(color: Color, rangeStart: number, rangeEnd: number): Color {
        rangeStart /= 360
        rangeEnd /= 360

        let maxSaturation = 1, minSaturation = 0.4;
        let maxLightness = 0.7, minLightness = 0.2;

        let bestEntry: ColorEntry | undefined;

        for (let entry of colors) {
            let [hue, saturation, lightness] = RGBToHSL(entry.rgb);

            let saturationIsWithinParameters = saturation <= maxSaturation && saturation >= minSaturation;
            let lightnessIsWithinParameters = lightness <= maxLightness && lightness >= minLightness;

            let hueIsWithinParameters = rangeStart < rangeEnd ?
                hue >= rangeStart && hue <= rangeEnd :
                (hue > rangeStart && hue < 1) ||
                (hue > 0 && hue < rangeEnd)

            let isWithinParameters = hueIsWithinParameters && saturationIsWithinParameters && lightnessIsWithinParameters;

            if (!isWithinParameters) continue;
            if (!bestEntry) {
                bestEntry = entry;
                continue;
            }

            let bestEntryDiff = diff(bestEntry.luminance, color.luminance),
                entryDiff = diff(entry.luminance, color.luminance);

            if (entryDiff > bestEntryDiff) {
                bestEntry = entry;
            }
        }

        return this.initColor(
            bestEntry ? bestEntry.rgb : HSLToRGB([rangeEnd / 360, 0.5, 0.6])
        )

    }

    static initGroundColor(color: Color, ratio = 7, maxContrast?: boolean): ColorWithVariants {
        let targetLuminance: number = this.derriveLuminanceUsingLight(color.luminance, ratio);

        if (targetLuminance < 0) targetLuminance = this.derriveLuminanceUsingDark(color.luminance, ratio)
        if (targetLuminance > 1) targetLuminance = 0


        if (maxContrast) {
            targetLuminance = targetLuminance > color.luminance ? 0.99 : 0;
        }

        const entries = this.findUsingLuminance(targetLuminance);

        return this.initColorWithVariants(entries[0].rgb)
    }

    static stripThemeToHexValues(theme: Theme): HexOnlyTheme {
        const reduceColorWithVariants = ({ hex, variants }: ColorWithVariants): HexOnlyTheme["primary"] => {
            return {
                0: hex,
                ...variants.reduce((res, { hex }, i) => ({
                    ...res,
                    [i + 1]: hex
                }), {})
            }
        }


        return {
            primary: reduceColorWithVariants(theme.primary),
            secondary: reduceColorWithVariants(theme.secondary),
            foreground: reduceColorWithVariants(theme.foreground),
            background: reduceColorWithVariants(theme.background),

            info: theme.info.hex,
            success: theme.success.hex,
            danger: theme.danger.hex,
            warning: theme.warning.hex

        }
    }

}


export {
    Theme
};

export function numsAreClose(
    n1: number,
    n2: number,
    distance = 0.05,
    lowerDistance: number | undefined = distance,
    upperDistance: number | undefined = distance
) {
    return (
        n1 > n2 - (lowerDistance ?? distance) &&
        n1 < n2 + (upperDistance ?? distance)
    )
}

export function sumRGB(rgb: RGBColor): number {
    return rgb.slice(0, 3).reduce<number>((sum, val) => sum + (val || 0), 0)
}

export function diff(n1: number, n2: number) { return Math.max(n1, n2) - Math.min(n1, n2) }
