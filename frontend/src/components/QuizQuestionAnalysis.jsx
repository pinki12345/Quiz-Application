import React, { useEffect, useState } from "react";
import axios from "axios";
import styles from "./QuizQuestionAnalysis.module.css";
import { useParams } from "react-router-dom";
import { formatDate } from "../utils/dateUtils";
import Loader from "./Loader";
import { toast } from "react-hot-toast";
import { useDispatch } from "react-redux";
import { setLoading } from "../actions";
import { endpoints } from "../services/apis";

const QuizQuestionAnalysis = () => {
  const dispatch = useDispatch();
  const { quizId } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchQuizData = async () => {
      const toastId = toast.loading("Fetching quiz data...");
      dispatch(setLoading(true));
      try {
        const response = await axios.get(endpoints.GET_QUIZ_BY_ID_API(quizId));
        setData(response.data.quiz);
      } catch (err) {
        setError("Failed to fetch quiz data");
        toast.error("Failed to fetch quiz data");
        console.error("Error fetching quiz data:", err);
      } finally {
        toast.dismiss(toastId);
        dispatch(setLoading(false));
      }
    };
    fetchQuizData();
  }, [quizId]);

  if (!data) {
    return <Loader />;
  }

  return (
    <div className={styles.container}>
      <div className={styles.headerContainer}>
        <h2 className={styles.heading}>
          {data.quizType === "Poll"
            ? "Poll Analysis"
            : "Quiz Question Analysis"}
        </h2>
        <div className={styles.metadata}>
          <div>
            Created on:{" "}
            {data.createdAt ? formatDate(data.createdAt) : "Loading..."}
          </div>
          <div>Impressions: {data.impressions || "N/A"}</div>
        </div>
      </div>
      {error && <div className={styles.error}>{error}</div>}
      <div className={styles.questionsWrapper}>
        {data.quizType === "Poll" ? (
          <div>
            {data.questions && data.questions.length > 0 ? (
              data.questions.map((question, index) => (
                <div key={index} className={styles.questionBlock}>
                  <h3>
                    Q.{index + 1} {question.questionText}
                  </h3>
                  <div className={styles.statsContainer}>
                    {question.options.map((option, index) => (
                      <div className={styles.statBox} key={index}>
                        <div className={styles.optionVotes}>{option.votes}</div>
                        <div className={styles.optionText}>
                          Option {index + 1}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div>No questions available</div>
            )}
          </div>
        ) : (
          <div>
            {data.questions && data.questions.length > 0 ? (
              data.questions.map((question, index) => (
                <div key={index} className={styles.questionBlock}>
                  <h3>
                    Q.{index + 1} {question.questionText}
                  </h3>
                  <div className={styles.statsContainer}>
                    <div className={styles.statBox}>
                      <div className={styles.number}>{question.attempts}</div>
                      <div>people Attempted the question</div>
                    </div>
                    <div className={styles.statBox}>
                      <div className={styles.number}>
                        {question.correctAnswers}
                      </div>
                      <div>people Answered Correctly</div>
                    </div>
                    <div className={styles.statBox}>
                      <div className={styles.number}>
                        {question.incorrectAnswers}
                      </div>
                      <div>people Answered Incorrectly</div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div>No questions available</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizQuestionAnalysis;
