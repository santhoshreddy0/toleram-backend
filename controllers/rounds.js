const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/middleware");

const pool = require("../db");
const { jsonParse } = require("../utils");

router.get("/", async (req, res) => {
  try {
    const query = `SELECT * FROM rounds`;
    const [rows] = await pool.execute(query);

    res.json({ rounds: rows });
  } catch (error) {
    console.error("Error executing query", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const query = `SELECT * FROM rounds WHERE id = ?`;
    const [rows] = await pool.execute(query, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "Round not found" });
    }

    res.json({ round: rows[0] });
  } catch (error) {
    console.error("Error executing query", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/:id/questions", async (req, res) => {
  try {
    const { id: round_id } = req.params;
    const query = `SELECT * FROM round_questions WHERE round_id = ?`;
    const [rows] = await pool.execute(query, [round_id]);

    if (rows.length == 0) {
      return res.status(404).json({ message: "Questions not found" });
    }

    const questions = rows.map((row) => {
      return {
        id: row.id,
        question: row.question,
        options: jsonParse(row.options),
        correct_option: row.correct_option || null,
      };
    });

    res.json({ questions: questions });
  } catch (error) {
    console.error("Error executing query", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.put("/:id/bet", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { id: match_id } = req.params;
    const user_id = req.user.id;
    const { bets } = req.body;
    if (!bets || bets?.length === 0) {
      return res.status(400).json({ message: "No bets provided" });
    }

    const query = "Select * from rounds where id = ?";
    const [rows] = await pool.execute(query, [match_id]);
    if (rows.length == 0) {
      return res.status(404).json({ message: "Round not found" });
    }

    const round = rows[0];
    if (round.can_bet == 0) {
      return res
        .status(400)
        .json({ message: "Betting is closed for this match" });
    }
    const roundBetMax = round.max_bet_amount || 500000;
    const roundQuestionBetMin = 0;

    const roundQuestionQuery =
      "Select id from round_questions where round_id = ?";
    const [questionRows] = await pool.execute(roundQuestionQuery, [id]);
    if (questionRows.length === 0) {
      return res
        .status(404)
        .json({ message: "No questions found for this round" });
    }

    const questionMap = {};
    let totalAmount = 0;
    questionRows.forEach((row) => {
      let data = {};
      if (
        bets[row.id]?.option &&
        (bets[row.id].amount == null ||
          bets[row.id].amount < roundQuestionBetMin)
      ) {
        return res.status(400).json({
          message: `Bet amount for the question must be greater than ${roundQuestionBetMin}`,
        });
      }

      data["option"] = bets[row.id]?.option || null;
      data["amount"] = bets[row.id]?.amount || 0;
      totalAmount += data.amount;
      questionMap[row.id] = data;
    });

    if (totalAmount > roundBetMax) {
      return res.status(400).json({
        message: `Total bet amount (${totalAmount}) exceeds round limit of ${roundBetMax}`,
      });
    }

    const existingBetsQuery =
      "SELECT * FROM round_bets WHERE user_id = ? AND round_id = ?";
    const [existingBets] = await pool.execute(existingBetsQuery, [user_id, id]);

    if (existingBets.length === 0) {
      const insertQuery =
        "INSERT INTO round_bets (user_id, round_id, answers, total_amount) VALUES (?, ?, ?, ?)";
      await pool.execute(insertQuery, [
        user_id,
        id,
        JSON.stringify(questionMap),
        totalAmount,
      ]);

      res.status(200).json({ message: "Round bet placed successfully" });
    } else {
      const updateQuery =
        "UPDATE round_bets SET answers = ? , total_amount = ? WHERE user_id = ? AND round_id = ?";
      await pool.execute(updateQuery, [
        JSON.stringify(questionMap),
        totalAmount,
        user_id,
        id,
      ]);
      res.status(200).json({ message: "Round bets updated" });
    }
  } catch (error) {
    console.error("Error executing query", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/:id/bet", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;
    const query = "SELECT * FROM round_bets WHERE user_id = ? AND round_id = ?";
    const [rows] = await pool.execute(query, [user_id, id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "No bets found" });
    }
    const bets = jsonParse(rows[0].answers);
    res.status(200).json({ bets: bets });
  } catch (error) {
    console.error("Error executing query", error);
    res.status(500).json({ message: "Internal server error" });
  }
});
module.exports = router;
