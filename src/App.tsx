import styles from "./App.module.scss";
import BiggestChange from "./components/BiggestChange";
import PetitionMap from "./components/PetitionMap";
import PetitionMeta from "./components/PetitionMeta";

export default function App() {
  return (
    <main class={styles.main}>
      <div class={styles.overlay}>
        <PetitionMeta />
        <BiggestChange />
      </div>
      <PetitionMap />
    </main>
  );
};
