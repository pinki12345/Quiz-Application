import React, { useState, useEffect } from "react";
import axios from "axios";
import styles from "./QuizOrPollType.module.css";
import deleteIcon from "../../assets/deleteIcon.png";
import toast from "react-hot-toast";
import { useDispatch,useSelector } from "react-redux";
import { setLoading, fetchAllQuizzes } from "../../actions";
import { endpoints } from "../../services/apis";

const QuizOrPollType = ({
  quizType,
  quizName,
  onClose,
  onNext,
  quiz,
  CloseEdit,
  isEditMode = false,
}) => {
  const dispatch = useDispatch();
  const [questions, setQuestions] = useState([
    {
      id: 1,
      pollQuestion: "",
      options: [{ id: 1 }, { id: 2 }],
      optionType: "text",
      correctOptionId: null,
      ...(quizType === "Q&A" && { timeLimit: 0 }),
    },
  ]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const token = useSelector((state) => state.token);

  useEffect(() => {
    if (isEditMode && quiz) {
      const initialQuestions = quiz.questions.map((question, index) => {
        const correctOptionIndex =
          question.options.findIndex((option) => option.isCorrect)._id || null;
        const timeLimit = Array.isArray(question.timeLimit)
          ? question.timeLimit[0]
          : question.timeLimit;
        return {
          id: index + 1,
          pollQuestion: question.questionText || "",
          options: question.options.map((option, i) => ({
            id: i + 1,
            text: option.text || "",
            imageUrl: option.imageUrl || "",
            isCorrect: option.isCorrect || false,
          })),
          optionType:
            question.options[0]?.type === "Text & Image URL"
              ? "textImageURL"
              : question.options[0]?.type === "Image URL"
              ? "imageURL"
              : "text",
          correctOptionId: quiz.quizType === "Q&A" ? correctOptionIndex : null,
          ...(quizType === "Q&A" && { timeLimit: timeLimit }),
        };
      });
      setQuestions(initialQuestions);
    } else {
      setQuestions([
        {
          id: 1,
          pollQuestion: "",
          options: [
            { id: 1, text: "", imageUrl: "", isCorrect: false },
            { id: 2, text: "", imageUrl: "", isCorrect: false },
          ],
          optionType: "text",
          correctOptionId: quizType === "Q&A" ? null : undefined,
          timeLimit: quizType === "Q&A" ? 0 : undefined,
        },
      ]);
    }
  }, [quiz, isEditMode, quizType]);

  const currentQuestion = questions[currentQuestionIndex];

  const handleAddQuestion = () => {
    if (questions.length < 5) {
      setQuestions([
        ...questions,
        {
          id: questions.length + 1,
          pollQuestion: "",
          options: [{ id: 1 }, { id: 2 }],
          optionType: "text",
          correctOptionId: null,
          ...(quizType === "Q&A" && { timeLimit: 0 }),
        },
      ]);
      setCurrentQuestionIndex(questions.length);
    }
  };

  const handleRemoveQuestion = (id) => {
    setQuestions(questions.filter((question) => question.id !== id));
    setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1));
  };
  const handleRemoveOption = (id) => {
    setQuestions(
      questions.map((question, index) => {
        if (index === currentQuestionIndex) {
          return {
            ...question,
            options: question.options.filter((option) => option.id !== id),
          };
        }
        return question;
      })
    );
  };

  const handleAddOption = () => {
    if (currentQuestion.options.length < 4) {
      setQuestions(
        questions.map((question, index) => {
          if (index === currentQuestionIndex) {
            return {
              ...question,
              options: [
                ...question.options,
                { id: question.options.length + 1 },
              ],
            };
          }
          return question;
        })
      );
    }
  };

  const handleOptionTypeChange = (event) => {
    setQuestions(
      questions.map((question, index) => {
        if (index === currentQuestionIndex) {
          return { ...question, optionType: event.target.value };
        }
        return question;
      })
    );
  };

  const handleInputChange = (id, field, value) => {
    setQuestions(
      questions.map((question, index) => {
        if (index === currentQuestionIndex) {
          return {
            ...question,
            options: question.options.map((option) =>
              option.id === id ? { ...option, [field]: value } : option
            ),
          };
        }
        return question;
      })
    );
  };

  const handleOptionCorrectChange = (id) => {
    setQuestions(
      questions.map((question, index) => {
        if (index === currentQuestionIndex) {
          return {
            ...question,
            correctOptionId: id,
            options: question.options.map((option) => ({
              ...option,
              isCorrect: option.id === id,
            })),
          };
        }
        return question;
      })
    );
  };

  const handlePollQuestionChange = (value) => {
    setQuestions(
      questions.map((question, index) => {
        if (index === currentQuestionIndex) {
          return { ...question, pollQuestion: value };
        }
        return question;
      })
    );
  };

  const handleTimerChange = (value) => {
    if (quizType === "Q&A") {
      setQuestions(
        questions.map((question, index) => {
          if (index === currentQuestionIndex) {
            return { ...question, timeLimit: value };
          }
          return question;
        })
      );
    }
  };

  const validateQuizCreation = () => {
    const allQuizzesCreated = questions.every((question) => {
      for (const question of questions) {
        for (const option of question.options) {
          if (question.optionType === "textImageURL") {
            if (!option.text || !option.imageUrl) {
              toast.error(
                "Both text and image URL are required for 'Text & Image URL' option type."
              );
              return false;
            }
          } else if (question.optionType === "text") {
            if (!option.text) {
              toast.error("Text is required for 'Text' option type.");
              return false;
            }
          } else if (question.optionType === "imageURL") {
            if (!option.imageUrl) {
              toast.error("Image URL is required for 'Image URL' option type.");
              return false;
            }
          }
        }
      }

      if (isEditMode) {
        return (
          question.pollQuestion &&
          question.options.every((option) =>
            question.optionType === "textImageURL"
              ? option.text && option.imageUrl
              : question.optionType === "text"
              ? option.text
              : question.optionType === "imageURL"
              ? option.imageUrl
              : true
          )
        );
      } else {
        const hasCorrectOption =
          quizType === "Q&A" ? question.correctOptionId !== null : true;
        const hasValidTimeLimit =
          quizType === "Q&A" ? [0, 5, 10].includes(question.timeLimit) : true;

        return (
          question.pollQuestion &&
          question.options.length >= 2 &&
          hasCorrectOption &&
          hasValidTimeLimit
        );
      }
    });

    console.log("allQuizzesCreated", allQuizzesCreated);

    if (!allQuizzesCreated) {
      const errorMessage = isEditMode
        ? "Please ensure each question has text and each option has text."
        : "Please complete each question, fill all the options, set a time limit (Q&A), and enter valid text or ImageURL.";

      toast.error(errorMessage);
      return false;
    }
    toast.dismiss();
    return true;
  };

  const handleCreateQuiz = async () => {
    if (!validateQuizCreation()) return;
    const quizData = questions.map((question) => {
      const preparedOptions = question.options.map((option) => ({
        type:
          question.optionType === "textImageURL"
            ? "Text & Image URL"
            : question.optionType === "imageURL"
            ? "Image URL"
            : "Text",
        text: option.text || "",
        imageUrl: option.imageUrl || "",
        isCorrect:
          quizType === "Poll" ? false : option.id === question.correctOptionId,
      }));
      return {
        questionText: question.pollQuestion,
        options: preparedOptions,
        ...(quizType === "Q&A" && { timeLimit: question.timeLimit }), // Corrected to "Q&A"
      };
    });
    console.log("Create quiz_____", quizData);
    const toastId = toast.loading("Creating quiz...");
    dispatch(setLoading(true));
    try {
      const response = await axios.post(endpoints.CREATE_QUIZ_OR_POLL_API, {
        quizName,
        quizType: quizType === "Poll" ? "Poll" : "Q&A",
        questions: quizData,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`, 
        },
      }
    );

      console.log("Quiz created successfully:", response.data);
      toast.success("Quiz created successfully!", { id: toastId });
      dispatch(fetchAllQuizzes());
      onNext(response.data.quizLink);
    } catch (error) {
      toast.error("Failed to create quiz", { id: toastId });
      console.error(
        "Failed to create quiz:",
        error.response ? error.response.data : error.message
      );
    } finally {
      toast.dismiss(toastId);
      dispatch(setLoading(false));
    }
  };

  const handleUpdateQuiz = async () => {
    if (!validateQuizCreation()) return;
    const quizData = questions.map((question) => {
      return {
        questionText: question.pollQuestion,
        options: question.options.map((option) => ({
          type:
            question.optionType === "textImageURL"
              ? "Text & Image URL"
              : question.optionType === "imageURL"
              ? "Image URL"
              : "Text",
          text: option.text || "",
          imageUrl: option.imageUrl || "",
          isCorrect: quizType === "Poll" ? false : option.isCorrect,
        })),
      };
    });
    const toastId = toast.loading("Creating quiz...");
    dispatch(setLoading(true));
    try {
      // const response = await axios.put(
      //   endpoints.UPDATE_QUIZ_OR_POLL_API(quiz._id),
      //   {
      //     questions: quizData,
      //   }
      // );
      const response = await axios.put(
        endpoints.UPDATE_QUIZ_OR_POLL_API(quiz._id),
        {
          questions: quizData,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success("Quiz updated successfully!", {
        position: "top-right",
      });
      dispatch(fetchAllQuizzes());
      CloseEdit();
    } catch (error) {
      console.error(
        "Failed to update quiz:",
        error.response ? error.response.data : error.message
      );
    } finally {
      toast.dismiss(toastId);
      dispatch(setLoading(false));
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.header}>
          <div className={styles.number}>
            {questions.map((question, index) => (
              <div
                key={question.id}
                className={`${styles.questionNumber} ${
                  index === currentQuestionIndex ? styles.activeQuestion : ""
                }`}
                onClick={() => setCurrentQuestionIndex(index)}
              >
                <span>{question.id}</span>
                {!isEditMode && question.id > 1 && (
                  <button
                    className={styles.removeQuestion}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveQuestion(question.id);
                    }}
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
            {!isEditMode && questions.length < 5 && (
              <button
                className={styles.addQuestion}
                onClick={handleAddQuestion}
              >
                +
              </button>
            )}
          </div>
          <p>Max 5 questions</p>
        </div>

        <input
          type="text"
          placeholder="Poll Question"
          className={styles.inputTypePollQuestion}
          value={currentQuestion.pollQuestion}
          onChange={(e) => handlePollQuestionChange(e.target.value)}
        />
        <div className={styles.optionType}>
          <h3>Option Type</h3>
          {isEditMode ? (
            <>
              <label>
                <input
                  type="radio"
                  value="text"
                  checked={currentQuestion.optionType === "text"}
                  className={styles.customRadio}
                  disabled
                />
                Text
              </label>
              <label>
                <input
                  type="radio"
                  value="imageURL"
                  checked={currentQuestion.optionType === "imageURL"}
                  className={styles.customRadio}
                  disabled
                />
                Image URL
              </label>
              <label>
                <input
                  type="radio"
                  value="textImageURL"
                  checked={currentQuestion.optionType === "textImageURL"}
                  className={styles.customRadio}
                  disabled
                />
                Text & Image URL
              </label>
            </>
          ) : (
            <>
              <label>
                <input
                  type="radio"
                  value="text"
                  checked={currentQuestion.optionType === "text"}
                  onChange={handleOptionTypeChange}
                  className={styles.customRadio}
                />
                Text
              </label>
              <label>
                <input
                  type="radio"
                  value="imageURL"
                  checked={currentQuestion.optionType === "imageURL"}
                  onChange={handleOptionTypeChange}
                  className={styles.customRadio}
                />
                Image URL
              </label>
              <label>
                <input
                  type="radio"
                  value="textImageURL"
                  checked={currentQuestion.optionType === "textImageURL"}
                  onChange={handleOptionTypeChange}
                  className={styles.customRadio}
                />
                Text & Image URL
              </label>
            </>
          )}
        </div>
        <div className={styles.InputfieldAndTimer}>
          <div className={styles.options}>
            {currentQuestion.options.map((option) => (
              <div key={option.id} className={styles.optionContainer}>
                <label>
                  {quizType === "Q&A" && (
                    <input
                      type="radio"
                      name={`correctOption${option.id}`}
                      // checked={option.id === currentQuestion.correctOptionId}
                      checked={
                        option.id === currentQuestion.correctOptionId ||
                        (isEditMode && (option.isCorrect ?? false))
                      }
                      onChange={() => handleOptionCorrectChange(option.id)}
                      disabled={isEditMode}
                      className={styles.customSelectedRadio}
                    />
                  )}
                  {currentQuestion.optionType === "text" && (
                    <input
                      type="text"
                      placeholder="Text Option"
                      className={styles.inputField}
                      value={option.text || ""}
                      onChange={(e) =>
                        handleInputChange(option.id, "text", e.target.value)
                      }
                    />
                  )}
                  {currentQuestion.optionType === "imageURL" && (
                    <input
                      type="text"
                      placeholder="Image URL"
                      className={styles.inputField}
                      value={option.imageUrl || ""}
                      onChange={(e) =>
                        handleInputChange(option.id, "imageUrl", e.target.value)
                      }
                    />
                  )}
                  {currentQuestion.optionType === "textImageURL" && (
                    <>
                      <input
                        type="text"
                        placeholder="Text Option"
                        className={styles.inputFieldText}
                        value={option.text || ""}
                        onChange={(e) =>
                          handleInputChange(option.id, "text", e.target.value)
                        }
                      />
                      <input
                        type="text"
                        placeholder="Image URL"
                        className={styles.inputFieldImageUrl}
                        value={option.imageUrl || ""}
                        onChange={(e) =>
                          handleInputChange(
                            option.id,
                            "imageUrl",
                            e.target.value
                          )
                        }
                      />
                    </>
                  )}
                </label>
                {!isEditMode && option.id > 2 && (
                  <button
                    className={`${styles.removeOption} ${
                      currentQuestion.optionType === "text"
                        ? styles.removeOptionText
                        : currentQuestion.optionType === "imageURL"
                        ? styles.removeOptionImageURL
                        : styles.removeOptionTextImageURL
                    }`}
                    onClick={() => handleRemoveOption(option.id)}
                  >
                    <img src={deleteIcon} alt="Delete Option" />
                  </button>
                )}
              </div>
            ))}

            {!isEditMode && currentQuestion.options.length < 4 && (
              <button className={styles.addOption} onClick={handleAddOption}>
                + Add Option
              </button>
            )}
          </div>

          {quizType === "Q&A" && (
            <div className={styles.timer}>
              <h3>Timer</h3>
              <button
                className={`${styles.timerButton} ${
                  currentQuestion.timeLimit === 0 ? styles.activeTimer : ""
                }`}
                onClick={() => handleTimerChange(0)}
                disabled={isEditMode}
              >
                OFF
              </button>
              <button
                className={`${styles.timerButton} ${
                  currentQuestion.timeLimit === 5 ? styles.activeTimer : ""
                }`}
                onClick={() => handleTimerChange(5)}
                disabled={isEditMode}
              >
                5 sec
              </button>
              <button
                className={`${styles.timerButton} ${
                  currentQuestion.timeLimit === 10 ? styles.activeTimer : ""
                }`}
                onClick={() => handleTimerChange(10)}
                disabled={isEditMode}
              >
                10 sec
              </button>
            </div>
          )}
        </div>

        {errorMessage && <p className={styles.errorMessage}>{errorMessage}</p>}

        <div className={styles.modalActions}>
          <button
            className={styles.cancelButton}
            onClick={() => {
              if (isEditMode) {
                CloseEdit();
              } else {
                onClose();
              }
            }}
          >
            Cancel
          </button>
          <button
            className={styles.continueButton}
            onClick={isEditMode ? handleUpdateQuiz : handleCreateQuiz}
          >
            {isEditMode ? "Update" : "Create Quiz"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizOrPollType;
