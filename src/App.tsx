import styles from "./App.module.scss";
import { createMemo, Show } from "solid-js";
import LatestChange from "./components/LatestChange";
import PetitionMap from "./components/PetitionMap";
import PetitionMeta from "./components/PetitionMeta";
import PetitionLink from "./components/PetitionLink";
import TopSignatures from "./components/TopSignatures";
import Ticker from "./components/Ticker";
import TopRegions from "./components/TopRegions";
import ThresholdProgressBar from "./components/ThresholdProgressBar";
import { petitionMeta } from "./petitionStore";
import { SignatureMovingAverage } from "./components/SignatureMovingAverge";
import { SpikeGraph } from "./components/SpikeGraph";

export default function App() {
  const ready = createMemo(() => petitionMeta.action);

  return (
    <Show when={ready}>
      <main class={styles.main}>
        <div class={styles.overlay}>

          <PetitionMeta />


          <Show when={petitionMeta.government_response?.summary}>
            <article>
              <strong>{petitionMeta.government_response?.summary}</strong>
              {/* <p>{petitionMeta.government_response?.details}</p> */}
            </article>
          </Show>

          <Show when={!petitionMeta.government_response?.summary}>
            <div style="margin-top:0;  gap: 0; width: 100%; display: flex; flex-direction:row; justify-content: space-between; align-items: center;">
              <div style="width: 25%; height: 100%; padding: 1em; text-align: center; display: flex; flex-direction:column; gap: 0.8em; align-items: center; justify-content: space-around">
                <ThresholdProgressBar type="GOVERNMENT_RESPONSE" />
                <ThresholdProgressBar type="DEBATE" />
              </div>
              <div style="width: 20%; border-radius: 1em; height: 100%">
                <div style=" display: flex; flex-direction: column; justify-content: center; height: 100%" class="max">
                  <SignatureMovingAverage mode="minute" />
                  <SignatureMovingAverage />
                  <SignatureMovingAverage mode="day" />
                </div>
                <SpikeGraph />
              </div>
              <div style="width: 50%; text-align: center">
                <LatestChange />
              </div>
            </div>
          </Show>

          <div style="display: flex; width: 100%; background-color: rgb(9, 9, 194); ">
            <PetitionLink />
            <Ticker />
          </div>

          <div style="width: 100%; display: flex; flex-direction:row; justify-content: space-between; align-items: flex-start;">
            <div style="width: 50%; display: flex;    justify-content: center; flex-direction: column; align-items: center;">
              <TopRegions />
            </div>
            <div style="width: 50%; display: flex;    justify-content: center; flex-direction: column; align-items: center;">
              <TopSignatures />
            </div>
          </div>
        </div >

        <PetitionMap />

      </main>
    </Show >
  );
};
