import { Component, createMemo, Show } from "solid-js";
import styles from "./ThresholdProgressBar.module.scss";
import { petitionMeta, GOVERNMENT_RESPONSE_THRESHOLD, DEBATE_THRESHOLD, error } from "../petitionStore";

interface ThresholdProgressBarProps {
    type: "GOVERNMENT_RESPONSE" | "DEBATE";
}

export default function ThresholdProgressBar(props: ThresholdProgressBarProps) {
    const threshold = props.type === "GOVERNMENT_RESPONSE" ? GOVERNMENT_RESPONSE_THRESHOLD : DEBATE_THRESHOLD;
    const signature_count = createMemo(() => { return petitionMeta.signature_count || 0 });

    const label = createMemo(() => {
        const count = signature_count();

        if (props.type === "DEBATE") {
            if (petitionMeta.debate_threshold_reached_at) {
                if (petitionMeta.scheduled_debate_date) {
                    return 'Debate on ' + new Date(petitionMeta.scheduled_debate_date).toLocaleDateString()
                        + ' at ' + new Date(petitionMeta.scheduled_debate_date).toLocaleTimeString();
                } else {
                    return 'The debate threshold was reached on ' + new Date(petitionMeta.debate_threshold_reached_at).toLocaleDateString()
                        + ' at ' + new Date(petitionMeta.debate_threshold_reached_at).toLocaleTimeString();
                }
            }
        }

        if (props.type === "GOVERNMENT_RESPONSE") {
            if (petitionMeta.response_threshold_reached_at) {
                if (petitionMeta.government_response_at) {
                    return 'Debate on ' + new Date(petitionMeta.government_response_at).toLocaleDateString()
                        + ' at ' + new Date(petitionMeta.government_response_at).toLocaleTimeString();
                } else {
                    return 'The response threshold was reached on ' + new Date(petitionMeta.response_threshold_reached_at).toLocaleDateString()
                        + ' at ' + new Date(petitionMeta.response_threshold_reached_at).toLocaleTimeString();
                }
            }
        }

        if (count && count >= threshold) {
            return props.type === "GOVERNMENT_RESPONSE"
                ? "Government Response reached!"
                : "Parliamentary Debate reached!";
        }
        return props.type === "GOVERNMENT_RESPONSE"
            ? "Government Response"
            : "Parliamentary Debate";
    });

    return (
        <Show when={!error() && petitionMeta.action}>
            <button class={"chip primary large  " + styles.container}>
                <progress class="max" value={signature_count()} max={threshold}></progress>
                <span>{label()}</span>
            </button>
        </Show>

    );
};


