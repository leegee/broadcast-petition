import styles from "./TopSignatures.module.scss";
import { createMemo, createSignal, For, onCleanup, onMount, Show } from "solid-js";
import { countsStore, error, petitionMeta } from "../stores/petition.store";
import { setHighlightedFeatureId } from "./highlight.store";

interface TopSignaturesProps {
    n?: number;
}

export default function TopSignatures(props: TopSignaturesProps) {
    const topN = props.n ?? 5;

    const [highlightIndex, setHighlightIndex] = createSignal(0);

    const HIGHLIGHT_INTERVAL_MS = 10_000;
    const HIGHLIGHT_PAUSE_MS = 20_000;

    const sorted = createMemo(() =>
        Object.entries(countsStore)
            .map(([code, { name, count }]) => ({ code, name, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, topN)
    );


    onMount(() => {
        let timeoutId: number;
        const startHighlightTour = () => {
            const list = sorted();
            if (!list.length) {
                // not ready yet, try again in 100ms
                timeoutId = window.setTimeout(startHighlightTour, 100);
                return;
            }

            const advanceHighlight = () => {
                const list = sorted();
                if (!list.length) return;

                if (highlightIndex() < list.length) {
                    const feature = list[highlightIndex()];
                    setHighlightedFeatureId(feature?.code ?? null);

                    // alert(`Highlighting: ${feature?.name} (${highlightIndex()})`);

                    timeoutId = window.setTimeout(() => {
                        setHighlightIndex((i) => i + 1);
                        advanceHighlight();
                    }, HIGHLIGHT_INTERVAL_MS);
                } else {
                    setHighlightedFeatureId(null);
                    // alert("Pausing before restarting highlight tour");

                    timeoutId = window.setTimeout(() => {
                        setHighlightIndex(0);
                        advanceHighlight();
                    }, HIGHLIGHT_PAUSE_MS);
                }
            };

            advanceHighlight();
        };

        startHighlightTour();

        onCleanup(() => clearTimeout(timeoutId));
    });


    return (
        <Show
            when={!error() && petitionMeta.action}
            fallback={<div class="loading" />}
        >
            <div class="row margin ">
                <article class={`max border ${styles.tops}`}>

                    <h6 class="max full-width center-align">
                        Most Active Constituencies
                    </h6>
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
                                    <tr class={itemIndex() === highlightIndex() ? "highlighted" : ""}>
                                        <td>{item.name}</td>
                                        <td class="right-align">{item.count.toLocaleString()}</td>
                                    </tr>
                                )}
                            </For>
                        </tbody>
                    </table>
                </article>
            </div>
        </Show>
    );
}
