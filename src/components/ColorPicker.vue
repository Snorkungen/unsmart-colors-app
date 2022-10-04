<script setup lang="ts">
import { watch, ref } from 'vue';
import { hexToRGB, HSLToInts, RGBToHSL, HSLToRGB, RGBToHex } from '../lib/color';
import Button from './Button.vue';

export interface ColorPickerProps {
    value: string | any;
    input: (hex: string) => void
}

const props = defineProps<ColorPickerProps>();

const pickerIsOpen = ref<boolean>(false);

const hueValue = ref(0)
const saturationValue = ref(0)
const lightnessValue = ref(0)

const redValue = ref(0);
const blueValue = ref(0);
const greenValue = ref(0);

const updateRGBValues = () => {
    let [red, green, blue] = HSLToRGB([hueValue.value / 360, saturationValue.value / 100, lightnessValue.value / 100])

    redValue.value = red;
    greenValue.value = green;
    blueValue.value = blue;
}

const updateHSLValues = () => {
    let [hue, saturation, lightness] = HSLToInts(RGBToHSL([redValue.value, greenValue.value, blueValue.value]));

    hueValue.value = hue;
    saturationValue.value = saturation;
    lightnessValue.value = lightness;
}

const selectColor = () => {
    let hex = RGBToHex([redValue.value, greenValue.value, blueValue.value]);
    props.input(hex);
    pickerIsOpen.value = false;
}

const inputNumber = (event: Event, max = 255, fallback = 0): number =>
    Math.min(max, Math.max(0, (event.target as HTMLInputElement).valueAsNumber || fallback));

const HEX_REGEX = /^([A-F0-9]{3}|[A-F0-9]{6})$/i
const inputHex = (event: Event) => {
    if (!(event.target instanceof HTMLInputElement)) return;
    let { value } = event.target;

    value = value.trim();
    if (value.at(0) === "#") value = value.substring(1);
    if (!HEX_REGEX.test(value)) return;

    const [red, green, blue] = hexToRGB(value);

    redValue.value = red;
    greenValue.value = green;
    blueValue.value = blue;

    updateHSLValues();
}

const initRefs = ({ value }: ColorPickerProps) => {
    const [red, green, blue] = hexToRGB(value);

    redValue.value = red;
    greenValue.value = green;
    blueValue.value = blue;

    updateHSLValues();
}

watch(props, initRefs)
initRefs(props)
</script>

<template>
    <div class="container">
        <button class="preview" @click="() => pickerIsOpen = !pickerIsOpen"></button>

        <div class="picker-container" v-bind:class="pickerIsOpen ? '' : 'hidden'">
            <header>
                <h1>Select a color.</h1>
            </header>
            <div class="picker">
                <div class="range-container">
                    <input id="HUE_RANGE" type="range" min="0" max="360" :value="hueValue"
                        @input="(event) => {hueValue =  inputNumber(event,360,hueValue); updateRGBValues() }">
                    <label for="HUE_NUMBER">Hue : <input id="HUE_NUMBER" type="number" min="0" max="360"
                            :value="hueValue"
                            @input="(event) => {hueValue =  inputNumber(event,360,hueValue); updateRGBValues() }"></label>
                </div>
                <div class="range-container">
                    <input id="SATURATION_RANGE" type="range" min="0" max="100" :value="saturationValue"
                        @input="(event) => {saturationValue = inputNumber(event,100,saturationValue); updateRGBValues()}">
                    <label for="SATURATION_NUMBER">Sat : <input id="SATURATION_NUMBER" type="number" min="0" max="100"
                            :value="saturationValue"
                            @input="(event) => {saturationValue = inputNumber(event,100,saturationValue); updateRGBValues()}"></label>
                </div>
                <div class="range-container">
                    <input id="LIGHTNESS_RANGE" type="range" min="0" max="100" :value="lightnessValue"
                        @input="(event) => {lightnessValue = inputNumber(event,100,lightnessValue); updateRGBValues()}">
                    <label for="LIGHTNESS_NUMBER">Lum : <input id="LIGHTNESS_NUMBER" type="number" min="0" max="100"
                            :value="lightnessValue"
                            @input="(event) => {lightnessValue = inputNumber(event,100,lightnessValue); updateRGBValues()}"></label>
                </div>
            </div>
            <footer>
                <div class="show">
                    <p>#<input type="text" :value="RGBToHex([redValue,greenValue,blueValue]).substring(1)"
                            @change="inputHex"></p>
                    <div class="rgb">
                        <label for="RED_NUMBER">R: <input id="RED_NUMBER" :value="redValue" type="number"
                                @input="(event) => {redValue = inputNumber(event,255,redValue); updateHSLValues()}"></label>
                        <label for="GREEN_NUMBER">G: <input id="GREEN_NUMBER" :value="greenValue" type="number"
                                @input="(event) => {greenValue = inputNumber(event,255,greenValue); updateHSLValues()}"></label>
                        <label for="BLUE_NUMBER">B: <input id="BLUE_NUMBER" :value="blueValue" type="number"
                                @input="(event) => {blueValue = inputNumber(event,255,blueValue); updateHSLValues()}"></label>
                    </div>
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
    border-radius: 4px;
    transition: border-color linear 250ms;
}

button.preview {
    cursor: pointer;

    &:hover {
        border-color: var(--primary-3);
    }
}

.container {
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
                    appearance: none;

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

            }
        }

        footer {
            display: flex;
            justify-content: end;
            align-items: center;

            .show {
                flex-grow: 2;
                margin: 0 1em;
                display: grid;
                grid-template-areas: "a b" "c c";
                place-items: center;
                row-gap: 0.5em;
                input[type=text] {
                    width: 7ch;
                }

                label {
                    font-weight: 600;
                    padding: 4px;
                }
            }

            .preview {
                background-color: v-bind("RGBToHex([redValue, greenValue, blueValue])");
                grid-column: 1 / 3;
                width: 100%;
            }
        }

        input {
            text-align: center;

            background-color: var(--background);
            color: var(--foreground);
            font-weight: 600;

            border: none;
            border-radius: 3px;
            padding: 0.1em;
        }

        input[type=number] {
            width: 4ch;
        }

        /* Remove Arrow from number input */
        input[type=number],
        input::-webkit-outer-spin-button,
        input::-webkit-inner-spin-button {
            -webkit-appearance: none;
            -moz-appearance: textfield;
        }

        &.hidden {
            display: none;
            width: 0;
            height: 0;
        }
    }
}
</style>