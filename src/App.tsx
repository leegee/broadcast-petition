import styles from "./App.module.scss";
import { createMemo, Show } from "solid-js";
import { petitionMeta } from "./stores/petition.store";
import LatestChange from "./components/LatestChange";
import PetitionMap from "./components/PetitionMap";
import PetitionMeta from "./components/PetitionMeta";
import PetitionLink from "./components/PetitionLink";
import TopSignatures from "./components/TopSignatures";
import Ticker from "./components/Ticker";
import TopRegions from "./components/TopRegions";
import ThresholdProgressBar from "./components/ThresholdProgressBar";
import SignatureMovingAverage from "./components/SignatureMovingAverge";
import Carousel from "./components/Carousel";
import SpikeGraph from "./components/SpikeGraph";

export default function App() {
  const ready = createMemo(() => petitionMeta.action);

  const govResponse = createMemo(() => petitionMeta.government_response);
  const hasGovResponse = createMemo(() => !!govResponse()?.created_at);

  return (
    <Show when={ready}>
      <main class={styles.main}>
        <div class={styles.overlay}>

          <PetitionMeta />

          <div class="row">
            <div class="s-12 max">
              <Carousel intervalMs={5_000}>
                <article class="max padding">
                  <p class="no-padding no-margin" style="position: absolute; top:0; left:2em; opacity:0.75">Minute-by-minute</p>
                  <SpikeGraph />
                </article>
                <article class="max">
                  <Show when={hasGovResponse()}>
                    <strong>{govResponse()?.summary}</strong>
                    <strong>{govResponse()?.details}</strong>
                  </Show>
                  <Show when={!hasGovResponse()}>
                    <ThresholdProgressBar type="GOVERNMENT_RESPONSE" />
                    <ThresholdProgressBar type="DEBATE" />
                  </Show>
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

          <div class="row top-align tiny-padding">
            <div class="s-6 max">
              <TopRegions />
            </div>
            <div class="s-6 max">
              <TopSignatures />
            </div>
          </div>

          <div style="display: flex; width: 100%; margin-top: 1em; background-color: rgb(9, 9, 194); ">
            <PetitionLink />
            <Ticker />
          </div>
        </div >

        <PetitionMap />

      </main>
    </Show >
  );
};
