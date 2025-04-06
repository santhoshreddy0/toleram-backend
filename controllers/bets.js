const express = require("express");
const router = express.Router();
const pool = require("../db");

router.get("/bets/matches/:matchId/", async (req, res) => {
    try {
      const {matchId} = req.params;
    
      const query = `
        SELECT 
          SUM(total_amount) AS total_bets, 
          COUNT(DISTINCT user_id) AS total_users 
        FROM match_bets 
        WHERE match_id = ?
      `;
      
      const [rows] = await pool.execute(query, [matchId]);
      
      if (rows.length === 0 || rows[0].total_bets === null) {
        return res.status(404).json({ message: "No bets found for this match" });
      }
  
      const result = {
        total_bet_amount: rows[0].total_bets || 0, 
        total_users: rows[0].total_users || 0 
      };
  
      res.status(200).json(result);
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

router.get("/bets/rounds/:roundId/", async (req, res) => {
    try {
      const {roundId} = req.params;
    
      const query = `
        SELECT 
          SUM(total_amount) AS total_bets, 
          COUNT(DISTINCT user_id) AS total_users 
        FROM round_bets 
        WHERE round_id = ?
      `;
      
      const [rows] = await pool.execute(query, [roundId]);
      
      if (rows.length === 0 || rows[0].total_bets === null) {
        return res.status(404).json({ message: "No bets found for this round" });
      }
  
      const result = {
        total_bet_amount: rows[0].total_bets || 0, 
        total_users: rows[0].total_users || 0 
      };
  
      res.status(200).json(result);
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Internal server error" });
    }
  });  

  router.get("/bets/users/:userId", async (req, res) => {
    const { userId } = req.params;
    try {
        const query = `
            SELECT 
                SUM(match_bets.total_amount) AS total_bets, 
                COUNT(DISTINCT match_bets.match_id) AS total_matches,
                SUM(round_bets.total_amount) AS total_round_bets,
                COUNT(DISTINCT round_bets.round_id) AS total_rounds
            FROM match_bets 
            LEFT JOIN round_bets ON match_bets.user_id = round_bets.user_id 
            WHERE match_bets.user_id = ? OR round_bets.user_id = ?
        `;
        
        const [rows] = await pool.execute(query, [userId, userId]);

        if (rows.length === 0 || (rows[0].total_bets === null && rows[0].total_round_bets === null)) {
            return res.status(404).json({ message: "No bets found for this user" });
        }

        const result = {
            total_match_bet_amount: rows[0].total_bets || 0, 
            total_matches: rows[0].total_matches || 0,
            total_round_bet_amount: rows[0].total_round_bets || 0,
            total_rounds: rows[0].total_rounds || 0,
            total_bet_amount: (rows[0].total_bets || 0) + (rows[0].total_round_bets || 0),
        };

        res.status(200).json(result);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
});


router.get("/bets", async (req, res) => {
    try {
        const query = `
            SELECT 
                SUM(match_bets.total_amount) AS total_match_bets,
                COUNT(DISTINCT match_bets.match_id) AS total_matches,
                COUNT(DISTINCT match_bets.user_id) AS total_users_in_matches,
                SUM(round_bets.total_amount) AS total_round_bets,
                COUNT(DISTINCT round_bets.round_id) AS total_rounds,
                COUNT(DISTINCT round_bets.user_id) AS total_users_in_rounds,
                COUNT(DISTINCT COALESCE(match_bets.user_id, round_bets.user_id)) AS total_users_in_tournament
            FROM match_bets
            LEFT JOIN round_bets 
                ON match_bets.user_id = round_bets.user_id
        `;
        
        const [rows] = await pool.execute(query);

        if (rows.length === 0) {
            return res.status(404).json({ message: "No bets found for the tournament" });
        }

        const result = {
            total_match_bet_amount: rows[0].total_match_bets || 0, 
            // total_matches: rows[0].total_matches || 0,
            // total_users_in_matches: rows[0].total_users_in_matches || 0,
            total_round_bet_amount: rows[0].total_round_bets || 0,
            // total_rounds: rows[0].total_rounds || 0,
            // total_users_in_rounds: rows[0].total_users_in_rounds || 0,
            total_bet_amount: (rows[0].total_match_bets || 0) + (rows[0].total_round_bets || 0),
            total_users: rows[0].total_users_in_tournament || 0
        };

        res.status(200).json(result);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
});


module.exports = router;