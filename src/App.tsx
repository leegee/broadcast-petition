import styles from "./App.module.scss";
import BiggestChange from "./components/BiggestChange";
import PetitionMap from "./components/PetitionMap";

export default function App() {
  return (
    <main class={styles.main}>
      <BiggestChange />
      <PetitionMap />
    </main>
  );
};
