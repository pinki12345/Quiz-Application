import React from "react";
import styles from "./QuizFeedback.module.css";
import img from "../assets/winningCup.png"
import { useLocation } from "react-router-dom";


const QuizFeedback = () => {
  
  const location = useLocation();
  const { score, totalQuestions } = location.state || { score: 0, totalQuestions: 0 };
  const formattedScore = `${score.toString().padStart(2, '0')}/${totalQuestions.toString().padStart(2, '0')}`;

  return (
    <div className={styles.quizContainerbody}>
      <div className={styles.quizContainer}>
        <p className={styles.quizHeader}>Congrats Quiz is completed</p>
        <img src={img} className={styles.quizCup}/>
        <p className={styles.quizResult}>Your Score is <span className={styles.quizScore}>{formattedScore}</span></p>
      </div>
    </div>
  );
};


export default QuizFeedback;

