import React, { useEffect, useState } from "react";
import axios from "axios";
import styles from "./QuizAnalysis.module.css";
import icon1 from "../assets/material-symbols_delete.png";
import icon2 from "../assets/material-symbols_share.png";
import icon3 from "../assets/uil_edit.png";
import DeleteModal from "./modal/DeleteModal";
import { Link,useOutletContext } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllQuizzes, removeQuiz, setLoading } from "../actions";
import QuizOrPollType from "./modal/QuizOrPollType";
import Loader from "./Loader";
import toast from "react-hot-toast";
import { endpoints } from "../services/apis";

const QuizAnalysis = () => {
  const dispatch = useDispatch();
  const quizzes = useSelector((state) => state.allQuizzes);
  const isLoading = useSelector((state) => state.isLoading);
  const error = useSelector((state) => state.error);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [quizToDelete, setQuizToDelete] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [quizToEdit, setQuizToEdit] = useState(null);
  const { onQuestionWiseAnalysisClick } = useOutletContext();

  const token = useSelector((state) => state.token) || localStorage.getItem('token');

  useEffect(() => {
    dispatch(fetchAllQuizzes());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  if (isLoading) return <Loader />;

  const deleteQuiz = async (quizId) => {
    const toastId = toast.loading("Deleting quiz...");
    dispatch(setLoading(true));
    try {

      const response = await axios.delete(endpoints.DELETE_QUIZ_BY_ID_API(quizId), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      dispatch(removeQuiz(quizId));
      toast.success("Quiz deleted successfully!",{
        position: "top-right"});
        dispatch(fetchAllQuizzes());
    } catch (error) {
      toast.error("Could not delete quiz");
      console.error("Error deleting quiz:", error);
    } finally {
      toast.dismiss(toastId);
      dispatch(setLoading(false));
    }
  };

  const handleDeleteClick = (quizId) => {
    setQuizToDelete(quizId);
    setIsModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (quizToDelete) {
      deleteQuiz(quizToDelete);
    }
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setQuizToDelete(null);
  };

  const handleShareClick = (quizId) => {
    const url = `http://localhost:5173/quizInterface/${quizId}`;
    navigator.clipboard
      .writeText(url)
      .then(() => {
        toast.success("Link copied to clipboard!",{
          position: "top-right"});
      })
      .catch((error) => {
        console.error("Error copying link:", error);
        toast.error("Failed to copy link!"); 
      });
  };

  const handleCancelEdit = () => {
    setIsEditModalOpen(false);
    setQuizToEdit(null);
  };

  const handleEditClick = (quiz) => {
    setQuizToEdit(quiz);
    setIsEditModalOpen(true);
  };


  return (
    <>
      <div className={styles.container}>
        <h2 className={styles.heading}>Quiz Analysis</h2>
        <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.leftBottom}>S.No</th>
              <th>Quiz Name</th>
              <th>Created on</th>
              <th>Impression</th>
              <th></th>
              <th className={styles.rightBottom}></th>
            </tr>
          </thead>
          <tbody>
            {quizzes.map((quiz, index) => (
              <tr key={quiz._id || index}>
                <td>{index + 1}</td>
                <td>{quiz.quizName}</td>
                <td>{new Date(quiz.createdAt).toLocaleDateString()}</td>
                <td>{quiz.impressions || "N/A"}</td>
                <td className={styles.actions}>
                  <img
                    src={icon3}
                    className={styles.iconEdit}
                    alt="Edit"
                    onClick={() => handleEditClick(quiz)}
                  />
                  <img
                    src={icon1}
                    className={styles.iconDelete}
                    alt="Delete"
                    onClick={() => handleDeleteClick(quiz._id)}
                  />
                  <img
                    src={icon2}
                    className={styles.iconShare}
                    alt="Share"
                    onClick={() => handleShareClick(quiz._id)}
                  />
                </td>
                <td>
                  <Link to={`quizQuestionAnalysis/${quiz._id}`} onClick={(e) => {
                        e.preventDefault();
                        onQuestionWiseAnalysisClick(quiz._id);
                      }}
                      className={styles.linkUnderlined} 
                      >
                    Question Wise Analysis
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
        <div className={styles.moreQuizzes}>more quizzes can be added</div>
      </div>
      {isModalOpen && (
        <DeleteModal
          onConfirmDelete={handleConfirmDelete}
          onCancel={handleCancel}
        />
      )}
      {isEditModalOpen && (
        <QuizOrPollType
          quiz={quizToEdit}
          quizType={quizToEdit.quizType}
          CloseEdit={handleCancelEdit}
          isEditMode={true}
        />
      )}
    </>
  );
};

export default QuizAnalysis;
