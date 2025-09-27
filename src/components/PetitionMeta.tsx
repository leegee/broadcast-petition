import styles from "./PetitionMeta.module.scss";
import { petitionMeta, error } from "../petitionStore";
import { Show } from "solid-js";

export default function PetitionMeta() {
    return (
        <Show when={!error() && petitionMeta.action}
            fallback={
                <Show when={error()} > <div class="error" /> </Show>
            }
        >
            <article class={styles.meta + " transparent card border margin"}>
                <h1 class={styles.title}>{petitionMeta.action}</h1>
                <h2>
                    <strong>{petitionMeta.signature_count?.toLocaleString()}</strong> total signatures
                </h2>

                <blockquote>
                    <p class="left-align left-margin">
                        <strong>{petitionMeta.background}</strong>
                        {petitionMeta.additional_details && <span>{' ' + petitionMeta.additional_details}</span>}
                    </p>
                    <p class="right-align no-margin">
                        &mdash;&nbsp;<span class='italic'>{petitionMeta.creator_name}</span>
                    </p>
                </blockquote>
            </article>
        </Show>
    );
}
