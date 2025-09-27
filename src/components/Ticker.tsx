import { createMemo, onMount, onCleanup } from "solid-js";
import { countsStore } from "../petitionStore";
import styles from "./Ticker.module.scss";

interface TickerProps {
    speed?: number; // pixels per second
}

export default function Ticker({ speed = 50 }: TickerProps) {
    let containerRef: HTMLDivElement | null = null;
    let innerRef: HTMLDivElement | null = null;

    let innerWidth = 0;
    let x = 0;
    let animationFrameId: number | null = null;
    let lastTime = 0;

    const items = createMemo(() =>
        Object.entries(countsStore)
            .map(([code, { name, count }]) => ({ code, name, count }))
            .sort((a, b) => b.count - a.count)
    );

    const step = (time: number) => {
        if (!lastTime) lastTime = time;
        const delta = (time - lastTime) / 1000;
        lastTime = time;

        if (innerRef && innerWidth === 0) {
            innerWidth = innerRef.scrollWidth;
        }

        x -= speed * delta;

        if (innerWidth && x <= -innerWidth) {
            x = containerRef?.offsetWidth ?? 0;
        }

        if (innerRef) innerRef.style.transform = `translateX(${x}px)`;

        animationFrameId = requestAnimationFrame(step);
    };

    onMount(() => {
        animationFrameId = requestAnimationFrame(step);

        const resizeObserver = new ResizeObserver(() => {
            innerWidth = 0; // recalc width on resize
        });
        if (innerRef) resizeObserver.observe(innerRef);
    });

    onCleanup(() => {
        if (animationFrameId !== null) cancelAnimationFrame(animationFrameId);
    });

    return (
        <div ref={containerRef!} class={styles.tickerContainer}>
            <div ref={innerRef!} class={styles.tickerInner}>
                {items().map((i) => (
                    <span class={styles.item} key={i.code}>
                        <strong>{i.name}</strong>: {i.count.toLocaleString()}
                    </span>
                ))}
            </div>
        </div>
    );
}
