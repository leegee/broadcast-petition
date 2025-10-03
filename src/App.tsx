import styles from "./App.module.scss";
import { createMemo, Show } from "solid-js";
import { petitionMeta } from "./stores/petition.store";
import PetitionMap from "./components/PetitionMap";
import Ticker from "./components/Ticker";
import PetitionTitle from "./components/PetitionTitle";
import Carousel from "./components/Carousel";
import DetailsCarousel from "./DetailsCarousel";
import PetitionLink from "./components/PetitionLink";

export default function App() {
  const ready = createMemo(() => petitionMeta.action);
  const govResponse = createMemo(() => petitionMeta.government_response);
  const hasGovResponse = createMemo(() => !!govResponse()?.created_at);
  const responseDate = createMemo(() => {
    const dateStr = petitionMeta.government_response_at;
    return dateStr ? new Date(dateStr) : null;
  });

  return (
    <Show when={ready}>
      <main class={styles.main}>
        <div class={styles.overlay}>

          <PetitionTitle />

          <Show when={hasGovResponse()}>
            <Carousel intervalMs={10_000}>
              <article class="card padding">
                <h5 class="center-align">Government Response</h5>
                <p class="center-align">
                  Debate on {responseDate()?.toLocaleDateString()} at {responseDate()?.toLocaleTimeString()}
                </p>
                <p class="center-align">
                  <strong>{govResponse()?.summary}</strong>
                </p>
                <p>
                  {govResponse()?.details}
                </p>
              </article>

              <DetailsCarousel />
            </Carousel>
          </Show>

          <Show when={!hasGovResponse()}>
            <DetailsCarousel />
          </Show>

          <footer class="screen-bottom">
            <PetitionLink />
            <Ticker />
          </footer>
        </div>

        <PetitionMap />

      </main>
    </Show>
  );
};
