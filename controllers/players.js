const express = require("express");
const router = express.Router();
const pool = require("../db");
const { verifyToken, verifyRole } = require("../middleware/middleware");

function validateName(name) {
  if (!name || name.length < 3) return false;
  return true;
}

function validateString(string) {
  if (!string || string.trim().length === 0) return false;
  return true;
}

  router.get("/", async (req, res) => {
    try {
      const [players] = await pool.execute("SELECT p.* , t.team_name , t.team_logo FROM players p LEFT JOIN teams t ON p.team_id = t.id");
  
      if (players.length === 0) {
        return res.status(404).json({ message: "No players found" });
      }
  
      res.json({
        players,
      });
    } catch (error) {
      console.error("Error executing query", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  router.get("/:playerId", async (req, res) => {
    const { playerId } = req.params;
  
    try {
      const [playerRows] = await pool.execute(
        "SELECT p.* , t.team_name , t.team_logo  FROM players p LEFT JOIN teams t ON p.team_id = t.id WHERE p.id = ?",
        [playerId]
      );
  
      if (playerRows.length === 0) {
        return res.status(404).json({ message: "player not found" });
      }
  
      res.json(
         {player: playerRows[0]}
      );
    } catch (error) {
      console.error("Error executing query", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });


module.exports = router;
