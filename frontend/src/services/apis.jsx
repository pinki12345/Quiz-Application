const BASE_URL = import.meta.env.VITE_BASE_URL;

export const endpoints = {
  SIGNUP_API: BASE_URL + "/signup",
  LOGIN_API: BASE_URL + "/login",
  QUIZ_API: BASE_URL + "/quizzes",
  POLL_API: BASE_URL + "/poll",

  CREATE_QUIZ_OR_POLL_API: BASE_URL + "/createQuizOrPoll",
  GET_ALL_QUIZZES_API: `${BASE_URL}/getAllQuizzes`,
  GET_QUIZ_BY_ID_API: (id) => `${BASE_URL}/getQuizById/${id}`,
  DELETE_QUIZ_BY_ID_API: (id) => `${BASE_URL}/deleteQuizById/${id}`,
  UPDATE_QUIZ_OR_POLL_API: (id) => `${BASE_URL}/updateQuizOrPoll/${id}`,

  HANDLE_QUIZ_RESPONSE_API: `${BASE_URL}/quiz/response`,

  INCREMENT_IMPRESSION_API: (id) => `${BASE_URL}/calculateImpression/${id}`,

  CALCULATE_STATS_API: `${BASE_URL}/stats`,
};
