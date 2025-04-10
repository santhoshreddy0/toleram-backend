const express = require("express");
const router = express.Router();
const pool = require("../db");
const { verifyToken, verifyRole } = require("../middleware/middleware");
const moment = require("moment");
const { jsonParse } = require("../utils");


router.get("/", async (req, res) => {
  try {
    // Retrieve all available matches from the matches table
    const query = `SELECT matches.*, 
              teams.team_name AS team_one_name,
              teams.team_logo AS team_one_logo,
              team2.team_name AS team_two_name,
              team2.team_logo AS team_two_logo
              FROM matches 
              JOIN teams 
                ON matches.team_one = teams.id 
              JOIN teams AS team2 
                ON matches.team_two = team2.id
            `;
    const [rows] = await pool.execute(query);
    // rows.forEach((row) => {
    //     row.match_time = moment.tz(row.match_time, "Africa/Lagos").format();
    // });

    res.json({ matches: rows });
  } catch (error) {
    console.error("Error executing query", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    // Retrieve all available matches from the matches table
    const query = `SELECT matches.*, 
              teams.team_name AS team_one_name,
              teams.team_logo AS team_one_logo,
              team2.team_name AS team_two_name,
              team2.team_logo AS team_two_logo
              FROM matches 
              JOIN teams 
                ON matches.team_one = teams.id 
              JOIN teams AS team2 
                ON matches.team_two = team2.id
              WHERE matches.id = ?
            `;
    const [rows] = await pool.execute(query, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "Match not found" });
    }

    res.json({ match: rows[0] });
  } catch (error) {
    console.error("Error executing query", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/:id/questions", async (req, res) => {
  try {
    const { id: match_id } = req.params;
    // Retrieve all available matches from the matches table
    const matchQuery = "Select * from matches where id = ?";
    let [matchRows] = await pool.execute(matchQuery, [match_id]);
    if (matchRows.length == 0) {
      return res.status(404).json({ message: "Match not found" });
    }
    matchRows = matchRows[0];

    const query = `SELECT * FROM match_questions WHERE match_id = ?`;
    const [rows] = await pool.execute(query, [match_id]);

    if (rows.length == 0) {
      return res.status(404).json({ message: "Questions not found" });
    }
    console.log("rows", rows);
    const questions = rows.map((row) => {
      return {
        id: row.id,
        question: row.question,
        options: jsonParse(row.options),
        correct_option:
          matchRows.bet_status == "completed" ? row.correct_option : null,
      };
    });
    res.json({ questions: questions });
  } catch (error) {
    console.error("Error executing query", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/:id/bet", verifyToken, async (req, res) => {
  try {
    const { id: match_id } = req.params;
    const user_id = req.user.id;
    const query = "Select * from matches where id = ?";
    const [rows] = await pool.execute(query, [match_id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: "Match not found" });
    }

    const match = rows[0];

    const quesstionQuery = "Select id from match_questions where match_id = ?";
    const [questionRows] = await pool.execute(quesstionQuery, [match_id]);

    if (questionRows.length === 0) {
      return res
        .status(404)
        .json({ message: "No questions found for this match" });
    }

    const rowCheckingQuery =
      "SELECT * FROM match_bets WHERE user_id = ? AND match_id = ?";
    const rowValues = [user_id, match_id];
    const [existing_bets] = await pool.execute(rowCheckingQuery, rowValues);

    if (existing_bets.length === 0) {
      return res.status(404).json({ message: "No bets found" });
    } else {
      return res
        .status(200)
        .json({ bets: jsonParse(existing_bets[0].answers) });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
});
router.put("/:id/bet", verifyToken, async (req, res) => {
  try {
    const { id: match_id } = req.params;
    const user_id = req.user.id;
    const { bets } = req.body;
    if (!bets || bets?.length === 0) {
      return res.status(400).json({ message: "No bets provided" });
    }

    const query = "Select * from matches where id = ?";
    const [rows] = await pool.execute(query, [match_id]);
    if (rows.length == 0) {
      return res.status(404).json({ message: "Match not found" });
    }

    const match = rows[0];
    if (match.can_bet == 0) {
      return res
        .status(400)
        .json({ message: "Betting is closed for this match" });
    }

    const quesstionQuery = "Select id from match_questions where match_id = ?";
    const [questionRows] = await pool.execute(quesstionQuery, [match_id]);

    if (questionRows.length == 0) {
      return res
        .status(404)
        .json({ message: "No questions found for this match" });
    }

    const questionMap = {};
    let totalAmount = 0;
    questionRows.forEach((row) => {
      let data = {};
      data["option"] = bets[row.id]?.option || null;
      data["amount"] = bets[row.id]?.amount || 0;
      totalAmount += data.amount;
      questionMap[row.id] = data;
    });

    const rowCheckingQuery =
      "SELECT * FROM match_bets WHERE user_id = ? AND match_id = ?";
    const rowValues = [user_id, match_id];
    const [existing_bets] = await pool.execute(rowCheckingQuery, rowValues);

    if (existing_bets.length === 0) {
      const postQuery =
        "INSERT INTO match_bets (user_id, match_id,answers, total_amount) VALUES (?, ? , ?, ?) ";
      await pool.query(postQuery, [
        user_id,
        match_id,
        JSON.stringify(questionMap),
        totalAmount
      ]);
      return res.status(200).json({ message: "Bet placed successfully" });
    } else {
      const putQuery =
        "UPDATE match_bets SET answers = ?, total_amount = ? WHERE user_id = ? AND match_id = ?";
      await pool.query(putQuery, [
        JSON.stringify(questionMap),
        totalAmount,
        user_id,
        match_id,
      ]);
      return res.status(200).json({ message: "Bet updated successfully" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
