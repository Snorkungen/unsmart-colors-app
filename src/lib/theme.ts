import BigNumber from "bignumber.js";
import { RGBColor, RGBToLuminance, RGBToHex, createColorVariant, RGBToHSL, HSLToRGB, rotateHue, hexToRGB, HSLColor, createRandomColor } from "./color";
import { ColorEntries, ColorEntry, colors } from "./colors";

export interface Color {
    rgb: RGBColor;
    get hsl(): HSLColor;
    get hex(): string;
    get luminance(): number;
}

export interface ColorWithVariants extends Color {
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
        this.secondary = Theme.initSecondaryColor(this.primary);
        this.foreground = Theme.generateContrastingColor(this.primary, 5)
        this.background = Theme.generateContrastingColor(this.foreground, 7.2)

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
    static LUMINANCE_DISTANCE = 0.0069;

    static contrastRatio(...colors: Array<Color | number>) {
        // https://www.w3.org/WAI/GL/wiki/Contrast_ratio

        let lums: Array<number> = colors.map((v) => typeof v == "number" ? v : v.luminance);
        let dark = Math.min(...lums),
            light = Math.max(...lums);
        return (light + this.CONTRAST_RATIO_NUM) / (dark + this.CONTRAST_RATIO_NUM);
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

    static generateContrastingColor(color: Color, ratio = 4.5): ColorWithVariants {
        let targetLuminance = this.derriveLuminance(ratio, color.luminance);

        if (targetLuminance < 0) {
            return this.initColorWithVariants(
                color.luminance > 0.5 ? this.BLACK_RGB : this.WHITE_RGB
            )
        }

        let newColorIsDarker = color.luminance > 0.5

        let bestColorOption: undefined | RGBColor;
        const LUM_DIST = 0.2;
        for (let entry of colors) {
            let [rgb, , luminance] = entry;

            // (newColorIsDarker ? luminance < targetLuminance : luminance > targetLuminance)

            if (numsAreClose(targetLuminance, luminance, 0, newColorIsDarker ? LUM_DIST : undefined, !newColorIsDarker ? LUM_DIST : undefined)) {
                if (!bestColorOption) {
                    bestColorOption = rgb;
                } else {
                    let bestContrastRatio = this.contrastRatio(color, RGBToLuminance(rgb)),
                        cr = this.contrastRatio(color, luminance);

                    if (cr > bestContrastRatio) bestColorOption = rgb;
                }
            }
        }

        console.log(bestColorOption)

        if (!bestColorOption) bestColorOption = color.luminance > 0.5 ? this.BLACK_RGB : this.WHITE_RGB;



        // console.log("No color found!", targetLuminance)
        return this.initColorWithVariants(bestColorOption);
    }

    static initSecondaryColor(color: Color) {
        let diff = (n1: number, n2: number) => Math.max(n1, n2) - Math.min(n1, n2)
        let colorRGBSum = sumRGB(color.rgb);

        let colorEntries = colors.reduce<ColorEntries>((entries, entry) => (numsAreClose(entry[2], color.luminance, this.LUMINANCE_DISTANCE) ? [...entries, entry] : entries), [])
        let colorEntry = colorEntries.reduce((bestEntry, entry) => {
            let bestSum = sumRGB(bestEntry[0]), entryRGBSum = sumRGB(entry[0])

            if (diff(colorRGBSum, bestSum) < diff(colorRGBSum, entryRGBSum)) return entry;

            return bestEntry
        }, colorEntries[0]);


        return this.initColorWithVariants(colorEntry[0])
    }

    static initSupportColor(color: Color, rangeStart: number, rangeEnd: number): Color {
        rangeStart /= 360
        rangeEnd /= 360

        let maxSaturation = 1, minSaturation = 0.4;
        let maxLightness = 0.7, minLightness = 0.2;

        let bestEntry: ColorEntry | undefined;

        for (let entry of colors) {
            let [hue, saturation, lightness] = RGBToHSL(entry[0]);

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

            let bestEntryDiff = diff(bestEntry[2], color.luminance),
                entryDiff = diff(entry[2], color.luminance);

            if (entryDiff > bestEntryDiff) {
                bestEntry = entry;
            }
        }

        return this.initColor(
            bestEntry ? bestEntry[0] : HSLToRGB([rangeEnd / 360, 0.5, 0.6])
        )

    }


    static convertThemeIntoAMoreReadableObject(theme: Theme) {
        let colors: Record<string, any> = {};
        for (let color of ["primary", "secondary", "foreground", "background"]) {
            let { hex, variants } = theme[color as "primary"];
            colors[color] = {
                "1": hex
            };
            variants.forEach(({ hex }, i) => {
                colors[color] = {
                    ...colors[color],
                    [i + 2]: hex
                }
            })
        }

        colors["danger"] = theme.danger.hex
        colors["success"] = theme.success.hex
        colors["warning"] = theme.warning.hex
        colors["info"] = theme.info.hex

        return colors;
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
