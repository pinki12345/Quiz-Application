import React from "react";
import styles from "./PollFeedback.module.css";

const PollFeedback = () => {
  return (
    <div className={styles.pollContainerbody}>
      <div className={styles.pollContainer}>
        <div className={styles.pollResponse}>
          <p>Thank you</p>
          <p>for participating in</p>
          <p>the Poll</p>
        </div>
      </div>
    </div>
  );
};

export default PollFeedback;
