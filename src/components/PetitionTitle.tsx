import styles from "./PetitionMeta.module.scss";
import { petitionMeta, error } from "../stores/petition.store";
import { Show } from "solid-js";

export default function PetitionTitle() {
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
            </>
        </Show >
    );
}
