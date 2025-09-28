import styles from "./TopRegions.module.scss";
import { createMemo, For, Show } from "solid-js";
import { error, petitionMeta, regionCountsStore } from "../petitionStore";
interface TopRegionsProps {
    n?: number;
}

export default function TopRegions(props: TopRegionsProps) {
    const topN = props.n ?? 5;

    const sorted = createMemo(() => Object.entries(regionCountsStore)
        .map(([code, { name, count }]) => ({ code, name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, topN)
    );

    return (
        <Show when={!error() && petitionMeta.action}
            fallback={
                <Show when={error()}> <div class="error" /> </Show>
            }
        >
            <article class={`border ${styles.tops}`}>
                <h6 class="max full-width center-align">Regions With The Most Signatures</h6>
                <table class={styles.table + " border"}>
                    <thead>
                        <tr>
                            <th>Region</th>
                            <th>Signatures</th>
                        </tr>
                    </thead>
                    <tbody>
                        <For each={sorted()}>
                            {(item) => (
                                <tr>
                                    <td>{item.name}</td>
                                    <td>{item.count.toLocaleString()}</td>
                                </tr>
                            )}
                        </For>
                    </tbody>
                </table>
            </article>
        </Show>
    );
}
