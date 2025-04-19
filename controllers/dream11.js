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
  DEFAULT_FEMALE_MIN,
} = require("../constants");
const { getTournament } = require("./tournament");
const RedisClient = require("../redis");

class TransactionError extends Error {
  constructor(message) {
    super(message);
    this.name = "TransactionError";
  }
}

function validateTeam(players, userId, tournament) {
  const roleMinLimits = {
    batsman: tournament?.batsmenMin ?? DEFAULT_ROLE_MIN_LIMITS.batsman,
    bowler: tournament?.bowlersMin ?? DEFAULT_ROLE_MIN_LIMITS.bowler,
    "all-rounder":
      tournament?.allRoundersMin ?? DEFAULT_ROLE_MIN_LIMITS["all-rounder"],
    "wicket-keeper":
      tournament?.wicketKeepersMin ?? DEFAULT_ROLE_MIN_LIMITS["wicket-keeper"],
  };

  const maxPlayers = tournament?.noOfPlayers ?? DEFAULT_NO_OF_PLAYERS;
  const requiredFemaleCount =
    tournament?.femalePlayersMin ?? DEFAULT_FEMALE_MIN;
  const totalCreditsLimit = tournament?.totalCredits ?? DEFAULT_TOTAL_CREDITS;

  const typeCount = {
    batsman: 0,
    bowler: 0,
    "all-rounder": 0,
    "wicket-keeper": 0,
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
  }

  if (femaleCount < requiredFemaleCount) {
    return {
      valid: false,
      message: `At least ${requiredFemaleCount} female player(s) required`,
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
  const { players } = req.body;

  const userId = req.user.id;

  if (!players || !Array.isArray(players)) {
    return res.status(400).json({ message: "Invalid player data" });
  }

  const tournamentData = await getTournament();

  const teamValidation = validateTeam(players, userId, tournamentData);

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
  const { players } = req.body;

  const userId = req.user.id;

  if (!players || !Array.isArray(players)) {
    return res.status(400).json({ message: "Invalid players data" });
  }

  const tournamentData = await getTournament();

  const teamValidation = validateTeam(players, userId, tournamentData);

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

    const isStarted = await isTournamentStarted(pool);

    const hasTeam = teamPlayers.length > 0;

    const totalPoints = hasTeam
      ? teamPlayers.reduce((sum, player) => sum + player.points, 0)
      : 0;

    const canCreate = !hasTeam && !isStarted;
    const canEdit = hasTeam && !isStarted;

    return res.status(200).json({
      team: hasTeam ? teamPlayers : [],
      totalPoints,
      canCreate,
      canEdit,
    });
  } catch (error) {
    console.error("Error executing query", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

const LEADERBOARD_KEY = "leaderboard";
const LEADERBOARD_LIMIT = 10
router.get("/leaderboard", async (req, res) => {
  const redis = new RedisClient();
  const userId = req.user.id;

  try {
    const top = await redis.zRangeWithScores(LEADERBOARD_KEY, 0, LEADERBOARD_LIMIT-1);
    const topUserIds = top.map((item) => parseInt(item.value, 10));

    const placeholders = topUserIds.map(() => "?").join(", ");
    const query = `SELECT id, name, email FROM users WHERE id IN (${placeholders})`;
    const [topUsers] = topUserIds.length
      ? await pool.execute(query, topUserIds)
      : [[]];

    const leaderboard = top.map((item, index) => {
      const user = topUsers.find((u) => u.id === parseInt(item.value, 10));
      return {
        userId: parseInt(item.value, 10),
        totalPoints: item.score,
        rank: index + 1,
        name: user?.name || null,
        email: user?.email || null,
      };
    });

    const isInTop = topUserIds.includes(userId);

    if (!isInTop) {
      const userRank = await redis.zRevRank(LEADERBOARD_KEY, String(userId));
      const userScore = await redis.zScore(LEADERBOARD_KEY, String(userId));

      if (userRank !== null && userScore !== null) {
        const [rows] = await pool.execute(
          `SELECT id, name, email FROM users WHERE id = ?`,
          [userId]
        );

        const user = rows[0];

        leaderboard.push({
          userId: userId,
          totalPoints: parseFloat(userScore),
          rank: userRank + 1,
          name: user?.name || null,
          email: user?.email || null,
        });
      }
    }

    res.json({ leaderboard, isInTop });
  } catch (err) {
    console.error("Error fetching leaderboard:", err);
    res.status(500).send("Error fetching leaderboard");
  } finally {
    await redis.close();
  }
});

module.exports = router;
