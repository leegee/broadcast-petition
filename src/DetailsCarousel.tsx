import { createMemo, Show } from "solid-js";
import { petitionMeta } from "./stores/petition.store";
import Carousel from "./components/Carousel";
import LatestChange from "./components/LatestChange";
import PetitionMeta from "./components/PetitionMeta";
import SignatureMovingAverage from "./components/SignatureMovingAverge";
import SpikeGraph from "./components/SpikeGraph";
import ThresholdProgressBar from "./components/ThresholdProgressBar";
import TopRegions from "./components/TopRegions";
import TopSignatures from "./components/TopSignatures";

export default function DetailsCarousel() {
    const govResponse = createMemo(() => petitionMeta.government_response);
    const hasGovResponse = createMemo(() => !!govResponse()?.created_at);

    return <>
        <PetitionMeta />

        <div class="row top-align tiny-padding">
            <div class="s-6 max">
                <TopRegions />
            </div>
            <div class="s-6 max">
                <TopSignatures />
            </div>
        </div>

        <div class="row">
            <div class="s-12 max">
                <Carousel intervalMs={5_000}>
                    <article class="max padding">
                        <p class="no-padding no-margin" style="position: absolute; top:0; left:2em; opacity:0.75">Minute-by-minute</p>
                        <SpikeGraph />
                    </article>
                    <article class="max">
                        <ThresholdProgressBar type="GOVERNMENT_RESPONSE" />
                        <ThresholdProgressBar type="DEBATE" />
                    </article>
                    <article class="max padding">
                        <p class="no-padding no-margin" style="position: absolute; top:0; left:2em; opacity:0.75">Minute-by-minute</p>
                        <SpikeGraph />
                    </article>
                    <LatestChange />
                    <SignatureMovingAverage mode="minute" />
                    <SignatureMovingAverage />
                    <SignatureMovingAverage mode="day" />
                </Carousel>
            </div>
        </div>

    </>
};