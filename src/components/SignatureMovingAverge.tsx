import { Component, createMemo } from "solid-js";
import { getSignatureStore } from "../delta.store";

interface MovingAverageProps {
    mode?: "hour" | "day" | "lastHour"; // default: "hour"
}

export const SignatureMovingAverage: Component<MovingAverageProps> = (props) => {
    const { totalSignatureCount } = getSignatureStore();

    const average = createMemo(() => {
        const counts = totalSignatureCount();
        if (counts.length === 0) return 0;

        if (props.mode === "lastHour") {
            // last hour only (assuming 1 entry = 1 minute)
            const last60 = counts.slice(-60);
            return last60.reduce((a, b) => a + b, 0) / last60.length;
        }
        else if (props.mode === "day") {
            // per hour averages over past 24 hours (1440 entries = 24*60)
            const perHour: number[] = [];
            for (let h = 0; h < 24; h++) {
                const start = counts.length - (h + 1) * 60;
                const end = counts.length - h * 60;
                const slice = counts.slice(Math.max(0, start), Math.max(0, end));
                perHour.unshift(slice.reduce((a, b) => a + b, 0)); // oldest first
            }
            return perHour.reduce((a, b) => a + b, 0) / 24; // average per hour
        }
        else {
            // default: moving average over last hour
            const last60 = counts.slice(-60);
            return last60.reduce((a, b) => a + b, 0) / last60.length;
        }
    });

    return (
        <button class="chip large border fill tiny-margin medium-elevate">
            {/* <strong>
                {props.mode === "day" ? "Average per hour (past 24h)" : "Moving average (past hour)"}:
            </strong> */}
            <span> {Math.floor(average()).toLocaleString()} signatures {props.mode === "day" ? "per hour" : "per minute"}</span>
        </button>
    );
};
