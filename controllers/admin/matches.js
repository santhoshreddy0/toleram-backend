const express = require("express");
const router = express.Router();
const pool = require("../../db");
const { jsonParse } = require("../../utils");
const { POINTS, UPDATE_LEADERBOARD_KEY } = require("../../constants");
const RedisClient = require("../../redis");
const { updateLeaderboard } = require("../tournament");

function validateName(name) {
  if (!name || name.length < 3) return false;
  return true;
}

function validateString(string) {
  if (!string || string.trim().length === 0) return false;
  return true;
}

router.post("/", async (req, res) => {
  const { teamOneId, teamTwoId, matchTitle, matchTime, maxBetAmount } =
    req.body;
  const validationErrors = [];

  if (!teamOneId) {
    validationErrors.push("Team one ID is required.");
  }
  if (!teamTwoId) {
    validationErrors.push("Team two ID is required.");
  }
  if (!matchTitle) {
    validationErrors.push("Match title is required.");
  }
  if (!matchTime) {
    validationErrors.push("Match time is required.");
  }
  if (teamOneId == teamTwoId) {
    validationErrors.push("Please select two different teams");
  }

  if (validationErrors.length > 0) {
    return res.status(400).json({ errors: validationErrors });
  }

  if (
    maxBetAmount !== undefined &&
    (typeof maxBetAmount !== "number" ||
      maxBetAmount < 0 ||
      !Number.isFinite(maxBetAmount))
  ) {
    validationErrors.push("Enter a valid max bet amount for the match");
  }

  // Validate match time format (assume it's in ISO string format)
  const matchDate = new Date(matchTime);
  if (isNaN(matchDate.getTime())) {
    return res.status(400).json({ message: "Invalid match time" });
  }

  // Set the match_time to UTC format (use toISOString() to get UTC)
  const matchTimeUtc = new Date(matchDate.toISOString())
    .toISOString()
    .slice(0, 19)
    .replace("T", " ");

  try {
    const [teamRows] = await pool.execute(
      "SELECT * FROM teams WHERE id IN (?, ?)",
      [teamOneId, teamTwoId]
    );

    if (teamRows.length !== 2) {
      return res.status(400).json({ message: "One or both teams not found" });
    }

    const [insertResult] = await pool.execute(
      "INSERT INTO matches (team_one, team_two, match_title, match_time, max_bet_amount) VALUES (?, ?, ?, ?, ?)",
      [teamOneId, teamTwoId, matchTitle, matchTimeUtc, maxBetAmount || 500000]
    );

    res.json({
      message: "Match created successfully",
      matchId: insertResult.insertId,
    });
  } catch (error) {
    console.error("Error executing query", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.patch("/:id", async (req, res) => {
  const matchId = req.params.id;
  const {
    teamOneId,
    teamTwoId,
    matchTitle,
    matchTime,
    canBet,
    canShow,
    maxBetAmount,
  } = req.body;

  const validationErrors = [];

  // Validate match data if provided
  if (teamOneId && teamTwoId && teamOneId == teamTwoId) {
    validationErrors.push("Please select different teams.");
  }

  if (
    maxBetAmount !== undefined &&
    (typeof maxBetAmount !== "number" ||
      maxBetAmount < 0 ||
      !Number.isFinite(maxBetAmount))
  ) {
    validationErrors.push("Enter a valid max bet amount for the match");
  }

  if (canBet !== undefined && !["0", "1"].includes(canBet)) {
    return res
      .status(400)
      .json({ message: "Invalid value for canBet. Expected '0' or '1'" });
  }

  if (canShow !== undefined && !["0", "1"].includes(canShow)) {
    return res
      .status(400)
      .json({ message: "Invalid value for canShow. Expected '0' or '1'" });
  }

  if (validationErrors.length > 0) {
    return res.status(400).json({ errors: validationErrors });
  }

  // Validate match time format if provided
  if (matchTime) {
    const matchDate = new Date(matchTime);
    if (isNaN(matchDate.getTime())) {
      return res.status(400).json({ message: "Invalid match time." });
    }
  }

  try {
    const [matchRows] = await pool.execute(
      "SELECT * FROM matches WHERE id = ?",
      [matchId]
    );

    if (matchRows.length === 0) {
      return res.status(404).json({ message: "Match not found." });
    }

    const { team_one: existingTeamOne, team_two: existingTeamTwo } =
      matchRows[0];

    const newTeamOneId = teamOneId || existingTeamOne;
    const newTeamTwoId = teamTwoId || existingTeamTwo;

    if (newTeamOneId === newTeamTwoId) {
      return res
        .status(400)
        .json({ message: "Team Id must be different from other team Id" });
    }

    const validTeams = [];
    if (teamOneId) validTeams.push(teamOneId);
    if (teamTwoId) validTeams.push(teamTwoId);

    if (validTeams.length > 0) {
      const [teamRows] = await pool.execute(
        `SELECT id FROM teams WHERE id IN (${validTeams
          .map(() => "?")
          .join(", ")})`,
        validTeams
      );

      if (teamRows.length !== validTeams.length) {
        return res
          .status(400)
          .json({ message: "One or more selected teams not found." });
      }
    }

    const updates = [];
    const updateValues = [];

    if (teamOneId) {
      updates.push("team_one = ?");
      updateValues.push(teamOneId);
    }
    if (teamTwoId) {
      updates.push("team_two = ?");
      updateValues.push(teamTwoId);
    }
    if (matchTitle) {
      updates.push("match_title = ?");
      updateValues.push(matchTitle);
    }
    if (matchTime) {
      const matchDate = new Date(matchTime);
      const matchTimeUtc = new Date(matchDate.toISOString())
        .toISOString()
        .slice(0, 19)
        .replace("T", " ");
      updates.push("match_time = ?");
      updateValues.push(matchTimeUtc);
    }
    if (canBet !== undefined) {
      updates.push("can_bet = ?");
      updateValues.push(canBet);
    }
    if (canShow !== undefined) {
      updates.push("can_show = ?");
      updateValues.push(canShow);
    }
    if (maxBetAmount !== undefined) {
      updates.push("max_bet_amount = ?");
      updateValues.push(maxBetAmount);
    }

    updateValues.push(matchId);

    // Update the match record
    const query = `UPDATE matches SET ${updates.join(", ")}  WHERE id = ? `;
    await pool.execute(query, updateValues);

    res.json({
      message: "Match updated successfully",
      matchId: matchId,
    });
  } catch (error) {
    console.error("Error executing query", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.patch("/:matchId/process-bet", async (req, res) => {
  const { betStatus } = req.body;
  const { matchId } = req.params;

  if (!betStatus) {
    return res.status(400).json({ message: "Please provide the bet status!" });
  }

  if (
    betStatus &&
    !["dont_process", "process", "completed"].includes(betStatus)
  ) {
    return res.status(400).json({ message: "Invalid bet status" });
  }
  try {
    const [matchRows] = await pool.execute(
      "SELECT * FROM matches WHERE id = ?",
      [matchId]
    );

    if (matchRows.length === 0) {
      return res.status(404).json({ message: "Match not found." });
    }

    const query = `UPDATE matches SET bet_status = ?  WHERE id = ? `;
    await pool.execute(query, [betStatus, matchId]);

    res.json({
      message: "Match bet status updated successfully",
    });
  } catch (error) {
    console.error("Error executing query", error);
    res.status(500).json({ message: "Internal server error" });
  }
});
router.get("/:id/questions", async (req, res) => {
  try {
    const { id: match_id } = req.params;
    // Retrieve all available matches from the matches table
    const matchQuery = "Select * from matches where id = ?";
    let [matchRows] = await pool.execute(matchQuery, [match_id]);
    if (matchRows.length == 0) {
      return res.status(404).json({ message: "Match not found" });
    }
    matchRows = matchRows[0];

    const query = `SELECT * FROM match_questions WHERE match_id = ?`;
    const [rows] = await pool.execute(query, [match_id]);

    if (rows.length == 0) {
      return res.status(404).json({ message: "Questions not found" });
    }
    const questions = rows.map((row) => {
      return {
        id: row.id,
        question: row.question,
        canShow: row.can_show,
        options: jsonParse(row.options),
        correct_option: row.correct_option,
      };
    });
    res.json({ questions: questions });
  } catch (error) {
    console.error("Error executing query", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/:matchId/addQuestion", async (req, res) => {
  const { question, options } = req.body;
  const { matchId } = req.params;

  const validationErrors = [];
  const idsSet = new Set();

  if (!matchId) {
    validationErrors.push("Match ID is required.");
  }
  if (!question) {
    validationErrors.push("Question is required.");
  }
  if (!options || !Array.isArray(options) || options.length === 0) {
    validationErrors.push("Options should be an array.");
  }

  if (validationErrors.length > 0) {
    return res.status(400).json({ errors: validationErrors });
  }

  try {
    const [matchRows] = await pool.execute(
      "SELECT * FROM matches WHERE id = ?",
      [matchId]
    );

    if (matchRows.length === 0) {
      return res.status(400).json({ message: "Match not found" });
    }

    options.forEach((option, index) => {
      if (!option.id || !option.option || !option.odds) {
        validationErrors.push(
          `Option at index ${index} is missing id, option, or odds.`
        );
      }
      if (idsSet.has(option.id)) {
        validationErrors.push(
          `Option at index ${index} has a duplicate id: ${option.id}.`
        );
      } else {
        idsSet.add(option.id);
      }
    });

    if (validationErrors.length > 0) {
      return res.status(400).json({ errors: validationErrors });
    }

    const [insertResult] = await pool.execute(
      "INSERT INTO match_questions (match_id, question, can_show, options) VALUES (?, ?, ?, ?)",
      [matchId, question, "1", options]
    );

    res.json({
      message: "Question added successfully",
      questionId: insertResult.insertId,
    });
  } catch (error) {
    console.error("Error executing query", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.patch("/:matchId/players/:playerId", async (req, res) => {
  const { matchId, playerId } = req.params;
  const {
    score,
    sixes,
    fours,
    wickets,
    runOuts,
    stumps,
    catches,
    maidenOvers,
    ballsPlayed,
  } = req.body;

  const updates = [];
  const values = [];

  if (score !== undefined) {
    updates.push("player_score = ?");
    values.push(score);
  }
  if (sixes !== undefined) {
    updates.push("sixes = ?");
    values.push(sixes);
  }
  if (fours !== undefined) {
    updates.push("fours = ?");
    values.push(fours);
  }
  if (wickets !== undefined) {
    updates.push("wickets = ?");
    values.push(wickets);
  }
  if (runOuts !== undefined) {
    updates.push("run_outs = ?");
    values.push(runOuts);
  }
  if (stumps !== undefined) {
    updates.push("stumps = ?");
    values.push(stumps);
  }
  if (catches !== undefined) {
    updates.push("catches = ?");
    values.push(catches);
  }
  if (maidenOvers !== undefined) {
    updates.push("maiden_overs = ?");
    values.push(maidenOvers);
  }
  if (ballsPlayed !== undefined) {
    updates.push("balls_played = ?");
    values.push(ballsPlayed);
  }

  if (updates.length === 0) {
    return res.status(400).json({ message: "No fields provided to update" });
  }

  try {
    //Check if the combination of match_id and player_id exists
    const [existingPlayer] = await pool.execute(
      "SELECT * FROM match_player_mapping WHERE match_id = ? AND player_id = ?",
      [matchId, playerId]
    );
    // Calculate points
    const player = existingPlayer?.[0];

    const points =
      (score ?? player?.player_score ?? 0) +
      (sixes ?? player?.sixes ?? 0) * POINTS.SIX +
      (fours ?? player?.fours ?? 0) * POINTS.FOUR +
      (wickets ?? player?.wickets ?? 0) * POINTS.WICKET +
      (stumps ?? player?.stumps ?? 0) * POINTS.STUMP +
      (runOuts ?? player?.run_outs ?? 0) * POINTS.RUN_OUT +
      (catches ?? player?.catches ?? 0) * POINTS.CATCH +
      (maidenOvers ?? player?.maiden_overs ?? 0) * POINTS.MAIDEN_OVER;

    updates.push("points = ?");
    values.push(points);
    values.push(matchId, playerId);

    if (existingPlayer.length > 0) {
      //If exists, update the existing record with new data
      const updateQuery = `UPDATE match_player_mapping SET ${updates.join(
        ", "
      )} WHERE match_id = ? AND player_id = ?`;

      const [updateResult] = await pool.execute(updateQuery, values);
      await updateLeaderboard();

      res.json({
        message: "Player data updated successfully",
      });
    } else {
      // 3. If not exists, insert a new record
      const [insertResult] = await pool.execute(
        `INSERT INTO match_player_mapping (match_id, player_id, player_score, sixes, fours, wickets, run_outs, stumps, catches, maiden_overs, balls_played, points)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          matchId,
          playerId,
          score || 0,
          sixes || 0,
          fours || 0,
          wickets || 0,
          runOuts || 0,
          stumps || 0,
          catches || 0,
          maidenOvers || 0,
          ballsPlayed || 0,
          points,
        ]
      );
      await updateLeaderboard();

      res.status(201).json({
        message: "Player data added successfully",
        playerId: insertResult.insertId,
      });
    }
  } catch (error) {
    console.error("Error processing request", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/:matchId/players", async (req, res) => {
  const matchId = req.params.matchId;

  try {
    const [matchRows] = await pool.execute(
      "SELECT team_one, team_two FROM matches WHERE id = ?",
      [matchId]
    );

    if (matchRows.length === 0) {
      return res.status(404).json({ message: "Match not found" });
    }

    const { team_one, team_two } = matchRows[0];

    const [rows] = await pool.execute(
      `
        SELECT 
          t.id AS teamId, t.team_name AS teamName, t.team_logo AS teamLogo,
          p.id AS playerId, p.name AS playerName, p.player_role AS playerRole, p.player_logo AS playerLogo,
          COALESCE(s.balls_played, 0) AS ballsPlayed,
          COALESCE(s.player_score, 0) AS playerScore,
          COALESCE(s.points, 0) AS points,
          COALESCE(s.fours, 0) AS fours,
          COALESCE(s.sixes, 0) AS sixes,
          COALESCE(s.wickets, 0) AS wickets,
          COALESCE(s.maiden_overs, 0) AS maidenOvers,
          COALESCE(s.stumps, 0) AS stumps,
          COALESCE(s.catches, 0) AS catches,
          COALESCE(s.run_outs, 0) AS runOuts
        FROM players p
        JOIN teams t ON p.team_id = t.id
        LEFT JOIN match_player_mapping s ON s.player_id = p.id AND s.match_id = ?
        WHERE p.team_id IN (?, ?)
      `,
      [matchId, team_one, team_two]
    );
    // console.log("teams", rows);

    const teamMap = {};

    for (const row of rows) {
      const teamId = row.teamId;

      if (!teamMap[teamId]) {
        teamMap[teamId] = {
          id: teamId,
          teamName: row.teamName,
          teamLogo: row.teamLogo,
          players: [],
        };
      }

      teamMap[teamId].players.push({
        id: row.playerId,
        name: row.playerName,
        playerRole: row.playerRole,
        playerLogo: row.playerLogo,
        stats: {
          ballsPlayed: row.ballsPlayed,
          playerScore: row.playerScore,
          points: row.points,
          fours: row.fours,
          sixes: row.sixes,
          wickets: row.wickets,
          maidenOvers: row.maidenOvers,
          stumps: row.stumps,
          catches: row.catches,
          runOuts: row.runOuts,
        },
      });
    }

    const teams = Object.values(teamMap);
    

    if (teams.length >= 1) {
      res.json({
        team1: teamMap[team_one] || {},
        team2: teamMap[team_two] || {},
      });
    } else {
      res
        .status(404)
        .json({ message: "Match data incomplete or teams not found" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server error" });
  }
});

module.exports = router;
