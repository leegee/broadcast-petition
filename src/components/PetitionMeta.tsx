import styles from "./PetitionMeta.module.scss";
import { petitionMeta, loading, error } from "../petitionStore";
import { Show } from "solid-js";

export default function PetitionMeta() {
    return (
        <Show
            when={!loading() && !error() && petitionMeta.action}
            fallback={
                <Show when={loading()} fallback={<div>Error loading petition info: {error()}</div>}>
                    <div class="loading" />
                </Show>
            }
        >
            <article class={styles.meta + " transparent card border margin"}>
                <h1 class={styles.title}>{petitionMeta.action}</h1>
                <h2>
                    <strong>{petitionMeta.signature_count?.toLocaleString()}</strong> total signatures
                </h2>

                <blockquote>
                    <p><strong>{petitionMeta.background}</strong></p>
                    {petitionMeta.additional_details && <p>{petitionMeta.additional_details}</p>}
                </blockquote>
            </article>
        </Show>
    );
}
