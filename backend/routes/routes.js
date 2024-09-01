const express = require("express");
const router = express.Router();

const { login, signup } = require("../controllers/user");
const authMiddleware = require("../middleware/user");

const {
  createQuizOrPoll,
  getAllQuizzes,
  getQuizById,
  deleteQuizById,
  handleQuizResponse,
  incrementImpression,
  calculateStats,
  updateQuizOrPoll,
} = require("../controllers/quiz");

router.post("/login", login);

router.post("/signup", signup);

router.post("/createQuizOrPoll", authMiddleware, createQuizOrPoll);

router.get("/getAllQuizzes", authMiddleware, getAllQuizzes);

router.get("/getQuizById/:id", getQuizById);


router.delete("/deleteQuizById/:id", authMiddleware, deleteQuizById);

router.post("/quiz/response", handleQuizResponse);

router.get("/calculateImpression/:id", incrementImpression);

router.get("/stats", authMiddleware,calculateStats);

router.put("/updateQuizOrPoll/:id", authMiddleware,updateQuizOrPoll);

module.exports = router;
