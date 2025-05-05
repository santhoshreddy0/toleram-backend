const express = require("express");
const tournamentRouter = express.Router();
const pool = require("../db");
const moment = require("moment");
const { verifyToken, tournament } = require("../middleware/middleware");

const { UPDATE_LEADERBOARD_KEY } = require("../constants");
const RedisClient = require("../redis");

async function getTournament() {
  const query = "SELECT run_super12_bets FROM tournaments";
  const [results] = await pool.execute(query);

  const row = results[0];
  if (!row) return null;

  const formattedRow = {};
  for (let key in row) {
    const camelCaseKey = key.replace(/_([a-z])/g, (match, letter) =>
      letter.toUpperCase()
    );
    formattedRow[camelCaseKey] = row[key];
  }

  return formattedRow;
}

async function updateLeaderboard() {
  try {
    await RedisClient.set(UPDATE_LEADERBOARD_KEY, "yes");
    console.log("Leaderboard update flag set to 'yes' in Redis");
    return;
  } catch (error) {
    console.error("Failed to update leaderboard in Redis:", error);
    return;
  }
}

tournamentRouter.get("/", verifyToken, async (req, res) => {
  try {
    const tournament = await getTournament();
    if (!tournament) {
      return res.status(404).json({ message: "Tournament not found" });
    }
    res.json({ tournament });
  } catch (error) {
    console.error("Error fetching tournament", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

tournamentRouter.patch('/super12', async (req, res) => {
  const { status } = req.body; 

  if (!['yes', 'no'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status. Use "yes" or "no".' });
  }

  try {
    const [result] = await pool.execute(
      'UPDATE tournaments SET run_super12_bets = ? WHERE id = 1',
      [status]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Tournament not found.' });
    }

    res.json({ message: `Super12 bet status updated` });
  } catch (error) {
    console.error('Error updating run_super12_bets:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});


module.exports = {
  tournamentRouter,
  getTournament,
  updateLeaderboard,
};
