import styles from "./UkFlagsCycler.module.scss";
import "flag-icons/css/flag-icons.min.css";
import { createSignal, onCleanup, onMount } from "solid-js";

const FLAGS = [
    "fi-gb",
    "fi-gb-eng",
    "fi-gb-sct",
    "fi-gb-wls",
    "fi-gb-nir",
];

export default function Flag() {
    const [index, setIndex] = createSignal(0);
    let intervalId: number;

    onMount(() => {
        intervalId = window.setInterval(() => {
            setIndex((prev) => (prev + 1) % FLAGS.length);
        }, 6_000);
    });

    onCleanup(() => {
        clearInterval(intervalId);
    });

    return (
        <div class={`${styles.flag} fi ${FLAGS[index()]}`} ></div>
    );
}
