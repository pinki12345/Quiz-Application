import { endpoints } from "../services/apis";

export const SET_LOADING = "SET_LOADING";
export const SET_ERROR = "SET_ERROR";
export const SET_TOKEN = "SET_TOKEN";
export const SET_ALL_QUIZZES = "SET_ALL_QUIZZES";
export const REMOVE_QUIZ = "REMOVE_QUIZ";

export const setToken = (payload) => ({
  type: SET_TOKEN,
  payload,
});

export const setLoading = (payload) => ({
  type: SET_LOADING,
  payload,
});

export const setError = (payload) => ({
  type: SET_ERROR,
  payload,
});

export const setQuizzes = (data) => ({
  type: SET_ALL_QUIZZES,
  payload: data,
});

export const removeQuiz = (quizId) => ({
  type: "REMOVE_QUIZ",
  payload: quizId,
});

export const fetchAllQuizzes = () => {
  return async (dispatch) => {
    dispatch(setLoading(true));

    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No token found");
      dispatch(setError("No token found. Please log in."));
      dispatch(setLoading(false));
      return;
    }

    try {
      const response = await fetch(endpoints.GET_ALL_QUIZZES_API, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();

      if (response.ok) {
        if (data.success) {
          dispatch(setQuizzes(data.quizzes));
          dispatch(setLoading(false));
        } else {
          dispatch(setError("Unexpected data format received from server"));
        }
      } else {
        dispatch(setError(data.message || "Failed to fetch quizzes"));
      }
    } catch (error) {
      console.error("Error fetching all quizzes data:", error.message);
      dispatch(setError("Error fetching all quizzes data"));
    } finally {
      dispatch(setLoading(false));
    }
  };
};
