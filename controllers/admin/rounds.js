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

router.post("/", async (req, res) => {
  const { roundName } = req.body;

  if (!validateName(roundName)) {
    return res.status(400).json({ message: "Invalid round name" });
  }
  
  try {
    const [roundRows] = await pool.execute(
      "SELECT * FROM rounds WHERE round_name = ?",
      [roundName]
    );
    if (roundRows.length > 0) {
      return res
        .status(400)
        .json({ message: "Round with the name already exists" });
    }
    const [insertResult] = await pool.execute(
      "INSERT INTO rounds (round_name) VALUES (?)",
      [roundName]
    );

    res.json({
      message: "Round created successfully",
      roundId: insertResult.insertId,
    });
  } catch (error) {
    console.error("Error executing query", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.patch("/:roundId", async (req, res) => {
  const { roundId } = req.params;
  const { roundName, canBet, canShow } = req.body;

  if (roundName && !validateName(roundName)) {
    return res.status(400).json({ message: "Invalid round name" });
  }

  if (canBet !== undefined && !["0", "1"].includes(canBet)) {
    return res.status(400).json({ message: "Invalid value for canBet. Expected '0' or '1'" });
  }

  if (canShow !== undefined && !["0", "1"].includes(canShow)) {
    return res.status(400).json({ message: "Invalid value for canShow. Expected '0' or '1'" });
  }

  try {
    const [roundRows] = await pool.execute(
      "SELECT * FROM rounds WHERE id = ?",
      [roundId]
    );

    if (roundRows.length === 0) {
      return res.status(404).json({ message: "Round not found" });
    }

    const updateFields = [];
    const updateValues = [];

    if (roundName) {
      updateFields.push("round_name = ?");
      updateValues.push(roundName);
    }
    if (canBet !== undefined && ["0", "1"].includes(canBet)) {
      updateFields.push("can_bet = ?");
      updateValues.push(canBet);
    }
    if (canShow !== undefined && ["0", "1"].includes(canShow)) {
      updateFields.push("can_show = ?");
      updateValues.push(canShow);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ message: "No fields to update" });
    }

    updateValues.push(roundId);
    const [updateResult] = await pool.execute(
      `UPDATE rounds SET ${updateFields.join(", ")} WHERE id = ?`,
      updateValues
    );

    if (updateResult.affectedRows === 0) {
      return res.status(400).json({ message: "Update failed" });
    }

    res.json({
      message: "Round updated successfully",
    });
  } catch (error) {
    console.error("Error executing query", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.patch("/:roundId/process-bet", async (req, res) => {
  const { roundId } = req.params;
  const { betStatus } = req.body;

  if (!betStatus) {
    return res.status(400).json({ message: "Please provide the bet status!" });
  }

  if (
    betStatus &&
    !["dont_process", "process", "completed"].includes(betStatus)
  ) {
    return res.status(400).json({ message: "Invalid bet status" });
  }
  try{
    const [roundRows] = await pool.execute(
      "SELECT * FROM rounds WHERE id = ?",
      [roundId]
    );

    if (roundRows.length === 0) {
      return res.status(404).json({ message: "Round not found." });
    }

    const query = `UPDATE rounds SET bet_status = ? WHERE id = ? `;
    await pool.execute(query, [betStatus, roundId]);

    res.json({
      message: "Round bet status updated successfully"
    });


  }catch(error){
    console.error("Error executing query", error);
    res.status(500).json({ message: "Internal server error" });
  }

});

router.post("/:roundId/addQuestion", async (req, res) => {
  const { question, options } = req.body;
  const { roundId } = req.params;

  const validationErrors = [];
  const idsSet = new Set();

  if (!roundId) {
    validationErrors.push("Round ID is required.");
  }
  if (!question) {
    validationErrors.push("Question is required.");
  }
  if (!options || !Array.isArray(options) || options.length === 0) {
    validationErrors.push("Options should be an array.");
  }

  if (validationErrors.length > 0) {
    return res.status(400).json({ errors: validationErrors });
  }

  try {
    const [roundRows] = await pool.execute(
      "SELECT * FROM rounds WHERE id = ?",
      [roundId]
    );

    if (roundRows.length === 0) {
      return res.status(400).json({ message: "Round not found" });
    }

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

    if (validationErrors.length > 0) {
      return res.status(400).json({ errors: validationErrors });
    }

    const [insertResult] = await pool.execute(
      "INSERT INTO round_questions (round_id, question, can_show, options) VALUES (?, ?, ?, ?)",
      [roundId, question, "1", options]
    );

    res.json({
      message: "Question added successfully",
      questionId: insertResult.insertId,
    });
  } catch (error) {
    console.error("Error executing query", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/:id/questions", async (req, res) => {
    try {
      const { id: round_id } = req.params;
  
      const roundQuery = "SELECT * FROM rounds WHERE id = ?";
      let [roundRows] = await pool.execute(roundQuery, [round_id]);
      if (roundRows.length == 0) {
        return res.status(404).json({ message: "Round not found" });
      }
      roundRows = roundRows[0];
  
      const query = "SELECT * FROM round_questions WHERE round_id = ?";
      const [rows] = await pool.execute(query, [round_id]);
  
      if (rows.length == 0) {
        return res.status(404).json({ message: "Questions not found" });
      }
  
      const questions = rows.map((row) => {
        return {
          id: row.id,
          question: row.question,
          canShow: row.can_show,
          options: jsonParse(row.options),
          correct_option: row.correct_option,
        };
      });
  
      res.json({ questions: questions });
    } catch (error) {
      console.error("Error executing query", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });


module.exports = router;