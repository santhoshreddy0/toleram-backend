const express = require("express");
const router = express.Router();
const pool = require("../../db");
const { jsonParse } = require("../../utils");

function validateName(name) {
  if (!name || name.length < 3) return false;
  return true;
}

function validateString(string) {
  if (!string || string.trim().length === 0) return false;
  return true;
}

router.patch("/round-questions/:questionId", async (req, res) => {
  const { question, canShow, options } = req.body;
  const { questionId } = req.params;

  const validationErrors = [];
  const idsSet = new Set();

  if (!questionId) {
    validationErrors.push("Question ID is required.");
  }

  if (options && (!Array.isArray(options) || options.length === 0)) {
    validationErrors.push("Options should be an array.");
  }

  if (canShow && !["0", "1"].includes(canShow)) {
    validationErrors.push("Invalid value for canShow. Expected '0' or '1'");
  }

  if (validationErrors.length > 0) {
    return res.status(400).json({ errors: validationErrors });
  }

  try {
    const [questionRows] = await pool.execute(
      "SELECT * FROM round_questions WHERE id = ?",
      [questionId]
    );

    if (questionRows.length === 0) {
      return res.status(400).json({ message: "Question not found" });
    }

    if (options) {
      options.forEach((option, index) => {
        if (!option.id || !option.option || !option.odds) {
          validationErrors.push(
            `Option at index ${index} is missing id, option, or odds.`
          );
        }
        if (idsSet.has(option.id)) {
          validationErrors.push(
            `Option at index ${index} has a duplicate id: ${option.id}.`
          );
        } else {
          idsSet.add(option.id);
        }
      });
    }

    if (validationErrors.length > 0) {
      return res.status(400).json({ errors: validationErrors });
    }

    const updateFields = [];
    const updateValues = [];

    if (question !== undefined && validateString(question)) {
      updateFields.push("question = ?");
      updateValues.push(question);
    }

    if (canShow !== undefined) {
      updateFields.push("can_show = ?");
      updateValues.push(canShow);
    }

    if (options !== undefined) {
      updateFields.push("options = ?");
      updateValues.push(options);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ message: "No fields to update" });
    }

    const [updateResult] = await pool.execute(
      `UPDATE round_questions SET ${updateFields.join(", ")} WHERE id = ?`,
      [...updateValues, questionId]
    );

    if (updateResult.affectedRows === 0) {
      return res.status(400).json({ message: "No rows updated" });
    }

    res.json({
      message: "Question updated successfully",
    });
  } catch (error) {
    console.error("Error executing query", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.patch("/round-questions/:questionId/correctOption", async (req, res) => {
  const { correctOption } = req.body;
  const { questionId } = req.params;

  const validationErrors = [];

  if (!questionId) {
    validationErrors.push("Question ID is required.");
  }

  if (!correctOption) {
    validationErrors.push("Correct option is required.");
  }

  if (validationErrors.length > 0) {
    return res.status(400).json({ errors: validationErrors });
  }

  try {
    const [questionRows] = await pool.execute(
      "SELECT * FROM round_questions WHERE id = ?",
      [questionId]
    );

    if (questionRows.length === 0) {
      return res.status(400).json({ message: "Question not found" });
    }

    const options = jsonParse(questionRows[0].options);
    const validOption = options.some(option => option.option === correctOption);

    if (!validOption) {
      return res.status(400).json({ message: "Invalid option provided." });
    }

    const [updateResult] = await pool.execute(
      "UPDATE round_questions SET correct_option = ? WHERE id = ?",
      [correctOption, questionId]
    );

    if (updateResult.affectedRows === 0) {
      return res.status(400).json({ message: "No rows updated" });
    }

    res.json({
      message: "Correct option updated successfully",
    });
  } catch (error) {
    console.error("Error executing query", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.patch("/:questionId", async (req, res) => {
  const { question, canShow, options } = req.body;
  const { questionId } = req.params;

  const validationErrors = [];
  const idsSet = new Set();

  if (!questionId) {
    validationErrors.push("Question ID is required.");
  }

  if (options && (!Array.isArray(options) || options.length === 0)) {
    validationErrors.push("Options should be an array.");
  }

  if (canShow && !["0", "1"].includes(canShow)) {
    validationErrors.push("Invalid value for canShow. Expected '0' or '1'");
  }

  if (validationErrors.length > 0) {
    return res.status(400).json({ errors: validationErrors });
  }

  try {
    const [questionRows] = await pool.execute(
      "SELECT * FROM round_questions WHERE id = ?",
      [questionId]
    );

    if (questionRows.length === 0) {
      return res.status(400).json({ message: "Question not found" });
    }

    if (options) {
      options.forEach((option, index) => {
        if (!option.id || !option.option || !option.odds) {
          validationErrors.push(
            `Option at index ${index} is missing id, option, or odds.`
          );
        }
        if (idsSet.has(option.id)) {
          validationErrors.push(
            `Option at index ${index} has a duplicate id: ${option.id}.`
          );
        } else {
          idsSet.add(option.id);
        }
      });
    }

    if (validationErrors.length > 0) {
      return res.status(400).json({ errors: validationErrors });
    }

    const updateFields = [];
    const updateValues = [];

    if (question !== undefined && validateString(question)) {
      updateFields.push("question = ?");
      updateValues.push(question);
    }

    if (canShow !== undefined) {
      updateFields.push("can_show = ?");
      updateValues.push(canShow);
    }

    if (options !== undefined) {
      updateFields.push("options = ?");
      updateValues.push(options);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ message: "No fields to update" });
    }

    const [updateResult] = await pool.execute(
      `UPDATE round_questions SET ${updateFields.join(", ")} WHERE id = ?`,
      [...updateValues, questionId]
    );

    if (updateResult.affectedRows === 0) {
      return res.status(400).json({ message: "No rows updated" });
    }

    res.json({
      message: "Question updated successfully",
    });
  } catch (error) {
    console.error("Error executing query", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.patch("/:questionId/correctOption", async (req, res) => {
  const { correctOption } = req.body;
  const { questionId } = req.params;

  const validationErrors = [];

  if (!questionId) {
    validationErrors.push("Question ID is required.");
  }

  if (!correctOption) {
    validationErrors.push("Correct option is required.");
  }

  if (validationErrors.length > 0) {
    return res.status(400).json({ errors: validationErrors });
  }

  try {
    const [questionRows] = await pool.execute(
      "SELECT * FROM round_questions WHERE id = ?",
      [questionId]
    );

    if (questionRows.length === 0) {
      return res.status(400).json({ message: "Question not found" });
    }

    const options = jsonParse(questionRows[0].options);
    const validOption = options.some(option => option.option === correctOption);

    if (!validOption) {
      return res.status(400).json({ message: "Invalid option provided." });
    }

    const [updateResult] = await pool.execute(
      "UPDATE round_questions SET correct_option = ? WHERE id = ?",
      [correctOption, questionId]
    );

    if (updateResult.affectedRows === 0) {
      return res.status(400).json({ message: "No rows updated" });
    }

    res.json({
      message: "Correct option updated successfully",
    });
  } catch (error) {
    console.error("Error executing query", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;