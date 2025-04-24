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
      const [teams] = await pool.execute("SELECT * FROM teams");
  
      if (teams.length === 0) {
        return res.status(404).json({ message: "No teams found" });
      }
  
      res.json({
        teams,
      });
    } catch (error) {
      console.error("Error executing query", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  router.get("/:teamId", async (req, res) => {
    const { teamId } = req.params;
  
    try {
      const [teamRows] = await pool.execute(
        "SELECT * FROM teams WHERE id = ?",
        [teamId]
      );
  
      if (teamRows.length === 0) {
        return res.status(404).json({ message: "Team not found" });
      }
  
      res.json(
         {team: teamRows[0]}
      );
    } catch (error) {
      console.error("Error executing query", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  router.get("/:teamId/players", verifyToken, async (req, res) => {
    const { teamId } = req.params;
  
    try {
      const [teamRows] = await pool.execute(
        "SELECT * FROM teams WHERE id = ?",
        [teamId]
      );
  
      if (teamRows.length === 0) {
        return res.status(404).json({ message: "Team not found" });
      }

      const [teamPlayers] = await pool.execute("SELECT * FROM players WHERE team_id= ?", [teamId]);
  
      res.json(
         {teamPlayers}
      );
    } catch (error) {
      console.error("Error executing query", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });


module.exports = router;
