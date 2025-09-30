import { Component, createMemo } from "solid-js";
import { getSignatureStore } from "../stores/delta.store";

interface SignatureMovingAverageProps {
    mode?: "minute" | "hour" | "day"; // default: "hour"
}

export default function SignatureMovingAverage(props: SignatureMovingAverageProps) {
    const { totalSignatureCount } = getSignatureStore();

    const value = createMemo(() => {
        const counts = totalSignatureCount();
        if (!counts.length) return 0;

        switch (props.mode) {
            case "minute":
                // last entry is the most recent minute
                return counts[counts.length - 1] || 0;

            case "day":
                // average per hour over last 24 hours
                const perHour: number[] = [];
                for (let h = 0; h < 24; h++) {
                    const start = counts.length - (h + 1) * 60;
                    const end = counts.length - h * 60;
                    const slice = counts.slice(Math.max(0, start), Math.max(0, end));
                    perHour.unshift(slice.reduce((a, b) => a + b, 0));
                }
                // return an hour's worth of the todal minutes for that 24-hours
                return perHour.reduce((a, b) => a + b, 0) / 24;

            case "hour":
            default:
                // average over last 60 minutes
                const last60 = counts.slice(-60);
                return last60.reduce((a, b) => a + b, 0) / last60.length;
        }
    });

    const label = props.mode === "minute"
        ? " signatures in the past minute"
        : props.mode === "day"
            ? " signatures on average per hour today"
            : " signatures in the past hour";

    return (
        <button class="chip large border fill tiny-margin medium-elevate">
            <span>
                {Math.floor(value()).toLocaleString()}
                {label}
            </span>
        </button>
    );
};
