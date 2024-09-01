import React from "react";
import { useNavigate, Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import styles from "./Home.module.css";

const Home = () => {
  const navigate = useNavigate();

  const handleSidebarClick = (component) => {
    navigate(`/home/${component}`); 
  };

  const handleShowQuizQuestionAnalysis = (quizId) => {
    navigate(`/home/quizQuestionAnalysis/${quizId}`); 
  };

  return (
    <div className={styles.container}>
      <div className={styles.sidebarData}>
        <Sidebar onSidebarClick={handleSidebarClick} />
      </div>
      <div className={styles.mainContent}>
        <Outlet context={{ onQuestionWiseAnalysisClick: handleShowQuizQuestionAnalysis }} />
      </div>
    </div>
  );
};

export default Home;
