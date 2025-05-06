const express = require("express");
const router = express.Router();
const pool = require("../db");
const {
  verifyToken,
  tournament,
  isTournamentStarted,
} = require("../middleware/middleware");
const {
  DEFAULT_NO_OF_PLAYERS,
  DEFAULT_TOTAL_CREDITS,
  DEFAULT_ROLE_MIN_LIMITS,
  DEFAULT_ROLE_MAX_LIMITS,
  DEFAULT_FEMALE_COUNT,
  LEADERBOARD_KEY,
  LEADERBOARD_LIMIT,
  LAST_UPDATED_KEY,
} = require("../constants");
const { getTournament } = require("./tournament");
const RedisClient = require("../redis");

class TransactionError extends Error {
  constructor(message) {
    super(message);
    this.name = "TransactionError";
  }
}

function validateTeam(players, userId) {
  // Directly use constants for min and max limits
  const roleMinLimits = DEFAULT_ROLE_MIN_LIMITS;
  const roleMaxLimits = DEFAULT_ROLE_MAX_LIMITS;

  const maxPlayers = DEFAULT_NO_OF_PLAYERS;
  const requiredFemaleCount = DEFAULT_FEMALE_COUNT;
  const totalCreditsLimit = DEFAULT_TOTAL_CREDITS;

  const typeCount = {
    batsman: 0,
    bowler: 0,
    "all-rounder": 0,
    "wicket-keeper": 0,
    "impact-player": 0,
  };

  let femaleCount = 0;
  let captainCount = 0;
  let viceCaptainCount = 0;
  let usedCredits = 0;

  const playerIds = [];
  const playerInserts = [];

  for (const player of players) {
    const { playerId, roleType, gender, type, credits } = player;

    if (!playerId || !roleType) {
      return { valid: false, message: "Missing playerId or roleType" };
    }

    if (!["captain", "vice-captain", "player"].includes(roleType)) {
      return { valid: false, message: `Invalid roleType: ${roleType}` };
    }

    if (!type || !roleMinLimits.hasOwnProperty(type)) {
      return { valid: false, message: `Invalid player type: ${type}` };
    }

    if (!gender || !["male", "female"].includes(gender)) {
      return { valid: false, message: `Invalid gender: ${gender}` };
    }

    if (typeof credits !== "number" || credits < 0) {
      return {
        valid: false,
        message: `Invalid credit value for player: ${playerId}`,
      };
    }

    usedCredits += credits;

    if (roleType === "captain") captainCount++;
    else if (roleType === "vice-captain") viceCaptainCount++;

    typeCount[type]++;
    if (gender === "female") femaleCount++;

    playerIds.push(playerId);
    playerInserts.push([userId, playerId, roleType]);
  }

  if (players.length !== maxPlayers) {
    return {
      valid: false,
      message: `You must select exactly ${maxPlayers} players`,
    };
  }

  if (captainCount !== 1 || viceCaptainCount !== 1) {
    return {
      valid: false,
      message: "You must select exactly one captain and one vice-captain",
    };
  }

  for (const type in typeCount) {
    if (typeCount[type] < roleMinLimits[type]) {
      return {
        valid: false,
        message: `You have to select at least ${roleMinLimits[type]} ${type}(s)`,
      };
    }
    if (typeCount[type] > roleMaxLimits[type]) {
      return {
        valid: false,
        message: `You cannot select more than ${roleMaxLimits[type]} ${type}(s)`,
      };
    }
  }

  if (femaleCount !== requiredFemaleCount) {
    return {
      valid: false,
      message: `You must select exactly ${requiredFemaleCount} female player(s)`,
    };
  }

  if (usedCredits > totalCreditsLimit) {
    return {
      valid: false,
      message: `Credits exceeded: used ${usedCredits} / allowed ${totalCreditsLimit}`,
    };
  }

  return { valid: true, playerIds, playerInserts };
}

router.post("/createTeam", verifyToken, tournament, async (req, res) => {
  const { players, teamName } = req.body;

  if (!teamName || typeof teamName !== "string") {
    return res.status(400).json({ message: "Invalid team name" });
  }

  const userId = req.user.id;

  if (!players || !Array.isArray(players)) {
    return res.status(400).json({ message: "Invalid player data" });
  }

  const teamValidation = validateTeam(players, userId);

  if (!teamValidation.valid) {
    return res.status(400).json({ message: teamValidation.message });
  }

  const { playerIds, playerInserts } = teamValidation;

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
    }

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

    await connection.query(
      "INSERT INTO dream11_players (user_id, player_id, role_type) VALUES ?",
      [playerInserts]
    );

    await connection.query(
      "UPDATE users SET super12_team_name = ? WHERE id = ?",
      [teamName, userId]
    );

    await connection.commit();

    res.json({ message: "Team created successfully" });
  } catch (error) {
    await connection.rollback();
    console.error("Error executing query", error);
    res.status(500).json({ message: "Internal server error" });
  } finally {
    connection.release();
  }
});

router.put("/updateTeam", verifyToken, tournament, async (req, res) => {
  const { players, teamName } = req.body;

  if (!teamName || typeof teamName !== "string") {
    return res.status(400).json({ message: "Invalid team name" });
  }

  const userId = req.user.id;

  if (!players || !Array.isArray(players)) {
    return res.status(400).json({ message: "Invalid players data" });
  }

  const teamValidation = validateTeam(players, userId);

  if (!teamValidation.valid) {
    return res.status(400).json({ message: teamValidation.message });
  }

  const { playerIds, playerInserts } = teamValidation;

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [existingPlayers] = await connection.query(
      "SELECT id FROM dream11_players WHERE user_id = ?",
      [userId]
    );

    if (existingPlayers.length !== playerInserts.length) {
      return res.status(400).json({
        message: `You must have exactly ${playerInserts.length} players in your existing team.`,
      });
    }

    for (let i = 0; i < playerInserts.length; i++) {
      const [uid, playerId, roleType] = playerInserts[i];
      const { id } = existingPlayers[i];

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

    await connection.query(
      "UPDATE users SET super12_team_name = ? WHERE id = ?",
      [teamName, userId]
    );

    await connection.commit();
    res.json({ message: "Team updated successfully" });
  } catch (error) {
    await connection.rollback();

    if (error instanceof TransactionError) {
      return res.status(400).json({ message: error.message });
    }

    console.error("Update error:", error);
    res.status(500).json({ message: "Internal server error" });
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
          END AS points,
        ANY_VALUE(u.super12_team_name) AS super12_team_name
      FROM dream11_players dp 
      LEFT JOIN match_player_mapping mpm 
        ON dp.player_id = mpm.player_id
      LEFT JOIN players p 
        ON p.id = dp.player_id
      LEFT JOIN users u 
        ON dp.user_id = u.id
      WHERE dp.user_id = ?
      GROUP BY dp.player_id, dp.role_type`,
      [userId]
    );

    const isStarted = await isTournamentStarted(pool);

    const hasTeam = teamPlayers.length > 0;

    const totalPoints = hasTeam
      ? teamPlayers.reduce((sum, player) => sum + player.points, 0)
      : 0;

    const canCreate = !hasTeam && !isStarted;
    const canEdit = hasTeam && !isStarted;
    const teamName = hasTeam ? teamPlayers[0].super12_team_name : null;

    return res.status(200).json({
      team: hasTeam ? teamPlayers : [],
      totalPoints,
      canCreate,
      canEdit,
      teamName
    });
  } catch (error) {
    console.error("Error executing query", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/leaderboard", async (req, res) => {
  const userId = req.user.id;

  try {
    const topEntries = await RedisClient.zRangeWithScores(
      LEADERBOARD_KEY,
      0,
      LEADERBOARD_LIMIT - 1
    );
    const topUserIds = topEntries.map((entry) => parseInt(entry.value, 10));
    const isUserInTop = topUserIds.includes(userId);

    let completeEntries = [...topEntries];
    let completeUserIds = [...topUserIds];

    if (!isUserInTop) {
      const userRank = await RedisClient.zRevRank(
        LEADERBOARD_KEY,
        String(userId)
      );

      if (userRank !== null) {
        const surroundingUsers = await RedisClient.zRangeWithScores(
          LEADERBOARD_KEY,
          Math.max(userRank - 1, 0),
          userRank + 1
        );

        for (let i = 0; i < surroundingUsers.length; i++) {
          const entry = surroundingUsers[i];
          const id = parseInt(entry.value, 10);
          if (!completeUserIds.includes(id)) {
            completeUserIds.push(id);
            completeEntries.push({
              value: entry.value,
              score: entry.score,
              rank: userRank + i - 1,
            });
          }
        }
      }
    }

    const placeholders = completeUserIds.map(() => "?").join(", ");
    const query = `SELECT id, name, email , super12_team_name FROM users WHERE id IN (${placeholders})`;
    const [userRecords] = completeUserIds.length
      ? await pool.execute(query, completeUserIds)
      : [[]];

    const leaderboard = completeEntries.map((entry, index) => {
      const id = parseInt(entry.value, 10);
      const user = userRecords.find((u) => u.id === id);

      return {
        userId: id,
        totalPoints: entry.score,
        rank: entry.rank || index + 1,
        name: user?.name || null,
        email: user?.email || null,
        teamName: user?.super12_team_name || null,
      };
    });

    const lastUpdated = await RedisClient.get(LAST_UPDATED_KEY);

    return res.json({ leaderboard, isInTop: isUserInTop, lastUpdated });
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return res.status(500).send("Error fetching leaderboard");
  }
});

module.exports = router;
