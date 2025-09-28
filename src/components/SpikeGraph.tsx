import styles from './SpikeGraph.module.scss';
import { createMemo, For } from "solid-js";
import { getSignatureStore } from "../delta.store";

const { totalSignatureCount } = getSignatureStore();

export const MAX_ENTRIES = 1000;
const DEFAULT_SPIKE_HEIGHT = 60;
const DEFAULT_SPIKE_WIDTH = 6;

export const SpikeGraph = (props: {
    color?: string;
    width?: number;
    height?: number;
    gap?: number;
}) => {
    const height = props.height ?? DEFAULT_SPIKE_HEIGHT;
    const color = props.color ?? "var(--spike-colour)";
    // const width = ; // props.width ?? DEFAULT_SPIKE_WIDTH;

    const spikes = createMemo(() => {
        const values = totalSignatureCount().slice(0, 200) || [];
        if (!values.length) return [];
        const maxValue = Math.max(...values, 1);
        return values.map((v) => (v / maxValue) * height);
    });

    return (
        <article class={styles["graph-container"]}
            style={{ height: `${height}px`, }}
        >
            <For each={spikes()}>
                {(spikeHeight) => (
                    <div class={styles.spike}
                        style={{
                            width: `${Math.min(Math.max(100 / spikes().length, 1), 100)}%`,
                            height: `${spikeHeight}px`,
                            background: `linear-gradient(${color} 10%, transparent 40%)`,
                        }}
                    />
                )}
            </For>
        </article>
    );
};
