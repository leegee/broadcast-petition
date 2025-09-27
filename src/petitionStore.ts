import { createStore } from "solid-js/store";
import { createSignal } from "solid-js";

export const PETITION_ID = 730194;

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

export const [petitionMeta, setPetitionMeta] = createStore<Partial<PetitionMeta>>({});

export const [countsStore, setCountsStore] = createStore<
    Record<string, { name: string; count: number }>
>({});

export const [countryCountsStore, setCountryCountsStore] = createStore<
    Record<string, { name: string; count: number }>
>({});

export interface BiggestChange {
    code: string;
    name: string;
    diff: number;
    old: number;
    new: number;
    timestamp: Date;
}
export const [biggestChange, setBiggestChange] = createSignal<BiggestChange | null>(null);

export const [loading, setLoading] = createSignal(true);
export const [error, setError] = createSignal<string | null>(null);

export async function fetchPetitionData() {
    setLoading(true);
    setError(null);

    try {
        const res = await fetch(`https://petition.parliament.uk/petitions/${PETITION_ID}.json`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        const meta = data.data.attributes as PetitionMeta & {
            signatures_by_constituency: { ons_code: string; name: string; signature_count: number }[];
            signatures_by_country: { code: string; name: string; signature_count: number }[];
        };

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

        const newCounts: Record<string, { name: string; count: number }> = {};
        meta.signatures_by_constituency.forEach((c) => {
            newCounts[c.ons_code.toUpperCase()] = { name: c.name, count: c.signature_count };
        });

        const newCountryCounts: Record<string, { name: string; count: number }> = {};
        meta.signatures_by_country.forEach(c => {
            newCountryCounts[c.code] = { name: c.name, count: c.signature_count };
        });
        setCountryCountsStore(newCountryCounts);

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

        setLoading(false);
        return { meta, counts: newCounts };
    }

    catch (err: any) {
        setError(err.message || "Unknown error");
        setLoading(false);
        return null;
    }
}
