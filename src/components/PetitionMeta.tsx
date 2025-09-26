import styles from "./PetitionMeta.module.scss";
import { petitionMeta, loading, error } from "../petitionStore";

export default function PetitionMeta() {
    if (loading()) return <div>Loading petition info…</div>;
    if (error()) return <div>Error loading petition info: {error()}</div>;

    return (
        <article class={styles.meta + " transparent card border margin large-padding"}>
            <h1 class={styles.title}>{petitionMeta.action}</h1>
            <h2>
                <strong>{petitionMeta.signature_count?.toLocaleString()}</strong> total signatures
            </h2>

            <blockquote>
                <p><strong>{petitionMeta.background}</strong></p>
                {petitionMeta.additional_details && <p>{petitionMeta.additional_details}</p>}
            </blockquote>

            <ul class="list border">
                <li>The petition is <strong>{petitionMeta.state}</strong></li>
                <li>
                    Created: <strong>{new Date(petitionMeta.created_at!).toLocaleDateString()}</strong>
                </li>
                <li>
                    Last updated: <strong>
                        {new Date(petitionMeta.updated_at!).toLocaleDateString()}{" "}
                        {new Date(petitionMeta.updated_at!).toLocaleTimeString()}
                    </strong>
                </li>
                {petitionMeta.closed_at && (
                    <li>
                        <strong>Closed:</strong> {new Date(petitionMeta.closed_at).toLocaleDateString()}
                    </li>
                )}
            </ul>
        </article>
    );
}
