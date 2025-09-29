import { createSignal } from "solid-js";
import { makePersisted } from "@solid-primitives/storage";
import { PETITION_ID } from "./petition.store";

const MAX_ENTRIES = 1000;

let store: ReturnType<typeof createSignatureStoreInternal> | null = null;

function createSignatureStoreInternal() {
    const [totalSignatureCount, setTotalSignatureCount] = makePersisted(
        createSignal<number[]>([]),
        {
            name: "petition-totalSignatureCount-" + PETITION_ID,
            storage: localStorage,
            serialize: JSON.stringify,
            deserialize: (v) => {
                const parsed = JSON.parse(v);
                return Array.isArray(parsed) ? parsed : [];
            },
        }
    );

    const [previousTotal, setPreviousTotal] = makePersisted(
        createSignal<number>(0),
        {
            name: "petition-previousTotal-" + PETITION_ID,
            storage: localStorage,
            serialize: JSON.stringify,
            deserialize: (v) => {
                const parsed = JSON.parse(v);
                return typeof parsed === "number" ? parsed : 0;
            },
        }
    );

    function addSignature(total: number) {
        if (previousTotal() === 0) {
            setPreviousTotal(total);
            return; // skip first spike
        }
        const delta = total - previousTotal();
        setPreviousTotal(total);
        setTotalSignatureCount([
            ...totalSignatureCount().slice(-MAX_ENTRIES + 1),
            delta,
        ]);
    }

    return { totalSignatureCount, setTotalSignatureCount, previousTotal, addSignature };
}

export function getSignatureStore() {
    if (!store) store = createSignatureStoreInternal();
    return store;
}
