import { createSignal } from "solid-js";
import { makePersisted } from "@solid-primitives/storage";
import { PETITION_ID } from "./petitionStore";

const MAX_ENTRIES = 1_000;

// Persisted array of counts
export const [totalSignatureCount, setTotalSignatureCount] = makePersisted(
    createSignal<number[]>([]),
    {
        name: "petition-totalSignatureCount",
        storage: localStorage,
        serialize: JSON.stringify,
        deserialize: (v) => {
            const parsed = JSON.parse(v);
            return Array.isArray(parsed) ? parsed : [];
        }
    }
);

const [previousTotal, setPreviousTotal] = makePersisted(createSignal<number>(-1), {
    name: "petition-previousTotal",
    storage: localStorage,
    serialize: JSON.stringify,
    deserialize: (v) => {
        const parsed = JSON.parse(v);
        return typeof parsed === "number" ? parsed : 0;
    }
});

export function addSignature(total: number) {
    const delta = total - previousTotal();
    setPreviousTotal(total);

    console.info('DELTA', delta);
    console.info('before update', totalSignatureCount());

    setTotalSignatureCount([
        ...totalSignatureCount().slice(-MAX_ENTRIES + 1),
        delta
    ]);

    console.info('after update', totalSignatureCount());
}
