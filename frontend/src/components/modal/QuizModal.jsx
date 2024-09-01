import React, { useState} from "react";
import { toast } from "react-hot-toast";
import styles from "./QuizModal.module.css";

const QuizModal = ({onClose, onNext}) => {
  const [quizType, setQuizType] = useState("");
  const [quizName, setQuizName] = useState("");

  const handleContinue = () => {
    if (!quizType) {
      toast.error("Please select a quiz type before continuing."); 
      return;
    }
    onNext(quizType, quizName);
  };

  return (
    <>
      <div className={styles.modalOverlay}>
        <div className={styles.modalContent}>
          <input
            type="text"
            placeholder="Quiz Name"
            value={quizName}
            onChange={(e) => setQuizName(e.target.value)}
          />
          <div className={styles.quizType}>
            <h3>Quiz Type</h3>
            <button
              className={`${styles.qna} ${
                quizType === "Q&A" ? styles.selected : ""
              }`}
              onClick={() => setQuizType("Q&A")}
            >
              Q & A
            </button>
            <button
              className={`${styles.poll} ${
                quizType === "Poll" ? styles.selected : ""
              }`}
              onClick={() => setQuizType("Poll")}
            >
              Poll Type
            </button>
          </div>
          <div className={styles.modalActions}>
            <button className={styles.cancelButton} onClick={onClose}>
              Cancel
            </button>
            <button className={styles.continueButton} onClick={handleContinue}>
              Continue
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default QuizModal;
