import {
	RGBColor,
	RGBToLuminance,
	RGBToHex,
	RGBToHSL,
	HSLToRGB,
	hexToRGB,
	HSLColor,
} from "./color";
import { ColorEntries, ColorEntry, colors } from "./colors";

export interface HexOnlyTheme {
	primary: { [n: number]: string };
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
	return new Theme(primary, options);
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

	constructor(primary: RGBColor, options: ThemeConfigurationOptions = {}) {
		this.primary = Theme.initColorWithVariants(primary);
		this.secondary = Theme.initSecondaryColor(this.primary);
		this.foreground = Theme.initGroundColor(this.primary, 7);
		this.background = Theme.initGroundColor(this.foreground, 7.5);

		this.info = Theme.initSupportColor(this.foreground, 175, 201);
		this.success = Theme.initSupportColor(this.foreground, 80, 139);
		this.danger = Theme.initSupportColor(this.foreground, 340, 10);
		this.warning = Theme.initSupportColor(this.foreground, 24, 47);


		if ((this.constructor as typeof Theme).logRatioValues) console.log(JSON.stringify(flattenObject(this.ratios), null, 4));
	}

	get ratios() {
		let primary = {
			// secondary: Theme.contrastRatio(this.primary, this.secondary),
			foreground: Theme.contrastRatio(this.primary, this.foreground),
			// background: Theme.contrastRatio(this.primary, this.background),

			// info: Theme.contrastRatio(this.primary, this.info),
			// success: Theme.contrastRatio(this.primary, this.success),
			// danger: Theme.contrastRatio(this.primary, this.danger),
			// warning: Theme.contrastRatio(this.primary, this.warning),
		};
		let secondary = {
			// primary: Theme.contrastRatio(this.secondary, this.primary),
			foreground: Theme.contrastRatio(this.secondary, this.foreground),
			// background: Theme.contrastRatio(this.secondary, this.background),

			// info: Theme.contrastRatio(this.secondary, this.info),
			// success: Theme.contrastRatio(this.secondary, this.success),
			// danger: Theme.contrastRatio(this.secondary, this.danger),
			// warning: Theme.contrastRatio(this.secondary, this.warning),
		};
		let foreground = {
			primary: Theme.contrastRatio(this.foreground, this.primary),
			secondary: Theme.contrastRatio(this.foreground, this.secondary),
			background: Theme.contrastRatio(this.foreground, this.background),

			info: Theme.contrastRatio(this.foreground, this.info),
			success: Theme.contrastRatio(this.foreground, this.success),
			danger: Theme.contrastRatio(this.foreground, this.danger),
			warning: Theme.contrastRatio(this.foreground, this.warning),
		};
		let background = {
			// primary: Theme.contrastRatio(this.background, this.primary),
			// secondary: Theme.contrastRatio(this.background, this.secondary),
			foreground: Theme.contrastRatio(this.background, this.foreground),

			// info: Theme.contrastRatio(this.background, this.info),
			// success: Theme.contrastRatio(this.background, this.success),
			// danger: Theme.contrastRatio(this.background, this.danger),
			// warning: Theme.contrastRatio(this.background, this.warning),
		};

		return { primary, secondary, foreground, background };
	}

	// !!! Below only static !!!
	static logRatioValues = true;
	static colors = colors;


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
			},
		};
	}

	static initColorWithVariants(rgb: RGBColor, count = 4): ColorWithVariants {
		let color = this.initColor(rgb);

		// generate variants
		let [hue, saturation, lightness] = color.hsl;
		let lightnessModifier = 0.05; // lightness / (count);

		if (lightness > 0.5) {
			lightnessModifier * -1;
		}

		let variants: Array<Color> = [];

		for (let i = 1; i <= count; i++) {
			variants.push(
				this.initColor(HSLToRGB([hue, saturation, Math.min(lightness + lightnessModifier * i, 1)]))
			);
		}

		return {
			...color,
			variants,
		};
	}

	// Info is "cyan"
	static info = this.initColor(hexToRGB("#17a2b8"));
	// Warning is "yellow"
	static warning = this.initColor(hexToRGB("#ffc107"));
	// Danger is "red"
	static danger = this.initColor(hexToRGB("#dc3545"));
	// succes is "green"
	static success = this.initColor(hexToRGB("#28a745"));

	static CONTRAST_RATIO_NUM = 0.05;
	static MAX_LUMINANCE = RGBToLuminance([255, 255, 255]);
	static MIN_LUMINANCE = 0;
	static BLACK_RGB: RGBColor = [0, 0, 0, 1];
	static WHITE_RGB: RGBColor = [255, 255, 255, 1];

	static contrastRatio(...colors: Array<Color | number>) {
		// https://www.w3.org/WAI/GL/wiki/Contrast_ratio

		let lums: Array<number> = colors.map((v) => (typeof v == "number" ? v : v.luminance));
		let dark = Math.min(...lums),
			light = Math.max(...lums);
		return (light + this.CONTRAST_RATIO_NUM) / (dark + this.CONTRAST_RATIO_NUM);
	}

	static derriveLuminanceUsingDark(luminance: number, ratio: number) {
		// (x + 0.05) / (0 + 0.05) = 21, x = 1
		return ratio * (luminance + this.CONTRAST_RATIO_NUM) - this.CONTRAST_RATIO_NUM;
	}

	static derriveLuminanceUsingLight(luminance: number, ratio: number) {
		// (1 + 0.05) / (x + 0.05) = 21, x = 0
		return ((luminance + this.CONTRAST_RATIO_NUM) - ratio * this.CONTRAST_RATIO_NUM) / ratio;
	}

	static getColorEntry(
		targetLuminance: number,
		h?: (best: ColorEntry, entry: ColorEntry, i: number) => boolean
	): undefined | ColorEntry {
		const LUM_DISTANCE = 0.0025;

		const entries = this.colors.filter(({ luminance }) =>
			numsAreClose(luminance, targetLuminance, LUM_DISTANCE)
		);

		if (!h) return entries[0];

		return entries.reduce((best, entry, i) => (h(best, entry, i) ? entry : best), entries[0]);
	}

	static initSecondaryColor(color: Color) {
		let optionsIndex = 0, variance = 0.002;
		let isLight = this.derriveLuminanceUsingLight(color.luminance, 7) > 0;

		for (let option of this.colors) {
			if (isLight) {
				if (!(option.luminance <= color.luminance && option.luminance > color.luminance - variance)) {
					continue
				}
			} else {
				if (!(option.luminance >= color.luminance && option.luminance < color.luminance + variance)) {
					continue
				}
			}

			this.colorOptions[optionsIndex++] = option
			if (optionsIndex >= this.colorOptions.length) {
				break
			}
		}

		if (optionsIndex == 0) {
			// this is a fallback that is not sufficiently contrasting
			return this.initColorWithVariants(
				this.colorOptions[0].rgb
			);
		}

		let best = this.colorOptions[0];
		for (let i = 1; i < optionsIndex; i++) {
			let entry = this.colorOptions[i];
			let [bestHue, bestSaturation] = RGBToHSL(best.rgb),
				[hue, saturation] = RGBToHSL(entry.rgb);

			if (diff(color.hsl[1], bestSaturation) > diff(color.hsl[1], saturation) &&
				diff(color.hsl[0], bestHue) < diff(color.hsl[0], hue)) {
				best = entry
			}
		}

		return this.initColorWithVariants(best.rgb)
	}

	static initSupportColor(color: Color, rangeStart: number, rangeEnd: number): Color {
		rangeStart /= 360;
		rangeEnd /= 360;

		let maxSaturation = 1,
			minSaturation = 0.4;
		let maxLightness = 0.7,
			minLightness = 0.2;

		let bestEntry: ColorEntry | undefined;

		for (let entry of this.colors) {
			let [hue, saturation, lightness] = RGBToHSL(entry.rgb);

			let saturationIsWithinParameters = saturation <= maxSaturation && saturation >= minSaturation;
			let lightnessIsWithinParameters = lightness <= maxLightness && lightness >= minLightness;

			let hueIsWithinParameters =
				rangeStart < rangeEnd
					? hue >= rangeStart && hue <= rangeEnd
					: (hue > rangeStart && hue < 1) || (hue > 0 && hue < rangeEnd);

			let isWithinParameters =
				hueIsWithinParameters && saturationIsWithinParameters && lightnessIsWithinParameters;

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

		return this.initColor(bestEntry ? bestEntry.rgb : HSLToRGB([rangeEnd / 360, 0.5, 0.6]));
	}

	static colorOptions = Array<ColorEntry>(1000);
	static initGroundColor(color: Color, ratio = 7): ColorWithVariants {
		let targetLuminance: number = this.derriveLuminanceUsingLight(color.luminance, ratio), isLight = true;

		if (targetLuminance < 0) {
			isLight = false
			targetLuminance = this.derriveLuminanceUsingDark(color.luminance, ratio);
		}
		if (targetLuminance > 1) {
			console.warn("Algorithm failed. " + color.hex);

			let crWithWhite = this.contrastRatio(color, 1),
				crWithBlack = this.contrastRatio(color, 0);
			targetLuminance = crWithBlack > crWithWhite ? 0 : 1;
		}

		let best: ColorEntry;
		let variance = 0.04;
		let optionsIndex = 0;


		for (let option of this.colors) {
			if (isLight) {
				if (!(option.luminance <= targetLuminance && option.luminance > targetLuminance - variance)) {
					continue
				}
			} else {
				if (!(option.luminance >= targetLuminance && option.luminance < targetLuminance + variance)) {
					continue
				}
			}

			this.colorOptions[optionsIndex++] = option
			if (optionsIndex >= this.colorOptions.length) {
				break
			}
		}

		if (optionsIndex == 0) {
			// this is a fallback that is not sufficiently contrasting
			return this.initColorWithVariants(
				targetLuminance < color.luminance ? this.BLACK_RGB : this.WHITE_RGB
			);
		}

		best = this.colorOptions[0];
		for (let i = 1; i < optionsIndex; i++) {
			let entry = this.colorOptions[i];
			let [bestHue, bestSaturation] = RGBToHSL(best.rgb),
				[hue, saturation] = RGBToHSL(entry.rgb);

			if (diff(color.hsl[1], bestSaturation) < diff(color.hsl[1], saturation) &&
				diff(color.hsl[0], bestHue) > diff(color.hsl[0], hue)) {
				best = entry
			}
		}

		return this.initColorWithVariants(best.rgb)
	}

	static stripThemeToHexValues(theme: Theme): HexOnlyTheme {
		const reduceColorWithVariants = ({
			hex,
			variants,
		}: ColorWithVariants): HexOnlyTheme["primary"] => {
			return {
				0: hex,
				...variants.reduce(
					(res, { hex }, i) => ({
						...res,
						[i + 1]: hex,
					}),
					{}
				),
			};
		};

		return {
			primary: reduceColorWithVariants(theme.primary),
			secondary: reduceColorWithVariants(theme.secondary),
			foreground: reduceColorWithVariants(theme.foreground),
			background: reduceColorWithVariants(theme.background),

			info: theme.info.hex,
			success: theme.success.hex,
			danger: theme.danger.hex,
			warning: theme.warning.hex,
		};
	}
}

export { Theme };

export function numsAreClose(
	n1: number,
	n2: number,
	distance = 0.05,
	lowerDistance: number | undefined = distance,
	upperDistance: number | undefined = distance
) {
	return n1 > n2 - (lowerDistance ?? distance) && n1 < n2 + (upperDistance ?? distance);
}

export function sumRGB(rgb: RGBColor): number {
	return rgb.slice(0, 3).reduce<number>((sum, val) => sum + (val || 0), 0);
}

export function diff(n1: number, n2: number) {
	return Math.max(n1, n2) - Math.min(n1, n2);
}

export function flattenObject<T extends {}>(obj: T, parentKey = "") {
	let result: Record<string, any> = {};

	for (let key in obj) {
		let value = obj[key];

		if (value instanceof Object && !Array.isArray(value)) {
			result = Object.assign(result, flattenObject(value, key + "."));
		} else {
			result[parentKey + key] = value;
		}
	}

	return result;
}
