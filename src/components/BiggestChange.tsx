import styles from "./BiggestChange.module.scss";
import { biggestChange } from "../petitionStore";
export default function BiggestChange() {
    const change = biggestChange();

    if (!change) return null;

    return (
        <article class={styles["biggest-change"] + ' transparent card large-padding '}>
            <fieldset>
                <legend class="">Latest</legend>
                <h3>{change.name}</h3>
                <h4>
                    +{Number(change.new - change.old).toLocaleString()}
                    → {change.new.toLocaleString()} signatures
                    at {change.timestamp.toLocaleTimeString()}
                </h4>
            </fieldset>
        </article>
    );
}
