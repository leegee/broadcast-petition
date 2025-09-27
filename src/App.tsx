import styles from "./App.module.scss";
import BiggestChange from "./components/BiggestChange";
import PetitionMap from "./components/PetitionMap";
import PetitionMeta from "./components/PetitionMeta";
import PetitionLink from "./components/PetitionLink";
import TopSignatures from "./components/TopSignatures";
import RotatingConstituencies from "./components/RotatingConstituencies";
import Ticker from "./components/Ticker";

export default function App() {
  return (
    <main class={styles.main}>
      <div class={styles.overlay}>
        <PetitionMeta />
        <BiggestChange />
        <TopSignatures />
        {/* <PetitionLink /> */}
        <Ticker />
      </div>
      <PetitionMap />
    </main>
  );
};
