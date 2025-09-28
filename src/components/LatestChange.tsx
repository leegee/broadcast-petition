import styles from "./LatestChange.module.scss";
import { createMemo, createSignal, Show } from "solid-js";
import { highlightedFeatureId } from "./highlight.store";

export interface BiggestChange {
    id: string;
    code: string;
    name: string;
    diff: number;
    old: number;
    new: number;
    timestamp: Date;
}
export const [biggestChange, setBiggestChange] = createSignal<BiggestChange | null>(null);

export default function BiggestChange() {
    const change = createMemo<BiggestChange | null>(() => biggestChange());

    return (
        <Show when={change()}>
            {(changeAccessor) => {
                const diff = changeAccessor().diff;
                const newest = changeAccessor().new;
                const time = new Date(changeAccessor().timestamp).toLocaleTimeString();

                return (
                    <article class={`
                        ${styles.container} secondary center-align middle-align margin padding max
                        ${highlightedFeatureId() === changeAccessor().id ? 'highlighted ' + styles.highlighted : ''}
                    ` } >
                        <h6>Latest</h6>
                        <p>
                            <span class={styles.name}>
                                {changeAccessor().name + ' '}
                            </span>
                            <span class={styles.values}>
                                <Show when={diff < newest}>
                                    +{diff.toLocaleString() + ' → '}
                                </Show>
                                {newest.toLocaleString() + ' '}
                                signatures at {time}
                            </span>
                        </p>
                    </article>
                );
            }}
        </Show>
    );
}
