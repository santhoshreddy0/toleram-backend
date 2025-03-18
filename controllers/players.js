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

router.patch("/:playerId", verifyRole("admin"), async (req, res) => {
    const { playerId } = req.params;
    const { name, imageKey, role  } = req.body;
  
    if (name && !validateName(name)) {
      return res.status(400).json({ message: "Invalid player name" });
    }
  
    if (imageKey && !validateString(imageKey)) {
      return res.status(400).json({ message: "Invalid url" });
    }
    if (role && !['all-rounder', 'batsman', 'bowler', 'wicket-keeper'].includes(role)) {
        return res.status(400).json({ message: "Invalid role for player" });
      }

  
    try {
      // Check if the team exists
      const [playerRows] = await pool.execute(
        "SELECT * FROM players WHERE id = ?",
        [playerId]
      );
  
      if (playerRows.length === 0) {
        return res.status(404).json({ message: "Player not found" });
      }
  
      // Update fields conditionally
      const updateFields = [];
      const updateValues = [];
  
      if (name) {
        updateFields.push("name = ?");
        updateValues.push(name);
      }
  
      if (imageKey) {
        updateFields.push("player_logo = ?");
        updateValues.push(imageKey);
      }
  
      if (role !== undefined) {
        updateFields.push("player_role = ?");
        updateValues.push(role);
      }
  
      if (updateFields.length === 0) {
        return res.status(400).json({ message: "No fields to update" });
      }
  
      updateValues.push(playerId);
  
      const [updateResult] = await pool.execute(
        `UPDATE players SET ${updateFields.join(", ")} WHERE id = ?`,
        updateValues
      );
  
      if (updateResult.affectedRows === 0) {
        return res.status(400).json({ message: "Update failed" });
      }
  
      res.json({
        message: "Player updated successfully"
      });
    } catch (error) {
      console.error("Error executing query", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  router.get("/", verifyToken, async (req, res) => {
    try {
      const [players] = await pool.execute("SELECT * FROM players");
  
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
  
  router.get("/:playerId", verifyToken, async (req, res) => {
    const { playerId } = req.params;
  
    try {
      const [playerRows] = await pool.execute(
        "SELECT * FROM players WHERE id = ?",
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
