import {
    SET_LOADING,
    SET_ERROR,
    SET_TOKEN,
    SET_ALL_QUIZZES,
    REMOVE_QUIZ,
  } from "../actions/index";
  
  const initialState = {
    token: localStorage.getItem("token") || null,
    isLoading: false,
    error: null,
    allQuizzes: [],
  };
  
  const quizReducer = (state = initialState, action) => {
    switch (action.type) {
      case SET_TOKEN:
        return {
          ...state,
          token: action.payload,
        };
      case SET_LOADING:
        return {
          ...state,
          isLoading: action.payload,
        };
      case SET_ERROR:
        return {
          ...state,
          error: action.payload,
        };
        case SET_ALL_QUIZZES: 
        return {
          ...state,
          allQuizzes: action.payload,
        };
        case REMOVE_QUIZ:
      return {
        ...state,
        allQuizzes: state.allQuizzes.filter((quiz) => quiz._id !== action.payload),
      };
      default:
        return state;
    }
  };
  
  export default quizReducer;
  