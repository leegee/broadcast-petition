import styles from "./App.module.scss";
import BiggestChange from "./components/BiggestChange";
import PetitionMap from "./components/PetitionMap";
import PetitionMeta from "./components/PetitionMeta";
import PetitionLink from "./components/PetitionLink";
import TopSignatures from "./components/TopSignatures";
import RotatingConstituencies from "./components/RotatingConstituencies";

export default function App() {
  return (
    <main class={styles.main}>
      <div class={styles.overlay}>
        <PetitionMeta />
        <BiggestChange />
        <TopSignatures />
        {/* <div class="grid">
          <div class="s6">
            <TopSignatures />
          </div>
          <div class="s6">
            <RotatingConstituencies />
          </div>
        </div> */}
        <PetitionLink />
      </div>
      <PetitionMap />
    </main>
  );
};
