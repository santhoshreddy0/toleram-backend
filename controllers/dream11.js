const express = require("express");
const router = express.Router();
const pool = require("../db");
const { verifyToken, tournament } = require("../middleware/middleware");

class TransactionError extends Error {
  constructor(message) {
    super(message);
    this.name = "TransactionError";
  }
}

function validatePlayerRole(players) {
  let captainCount = 0;
  let viceCaptainCount = 0;

  players.forEach((player) => {
    if (player.roleType === "captain") captainCount++;
    if (player.roleType === "vice-captain") viceCaptainCount++;
  });

  return captainCount === 1 && viceCaptainCount === 1;
}

router.post("/createTeam", verifyToken, tournament, async (req, res) => {
  const { players } = req.body;

  if (
    !players ||
    !Array.isArray(players) ||
    players.length === 0 ||
    players.length != 11
  ) {
    return res
      .status(400)
      .json({ message: "You must select exactly 11 players" });
  }

  if (!validatePlayerRole(players)) {
    return res.status(400).json({
      message: "You must select only one captain and one vice-captain",
    });
  }

  const userId = req.user.id;

  const playerInserts = [];
  const playerIds = [];

  for (let player of players) {
    const { playerId, roleType } = player;

    if (!playerId || !roleType) {
      return res.status(400).json({ message: "Missing playerId or roleType" });
    }

    if (!["captain", "vice-captain", "player"].includes(roleType)) {
      return res.status(400).json({ message: "Invalid player role" });
    }

    playerIds.push(playerId);
    playerInserts.push([userId, playerId, roleType]);
  }

  const connection = await pool.getConnection();

  try {
    const [existingTeams] = await connection.query(
      "SELECT id FROM dream11_players WHERE user_id = ?",
      [userId]
    );
    if (existingTeams.length > 0) {
      return res
        .status(400)
        .json({ message: "You have already created a team" });
    };

    const [existingPlayers] = await connection.query(
      "SELECT id FROM players WHERE id IN (?)",
      [playerIds]
    );

    const existingPlayerIds = existingPlayers.map((player) => player.id);

    const missingPlayerIds = playerIds.filter(
      (id) => !existingPlayerIds.includes(id)
    );
    if (missingPlayerIds.length > 0) {
      return res.status(400).json({
        message: `Player IDs do not exist: ${missingPlayerIds.join(", ")}`,
      });
    }

    await connection.beginTransaction();

    const [insertResult] = await connection.query(
      "INSERT INTO dream11_players (user_id, player_id, role_type) VALUES ?",
      [playerInserts]
    );

    await connection.commit();

    res.json({
      message: "Team created successfully",
    });
  } catch (error) {
    await connection.rollback();
    console.error("Error executing query", error);
    res.status(500).json({ message: "Internal server error" });
  } finally {
    connection.release();
  }
});

router.put("/updateTeam", verifyToken, tournament, async (req, res) => {
  const { players } = req.body;

  if (!players || !Array.isArray(players) || players.length != 11) {
    return res
      .status(400)
      .json({ message: "You must select exactly 11 players" });
  }

  if (!validatePlayerRole(players)) {
    return res.status(400).json({
      message: "You must select only one captain and one vice-captain",
    });
  }

  const userId = req.user.id;

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [existingIds] = await connection.execute(
      `SELECT id FROM dream11_players WHERE user_id = ?`,
      [userId]
    );

    if (existingIds.length !== 11) {
      return res.status(400).json({ message: "You must have exactly 11 players" });
    }

    for (let i = 0; i < players.length; i++) {
      const { playerId, roleType } = players[i];
      const  {id} = existingIds[i];

      if (
        !id ||
        !playerId ||
        !roleType ||
        !["captain", "vice-captain", "player"].includes(roleType)
      ) {
        throw new TransactionError("Invalid player data");
      }

      const [updateResult] = await connection.execute(
        `UPDATE dream11_players
           SET player_id = ?, role_type = ?
           WHERE user_id = ? AND id = ?`,
        [playerId, roleType, userId, id]
      );

      if (updateResult.affectedRows === 0) {
        throw new TransactionError(`Failed to update player with ID ${id}`);
      }
    }

    await connection.commit();
    res.json({ message: "Players updated successfully" });
  } catch (error) {
    if (error instanceof TransactionError) {
      await connection.rollback();
      return res.status(400).json({ message: error.message });
    } else {
      await connection.rollback();
      console.error("Error executing query", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  } finally {
    connection.release();
  }
});

router.get("/team", async (req, res) => {
  const userId = req.user.id;

  try {
    const [teamPlayers] = await pool.execute(
      `SELECT
        dp.player_id AS player_id, 
        p.player_logo,
        p.name AS player_name,
        dp.role_type AS player_role,
        IFNULL(SUM(mpm.points), 0) * 
          CASE
            WHEN dp.role_type = 'captain' THEN 2
            WHEN dp.role_type = 'vice-captain' THEN 1.5
            ELSE 1
          END AS points
      FROM dream11_players dp 
      LEFT JOIN match_player_mapping mpm 
        ON dp.player_id = mpm.player_id
      LEFT JOIN players p 
        ON p.id = dp.player_id
      WHERE dp.user_id = ?
      GROUP BY dp.player_id, dp.role_type`,
      [userId]
    );

    if (teamPlayers.length === 0) {
      return res.status(404).json({ message: "No team found for the user" });
    }

    const totalPoints = teamPlayers.reduce(
      (sum, player) => sum + player.points,
      0
    );

    res.json({
      team: teamPlayers,
      totalPoints,
    });
  } catch (error) {
    console.error("Error executing query", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
