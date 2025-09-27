import styles from "./PetitionLink.module.scss";
import { PETITION_ID, petitionMeta } from "../petitionStore";
import Flag from "./Flag";
import { Show } from "solid-js";

export default function PetitionLink() {
    return (
        <Show when={!petitionMeta.closed_at}>
            <article class={styles.sign + " border margin padding"}>
                <h2 class="padding">
                    <Flag />
                    <span>
                        Sign at{" "}
                        <a
                            class="left-margin small-margin"
                            href={`https://petition.parliament.uk/petitions/${PETITION_ID}/signatures/new`}
                        >
                            {`petition.parliament.uk/petitions/${PETITION_ID}`}
                        </a>
                    </span>
                </h2>
            </article>
        </Show>
    );
}
