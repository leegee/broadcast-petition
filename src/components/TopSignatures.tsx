import styles from "./TopSignatures.module.scss";
import { createMemo, For } from "solid-js";
import { countsStore } from "../petitionStore";

interface TopSignaturesProps {
    n?: number;
}

export default function TopSignatures(props: TopSignaturesProps) {
    const topN = props.n ?? 5;

    const sorted = createMemo(() => Object.entries(countsStore)
        .map(([code, { name, count }]) => ({ code, name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, topN)
    );

    return (
        <article class={`border ${styles.tops}`}>
            <h6>Constituencies With The Most Signatures</h6>
            <table class={styles.table + " border"}>
                <thead>
                    <tr>
                        <th>Constituency</th>
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
    );
}
