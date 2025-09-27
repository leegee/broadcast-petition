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
                console.log('xxx', changeAccessor())
                const diff = changeAccessor().diff;
                const newest = changeAccessor().new;
                const time = new Date(changeAccessor().timestamp).toLocaleTimeString();

                return (
                    <article class={styles["biggest-change"] + " center-align middle-align"}>
                        <fieldset>
                            <legend>Latest</legend>
                            <h6>
                                {changeAccessor().name}
                                &nbsp;
                                <Show when={diff < newest}>
                                    +{diff.toLocaleString()} &nbsp;→&nbsp;
                                </Show>
                                {newest.toLocaleString()}
                                &nbsp;
                                signatures at {time}
                            </h6>
                        </fieldset>
                    </article>
                );
            }}
        </Show>
    );
}
