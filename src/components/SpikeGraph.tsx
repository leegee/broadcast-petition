import styles from './SpikeGraph.module.scss';
import { createMemo, createSignal, onCleanup, onMount, Show } from "solid-js";
import { getSignatureStore } from "../stores/delta.store";

const { totalSignatureCount } = getSignatureStore();

const DEFAULT_SPIKE_HEIGHT = 60;
const DEFAULT_SPIKE_WIDTH = 6;

export default function SpikeGraph(props: {
    color?: string;
    width?: number | string;
    height?: number;
}) {
    const color = props.color ?? "var(--spike-colour)";
    const height = props.height ?? DEFAULT_SPIKE_HEIGHT;
    const [measuredWidth, setMeasuredWidth] = createSignal<number>(500);

    let svgRef: SVGSVGElement | undefined;

    onMount(() => {
        if (svgRef) {
            const ro = new ResizeObserver(entries => {
                for (const entry of entries) {
                    setMeasuredWidth(entry.contentRect.width);
                }
            });
            ro.observe(svgRef);
            onCleanup(() => ro.disconnect());
        }
    });

    const numericWidth = createMemo(() =>
        typeof props.width === "number" ? props.width : measuredWidth()
    );

    // Compute spike heights normalized to the max value
    const spikes = createMemo(() => {
        const values = totalSignatureCount().slice(0, 200) || [];
        if (!values.length) return [];
        const maxValue = Math.max(...values, 1);
        return values.map(v => (v / maxValue) * height);
    });

    const spikeWidth = createMemo(
        () => (spikes().length ? numericWidth() / spikes().length : DEFAULT_SPIKE_WIDTH)
    );

    const points = createMemo(() =>
        spikes()
            .map((spike, i) => {
                const x = i * spikeWidth();
                const y = height - spike;
                return `${x},${y}`;
            })
            .join(" ")
    );

    return (
        <>
            <Show when={points() === ''}>
                {' '}
            </Show>
            <Show when={points() !== ''}>
                <svg
                    ref={svgRef}
                    width={props.width ?? "100%"}
                    height={height}
                    class={styles["graph-container"]}
                >
                    <polyline
                        points={points()}
                        fill="none"
                        stroke={color}
                        stroke-width="2"
                    />
                </svg>
            </Show>
        </>
    );
}
