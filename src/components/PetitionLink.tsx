import styles from "./PetitionLink.module.scss";
import { PETITION_ID, petitionMeta } from "../petitionStore";
import Flag from "./Flag";
import { Show } from "solid-js";

export default function PetitionLink() {
    return (
        <>
            <Show when={!petitionMeta.closed_at}>
                <div class={styles.sign}>
                    <h2>
                        <span class={styles.flag}>
                            <Flag />
                        </span>
                        <span class={styles.signat}> Sign at </span>
                        <a
                            class={styles.a}
                            href={`https://petition.parliament.uk/petitions/${PETITION_ID}/signatures/new`}
                        >
                            <span class={styles.domainname}>petition.parliament.uk/petitions/</span>
                            <span class={`bold ${styles.petition_id}`}>{PETITION_ID}</span>
                        </a>
                    </h2>
                </div>
            </Show >

            <Show when={!!petitionMeta.closed_at}>
                <div class={styles.sign + " border margin padding center-align middle-align"} >
                    <h2 class="padding">
                        <Flag />
                        <span>This petition closed at
                            {new Date(petitionMeta.closed_at!).toLocaleDateString()}
                            {new Date(petitionMeta.closed_at!).toLocaleTimeString()}
                        </span>
                    </h2>
                </div>
            </Show>
        </>
    );
}
