import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import styles from "./QuizInterface.module.css";
import Loader from "./Loader";
import { toast } from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { setLoading } from "../actions";
import { endpoints } from "../services/apis";

const QuizInterface = () => {
  const dispatch = useDispatch();
  const { id } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const isLoading = useSelector((state) => state.isLoading);
  const token = useSelector((state) => state.token) || localStorage.getItem('token');
  
  useEffect(() => {
    const incrementImpression = async () => {
      dispatch(setLoading(true));
      try {
        const response = await axios.get(endpoints.INCREMENT_IMPRESSION_API(id), {
        });
        console.log('Increment Impression Response:_________');
      } catch (err) {
        console.error("Error incrementing impression:", err);
        toast.error("Failed to increment impression", {
          position: "top-right",
        });
      } finally {
        dispatch(setLoading(false));
      }
    };
    incrementImpression();
  }, [id]);

  useEffect(() => {
    const fetchQuiz = async () => {
      dispatch(setLoading(true));
      try {
        const response = await axios.get(endpoints.GET_QUIZ_BY_ID_API(id));
        setQuiz(response.data.quiz);
        setLoading(false);
        setCurrentQuestionIndex(0);
         
        if (response.data.quiz.quizType === "Q&A") {
          const initialTimeLimit =
            response.data.quiz.questions[0].timeLimit || 0;
          setTimeLeft(initialTimeLimit);
        }
      } catch (err) {
        console.error("Error fetching quiz:", err);
        toast.error("Failed to fetch quiz", {
          position: "top-right",
        });
      } finally {
        dispatch(setLoading(false));
      }
    };
    fetchQuiz();
  }, [id]);

  useEffect(() => {
    if (quiz?.quizType === "Q&A" && timeLeft > 0) {
      const timer = setTimeout(
        () => setTimeLeft((prevTime) => prevTime - 1),
        1000
      );
      return () => clearTimeout(timer);
    } else if (quiz?.quizType === "Q&A" && timeLeft === 0) {
      handleNextQuestion();
    }
  }, [timeLeft, quiz]);

  useEffect(() => {
    if (quiz && quiz.questions.length > 0 && quiz.quizType === "Q&A") {
      const newTimeLimit = quiz.questions[currentQuestionIndex].timeLimit || 0;
      setTimeLeft(newTimeLimit);
    }
  }, [currentQuestionIndex, quiz]);

  const handleOptionClick = (optionIndex) => {
    if (quiz) {
      const currentQuestionId = quiz.questions[currentQuestionIndex]._id;

      if (selectedOption === optionIndex) {
        setSelectedOption(null);
        const updatedResponses = responses.filter(
          (response) => response.questionId !== currentQuestionId
        );
        setResponses(updatedResponses);
      } else {
        setSelectedOption(optionIndex);

        const updatedResponses = [...responses];
        if (quiz.quizType === "Q&A") {
          const isCorrect =
            quiz.questions[currentQuestionIndex].options[optionIndex].isCorrect;
          updatedResponses[currentQuestionIndex] = {
            questionId: currentQuestionId,
            isCorrect: isCorrect,
          };
        } else if (quiz.quizType === "Poll") {
          const selectedOptionId =
            quiz.questions[currentQuestionIndex].options[optionIndex]._id;
          updatedResponses[currentQuestionIndex] = {
            questionId: currentQuestionId,
            selectedOptionId: selectedOptionId,
          };
        }
        setResponses(updatedResponses);
      }
    }
  };

  useEffect(() => {
    if (quiz) {
      setCurrentQuestionIndex(0);
      setSelectedOption(null);
      setResponses([]);
      if (quiz.quizType === "Q&A" && quiz.questions[0].timeLimit) {
        setTimeLeft(quiz.questions[0].timeLimit);
      }
    }
  }, [quiz]);

  const handleNextQuestion = () => {
    if (!quiz) return;
    const updatedResponses = [...responses];
    const currentQuestionId = quiz.questions[currentQuestionIndex]._id;
    if (selectedOption !== null) {
      if (quiz.quizType === "Q&A") {
        const isCorrect =
          quiz.questions[currentQuestionIndex].options[selectedOption]
            .isCorrect;
        updatedResponses[currentQuestionIndex] = {
          questionId: currentQuestionId,
          isCorrect: isCorrect,
        };
      } else if (quiz.quizType === "Poll") {
        const selectedOptionId =
          quiz.questions[currentQuestionIndex].options[selectedOption]._id;
        updatedResponses[currentQuestionIndex] = {
          questionId: currentQuestionId,
          selectedOptionId: selectedOptionId,
        };
      }
    } else {
      updatedResponses[currentQuestionIndex] = null;
    }
    setResponses(updatedResponses);
    if (currentQuestionIndex < quiz.questions.length - 1) {
      const nextQuestionIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextQuestionIndex);
      setSelectedOption(null);
      if (quiz.quizType === "Q&A") {
        const newTimeLimit = quiz.questions[nextQuestionIndex].timeLimit || 0;
        setTimeLeft(newTimeLimit);
      }
    } else {
      if (quiz.quizType === "Q&A" || quiz.quizType === "Poll") {
        handleSubmitQuiz();
      }
    }
  };

  const handleSubmitQuiz = async () => {
    const toastId = toast.loading("Submitting quiz...");
    dispatch(setLoading(true));
    try {
      const responsePayload = {
        quizId: id,
        responses: responses.filter((response) => response !== null),
      };
      const response = await axios.post(
        endpoints.HANDLE_QUIZ_RESPONSE_API,
        responsePayload
      );
      if (quiz.quizType === "Q&A") {
        const correctAnswersCount = responses.filter(
          (response) => response && response.isCorrect
        ).length;
        const totalQuestions = quiz.questions.length;
        toast.success("Quiz submitted successfully!", {
          position: "top-right",
        });
        navigate("/feedback", {
          state: { score: correctAnswersCount, totalQuestions },
        });
      } else if (quiz.quizType === "Poll") {
        toast.success("Poll submitted successfully!", {
          position: "top-right",
        });
        navigate("/pollFeedback");
      }
    } catch (err) {
      console.error("Error submitting quiz:", err);
      toast.error("Failed to submit quiz", {
        position: "top-right",
      });
    } finally {
      toast.dismiss(toastId);
      dispatch(setLoading(false));
    }
  };

  if (isLoading) return <Loader />;
  if (!quiz || !quiz.questions || quiz.questions.length === 0) {
    return <div>No questions available.</div>;
  }
  const currentQuestion = quiz.questions[currentQuestionIndex];

  return (
    <div className={styles.quizContainerbody}>
      <div className={styles.quizContainer}>
        <div className={styles.quizHeader}>
          <div className={styles.quizProgress}>
            0{currentQuestionIndex + 1}/0{quiz.questions.length}
          </div>
          {quiz.quizType === "Q&A" && currentQuestion.timeLimit > 0 && (
            <div className={styles.quizTimer}>{timeLeft} sec</div>
          )}
        </div>

        <div className={styles.quizQuestions}>
          <div key={currentQuestion._id} className={styles.quizQuestion}>
            <p>{currentQuestion.questionText}</p>
            <div className={styles.quizOptions}>
              {currentQuestion.options.map((option, optionIndex) => (
                <button
                  key={option._id}
                  className={`${styles.quizOption} ${
                    selectedOption === optionIndex
                      ? styles.quizOptionSelected
                      : ""
                  }`}
                  onClick={() => handleOptionClick(optionIndex)}
                >
                  {option.type === "Text" && (
                    <div className={styles.optionText}>{option.text}</div>
                  )}
                  {option.type === "Image URL" && (
                    <img
                      src={option.imageUrl}
                      alt={`Option ${optionIndex + 1}`}
                      className={styles.quizOptionOnlyImage}
                    />
                  )}
                  {option.type === "Text & Image URL" && (
                    <>
                      <div className={styles.quizOptionText}>{option.text}</div>
                      <img
                        src={option.imageUrl}
                        alt={`Option ${optionIndex + 1}`}
                        className={styles.quizOptionImage}
                      />
                    </>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
        <button className={styles.quizNextButton} onClick={handleNextQuestion}>
          {currentQuestionIndex < quiz.questions.length - 1 ? "NEXT" : "SUBMIT"}
        </button>
      </div>
    </div>
  );
};

export default QuizInterface;
