
const express = require("express");
const router = express.Router();
const pool = require("../db");


function validateName(name) {
  if (!name || name.length < 3) return false;
  return true;
}

function validateString(string) {
  if (!string || string.trim().length === 0) return false;
  return true;
}


router.post("/matches", async (req, res) => {
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

router.post("/matches/:matchId/addQuestion",  async (req, res) => {
  const { question, canShow, options } = req.body;
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

    const [insertResult] = await pool.execute(
      "INSERT INTO match_questions (match_id, question, can_show, options) VALUES (?, ?, ?, ?)",
      [matchId, question, canShow || "1", options]
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

router.patch("/matches/:matchId/players/:playerId", async (req, res) => {
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

router.patch("/players/:playerId", async (req, res) => {
    const { playerId } = req.params;
    const { name, imageKey, role  } = req.body;
  
    if (name && !validateName(name)) {
      return res.status(400).json({ message: "Invalid player name" });
    }
  
    if (imageKey && !validateString(imageKey)) {
      return res.status(400).json({ message: "Invalid key" });
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
  
  router.post("/teams", async (req, res) => {
    const { name, imageKey } = req.body;
  
    if (!validateName(name)) {
      res.status(400).json({ message: "Invalid team name" });
      return;
    }
  
    if (!validateString(imageKey)) {
      res.status(400).json({ message: "Invalid key" });
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
        [name, imageKey]
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
  
  router.patch("/teams/:teamId", async (req, res) => {
      const { teamId } = req.params;
      const { name, imageKey, status } = req.body;
    
      if (name && !validateName(name)) {
        return res.status(400).json({ message: "Invalid team name" });
      }
    
      if (imageKey && !validateString(imageKey)) {
        return res.status(400).json({ message: "Invalid key" });
      }
    
      if (status && !['0', '1'].includes(status)) {
        return res.status(400).json({ message: "Invalid operation" });
      }
    
      try {
        // Check if the team exists
        const [teamRows] = await pool.execute(
          "SELECT * FROM teams WHERE id = ?",
          [teamId]
        );
    
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
    
        if (imageKey) {
          updateFields.push("team_logo = ?");
          updateValues.push(imageKey);
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
          message: "Team updated successfully"
        });
      } catch (error) {
        console.error("Error executing query", error);
        res.status(500).json({ message: "Internal server error" });
      }
    });

    //createplayer
      router.post("/teams/:teamId", async (req, res) => {
        const { teamId } = req.params;
        const { name, imageKey , role} = req.body;
      
        if (!validateName(name)) {
          return res.status(400).json({ message: "Invalid player name" });
        }
      
        if (!validateString(imageKey)) {
          return res.status(400).json({ message: "Invalid key" });
        }
    
        if (!role || !['all-rounder', 'batsman', 'bowler', 'wicket-keeper'].includes(role)) {
            return res.status(400).json({ message: "Invalid role for player" });
          }
    
      
        try {
          // Check if the team exists
          const [teamRows] = await pool.execute(
            "SELECT * FROM teams WHERE id = ?",
            [teamId]
          );
      
          if (teamRows.length === 0) {
            return res.status(404).json({ message: "Team not found" });
          }
    
          const [playerRows] = await pool.execute(
            "SELECT * FROM players WHERE name = ? AND team_id = ?", 
            [name, teamId]
          );
      
          if (playerRows.length > 0) {
            return res.status(400).json({ message: "Player with the name already exists in the team" });
          }
      
          const [insertResult] = await pool.execute(
            "INSERT INTO players (name, player_logo, team_id, player_role) VALUES (?, ?, ?, ?)",
            [name, imageKey, teamId, role]
          );
      
          res.json({
            message: "Player added successfully",
            player: {
              id: insertResult.insertId,
              name,
              imageKey,
              teamId,
            },
          });
        } catch (error) {
          console.error("Error executing query", error);
          res.status(500).json({ message: "Internal server error" });
        }
      });

module.exports = router;