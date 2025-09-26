import styles from "./PetitionLink.module.scss";
import { PETITION_ID } from "../petitionStore";
import Flag from "./Flag";
export default function PetitionLink() {
    return (
        <div class={styles.sign}>
            <h2 class="padding">
                <Flag />
                <span>
                    Sign at <a class="left-margin small-margin" href="https://petition.parliament.uk/petitions/{PETITION_ID}/signatures/new">
                        petition.parliament.uk/petitions/{PETITION_ID}
                    </a>
                </span>
            </h2>
        </div >
    );
}