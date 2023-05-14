const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/middleware");

const pool = require("../db");

function validateWhoWins(who_wins) {
  // Password validation logic goes here
  if (!who_wins) return false;
  return true;
}

function validateBetAmount(bet_amount) {
  // Email validation logic goes here
  if (!bet_amount || bet_amount <= 0) return false;
  return true;
}

// Endpoint to create a new user bet
router.post("/:id", verifyToken, async (req, res) => {
  try {
    const { id: match_id } = req.params;
    const user_id = req.user.id;
    const {
      who_wins,
      who_wins_bet,
      who_wins_toss,
      who_wins_toss_bet,
      most_runs_male,
      most_runs_male_bet,
      best_female_player,
      best_female_player_bet,
      first_inn_score,
      first_inn_score_bet,
      max_sixes,
      max_sixes_bet,
    } = req.body;

    // Check if the match start time has passed
    const matchQuery = "SELECT match_start_time FROM matches WHERE id = ?";
    const matchValues = [match_id];
    const [matchRows] = await pool.execute(matchQuery, matchValues);

    const matchStartTime = matchRows[0].match_start_time;
    const currentTime = new Date();

    if (currentTime >= matchStartTime) {
      return res.status(400).json({
        message: "Bets can only be placed before the match start time",
      });
    }

    const rowCheckingQuery =
      "SELECT * FROM user_bets WHERE user_id = ? AND match_id = ?";
    const rowValues = [user_id, match_id];
    const [rows] = await pool.execute(rowCheckingQuery, rowValues);

    if (rows.length >= 0) {
      return res.status(404).json({ message: "Bet already registerd. please refresh page and edit bet" });
    }
    // Validate the request body data here (e.g., user authentication, input validation)
    let query_fields =
      "user_id, match_id, who_wins, who_wins_bet, who_wins_toss , who_wins_toss_bet,most_runs_male, most_runs_male_bet, best_female_player , best_female_player_bet, first_inn_score , first_inn_score_bet, max_sixes , max_sixes_bet";
    let query_values = "?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?";
    let values = [
      user_id,
      match_id,
      who_wins ? who_wins : "" ,
      parseInt(who_wins_bet) ? parseInt(who_wins_bet) : 0 ,
      who_wins_toss ? who_wins_toss : "" ,
      parseInt(who_wins_toss_bet) ? parseInt(who_wins_toss_bet) : 0 ,
      most_runs_male ? most_runs_male : "" ,
      parseInt(most_runs_male_bet) ? parseInt(most_runs_male_bet) : 0 ,
      best_female_player ? best_female_player : "" ,
      parseInt(best_female_player_bet) ? parseInt(best_female_player_bet) : 0 ,
      first_inn_score ? first_inn_score : "" ,
      parseInt(first_inn_score_bet) ? parseInt(first_inn_score_bet) : 0 ,
      max_sixes ? max_sixes : "" ,
      parseInt(max_sixes_bet) ? parseInt(max_sixes_bet) : 0 ,
    ];
    // Insert the user bet into the database
    const query = `INSERT INTO user_bets (${query_fields}) VALUES (${query_values})`;
    // const values = [user_id, match_id, who_wins, bet_amount];
    await pool.execute(query, values);

    res.status(201).json({ message: "User bet created successfully" });
  } catch (error) {
    console.error("Error creating user bet", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Endpoint to update a user bet
router.put("/:id", verifyToken, async (req, res) => {
  try {
    const { id: match_id } = req.params;
    const user_id = req.user.id;
    const {
      who_wins,
      who_wins_bet,
      who_wins_toss,
      who_wins_toss_bet,
      most_runs_male,
      most_runs_male_bet,
      best_female_player,
      best_female_player_bet,
      first_inn_score,
      first_inn_score_bet,
      max_sixes,
      max_sixes_bet,
    } = req.body;

    // Check if the match start time has passed
    const matchQuery = "SELECT match_start_time FROM matches WHERE id = ?";
    const matchValues = [match_id];
    const [matchRows] = await pool.execute(matchQuery, matchValues);

    const matchStartTime = matchRows[0].match_start_time;
    const currentTime = new Date();

    if (currentTime >= matchStartTime) {
      return res.status(400).json({
        message: "Bets can only be placed before the match start time",
      });
    }

    const rowCheckingQuery =
      "SELECT * FROM user_bets WHERE user_id = ? AND match_id = ?";
    const rowValues = [user_id, match_id];
    const [rows] = await pool.execute(rowCheckingQuery, rowValues);

    if (rows.length === 0) {
      return res.status(404).json({ message: "User bet not found" });
    }
    // Validate the request body data here (e.g., user authentication, input validation)
    let query_fields =
      "who_wins = ?, who_wins_bet = ?, who_wins_toss = ? , who_wins_toss_bet = ? , most_runs_male = ?, most_runs_male_bet = ?, best_female_player = ? , best_female_player_bet = ?, first_inn_score = ? , first_inn_score_bet = ?, max_sixes = ? , max_sixes_bet = ? ";
    let values = [
      who_wins ? who_wins : "" ,
      parseInt(who_wins_bet) ? parseInt(who_wins_bet) : 0 ,
      who_wins_toss ? who_wins_toss : "" ,
      parseInt(who_wins_toss_bet) ? parseInt(who_wins_toss_bet) : 0 ,
      most_runs_male ? most_runs_male : "" ,
      parseInt(most_runs_male_bet) ? parseInt(most_runs_male_bet) : 0 ,
      best_female_player ? best_female_player : "" ,
      parseInt(best_female_player_bet) ? parseInt(best_female_player_bet) : 0 ,
      first_inn_score ? first_inn_score : "" ,
      parseInt(first_inn_score_bet) ? parseInt(first_inn_score_bet) : 0 ,
      max_sixes ? max_sixes : "" ,
      parseInt(max_sixes_bet) ? parseInt(max_sixes_bet) : 0 ,
      user_id ,
      match_id 
    ];
    // Update the user bet in the database
    const query = `UPDATE user_bets SET ${query_fields} WHERE user_id = ? AND match_id = ?`;
    console.log(query);
    await pool.execute(query, values);

    res.json({ message: "User bet updated successfully" });
  } catch (error) {
    console.error("Error updating user bet", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/", verifyToken, async (req, res) => {
  try {
    // Retrieve the user ID from the decoded token payload
    const userId = req.user.id;

    // Fetch all user bets from the database
    const query = "SELECT * FROM user_bets WHERE user_id = ?";
    const values = [userId];
    const [rows] = await pool.execute(query, values);

    res.json({ userBets: rows });
  } catch (error) {
    console.error("Error retrieving user bets", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
