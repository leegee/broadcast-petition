import styles from "./App.module.scss";
import BiggestChange from "./components/BiggestChange";
import PetitionMap from "./components/PetitionMap";
import PetitionMeta from "./components/PetitionMeta";
import PetitionLink from "./components/PetitionLink";
import TopSignatures from "./components/TopSignatures";
import RotatingConstituencies from "./components/RotatingConstituencies";
import Ticker from "./components/Ticker";
import TopRegions from "./components/TopRegions";

export default function App() {
  return (
    <main class={styles.main}>
      <div class={styles.overlay}>
        <PetitionMeta />
        <BiggestChange />

        <div style="width: 100%; display: flex; flex-direction:row; justify-content: space-between; align-items: flex-start;">
          <div style="width: 50%"> <TopSignatures /> </div>
          <div style="width: 50%"> <TopRegions /> </div>
        </div>

        <PetitionLink />
        <Ticker />
      </div>
      <PetitionMap />
    </main>
  );
};
