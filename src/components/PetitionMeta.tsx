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
            <>
                {/* <article class={styles.meta + " transparent card border margin"}> */}
                <h1 class={'padding ' + styles.title}>{petitionMeta.action}</h1>
                <h2 class='padding'>
                    <strong>{petitionMeta.signature_count?.toLocaleString()}</strong> total signatures
                </h2>

                <article class="border margin">
                    <blockquote class="margin">
                        <strong>{petitionMeta.background}</strong>
                        {petitionMeta.additional_details && <span>{' ' + petitionMeta.additional_details}</span>}
                    </blockquote>
                    <p class="right-align margin">
                        &mdash;&nbsp;<span class={`italic ${styles.creator_name}`}>
                            {petitionMeta.creator_name},
                        </span>
                        <span>
                            {new Date(petitionMeta.created_at!).toLocaleDateString()} {" at "}
                            {new Date(petitionMeta.created_at!).toLocaleTimeString()}
                        </span>
                    </p>
                </article>
            </>
        </Show >
    );
}
