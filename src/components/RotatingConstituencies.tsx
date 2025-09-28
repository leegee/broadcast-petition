import styles from "./RotatingConstituencies.module.scss";
import { For, createSignal, createMemo, onCleanup } from "solid-js";
import { Transition } from "solid-transition-group";
import { countsStore } from "../petitionStore";

interface RotatingConstituenciesProps {
    n?: number;
    interval?: number;
}

export default function RotatingConstituencies(props: RotatingConstituenciesProps) {
    const n = props.n ?? 5;
    const intervalMs = props.interval ?? 3000;

    const sorted = createMemo(() =>
        Object.entries(countsStore)
            .map(([code, { name, count }]) => ({ code, name, count }))
            .sort((a, b) => b.count - a.count)
    );

    const [startIndex, setStartIndex] = createSignal(0);

    const intervalId = setInterval(() => {
        const next = startIndex() + n;
        if (next >= sorted().length) setStartIndex(0);
        else setStartIndex(next);
    }, intervalMs);

    onCleanup(() => clearInterval(intervalId));

    const currentChunk = createMemo(() => sorted().slice(startIndex(), startIndex() + n));

    return (
        <article class="card padding margin border">
            <h6>Most Active Constituencies</h6>

            <div class={styles.rotatingList}>
                <Transition name="slide" mode="outin">
                    <ul class={styles.list}>
                        <For each={currentChunk()}>
                            {(item) => (
                                <li class={styles.item}>
                                    <strong>{item.name}</strong>: {item.count.toLocaleString()} signatures
                                </li>
                            )}
                        </For>
                    </ul>
                </Transition>
            </div>
        </article>
    );
}
