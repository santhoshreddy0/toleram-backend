const express = require("express");
const router = express.Router();
const pool = require("../db");
const { verifyToken, verifyRole } = require("../middleware/middleware");
const moment = require("moment");
const { jsonParse } = require("../utils");

router.post("/", verifyRole("admin"), async (req, res) => {
  const {
    teamOneId,
    teamTwoId,
    matchTitle,
    matchTime,
    canBet,
    canShow,
    betStatus,
  } = req.body;
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
  if(betStatus && !['dont_process', 'process', 'completed'].includes(betStatus)){
    validationErrors.push("Invalid bet status");
  }

  if (validationErrors.length > 0) {
    return res.status(400).json({ errors: validationErrors });
  }

  // Validate match time format (assume it's in ISO string format)
  const matchDate = new Date(matchTime);
  if (isNaN(matchDate.getTime())) {
    return res.status(400).json({ message: "Invalid match time" });
  }

  // Set the match_time to UTC format (use toISOString() to get UTC)
  const matchTimeUtc = new Date(matchDate.toISOString()).toISOString().slice(0, 19).replace('T', ' ');

  try {
    const [teamRows] = await pool.execute(
      "SELECT * FROM teams WHERE id IN (?, ?)",
      [teamOneId, teamTwoId]
    );

    if (teamRows.length !== 2) {
      return res.status(400).json({ message: "One or both teams not found" });
    }

    const [insertResult] = await pool.execute(
      "INSERT INTO matches (team_one, team_two, match_title, match_time, can_bet, can_show, bet_status) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [
        teamOneId,
        teamTwoId,
        matchTitle,
        matchTimeUtc,
        canBet || "1",
        canShow || "1",
        betStatus || "dont_process",
      ]
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

router.post("/:matchId/addQuestion", verifyRole("admin"), async (req, res) => {
  const { question, canShow, options, correctOption } = req.body;
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
        validationErrors.push(`Option at index ${index} is missing id, option, or odds.`);
      }
      if (idsSet.has(option.id)) {
        validationErrors.push(`Option at index ${index} has a duplicate id: ${option.id}.`);
      } else {
        idsSet.add(option.id);
      }
    });

    if (validationErrors.length > 0) {
      return res.status(400).json({ errors: validationErrors });
    }

    // if (correctOption) {
    //   const validOption = options.some(opt => opt.option === correctOption);
    //   if (!validOption) {
    //     validationErrors.push("Correct option does not match any of the available options.");
    //   }
    // }

    const [insertResult] = await pool.execute(
      "INSERT INTO match_questions (match_id, question, can_show, options, correct_option) VALUES (?, ?, ?, ?, ?)",
      [matchId, question, canShow || "1", options, correctOption || null]
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

router.patch("/:matchId/players/:playerId", verifyRole('admin'), async (req, res) => {
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
    console.log(existingPlayer, "existing player");
    // Calculate points
    const points =
      (score || existingPlayer[0].player_score || 0) +
      (sixes || existingPlayer[0].sixes || 0) * 6 +
      (fours || existingPlayer[0].fours || 0) * 4 +
      (wickets || existingPlayer[0].wickets || 0) * 25 +
      (stumps || existingPlayer[0].stumps || 0) * 12 +
      (runOuts || existingPlayer[0].run_outs || 0) * 12 +
      (catches || existingPlayer[0].catches || 0) * 8 +
      (maidenOvers || existingPlayer[0].maiden_overs || 0) * 12;

    updates.push("points = ?");
    values.push(points);
    values.push(matchId, playerId);

    if (existingPlayer.length > 0) {
      //If exists, update the existing record with new data
      const updateQuery = `UPDATE match_player_mapping SET ${updates.join(
        ", "
      )} WHERE match_id = ? AND player_id = ?`;

      const [updateResult] = await pool.execute(updateQuery, values);

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

router.get("/", async (req, res) => {
  try {
    // Retrieve all available matches from the matches table
    const query = `SELECT matches.*, 
              teams.team_name AS team_one_name,
              teams.team_logo AS team_one_logo,
              team2.team_name AS team_two_name,
              team2.team_logo AS team_two_logo
              FROM matches 
              JOIN teams 
                ON matches.team_one = teams.id 
              JOIN teams AS team2 
                ON matches.team_two = team2.id
            `;
    const [rows] = await pool.execute(query);
    // rows.forEach((row) => {
    //     row.match_time = moment.tz(row.match_time, "Africa/Lagos").format();
    // });

    res.json({ matches: rows });
  } catch (error) {
    console.error("Error executing query", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    // Retrieve all available matches from the matches table
    const query = `SELECT matches.*, 
              teams.team_name AS team_one_name,
              teams.team_logo AS team_one_logo,
              team2.team_name AS team_two_name,
              team2.team_logo AS team_two_logo
              FROM matches 
              JOIN teams 
                ON matches.team_one = teams.id 
              JOIN teams AS team2 
                ON matches.team_two = team2.id
              WHERE matches.id = ?
            `;
    const [rows] = await pool.execute(query, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "Match not found" });
    }

    res.json({ match: rows[0] });
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
    console.log("rows", rows);
    const questions = rows.map((row) => {
      return {
        id: row.id,
        question: row.question,
        options: jsonParse(row.options),
        correct_option:
          matchRows.bet_status == "completed" ? row.correct_option : null,
      };
    });
    res.json({ questions: questions });
  } catch (error) {
    console.error("Error executing query", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/:id/bet", verifyToken, async (req, res) => {
  try {
    const { id: match_id } = req.params;
    const user_id = req.user.id;
    const query = "Select * from matches where id = ?";
    const [rows] = await pool.execute(query, [match_id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: "Match not found" });
    }

    const match = rows[0];

    const quesstionQuery = "Select id from match_questions where match_id = ?";
    const [questionRows] = await pool.execute(quesstionQuery, [match_id]);

    if (questionRows.length === 0) {
      return res
        .status(404)
        .json({ message: "No questions found for this match" });
    }

    const rowCheckingQuery =
      "SELECT * FROM match_bets WHERE user_id = ? AND match_id = ?";
    const rowValues = [user_id, match_id];
    const [existing_bets] = await pool.execute(rowCheckingQuery, rowValues);

    if (existing_bets.length === 0) {
      return res.status(404).json({ message: "No bets found" });
    } else {
      return res
        .status(200)
        .json({ bets: JSON.parse(existing_bets[0].answers) });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
});
router.put("/:id/bet", verifyToken, async (req, res) => {
  try {
    const { id: match_id } = req.params;
    const user_id = req.user.id;
    const { bets } = req.body;
    if (!bets || bets?.length === 0) {
      return res.status(400).json({ message: "No bets provided" });
    }

    const query = "Select * from matches where id = ?";
    const [rows] = await pool.execute(query, [match_id]);
    if (rows.length == 0) {
      return res.status(404).json({ message: "Match not found" });
    }

    const match = rows[0];
    if (match.can_bet == 0) {
      return res
        .status(400)
        .json({ message: "Betting is closed for this match" });
    }

    const quesstionQuery = "Select id from match_questions where match_id = ?";
    const [questionRows] = await pool.execute(quesstionQuery, [match_id]);

    if (questionRows.length == 0) {
      return res
        .status(404)
        .json({ message: "No questions found for this match" });
    }

    const questionMap = {};
    questionRows.forEach((row) => {
      let data = {};
      data["option"] = bets[row.id]?.option || null;
      data["amount"] = bets[row.id]?.amount || 0;
      questionMap[row.id] = data;
    });

    const rowCheckingQuery =
      "SELECT * FROM match_bets WHERE user_id = ? AND match_id = ?";
    const rowValues = [user_id, match_id];
    const [existing_bets] = await pool.execute(rowCheckingQuery, rowValues);

    if (existing_bets.length === 0) {
      const postQuery =
        "INSERT INTO match_bets (user_id, match_id,answers) VALUES (?, ? , ?) ";
      await pool.query(postQuery, [
        user_id,
        match_id,
        JSON.stringify(questionMap),
      ]);
      return res.status(200).json({ message: "Bet placed successfully" });
    } else {
      const putQuery =
        "UPDATE match_bets SET answers = ? WHERE user_id = ? AND match_id = ?";
      await pool.query(putQuery, [
        JSON.stringify(questionMap),
        user_id,
        match_id,
      ]);
      return res.status(200).json({ message: "Bet updated successfully" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
