import styles from "./BiggestChange.module.scss";
import { createMemo, Show } from "solid-js";
import { biggestChange } from "../petitionStore";

interface BiggestChange {
    name: string;
    diff: number;
    new: number;
    timestamp: string | Date;
}

export default function BiggestChange() {
    const change = createMemo<BiggestChange | null>(() => biggestChange());

    return (
        <Show when={change()}>
            {(changeAccessor) => {
                const diff = changeAccessor().diff;
                const newest = changeAccessor().new;
                const time = new Date(changeAccessor().timestamp).toLocaleTimeString();

                return (
                    <article class={styles["biggest-change"] + " secondary center-align middle-align margin padding"}>
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
