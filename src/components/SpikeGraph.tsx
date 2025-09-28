import { For } from "solid-js";
import { totalSignatureCount } from "../delta.store";

export const MAX_ENTRIES = 1000;

// SpikeGraph component reads directly from persisted signal
export const SpikeGraph = (props: {
    color?: string;
    width?: number;
    height?: number;
    gap?: number;
}) => {
    const width = props.width ?? 4;
    const height = props.height ?? 75;
    const gap = props.gap ?? 0;
    const color = props.color ?? "white";

    const spikes = () => {
        const values = totalSignatureCount().map(Number);
        if (!values.length) return [];
        const maxValue = Math.max(...values, 1);
        return values.map((v) => (v / maxValue) * height);
    };

    return (
        <article
            class="border fill no-padding margin"
            style={{
                display: "flex",
                "align-items": "flex-end",
                "justify-content": "space-between",
                gap: `${gap}px`,
                height: `${height}px`,
            }}
        >
            <For each={spikes()}>
                {(spikeHeight) => (
                    <div
                        style={{
                            width: `${width}px`,
                            height: `${spikeHeight}px`,
                            background: `linear-gradient(to bottom, ${color} 0%, ${color} 1%, rgba(255,255,255,0.1) 50%)`,
                        }}
                    />
                )}
            </For>
        </article>
    );
};
