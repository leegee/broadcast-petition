import { biggestChange } from "../petitionStore";
import styles from "./BiggestChange.module.scss";
export default function BiggestChange() {
    const change = biggestChange();

    if (!change) return null;

    return (
        <article class={'small border card ' + styles["biggest-change"]}>
            <h3>{change.name}</h3>
            <h4>
                +{Number(change.new - change.old).toLocaleString()}
                → {change.new.toLocaleString()} signatures
            </h4>
        </article>
    );
}
