import styles from "./App.module.scss";
import BiggestChange from "./components/BiggestChange";
import PetitionMap from "./components/PetitionMap";
import PetitionMeta from "./components/PetitionMeta";
import PetitionLink from "./components/PetitionLink";
import TopSignatures from "./components/TopSignatures";
import Ticker from "./components/Ticker";
import TopRegions from "./components/TopRegions";
import ThresholdProgressBar from "./components/ThresholdProgressBar";

export default function App() {
  return (
    <main class={styles.main}>
      <div class={styles.overlay}>
        <PetitionMeta />

        <div style="margin-top:0; margin: 1em; gap: 1em; width: 100%; display: flex; flex-direction:row; justify-content: space-between; align-items: center;">
          <div style="width: 50%; text-align: center">
            <ThresholdProgressBar type="GOVERNMENT_RESPONSE" />
            <ThresholdProgressBar type="DEBATE" />
          </div>
          <div style="width: 50%; text-align: center">
            <BiggestChange />
          </div>
        </div>

        <div style="width: 100%; display: flex; flex-direction:row; justify-content: space-between; align-items: flex-start;">
          <div style="width: 50%">
            <TopSignatures />
          </div>
          <div style="width: 50%">
            <TopRegions />
          </div>
        </div>
      </div >


      <div style="width: 100%; background-color: rgb(9, 9, 194); ">
        <div>
          <PetitionLink />
        </div>
        <div style="width: 60%">
          <Ticker />
        </div>
      </div>

      <PetitionMap />

    </main >
  );
};
