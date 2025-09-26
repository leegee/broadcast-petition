import styles from "./BiggestChange.module.scss";
import { biggestChange } from "../petitionStore";
export default function BiggestChange() {
    const change = biggestChange();

    if (!change) return null;

    return (
        <article class={styles["biggest-change"]}>
            <fieldset>
                <legend>Latest</legend>
                <h6>{change.name}</h6>
                <p>
                    +{Number(change.new - change.old).toLocaleString()}
                    &nbsp;→&nbsp;{change.new.toLocaleString()} signatures
                    at {change.timestamp.toLocaleTimeString()}
                </p>
            </fieldset>
        </article>
    );
}
