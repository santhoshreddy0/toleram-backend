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
router.patch("/:playerId", async (req, res) => {
  const { playerId } = req.params;
  const { name, imageUrl, role, gender, credits } = req.body;

  if (name && !validateName(name)) {
    return res.status(400).json({ message: "Invalid player name" });
  }

  if (imageUrl && !validateString(imageUrl)) {
    return res.status(400).json({ message: "Invalid url" });
  }
  if (
    role &&
    !["all-rounder", "batsman", "bowler", "wicket-keeper"].includes(role)
  ) {
    return res.status(400).json({ message: "Invalid role for player" });
  }

  if (gender && !["male", "female"].includes(gender)) {
    return res
      .status(400)
      .json({ message: "Please select the gender as male or female" });
  }

  if (
    credits !== undefined &&
    (typeof credits !== "number" || credits < 0 || !Number.isFinite(credits))
  ) {
    return res
      .status(400)
      .json({ error: "Invalid credits value. Must be a non-negative number." });
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

    if (imageUrl) {
      updateFields.push("player_logo = ?");
      updateValues.push(imageUrl);
    }

    if (role !== undefined) {
      updateFields.push("player_role = ?");
      updateValues.push(role);
    }

    if (credits !== undefined) {
      updateFields.push("credits = ?");
      updateValues.push(credits);
    }

    if (gender) {
      updateFields.push("gender = ?");
      updateValues.push(gender);
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
      message: "Player updated successfully",
    });
  } catch (error) {
    console.error("Error executing query", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
