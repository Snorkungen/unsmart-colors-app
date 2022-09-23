import BigNumber from "bignumber.js";
import { RGBColor, RGBToLuminance, RGBToHex, createColorVariant, RGBToHSL, HSLToRGB, rotateHue, hexToRGB, HSLColor, createRandomColor } from "./color";
import { ColorEntries, ColorEntry, colors } from "./colors";

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
        this.secondary = Theme.initSecondaryColor(this.primary);
        this.foreground = Theme.generateContrastingColor(this.primary, 5)
        this.background = Theme.generateContrastingColor(this.foreground, 7.2)
        this.info = Theme.info;
        this.warning = Theme.warning;
        this.danger = Theme.danger;
        this.success = Theme.success;

        // http://www.workwithcolor.com/red-color-hue-range-01.htm		

        /* get all red'ish colors */
        /* UnSmart logic for getting red colors red is more than 72% of total */
        let redColors = Theme.selectColorsUsingHue(340,9).map(([,hex]) => hex);
        console.log("red:", redColors)

        /* get all yellow'ish colors */

	let yellowColors = Theme.selectColorsUsingHue(14,58).map(([,hex]) => hex);
        console.log("yellow:", yellowColors)
    }

    // !!! Below only static !!!

    static selectColorsUsingHue (start: number,end: number): ColorEntries {
    	start /= 360; end /= 360;	
	return colors.filter(([rgb]) => {
		let [hue] = RGBToHSL(rgb);
		return start < end ?
			hue > start && hue < end :
			(hue > start && hue < 1) ||
			(hue > 0 && hue < end)			
	});
    }

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

    static contrastRatio(...colors: [Color, Color]) {
        // https://www.w3.org/WAI/GL/wiki/Contrast_ratio
        let lums = colors.map(({ luminance }) => luminance);
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

        let newColorIsDarker = color.luminance > targetLuminance;

        let colorEntries: ColorEntries = colors.reduce<ColorEntries>((found, entry) => {
            let [, , luminance] = entry;
            if (
                (newColorIsDarker && luminance < targetLuminance && luminance > targetLuminance - this.LUMINANCE_DISTANCE) ||
                (!newColorIsDarker && luminance > targetLuminance && luminance < targetLuminance + this.LUMINANCE_DISTANCE)
            ) return [...found, entry];
            return found;
        }, []);

        if (colorEntries.length) {
            let entry = !newColorIsDarker ? colorEntries[colorEntries.length - 1] : colorEntries[0]
            return this.initColorWithVariants(entry[0])
        }

        // console.log("No color found!", targetLuminance)
        return this.initColorWithVariants(newColorIsDarker ? this.BLACK_RGB : this.WHITE_RGB);
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
