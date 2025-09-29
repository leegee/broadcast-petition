// from screen-capture home-broadcast
import styles from "./Ticker.module.scss";
import { createMemo, onMount, onCleanup } from "solid-js";
import { countryCountsStore, countsStore } from "../stores/petition.store";

interface TickerProps {
    speed?: number; // pixels per second
}

export default function Ticker({ speed = 300 }: TickerProps) {
    let containerRef: HTMLDivElement | null = null;
    let innerRef: HTMLDivElement | null = null;

    let innerWidth = 0;
    let x = 0;
    let animationFrameId: number | null = null;
    let lastTime = 0;

    const items = createMemo(() =>
        [
            ...Object.entries(countryCountsStore),
            ...Object.entries(countsStore),
        ]
            .map(([_code, { name, count }]) => ({ name, count }))
            .filter((i) => i.count > 0)
    );

    const step = (time: number) => {
        if (!lastTime) lastTime = time;
        const delta = (time - lastTime) / 1000;
        lastTime = time;

        if (innerRef && innerWidth === 0) {
            innerWidth = (innerRef as HTMLDivElement).scrollWidth;
        }

        x -= speed * delta;

        if (containerRef && innerWidth && x <= -innerWidth) {
            x = (containerRef as HTMLDivElement).offsetWidth ?? 0;
        }

        if (innerRef) (innerRef as HTMLDivElement).style.transform = `translateX(${x}px)`;

        animationFrameId = requestAnimationFrame(step);
    };

    onMount(() => {
        animationFrameId = requestAnimationFrame(step);

        const resizeObserver = new ResizeObserver(() => innerWidth = 0);
        if (innerRef) resizeObserver.observe(innerRef);
    });

    onCleanup(() => {
        if (animationFrameId !== null) cancelAnimationFrame(animationFrameId);
    });

    return (
        <div ref={containerRef!} class={styles.tickerContainer}>
            <div ref={innerRef!} class={styles.tickerInner}>
                {items().map((i) => (
                    <span class={styles.item}>
                        <strong>{i.name}</strong>: {i.count.toLocaleString()}
                    </span>
                ))}
            </div>
        </div>
    );
}
