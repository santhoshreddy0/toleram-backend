const express = require("express");
const tournamentRouter = express.Router();
const pool = require("../db");
const moment = require("moment");
const { verifyToken, tournament } = require("../middleware/middleware");

async function getTournament() {
  const query = "SELECT * FROM tournaments";
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
  await pool.execute(
    `UPDATE tournaments SET update_leaderboard = 'yes' WHERE id = 1`
  );
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

module.exports = {
  tournamentRouter,
  getTournament,
  updateLeaderboard,
};
