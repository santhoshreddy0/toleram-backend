const express = require("express");
const router = express.Router();
const pool = require("../../db");
const { jsonParse } = require("../../utils");

function validateName(name) {
  if (!name || name.length < 3) return false;
  return true;
}

function validateString(string) {
  if (!string || string.trim().length === 0) return false;
  return true;
}


router.post("/", async (req, res) => {
  const { name, imageUrl } = req.body;

  if (!validateName(name)) {
    res.status(400).json({ message: "Invalid team name" });
    return;
  }

  if (!validateString(imageUrl)) {
    res.status(400).json({ message: "Invalid url" });
    return;
  }

  try {
    const [teamRows] = await pool.execute(
      "SELECT * FROM teams WHERE team_name = ?",
      [name]
    );

    if (teamRows.length > 0) {
      res.status(400).json({ message: "Team already exists" });
      return;
    }

    const [insertResult] = await pool.execute(
      "INSERT INTO teams (team_name, team_logo) VALUES (?, ?)",
      [name, imageUrl]
    );

    res.json({
      message: "Team created successfully",
      teamId: insertResult.insertId,
    });
  } catch (error) {
    console.error("Error executing query", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.patch("/:teamId", async (req, res) => {
  const { teamId } = req.params;
  const { name, imageUrl, status } = req.body;

  if (name && !validateName(name)) {
    return res.status(400).json({ message: "Invalid team name" });
  }

  if (imageUrl && !validateString(imageUrl)) {
    return res.status(400).json({ message: "Invalid url" });
  }

  if (status && !["0", "1"].includes(status)) {
    return res.status(400).json({ message: "Invalid operation" });
  }

  try {
    // Check if the team exists
    const [teamRows] = await pool.execute("SELECT * FROM teams WHERE id = ?", [
      teamId,
    ]);

    if (teamRows.length === 0) {
      return res.status(404).json({ message: "Team not found" });
    }

    // Update fields conditionally
    const updateFields = [];
    const updateValues = [];

    if (name) {
      updateFields.push("team_name = ?");
      updateValues.push(name);
    }

    if (imageUrl) {
      updateFields.push("team_logo = ?");
      updateValues.push(imageUrl);
    }

    if (status !== undefined) {
      updateFields.push("status = ?");
      updateValues.push(status);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ message: "No fields to update" });
    }

    // Add teamId to the end for where clause
    updateValues.push(teamId);

    // Perform the update query
    const [updateResult] = await pool.execute(
      `UPDATE teams SET ${updateFields.join(", ")} WHERE id = ?`,
      updateValues
    );

    if (updateResult.affectedRows === 0) {
      return res.status(400).json({ message: "Update failed" });
    }

    res.json({
      message: "Team updated successfully",
    });
  } catch (error) {
    console.error("Error executing query", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

//createplayer
router.post("/:teamId", async (req, res) => {
  const { teamId } = req.params;
  const { name, imageUrl, role } = req.body;

  if (!validateName(name)) {
    return res.status(400).json({ message: "Invalid player name" });
  }

  if (imageUrl && imageUrl.trim().length === 0) {
    return res.status(400).json({ message: "Invalid url" });
  }

  if (
    !role ||
    !["all-rounder", "batsman", "bowler", "wicket-keeper"].includes(role)
  ) {
    return res.status(400).json({ message: "Invalid role for player" });
  }

  try {
    // Check if the team exists
    const [teamRows] = await pool.execute("SELECT * FROM teams WHERE id = ?", [
      teamId,
    ]);

    if (teamRows.length === 0) {
      return res.status(404).json({ message: "Team not found" });
    }

    const [playerRows] = await pool.execute(
      "SELECT * FROM players WHERE name = ? AND team_id = ?",
      [name, teamId]
    );

    if (playerRows.length > 0) {
      return res
        .status(400)
        .json({ message: "Player with the name already exists in the team" });
    }

    const [insertResult] = await pool.execute(
      "INSERT INTO players (name, player_logo, team_id, player_role) VALUES (?, ?, ?, ?)",
      [name, imageUrl || null, teamId, role]
    );

    res.json({
      message: "Player added successfully",
      player: {
        id: insertResult.insertId,
        name,
        imageUrl,
        teamId,
      },
    });
  } catch (error) {
    console.error("Error executing query", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;