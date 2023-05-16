const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/middleware");

const pool = require("../db");

// Endpoint to create a new user bet
router.post("/:id", verifyToken, async (req, res) => {
  try {
    const { id: round } = req.params;
    const user_id = req.user.id;
    const {
      team
    } = req.body;

    // Check if the match start time has passed
    const tournamentQuery = "SELECT start_time FROM time_channel WHERE id = ?";
    const tournamentValues = [round] 
    const [tournamentRows] = await pool.execute(tournamentQuery,tournamentValues);

    const startTime = tournamentRows[0].start_time;
    const currentTime = new Date();

    if (currentTime >= startTime) {
      return res.status(400).json({
        message: "Bets can only be placed before the round start time",
      });
    }

    const rowCheckingQuery =
      "SELECT * FROM winners WHERE user_id = ? AND round = ?";
    const rowValues = [user_id, round];
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
      "user_id, round, team";
    let query_values = "?, ?, ?";
    let values = [
      user_id,
      round ? round : "",
      team ? team : "",
    ];
    // Insert the user bet into the database
    const query = `INSERT INTO winners (${query_fields}) VALUES (${query_values})`;
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
    const { id: round } = req.params;
    const user_id = req.user.id;
    const {
        team
    } = req.body;

    // Check if the match start time has passed
    const tournamentQuery = "SELECT start_time FROM time_channel WHERE id = ?";
    const tournamentValues = [round] 
    const [tournamentRows] = await pool.execute(tournamentQuery,tournamentValues);

    const startTime = tournamentRows[0].start_time;
    const currentTime = new Date();

    if (currentTime >= startTime) {
      return res.status(400).json({
        message: "Bets can only be placed before the round start time",
      });
    }

    const rowCheckingQuery =
      "SELECT * FROM winners WHERE user_id = ? AND round = ?";
    const rowValues = [user_id, round];
    const [rows] = await pool.execute(rowCheckingQuery, rowValues);

    if (rows.length === 0) {
      return res.status(404).json({ message: "User bet not found" });
    }
    // Validate the request body data here (e.g., user authentication, input validation)
    let query_fields =
      "team = ?";
    let values = [
        team ? team : "",
        user_id,
        round
    ];
    // Update the user bet in the database
    const query = `UPDATE winners SET ${query_fields} WHERE user_id = ? AND round = ? `;
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
    const query = "SELECT * FROM winners WHERE user_id = ?";
    const values = [userId];
    const [rows] = await pool.execute(query, values);

    res.json({ winners: rows });
  } catch (error) {
    console.error("Error retrieving user bets", error);
    res.status(500).json({ message: "Internal server error" });
  }
});


module.exports = router;
