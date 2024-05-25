const express = require("express");
const router = express.Router();
const pool = require("../db");
const { verifyToken } = require("../middleware/middleware");

router.get("/", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const query = `SELECT 
                        mb.match_id, mb.can_show_points, mb.points, m.match_title 
                    FROM 
                        match_bets mb 
                    LEFT JOIN matches m  
                        ON m.id = mb.match_id 
                    WHERE mb.user_id = ? `;
    const [matchRows] = await pool.execute(query, [userId]);
    const bets = {
      matchBets: [],
      roundBets: [],
      betPlayerBets: [],
    };
    if (matchRows.length > 0) {
      bets.matchBets = matchRows;
    }
    const query2 = `SELECT 
                        rb.round_id, rb.can_show_points, rb.points , r.round_name
                    FROM 
                        round_bets rb
                    LEFT JOIN rounds r 
                        ON r.id = rb.round_id
                    WHERE user_id = ?`;
    const [roundRows] = await pool.execute(query2, [userId]);
    if (roundRows.length > 0) {
      bets.roundBets = roundRows;
    }
    const query3 = `SELECT can_show_points, points FROM best_player_bets WHERE user_id = ?`;
    const [playerRows] = await pool.execute(query3, [userId]);
    if (playerRows.length > 0) {
      bets.betPlayerBets = playerRows;
    }
    res.json({ bets });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error." });
  }
});

router.get("/matches/:id", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const { id } = req.params;
    const query = `SELECT 
                            mb.match_id, mb.can_show_points, mb.points, m.match_title , mb.answers, m.can_bet
                        FROM 
                            match_bets mb 
                        LEFT JOIN matches m  
                            ON m.id = mb.match_id 
                        WHERE mb.user_id = ? AND mb.match_id = ?`;
    const [rows] = await pool.execute(query, [userId, id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: "Match not found" });
    }
    rows[0].answers = JSON.parse(rows[0].answers);
    res.json({ matchBet: rows[0] });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error." });
  }
});

router.get("/rounds/:id", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const { id } = req.params;
    const query = `SELECT 
                            rb.round_id, rb.can_show_points, rb.points , r.round_name, rb.answers, r.can_bet
                        FROM 
                            round_bets rb
                        LEFT JOIN rounds r 
                            ON r.id = rb.round_id
                        WHERE user_id = ? AND rb.round_id = ?`;
    const [rows] = await pool.execute(query, [userId, id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: "Round not found" });
    }
    rows[0].answers = JSON.parse(rows[0].answers);
    res.json({ roundBet: rows[0] });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error." });
  }
});
router.get("/bestplayers", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const query = `SELECT can_show_points, points, answers , rounds.can_bet
                        FROM 
                            best_player_bets 
                        LEFT JOIN rounds
                            ON rounds.id = 1
                        WHERE user_id = ?`;
    const [rows] = await pool.execute(query, [userId]);
    if (rows.length === 0) {
      return res.status(404).json({ message: "Best player bets not found" });
    }
    rows[0].answers = JSON.parse(rows[0].answers);
    res.json({ bestPlayerBets: rows[0] });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error." });
  }
});

router.get("/rewards", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    let totalPoints = 0.0;
    const points = {};
    const matchQuery = `SELECT SUM(points) as match_points FROM match_bets WHERE user_id = ?`;
    const [matchRows] = await pool.execute(matchQuery, [userId]);
    if (matchRows.length == 0) {
      points["match_points"] = 0.0;
      // totalPoints += 0.0;
    } else {
      points["match_points"] = parseFloat(parseFloat(matchRows[0].match_points).toFixed(2));
    }
    totalPoints += points['match_points']
    const roundQuery = `SELECT SUM(points) as round_points FROM round_bets WHERE user_id = ?`;
    const [roundRows] = await pool.execute(roundQuery, [userId]);
    
    // res.json({"sk":roundRows.length})
    if (roundRows[0].round_points == null) {
      points["round_points"] = 0.0;
      // totalPoints += 0.0;
    } else {
      points["round_points"] = parseFloat(parseFloat(roundRows[0].round_points).toFixed(2));
    }
    totalPoints += points["round_points"];
    
    const bestPlayerQuery = `SELECT SUM(points) as best_player_points FROM best_player_bets WHERE user_id = ?`;
    const [bestPlayerRows] = await pool.execute(bestPlayerQuery, [userId]);
    if (bestPlayerRows[0].best_player_points == null) {
      points["best_player_points"] = 0.0;
      // totalPoints += 0.0;
    } else {
      points["best_player_points"] = parseFloat(
        bestPlayerRows[0].best_player_points
      ).toFixed(2);
    }
    totalPoints += points["best_player_points"];
    
             
    
    res.json({ points, totalPoints: totalPoints });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error." });
  }
});
module.exports = router;
