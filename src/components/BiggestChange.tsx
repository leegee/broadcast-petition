import styles from "./BiggestChange.module.scss";
import { createMemo, Show } from "solid-js";
import { biggestChange } from "../petitionStore";

interface BiggestChange {
    name: string;
    old: number;
    new: number;
    timestamp: string | Date;
}

export default function BiggestChange() {
    const change = createMemo<BiggestChange | null>(() => biggestChange());

    return (
        <Show when={change()}>
            {(changeAccessor) => {
                const delta = changeAccessor().new - changeAccessor().old;
                const time = new Date(changeAccessor().timestamp).toLocaleTimeString();

                return (
                    <article class={styles["biggest-change"]}>
                        <fieldset>
                            <legend>Latest</legend>
                            <h6>
                                {changeAccessor().name} +{delta.toLocaleString()} &nbsp;→&nbsp;{changeAccessor().new.toLocaleString()} signatures
                                at {time}
                            </h6>
                        </fieldset>
                    </article>
                );
            }}
        </Show>
    );
}
