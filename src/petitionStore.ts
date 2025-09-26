import { createStore } from "solid-js/store";
import { createSignal } from "solid-js";

// Each entry stores both the constituency name and the count
export const [countsStore, setCountsStore] = createStore<
    Record<string, { name: string; count: number }>
>({});

export const [biggestChange, setBiggestChange] = createSignal<{
    code: string;
    name: string;
    diff: number;
    old: number;
    new: number;
} | null>(null);

export function updateCounts(
    newCounts: Record<string, { name: string; count: number }>
) {
    let maxDiff = 0;
    let changed:
        | { code: string; name: string; diff: number; old: number; new: number }
        | null = null;

    for (const [code, { name, count: newVal }] of Object.entries(newCounts)) {
        const oldVal = countsStore[code]?.count ?? 0;
        const diff = newVal - oldVal;
        if (Math.abs(diff) > Math.abs(maxDiff)) {
            maxDiff = diff;
            changed = { code, name, diff, old: oldVal, new: newVal };
        }
    }

    if (changed) {
        setBiggestChange(changed);
    }

    setCountsStore(newCounts);
}
