<script setup lang="ts">
import { watch, ref } from 'vue';
import { hexToRGB, HSLToInts, RGBToHSL, HSLToRGB, RGBToHex } from '../lib/color';
import Button from './Button.vue';

export interface ColorPickerProps {
    value: string | any;
    input: (hex: string) => void
}

const props = defineProps<ColorPickerProps>();

const pickerIsOpen = ref<boolean>(/* false */ true);

const hueValue = ref(0)
const saturationValue = ref(0)
const lightnessValue = ref(0)

const redValue = ref(0);
const blueValue = ref(0);
const greenValue = ref(0);

const initRefs = ({ value }: ColorPickerProps) => {
    const rgb = hexToRGB(value);
    const [hue, saturation, lightness] = HSLToInts(RGBToHSL(rgb))

    hueValue.value = hue;
    saturationValue.value = saturation;
    lightnessValue.value = lightness;
}
watch(props, initRefs)


const updateRGBValues = () => {
    let [red, green, blue] = HSLToRGB([hueValue.value / 360, saturationValue.value / 100, lightnessValue.value / 100])

    redValue.value = red;
    greenValue.value = green;
    blueValue.value = blue;
}

watch(hueValue, updateRGBValues);
watch(saturationValue, updateRGBValues);
watch(lightnessValue, updateRGBValues);

initRefs(props)


const selectColor = () => {
    let hex = RGBToHex([redValue.value, greenValue.value, blueValue.value]);
    props.input(hex);
    pickerIsOpen.value = false;
}

</script>

<template>
    <div class="container">
        <div class="preview" @click="() => pickerIsOpen = !pickerIsOpen"></div>

        <div class="picker-container" v-bind:class="pickerIsOpen ? '' : 'hidden'">
            <header>
                <h1>Select a color.</h1>
            </header>
            <div class="picker">
                <div class="range-container">
                    <input id="HUE_RANGE" type="range" min="0" max="360" :value="hueValue"
                        @input="({target}) => hueValue = (target as HTMLInputElement).valueAsNumber">
                    <label for="HUE_NUMBER">Hue : <input id="HUE_NUMBER" type="number" min="0" max="360"
                            :value="hueValue"
                            @input="({target}) => hueValue = (target as HTMLInputElement).valueAsNumber"></label>
                </div>
                <div class="range-container">
                    <input id="SATURATION_RANGE" type="range" min="0" max="100" :value="saturationValue"
                        @input="({target}) => saturationValue = (target as HTMLInputElement).valueAsNumber">
                    <label for="SATURATION_NUMBER">Sat : <input id="SATURATION_NUMBER" type="number" min="0" max="100"
                            :value="saturationValue"
                            @input="({target}) => saturationValue = (target as HTMLInputElement).valueAsNumber"></label>
                </div>
                <div class="range-container">
                    <input id="LIGHTNESS_RANGE" type="range" min="0" max="100" :value="lightnessValue"
                        @input="({target}) => lightnessValue = (target as HTMLInputElement).valueAsNumber">
                    <label for="LIGHTNESS_NUMBER">Lum : <input id="LIGHTNESS_NUMBER" type="number" min="0" max="100"
                            :value="lightnessValue"
                            @input="({target}) => lightnessValue = (target as HTMLInputElement).valueAsNumber"></label>
                </div>
            </div>
            <footer>
                <div class="show">
                    <!-- <div class="text-values">
                        <p>{{RGBToHex([redValue,greenValue,blueValue])}}</p>
                        <p>({{redValue}},{{greenValue}},{{blueValue}})</p>
                    </div> -->
                    <div class="preview"></div>
                </div>
                <Button variant="secondary" @click="selectColor">Select</Button>
            </footer>
        </div>
    </div>


</template>

<style lang="scss" scoped>
.preview {
    $preview-size: 2em;
    display: block;
    width: $preview-size;
    height: $preview-size;

    background-color: v-bind(value);
    border: 2px solid;
    border-color: var(--foreground);
}

.container {
    // position: relative;



    .picker-container {
        position: absolute;

        right: 0;
        top: 6em;
        width: min(400px, 100vw);

        color: var(--primary);
        background-color: var(--foreground);
        border-radius: 4px;

        display: grid;
        grid-template-areas: "a" "b" "c";

        z-index: 19;

        header {
            padding: 1em;
            text-align: center;
        }

        .picker {
            --hue: v-bind(hueValue + "deg");
            --saturation: v-bind(saturationValue + "%");
            --lightness: v-bind(lightnessValue + "%");


            padding: 2em 1em;

            .range-container {
                display: grid;
                grid-template-columns: 2fr 1fr;
                gap: 1em;

                input[type=range] {
                    -webkit-appearance: none;

                    width: 100%;
                    height: 2em;

                    background-color: var(--foreground);

                    &#HUE_RANGE {
                        background-image: linear-gradient(90deg,
                                hsl(0, var(--saturation), var(--lightness)),
                                hsl(90deg, var(--saturation), var(--lightness)),
                                hsl(180deg, var(--saturation), var(--lightness)),
                                hsl(270deg, var(--saturation), var(--lightness)),
                                hsl(360deg, var(--saturation), var(--lightness)));
                    }

                    &#SATURATION_RANGE {
                        background-image: linear-gradient(90deg,
                                hsl(var(--hue), 0%, var(--lightness)),
                                hsl(var(--hue), 25%, var(--lightness)),
                                hsl(var(--hue), 50%, var(--lightness)),
                                hsl(var(--hue), 75%, var(--lightness)),
                                hsl(var(--hue), 100%, var(--lightness)));
                    }

                    &#LIGHTNESS_RANGE {
                        background-image: linear-gradient(90deg,
                                hsl(var(--hue), var(--saturation), 0%),
                                hsl(var(--hue), var(--saturation), 25%),
                                hsl(var(--hue), var(--saturation), 50%),
                                hsl(var(--hue), var(--saturation), 75%),
                                hsl(var(--hue), var(--saturation), 100%));
                    }

                }

                label {
                    font-weight: 600;
                    display: flex;
                    align-items: center;
                    vertical-align: middle;
                    gap: 2px;
                    justify-content: space-between;
                }

                input[type=number] {
                    text-align: center;
                    width: 4ch;

                    background-color: var(--background);
                    color: var(--foreground);
                    font-weight: 600;

                    border: none;
                    border-radius: 4px;
                }
            }



            /* Remove Arrow from number input */
            input[type=number],
            input::-webkit-outer-spin-button,
            input::-webkit-inner-spin-button {
                -webkit-appearance: none;
                -moz-appearance: textfield;
            }
        }

        footer {
            display: flex;
            justify-content: end;
            align-items: center;

            .show {
                flex-grow: 2;
                margin: 0 1em;
            }

            .text-values>p {
                display: inline-block;
                margin: 0 5px;
            }

            .preview {
                background-color: v-bind("RGBToHex([redValue, greenValue, blueValue])");

                width: 100%;
            }
        }

        &.hidden {
            display: none;
            width: 0;
            height: 0;
        }
    }
}
</style>