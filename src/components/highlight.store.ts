// highlightStore.ts
import { createSignal } from "solid-js";

export const [highlightedFeatureId, setHighlightedFeatureId] = createSignal<string | null>(null);
