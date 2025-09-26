import { createStore } from "solid-js/store";
import { createSignal } from "solid-js";

export const PETITION_ID = 730194;

// Type for petition metadata
export interface PetitionMeta {
    action: string;
    background: string;
    additional_details: string;
    created_at: string;
    updated_at: string;
    closed_at: string | null;
    state: string;
    signature_count: number;
}

// Store for metadata
export const [petitionMeta, setPetitionMeta] = createStore<Partial<PetitionMeta>>({});

// Store for constituency counts
export const [countsStore, setCountsStore] = createStore<
    Record<string, { name: string; count: number }>
>({});

// Type for biggest change
export interface BiggestChange {
    code: string;
    name: string;
    diff: number;
    old: number;
    new: number;
    timestamp: Date;
}

// Biggest change signal
export const [biggestChange, setBiggestChange] = createSignal<BiggestChange | null>(null);

// Unified fetch
export async function fetchPetitionData() {
    const res = await fetch(
        `https://petition.parliament.uk/petitions/${PETITION_ID}.json`
    );
    const data = await res.json();

    const meta = data.data.attributes as PetitionMeta & {
        signatures_by_constituency: { ons_code: string; name: string; signature_count: number }[];
    };

    // Extract only the fields we care about
    setPetitionMeta({
        action: meta.action,
        background: meta.background,
        additional_details: meta.additional_details,
        created_at: meta.created_at,
        updated_at: meta.updated_at,
        closed_at: meta.closed_at,
        state: meta.state,
        signature_count: meta.signature_count,
    });

    // Build constituency counts
    const newCounts: Record<string, { name: string; count: number }> = {};
    meta.signatures_by_constituency.forEach((c) => {
        newCounts[c.ons_code.toUpperCase()] = {
            name: c.name,
            count: c.signature_count,
        };
    });

    // Update biggest change
    let maxDiff = 0;
    let changed: BiggestChange | null = null;
    for (const [code, { name, count: newVal }] of Object.entries(newCounts)) {
        const oldVal = countsStore[code]?.count ?? 0;
        const diff = newVal - oldVal;
        if (Math.abs(diff) > Math.abs(maxDiff)) {
            maxDiff = diff;
            changed = { code, name, diff, old: oldVal, new: newVal, timestamp: new Date() };
        }
    }
    if (changed) setBiggestChange(changed);

    setCountsStore(newCounts);

    return { meta, counts: newCounts };
}
