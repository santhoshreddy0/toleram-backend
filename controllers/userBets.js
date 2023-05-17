const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/middleware");

const pool = require("../db");
const moment = require('moment');
// Endpoint to create a new user bet
router.post("/:id", verifyToken, async (req, res) => {
  try {
    const { id: match_id } = req.params;
    const user_id = req.user.id;
    const {
      wins,
      wins_bet,
      toss,
      toss_bet,
      sixes,
      sixes_bet,
      female_player,
      female_player_bet,
      most_runs,
      most_runs_bet,
      most_wickets,
      most_wickets_bet,
      team_one_fs,
      team_one_fs_bet,
      team_two_fs,
      team_two_fs_bet,
    } = req.body;

    // Check if the match start time has passed
    const matchQuery = "SELECT match_start_time FROM matches WHERE id = ?";
    const matchValues = [match_id];
    const [matchRows] = await pool.execute(matchQuery, matchValues);

    const matchStartTime = matchRows[0].match_start_time;
    const currentTime = new Date();
    
    if (moment(currentTime)>=moment(matchStartTime)) {
      return res.status(400).json({
        message: "Bets can only be placed before the match start time",
      });
    }

    const rowCheckingQuery =
      "SELECT * FROM user_bets WHERE user_id = ? AND match_id = ?";
    const rowValues = [user_id, match_id];
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
      "user_id, match_id, wins, wins_bet, toss, toss_bet, sixes, sixes_bet, female_player, female_player_bet, most_runs, most_runs_bet, most_wickets, most_wickets_bet, team_one_fs, team_one_fs_bet, team_two_fs, team_two_fs_bet";
    let query_values = "?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?";
    let values = [
      user_id,
      match_id,
      wins ? wins : "",
      parseInt(wins_bet) ? parseInt(wins_bet) : 0,
      toss ? toss : "",
      parseInt(toss_bet) ? parseInt(toss_bet) : 0,
      sixes ? sixes : "",
      parseInt(sixes_bet) ? parseInt(sixes_bet) : 0,
      female_player ? female_player : "",
      parseInt(female_player_bet) ? parseInt(female_player_bet) : 0,
      most_runs ? most_runs : "",
      parseInt(most_runs_bet) ? parseInt(most_runs_bet) : 0,
      most_wickets ? most_wickets : "",
      parseInt(most_wickets_bet) ? parseInt(most_wickets_bet) : 0,
      team_one_fs ? team_one_fs : "",
      parseInt(team_one_fs_bet) ? parseInt(team_one_fs_bet) : 0,
      team_two_fs ? team_two_fs : "",
      parseInt(team_two_fs_bet) ? parseInt(team_two_fs_bet) : 0
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
      wins,
      wins_bet,
      toss,
      toss_bet,
      sixes,
      sixes_bet,
      female_player,
      female_player_bet,
      most_runs,
      most_runs_bet,
      most_wickets,
      most_wickets_bet,
      team_one_fs,
      team_one_fs_bet,
      team_two_fs,
      team_two_fs_bet
    } = req.body;

    // Check if the match start time has passed
    const matchQuery = "SELECT match_start_time FROM matches WHERE id = ?";
    const matchValues = [match_id];
    const [matchRows] = await pool.execute(matchQuery, matchValues);

    const matchStartTime = matchRows[0].match_start_time;
    const currentTime = new Date();

    if (moment(currentTime)>=moment(matchStartTime)) {
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
      "wins = ?, wins_bet = ?, toss = ?, toss_bet = ?, sixes = ?, sixes_bet = ?, female_player = ?, female_player_bet = ?, most_runs = ?, most_runs_bet = ?, most_wickets = ?, most_wickets_bet = ?, team_one_fs = ?, team_one_fs_bet = ?, team_two_fs = ?, team_two_fs_bet = ?";
    let values = [
      wins ? wins : "",
      parseInt(wins_bet) ? parseInt(wins_bet) : 0,
      toss ? toss : "",
      parseInt(toss_bet) ? parseInt(toss_bet) : 0,
      sixes ? sixes : "",
      parseInt(sixes_bet) ? parseInt(sixes_bet) : 0,
      female_player ? female_player : "",
      parseInt(female_player_bet) ? parseInt(female_player_bet) : 0,
      most_runs ? most_runs : "",
      parseInt(most_runs_bet) ? parseInt(most_runs_bet) : 0,
      most_wickets ? most_wickets : "",
      parseInt(most_wickets_bet) ? parseInt(most_wickets_bet) : 0,
      team_one_fs ? team_one_fs : "",
      parseInt(team_one_fs_bet) ? parseInt(team_one_fs_bet) : 0,
      team_two_fs ? team_two_fs : "",
      parseInt(team_two_fs_bet) ? parseInt(team_two_fs_bet) : 0,
      user_id,
      match_id,
    ];
    // Update the user bet in the database
    const query = `UPDATE user_bets SET ${query_fields} WHERE user_id = ? AND match_id = ?`;
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
