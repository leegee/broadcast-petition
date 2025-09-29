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
                <article class={'no-padding'}>
                    <h1 class={'tiny-padding center-align stroked-black ' + styles.title}>{petitionMeta.action}</h1>
                    {/* <hr /> */}
                    <h2 class={'no-padding center-align stroked-black ' + styles.subtitle} style="z-index: 20; position: relative;">
                        <strong>{petitionMeta.signature_count?.toLocaleString()}</strong>
                        <span class={'small-caps ' + styles.total_signatures_text}>total signatures</span>
                    </h2>
                </article>

                <article class="border margin">
                    <blockquote class="margin" style="columns: 2; text-align: justify; padding-bottom:0; padding-top:0">
                        <strong>{petitionMeta.background}</strong>
                        {petitionMeta.additional_details && <span>{' ' + petitionMeta.additional_details}</span>}
                    </blockquote>
                    <p class="right-align margin">
                        <cite style='padding-right: 1.6em;'>
                            &mdash;&nbsp;<span class={`italic ${styles.creator_name}`}>
                                {petitionMeta.creator_name},
                            </span>
                            <span>
                                {new Date(petitionMeta.created_at!).toLocaleDateString()} {" at "}
                                {new Date(petitionMeta.created_at!).toLocaleTimeString()}
                            </span>
                        </cite>
                    </p>
                </article>
            </>
        </Show >
    );
}
