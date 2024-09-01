import "./App.css";
import Dashboard from "./components/Dashboard";
import PollFeedback from "./components/PollFeedback";
import QuizAnalysis from "./components/QuizAnalysis";
import QuizFeedback from "./components/QuizFeedback";
import QuizInterface from "./components/QuizInterface ";
import QuizQuestionAnalysis from "./components/QuizQuestionAnalysis";
import Error from "./pages/Error";
import SignupLogin from "./pages/SignupLogin";
import PrivateRoute from "./components/PrivateRoute";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Home from "./pages/Home";

function App() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Navigate to="/auth" />} />
        <Route path="/auth" element={<SignupLogin />} />

        <Route
          path="/home/*"
          element={
            <PrivateRoute>
              <Home />
            </PrivateRoute>
          }
        >
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="analytics" element={<QuizAnalysis />} />
          <Route
            path="quizQuestionAnalysis/:quizId"
            element={<QuizQuestionAnalysis />}
          />
        </Route>
        <Route path="/quizInterface/:id" element={<QuizInterface />} />
        <Route path="/feedback" element={<QuizFeedback />} />
        <Route path="/pollFeedback" element={<PollFeedback />} />
        <Route path="*" element={<Error />} />
      </Routes>
    </div>
  );
}

export default App;
