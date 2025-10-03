import styles from "./App.module.scss";
import { createMemo, Show } from "solid-js";
import { petitionMeta } from "./stores/petition.store";
import PetitionMap from "./components/PetitionMap";
import Ticker from "./components/Ticker";
import PetitionTitle from "./components/PetitionTitle";
import Carousel from "./components/Carousel";
import DetailsCarousel from "./DetailsCarousel";
import PetitionLink from "./components/PetitionLink";
import ThresholdProgressBar from "./components/ThresholdProgressBar";

export default function App() {
  const ready = createMemo(() => petitionMeta.action);

  const govResponse = createMemo(() => petitionMeta.government_response);
  const hasGovResponse = createMemo(() => !!govResponse()?.created_at);

  return (
    <Show when={ready}>
      <main class={styles.main}>
        <div class={styles.overlay}>

          <PetitionTitle />

          <Show when={hasGovResponse()}>
            <Carousel intervalMs={10_000}>
              <article class="card">
                <h5 class="small-padding">Government Response</h5>
                <ThresholdProgressBar type="GOVERNMENT_RESPONSE" />
                <p class="small-padding">
                  <strong>{govResponse()?.summary}</strong>
                </p>
                <p class="small-padding">
                  {govResponse()?.details}
                </p>
              </article>

              <DetailsCarousel />
            </Carousel>
          </Show>

          <Show when={!hasGovResponse()}>
            <DetailsCarousel />
          </Show>


          <div style="display: flex; width: 100%; margin-top: 1em; background-color: rgb(9, 9, 194); ">
            <PetitionLink />
            <Ticker />
          </div>
        </div >

        <PetitionMap />

      </main >
    </Show >
  );
};
