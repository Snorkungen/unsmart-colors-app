/*
    Use the existing framework since i have not conjured up a better solution of doing this

    1st. determine the range of possible luminance valuesl - since it is a mathematical formula the values can be calculated on the fly
*/

// Create list of available colours, and a sorted data structure that allows for indexing into the array

/**
 * 
 */
function create_list_of_available_colors(config = {}) {
    config = {
        min_contrast_ratio: 7.01,
        rgb_step_size: [5, 5, 15], // some bs blue is not that percivable
        ...config,
    }

    if (config.available_colors) return config.available_colors;

    // loop where I's walk through each possible rgb color
    function* rgb_colors_generator(red_step, green_step, blue_step) {
        /* The step size MUST be a factor of 255 */
        for (let red = 0; red <= 255; red += red_step) {
            for (let green = 0; green <= 255; green += green_step) {
                for (let blue = 0; blue <= 255; blue += blue_step) {
                    yield [red, green, blue]
                }
            }
        }
    }

    /* availble color [red, green, blue, rlum, hue, saturation, lightness] */
    const available_colors = [];

    for (let rgb of rgb_colors_generator(...config.rgb_step_size)) {
        let rlum = relative_luminance(rgb);

        // Validate if the color has the ability to have a sufficiently contrasting color
        let clum = get_darker_lum(rlum, config.min_contrast_ratio), is_light = is_valid_relative_luminance(clum);
        if (!is_light) {
            clum = get_lighter_lum(rlum, config.min_contrast_ratio)

            if (is_valid_relative_luminance(clum)) {
                is_light = false;
            } else {

                continue; // skip the following color it is not a viable value
            }
        }

        available_colors.push([
            ...rgb,
            rlum,
            ...rgb_to_hsl(rgb)
        ])
    }

    // sort the list of colors based on relaive luminance
    available_colors.sort((a, b) => (a[3] - b[3]));

    return available_colors;

    // find the indices where the luminance increases
}

function create_luminance_indexes(available_colors, config = {}) {
    config = {
        luminance_index_step: 0.025,
        ...config,
    }

    if (config.lum_indexes) return config.lum_indexes;

    let indexes = [0], vstep = config.luminance_index_step, value = vstep;

    for (let i = 0; i < available_colors.length; i++) {
        if (available_colors[i][3] > value) {
            value += vstep;
            indexes.push(i)
        }
    }

    return indexes;
}


function get_contrasting_colors(available_colors, lum_indexes, config, clum, direction) {
    // determine the bucket to begin with
    let lum_indexes_idx = Math.floor(clum / config.luminance_index_step);
    // console.log(lum_indexes.length, lum_indexes_idx, clum)

    // just do linear search to find a suitable spot
    // binary search would be an option
    let i = lum_indexes[lum_indexes_idx];
    while (available_colors[i++][3] < clum) { ; } // there might be some kind of issue with off by "1"

    if (direction < 0) {
        if (i == 1) {
            throw new Error("failed to slice")
        }

        let begin = 0, blum = clum + direction;
        // find begin based upon the range specified by 
        if (is_valid_relative_luminance(blum)) {
            // do some stuff ...
            lum_indexes_idx = Math.floor(blum / config.luminance_index_step);
            begin = lum_indexes[lum_indexes_idx];
            while (available_colors[begin++][3] < blum) { ; }
        };

        return available_colors.slice(begin, i - 1)
    } else {
        if (i == available_colors.length - 1) {
            throw new Error("failed to slice")
        }

        let end = available_colors.length - 1, elum = clum + direction;
        if (is_valid_relative_luminance(elum)) {
            end = Math.min(lum_indexes[Math.ceil(elum / config.luminance_index_step)], end);
            while (available_colors[end--][3] > elum) { ; }
        }
        return available_colors.slice(i, end + 1)
    }
}

function distance_to_hue(target, hue) { return Math.min(Math.abs(target - hue), Math.abs(target + 360 - hue)) }
function weighted_sorter(...weights) {
    // each weight would have the computation function, as well as the importance [0, 1], but also something that normalises the value ...
    return (a, b) => {
        let sum = 0;
        for (let [statement, weight] of weights) {
            sum += statement(a, b) * weight;
        }

        return sum;
    }
}

function generate_theme(color, config = {}, seed = 0xdeadc47) {
    /*
        - generate three shades of the primary* coulour
        - generate light/dark backround based on a shade of the primary colour 
    */

    Object.assign(config, {
        min_contrast_ratio: 4.5,
        luminance_index_step: 0.0025,
        rgb_step_size: [5, 15, 17],
        shade_contrast_ratio: 3,
        ...config
    })

    // color is assumed to be rgb
    const rlum = relative_luminance(color);
    const color_hsl = rgb_to_hsl(color);

    color = [...color.slice(0, 3), rlum, ...color_hsl];


    const available_colors = create_list_of_available_colors(config);
    const lum_indexes = create_luminance_indexes(available_colors, config);

    config.available_colors = available_colors;
    config.lum_indexes = lum_indexes;

    console.log(available_colors.length)

    // step 1. generate shades of the color inspired base color
    function generate_shades_of_a_color(icolor /* internal color 7-value array */, available_colors, lum_indexes, config = {}) { // generate shades
        /* for the given contrast ratio of "3" a maximum of three shades of color are possible */
        const shade_contrast_ratio = 3, shade_count = 3;
        const shade_lum_search_range = 0.04
        let shades = [];

        let [, , , lum, hue, saturation] = icolor;

        let lums = [], actual_idx = -1;

        { // the logic assumes that only three shades are to be made
            let dlum = get_darker_lum(lum, shade_contrast_ratio), llum = get_lighter_lum(lum, shade_contrast_ratio);
            // check that a perfect trio is made
            if (is_valid_relative_luminance(dlum) && is_valid_relative_luminance(llum)) {
                lums = [dlum, icolor[3], llum];
                actual_idx = 1;
            } else if (!is_valid_relative_luminance(dlum) && is_valid_relative_luminance(llum)) {
                // shift so that the given color is the darkest shade

                // check that the lighter luminance supports a lighter lum above
                dlum = llum;
                llum = get_lighter_lum(llum, shade_contrast_ratio);
                if (!is_valid_relative_luminance(llum)) {
                    // modifying your original given color
                    lum = lum - (llum - (1 - shade_lum_search_range));

                    console.warn("ignoring given colour")

                    dlum = get_darker_lum(lum, shade_contrast_ratio);
                    llum = get_lighter_lum(lum, shade_contrast_ratio);

                    if (!is_valid_relative_luminance(dlum) || !is_valid_relative_luminance(llum)) {
                        throw new Error("failed to generate shade lums")
                    }

                    lums = [dlum, lum, llum];
                    actual_idx = -1;
                } else {
                    lums = [lum, dlum, llum];
                    actual_idx = 0;
                }
            } else if (!is_valid_relative_luminance(llum) && is_valid_relative_luminance(dlum)) {
                llum = dlum;
                dlum = get_darker_lum(dlum, shade_contrast_ratio);
                if (!is_valid_relative_luminance(dlum)) {
                    // modifying your original given color
                    lum = lum + (dlum - shade_lum_search_range);

                    console.warn("ignoring given colour")

                    dlum = get_darker_lum(lum, shade_contrast_ratio);
                    llum = get_lighter_lum(lum, shade_contrast_ratio);

                    if (!is_valid_relative_luminance(dlum) || !is_valid_relative_luminance(llum)) {
                        throw new Error("failed to generate shade lums")
                    }

                    lums = [dlum, lum, llum];
                    actual_idx = -1;

                } else {
                    lums = [dlum, llum, lum];
                    actual_idx = 2;
                }
            } else {
                throw new Error("failed to generate shade lums")
            }
        }

        for (let i = lums.length - 1; i >= 0; i--) {
            if (i == actual_idx) {
                shades[actual_idx] = icolor;
                continue;
            }

            // now do the fun thing of looking through different colors
            let direction = 1, value = lums[i];

            // again assume that only three shades are supported
            if (i == 2) {
                direction = shade_lum_search_range;
            } else if (i == 0) {
                direction = -shade_lum_search_range;
            } else if (i == 1) {
                direction = -shade_lum_search_range;
            }

            let colors = get_contrasting_colors(available_colors, lum_indexes, config, value, direction)
            if (colors.length == 0) {
                throw new Error("failed to genearate shade colour")
            }

            // find the perfect color .. 
            // go through thees shits and find the colour with the closest hue and saturation

            colors.sort(weighted_sorter([(a, b) => (distance_to_hue(hue, a[4]) - distance_to_hue(hue, b[4])) / 360, 1],), [(a, b) => (Math.abs(a[5] - saturation) - Math.abs(b[5] - saturation)), 1])

            // in future i want to introduce some seeded RNG into the logic

            shades[i] = colors[0]
            if (distance_to_hue(hue, shades[i][4]) > 15) {
                console.log(hue)
                console.log(colors)
                throw new Error("failed to generate shade colour, not close enough hue")
            }

            if (i == 1 && actual_idx < 0) {
                // rectify the last lum ...
                lums[0] -= (lums[1] - shades[i][3]);
            }

        }

        return shades;
    }

    const primary_shades = generate_shades_of_a_color(color, available_colors, lum_indexes, config);
    // generate secondary & tertiary by looking at the color wheel for values that are 120 degrees apart on the color wheel

    // just generate a colour from hsl and then do the stuff later


    // but for now let's generate a background coluour ...

    let ratio = 9.2, search_range = 0.026;
    let background_colors = [];
    let text_colors = [];

    let clum = get_lighter_lum(primary_shades[0][3], ratio);
    let contrasting_colors = get_contrasting_colors(available_colors, lum_indexes, config, clum, search_range);

    background_colors[0] = contrasting_colors.sort(weighted_sorter([(a, b) => (a[5] - b[5]) / 100, 3], [(a, b) => (distance_to_hue(color[4], a[4]) - distance_to_hue(color[4], b[4])), 2]))[0]
    text_colors[0] = primary_shades[0];


    { // this is for the dark mode 
        // the issue is that this thing is just straight up ignoring the given input color

        // 1st select one of the darkest possible colors
        let max_ratio = get_contrast_ratio(primary_shades[2][3], 0)

        // do not care select the last few buckets
        contrasting_colors = get_contrasting_colors(available_colors, lum_indexes, config, 0.05, -config.luminance_index_step);

        let target_hue = color[4] - 120;
        if (target_hue < 0) target_hue += 360
        background_colors[1] = contrasting_colors.sort(weighted_sorter([(a, b) => (a[5] - b[5]) / 100, 3], [(a, b) => (distance_to_hue(target_hue, a[4]) - distance_to_hue(target_hue, b[4])) / 360, 9]))[0]

        target_hue = target_hue - 120;
        if (target_hue < 0) target_hue += 360
        text_colors[1] = get_contrasting_colors(available_colors, lum_indexes, config, get_lighter_lum(background_colors[1][3], 7.4), config.luminance_index_step)
            .sort(weighted_sorter([(a, b) => (a[5] - b[5]) / 100, 3], [(a, b) => (distance_to_hue(target_hue, a[4]) - distance_to_hue(target_hue, b[4])) / 360, 2]))[1]
    }


    return {
        primary_shades: primary_shades,
        // primary shades & stuff

        background_colors,
        text_colors
    }
}

{
    const config = {
        min_contrast_ratio: 3.5,
        luminance_index_step: 0.0025,
        rgb_step_size: [5, 5, 17]
    }
    console.log(config)

    // const color = [252, 114, 0]
    const color = [243, 200, 20]
    // const color = [103, 200, 20]
    // const color = [60, 45, 120]
    // const color = [9, 6, 40]

    let theme = generate_theme(color, config)

    console.log(theme)

    let theme_idx = 1;

    try {
        function set_theme(theme, theme_idx) {
            document.body.style.setProperty("--primary-0", rgb_to_hex(theme.primary_shades[0]))
            document.body.style.setProperty("--primary-1", rgb_to_hex(theme.primary_shades[1]))
            document.body.style.setProperty("--primary-2", rgb_to_hex(theme.primary_shades[2]))

            document.body.style.setProperty("--background-color", rgb_to_hex(theme.background_colors[theme_idx]))
            document.body.style.setProperty("--text-color", rgb_to_hex(theme.text_colors[theme_idx]))
        }

        set_theme(theme, theme_idx);

        let buttons = document.querySelectorAll("header button");
        buttons[0].addEventListener("click", () => {
            theme_idx = theme_idx ? 0 : 1;

            set_theme(theme, theme_idx);
        })

        buttons[1].addEventListener("click", () => {
            let c = config.available_colors[Math.floor(Math.random() * config.available_colors.length)]

            try {
                theme = generate_theme(c, config)
                set_theme(theme, theme_idx);
            } catch (e) {
                console.log([...c, relative_luminance(c), ...rgb_to_hsl(c)]);
                console.error(e);
            }

        })


    } catch (error) {

    }
}

// utility functions 
// -----------------------------------------------------------------------------------------------------------------------
function is_valid_relative_luminance(lum) {
    return lum > 0 && lum < 1.000001 /* leave room for the floating point innaccuracy where the value */
}

function relative_luminance([red, green, blue]) {
    red = (red & 0xff) / 255; red = red <= 0.03928 ? red / 12.92 : ((red + 0.055) / 1.055) ** 2.4
    green = (green & 0xff) / 255; green = green <= 0.03928 ? green / 12.92 : ((green + 0.055) / 1.055) ** 2.4
    blue = (blue & 0xff) / 255; blue = blue <= 0.03928 ? blue / 12.92 : ((blue + 0.055) / 1.055) ** 2.4

    return (red * 0.2126 + green * 0.7152 + blue * 0.0722);
}

function get_contrast_ratio(lum1, lum2) {
    let l = Math.max(lum1, lum2), d = Math.min(lum1, lum2);
    return (l + 0.05) / (d + 0.05);
}

function get_darker_lum(lighter_lum, ratio) {
    let lhs = (lighter_lum + 0.05) - ratio * 0.05;
    return lhs == 0 ? lhs : lhs / ratio;
}

function get_lighter_lum(darker_lum, ratio) {
    return ratio * (darker_lum + 0.05) - 0.05;
}

function get_contrasting_lum(lum, ratio) {
    let clum = get_darker_lum(lum, ratio), is_light = is_valid_relative_luminance(clum);
    if (!is_light) {
        clum = get_lighter_lum(lum, ratio)

        if (is_valid_relative_luminance(clum)) {
            is_light = false;
        } else {
            return - 1;
        }
    }

    return clum;
}

function rgb_to_hex([red, green, blue]) {
    let hex = "#";
    hex += (red).toString(16).padStart(2, "0");
    hex += (green).toString(16).padStart(2, "0");
    hex += (blue).toString(16).padStart(2, "0");

    return hex
}

function rgb_to_hsl(rgb) {
    rgb = rgb.map(v => v / 255);

    let min = Math.min(...rgb), max = Math.max(...rgb);


    let lightness = ((min + max) / 2) * 100;

    if (max == min) return [0, 0, lightness];

    let saturation = (lightness > 50 ? (max - min) / (2 - max - min) : (max - min) / (max + min)) * 100
    let hue = [
        (rgb[1] - rgb[2]) / (max - min),
        2 + (rgb[2] - rgb[0]) / (max - min),
        4 + (rgb[0] - rgb[1]) / (max - min)
    ][rgb.indexOf(max)] * 60;

    if (hue < 0) hue += 360;


    return [hue, saturation, lightness];
}