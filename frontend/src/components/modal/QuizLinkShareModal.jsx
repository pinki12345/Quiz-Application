import React from "react";
import { toast } from "react-hot-toast";
import styles from "./QuizLinkShareModal.module.css";

const QuizLinkShareModal = ({ quizLink, onClose }) => {
  const handleCopyLink = () => {
    navigator.clipboard
      .writeText(quizLink)
      .then(() => {
        toast.success("Link copied to clipboard!");
      })
      .catch((error) => {
        console.error("Failed to copy link:", error);
        toast.error("Failed to copy link!");
      });
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <button onClick={onClose} className={styles.closeButton}>
            X
          </button>
        </div>
        <div className={styles.modalHeading}>
        <p>Congrats! Your Quiz is </p>
        <p>Published!</p>
        </div>
        <input
          type="text"
          className={styles.linkInput}
          value={quizLink}
          readOnly
        />
        <button className={styles.shareButton} onClick={handleCopyLink}>
          Share
        </button>
      </div>
    </div>
  );
};

export default QuizLinkShareModal;
