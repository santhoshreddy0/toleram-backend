const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/middleware");

const pool = require("../db");

// Endpoint to create a new user bet
router.post("/", verifyToken, async (req, res) => {
  try {
    const user_id = req.user.id;
    const {
      sixes,
      sixes_bet,
      female_player,
      female_player_bet,
      most_runs,
      most_runs_bet,
      most_wickets,
      most_wickets_bet
    } = req.body;

    // Check if the match start time has passed
    const tournamentQuery = "SELECT match_start_time FROM matches WHERE match_title = ?";
    const tournamentValues = ['match 1'] 
    const [tournamentRows] = await pool.execute(tournamentQuery,tournamentValues);

    const startTime = tournamentRows[0].start_time;
    const currentTime = new Date();

    if (currentTime >= startTime) {
      return res.status(400).json({
        message: "Bets can only be placed before the tournament start time",
      });
    }

    const rowCheckingQuery =
      "SELECT * FROM tounament_bets WHERE user_id = ? ";
    const rowValues = [user_id];
    const [rows] = await pool.execute(rowCheckingQuery, rowValues);

    if (rows.length > 0) {
      return res
        .status(404)
        .json({
          message: "Bet already registerd. please refresh page and edit bet",
        });
    }
    // Validate the request body data here (e.g., user authentication, input validation)
    let query_fields =
      "user_id, sixes, sixes_bet, female_player, female_player_bet, most_runs, most_runs_bet, most_wickets, most_wickets_bet";
    let query_values = "?, ?, ?, ?, ?, ?, ?, ?, ?";
    let values = [
      user_id,
      sixes ? sixes : "",
      parseInt(sixes_bet) ? parseInt(sixes_bet) : 0,
      female_player ? female_player : "",
      parseInt(female_player_bet) ? parseInt(female_player_bet) : 0,
      most_runs ? most_runs : "",
      parseInt(most_runs_bet) ? parseInt(most_runs_bet) : 0,
      most_wickets ? most_wickets : "",
      parseInt(most_wickets_bet) ? parseInt(most_wickets_bet) : 0
    ];
    // Insert the user bet into the database
    const query = `INSERT INTO tounament_bets (${query_fields}) VALUES (${query_values})`;
    // const values = [user_id, match_id, who_wins, bet_amount];
    await pool.execute(query, values);

    res.status(201).json({ message: "User bet created successfully" });
  } catch (error) {
    console.error("Error creating user bet", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Endpoint to update a user bet
router.put("/", verifyToken, async (req, res) => {
  try {
    const user_id = req.user.id;
    const {
        sixes,
        sixes_bet,
        female_player,
        female_player_bet,
        most_runs,
        most_runs_bet,
        most_wickets,
        most_wickets_bet
    } = req.body;

    // Check if the match start time has passed
    const tournamentQuery = "SELECT match_start_time FROM matches WHERE match_title = ?";
    const tournamentValues = ['match 1'] 
    const [tournamentRows] = await pool.execute(tournamentQuery,tournamentValues);

    const startTime = tournamentRows[0].start_time;
    const currentTime = new Date();

    if (currentTime >= startTime) {
      return res.status(400).json({
        message: "Bets can only be Edit before the tournament start time",
      });
    }

    const rowCheckingQuery =
      "SELECT * FROM tounament_bets WHERE user_id = ? ";
    const rowValues = [user_id];
    const [rows] = await pool.execute(rowCheckingQuery, rowValues);

    if (rows.length === 0) {
      return res.status(404).json({ message: "User bet not found" });
    }
    // Validate the request body data here (e.g., user authentication, input validation)
    let query_fields =
      "sixes = ?, sixes_bet = ?, female_player = ?, female_player_bet = ?, most_runs = ?, most_runs_bet = ?, most_wickets = ?, most_wickets_bet = ?";
    let values = [
      sixes ? sixes : "",
      parseInt(sixes_bet) ? parseInt(sixes_bet) : 0,
      female_player ? female_player : "",
      parseInt(female_player_bet) ? parseInt(female_player_bet) : 0,
      most_runs ? most_runs : "",
      parseInt(most_runs_bet) ? parseInt(most_runs_bet) : 0,
      most_wickets ? most_wickets : "",
      parseInt(most_wickets_bet) ? parseInt(most_wickets_bet) : 0,
      user_id,
    ];
    // Update the user bet in the database
    const query = `UPDATE tounament_bets SET ${query_fields} WHERE user_id = ? `;
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
    const query = "SELECT * FROM tounament_bets WHERE user_id = ?";
    const values = [userId];
    const [rows] = await pool.execute(query, values);

    res.json({ bets: rows });
  } catch (error) {
    console.error("Error retrieving user bets", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
