const User = require("../models/user");
const Quiz = require("../models/quiz");

exports.createQuizOrPoll = async (req, res) => {
  try {
    const userId = req.user._id;
    console.log("User______123456__________ Id", req);
    const { quizName, quizType, questions } = req.body;

    if (!["Q&A", "Poll"].includes(quizType)) {
      return res
        .status(400)
        .json({ message: "Invalid quizType. Must be Q&A or Poll." });
    }

    if (!questions || questions.length === 0) {
      return res.status(400).json({ message: "Questions are required." });
    }

    for (const question of questions) {
      const { options, timeLimit } = question;
      const optionType = options[0]?.type || null;

      if (!optionType) {
        return res
          .status(400)
          .json({ message: "Each question must have an optionType." });
      }

      if (quizType === "Q&A") {
        if (![0, 5, 10].includes(timeLimit)) {
          return res.status(400).json({
            message:
              "Each question must have a valid time limit (0, 5, or 10 seconds)",
          });
        }
      }

      if (optionType === "Text" && options.some((option) => !option.text)) {
        return res.status(400).json({ message: "Each option must have text" });
      }

      if (
        optionType === "Image URL" &&
        options.some((option) => !option.imageUrl)
      ) {
        return res
          .status(400)
          .json({ message: "Each option must have an image URL" });
      }

      if (
        optionType === "Text & Image URL" &&
        options.some((option) => !option.text || !option.imageUrl)
      ) {
        return res
          .status(400)
          .json({ message: "Each option must have both text and image URL" });
      }

      const correctOptions = options.filter(
        (option) => option.isCorrect === true
      );
      if (correctOptions.length !== 1 && quizType === "Q&A") {
        return res.status(400).json({
          message: "Each question must have exactly one correct option",
        });
      }
    }

    const newQuiz = new Quiz({
      quizName,
      quizType,
      questions,
    });
    const createdDocument = await newQuiz.save();

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    user.quizzes.push(createdDocument._id);
    await user.save();

    const link = `https://quiz-application-blue-one.vercel.app/quizInterface/${createdDocument._id}`;
    res.status(201).json({
      success: true,
      message: `${quizType} created successfully!`,
      quizLink: link,
      createdDocument,
    });
  } catch (error) {
    console.error("Error creating quiz/poll:", error);
    res.status(500).json({ message: "Server error", error });
  }
};


exports.getAllQuizzes = async (req, res) => {
  try {
    const userId = req.user._id;
    console.log("User: " + userId);

    const user = await User.findById(userId).populate("quizzes");
    console.log("User details", user);

    const response = {
      success: true,
      quizzes: user?.quizzes || [],
    };

    if (!user || user.quizzes.length === 0) {
      response.message = "No quizzes found for this user.";
    }
    res.status(200).json(response);
  } catch (error) {
    console.error("Error fetching quizzes:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

exports.getQuizById = async (req, res) => {
  try {
    const { id } = req.params;
    const quiz = await Quiz.findById(id);
    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found." });
    }
    res.status(200).json({
      success: true,
      quiz,
    });
  } catch (error) {
    console.error("Error fetching quiz by ID:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

exports.deleteQuizById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id; 
    console.log("userId:______delete_______" + userId);
    const quiz = await Quiz.findById(id);
    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found." });
    }
    const user = await User.findById(userId);
    if (!user || !user.quizzes.includes(id)) {
      return res
        .status(403)
        .json({ message: "You are not authorized to delete this quiz." });
    }
    await Quiz.findByIdAndDelete(id);
    user.quizzes = user.quizzes.filter((quizId) => quizId.toString() !== id);
    await user.save();

    res.status(200).json({
      success: true,
      message: "Quiz deleted successfully.",
    });
  } catch (error) {
    console.error("Error deleting quiz by ID:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

exports.handleQuizResponse = async (req, res) => {
  const { quizId, responses } = req.body;
  try {
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }
    if (quiz.quizType === "Q&A") {
      responses.forEach((response) => {
        const { questionId, isCorrect } = response;
        const question = quiz.questions.id(questionId);
        if (question) {
          question.attempts += 1;
          if (isCorrect) {
            question.correctAnswers += 1;
          } else {
            question.incorrectAnswers += 1;
          }
        }
      });
    } else if (quiz.quizType === "Poll") {
      responses.forEach((response) => {
        const { questionId, selectedOptionId } = response;
        const question = quiz.questions.id(questionId);
        if (question) {
          const option = question.options.id(selectedOptionId);
          if (option) {
            if (!option.votes) {
              option.votes = 0;
            }
            option.votes += 1;
          }
          console.log("Voting: " + option.votes);
        }
      });
    }
    await quiz.save();
    console.log("Updated quiz:", quiz);
    res.status(200).json({ message: "Responses recorded successfully", quiz });
  } catch (error) {
    console.error("Error recording responses:", error);
    res
      .status(500)
      .json({ message: "An error occurred while recording responses" });
  }
};

exports.incrementImpression = async (req, res) => {
  const { id } = req.params;
  try {
    const quiz = await Quiz.findByIdAndUpdate(
      id,
      { $inc: { impressions: 1 } },
      { new: true }
    );

    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }
    res
      .status(200)
      .json({ message: "Impressions incremented successfully", quiz });
  } catch (error) {
    console.error("Error incrementing impression:", error);
    res
      .status(500)
      .json({ message: "An error occurred while incrementing impressions" });
  }
};

exports.calculateStats = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).populate("quizzes");
    if (!user || !user.quizzes || user.quizzes.length === 0) {
      return res.json({
        totalQuizzes: 0,
        totalQuestions: 0,
        totalImpressions: 0,
      });
    }

    const quizzes = user.quizzes;

    const totalQuizzes = quizzes.length;

    const totalImpressions = quizzes.reduce(
      (acc, quiz) => acc + (quiz.impressions || 0),
      0
    );

    const totalQuestions = quizzes.reduce(
      (acc, quiz) => acc + (quiz.questions.length || 0),
      0
    );

    res.json({
      totalQuizzes,
      totalQuestions,
      totalImpressions,
    });
  } catch (error) {
    console.error("Error calculating statistics:", error);
    res
      .status(500)
      .json({ error: "An error occurred while calculating statistics." });
  }
};

exports.updateQuizOrPoll = async (req, res) => {
  try {
    const { id } = req.params;
    const { questions } = req.body;
    const userId = req.user._id; 
     console.log("userId: " + userId)
    
    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ message: "Questions are required." });
    }
    const existingDocument = await Quiz.findById(id);
    if (!existingDocument) {
      return res.status(404).json({ message: "Quiz or Poll not found." });
    }
    const user = await User.findById(userId);
    if (!user || !user.quizzes.includes(id)) {
      return res.status(403).json({ message: "You do not have permission to update this quiz or poll." });
    }

    let hasError = false;
    let errorMessage = "";

    existingDocument.questions = existingDocument.questions.map((existingQuestion, index) => {
      const newQuestion = questions[index];

      if (newQuestion && newQuestion.questionText) {
        existingQuestion.questionText = newQuestion.questionText;
      }

      if (newQuestion && newQuestion.options) {
        if (newQuestion.options.length !== existingQuestion.options.length) {
          hasError = true;
          errorMessage = "Cannot add or remove options.";
          return existingQuestion;
        }

        existingQuestion.options = existingQuestion.options.map((existingOption, optionIndex) => {
          const newOption = newQuestion.options[optionIndex];
          if (newOption && newOption.text) {
            existingOption.text = newOption.text;
          }
          if (newOption && newOption.isCorrect !== undefined && newOption.isCorrect !== existingOption.isCorrect) {
            hasError = true;
            errorMessage = "Cannot change the correctness of options.";
            return existingOption;
          }
          if (!newOption.type || !["Text", "Image URL", "Text & Image URL"].includes(newOption.type)) {
            hasError = true;
            errorMessage = `Option type is required and must be one of 'Text', 'Image URL', or 'Text & Image URL'. Received: ${newOption.type || "undefined"}`;
            return existingOption;
          }

          existingOption.type = newOption.type;

          return existingOption;
        });
      }

      return existingQuestion;
    });

    if (hasError) {
      console.error("Validation error:", errorMessage);
      return res.status(400).json({ message: errorMessage });
    }
    await existingDocument.save();

    res.status(200).json({
      success: true,
      message: "Quiz or Poll updated successfully!",
      updatedDocument: existingDocument,
    });
  } catch (error) {
    console.error("Error updating quiz/poll:", error);
    res.status(500).json({ message: "Server error", error });
  }
};
