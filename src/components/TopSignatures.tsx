import styles from "./TopSignatures.module.scss";
import { createMemo, createSignal, For, onCleanup, onMount, Show } from "solid-js";
import { countsStore, error, petitionMeta } from "../petitionStore";
import { setHighlightedFeatureId } from "./highlight.store";

interface TopSignaturesProps {
    n?: number;
}

export default function TopSignatures(props: TopSignaturesProps) {
    const topN = props.n ?? 5;

    const [highlightIndex, setHighlightIndex] = createSignal(0);

    onMount(() => {
        const interval = setInterval(() => {
            setHighlightIndex((c) => (c + 1) % (topN + 1));

            const sortedList = sorted();
            const feature = sortedList[highlightIndex()];
            setHighlightedFeatureId(feature?.code ?? null);

        }, 10_000);

        onCleanup(() => clearInterval(interval));
    });

    const sorted = createMemo(() => Object.entries(countsStore)
        .map(([code, { name, count }]) => ({ code, name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, topN)
    );

    return (
        <Show when={!error() && petitionMeta.action}
            fallback={<Show when={!petitionMeta.action}>
                <div class="loading"> Error loading petition info: {error()} </div>
            </Show>}
        >
            <article class={`border ${styles.tops}`}>
                <h6 class="max full-width center-align">Constituencies With The Most Signatures</h6>
                <table class={styles.table + " border"}>
                    <thead>
                        <tr>
                            <th>Constituency</th>
                            <th class="right-align">Signatures</th>
                        </tr>
                    </thead>
                    <tbody>
                        <For each={sorted()}>
                            {(item, itemIndex) => (
                                <tr class={itemIndex() === highlightIndex() ? styles.bold : ''}>
                                    <td>{item.name}</td>
                                    <td class="right-align">{item.count.toLocaleString()}</td>
                                </tr>
                            )}
                        </For>
                    </tbody>
                </table>
            </article>
        </Show >
    );
}
