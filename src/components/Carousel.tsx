import { createSignal, JSX, onCleanup, onMount, createMemo } from "solid-js";

const INTERVAL_MS = 10_000;

interface FactsProps {
    children: JSX.Element[];
    intervalMs?: number;
}

export default function Carousel(props: FactsProps) {
    const [childIndex, setChildIndex] = createSignal(0);
    let intervalId: number | null = null;

    function selectNext() {
        const cId = childIndex() + 1;
        setChildIndex(cId < props.children.length ? cId : 0);
    }

    onMount(() => {
        intervalId = setInterval(selectNext, props.intervalMs ?? INTERVAL_MS);
    });

    onCleanup(() => {
        if (intervalId) clearInterval(intervalId);
    });

    const currentChild = createMemo(() => props.children[childIndex()]);

    return <>{currentChild()}</>;
}
