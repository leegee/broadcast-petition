import styles from "./App.module.scss";
import BiggestChange from "./components/BiggestChange";
import PetitionMap from "./components/PetitionMap";
import PetitionMeta from "./components/PetitionMeta";
import PetitionLink from "./components/PetitionLink";
import TopSignatures from "./components/TopSignatures";

export default function App() {
  return (
    <main class={styles.main}>
      <div class={styles.overlay}>
        <PetitionMeta />
        <TopSignatures />
        <BiggestChange />
        <PetitionLink />
      </div>
      <PetitionMap />
    </main>
  );
};
