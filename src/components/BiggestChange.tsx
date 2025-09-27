import styles from "./BiggestChange.module.scss";
import { biggestChange } from "../petitionStore";
export default function BiggestChange() {
    const change = biggestChange();

    if (!change) return null;

    return (
        <article class={styles["biggest-change"]}>
            <fieldset>
                <legend>Latest</legend>
                <h6>{change.name}
                    +{Number(change.new - change.old).toLocaleString()}
                    &nbsp;→&nbsp;{change.new.toLocaleString()} signatures
                    at {change.timestamp.toLocaleTimeString()}
                </h6>
            </fieldset>
        </article>
    );
}
