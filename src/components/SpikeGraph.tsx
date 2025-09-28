import { For } from "solid-js";
import { getSignatureStore } from "../delta.store";

const { totalSignatureCount } = getSignatureStore();

export const MAX_ENTRIES = 1000;
const DEFAULT_SPIKE_HEIGHT = 50;
const DEFAULT_SPIKE_WIDTH = 4;

export const SpikeGraph = (props: {
    color?: string;
    width?: number;
    height?: number;
    gap?: number;
}) => {
    const width = props.width ?? DEFAULT_SPIKE_WIDTH;
    const height = props.height ?? DEFAULT_SPIKE_HEIGHT;
    const gap = props.gap ?? 0
    const color = props.color ?? "var(--tertiary)";

    const spikes = () => {
        const values = totalSignatureCount() || [];
        if (!values.length) return [];
        const maxValue = Math.max(...values, 1);
        return values.map((v) => (v / maxValue) * height);
    };

    return (
        <article
            style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                opacity: 0.5,
                display: "flex",
                "align-items": "flex-end",
                gap: `${gap}px`,
                height: `${height}px`,
                background: "transparent",
                margin: "0 1em",
            }}
        >
            <For each={spikes()}>
                {(spikeHeight) => (
                    <div
                        style={{
                            width: `${width}px`,
                            height: `${spikeHeight}px`,
                            background: `linear-gradient(${color} 10%, ${color} 50%, rgba(255,255,255,0.1) 100%)`,
                        }}
                    />
                )}
            </For>
        </article>
    );
};
