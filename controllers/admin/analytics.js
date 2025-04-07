const express = require("express");
const router = express.Router();
const pool = require("../../db");
const { jsonParse } = require("../../utils");

router.get("/matches/:matchId/bets", async (req, res) => {
  try {
    const { matchId } = req.params;

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
      totalBetAmount: rows[0].total_bets || 0,
      totalBets: rows[0].total_users || 0,
    };

    res.status(200).json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/rounds/:roundId/bets", async (req, res) => {
  try {
    const { roundId } = req.params;

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
      totalBetAmount: rows[0].total_bets || 0,
      totalBets: rows[0].total_users || 0,
    };

    res.status(200).json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/users/:userId/bets", async (req, res) => {
  const { userId } = req.params;
  try {
    const query = `
      SELECT 
          match_bets.match_id,
          match_bets.total_amount AS bet_amount,
          match_bets.answers,
          match_bets.points
      FROM match_bets 
      WHERE match_bets.user_id = ?
    `;
    const [matchBetsRows] = await pool.execute(query, [userId]);

    const roundQuery = `
      SELECT 
          round_bets.round_id,
          round_bets.total_amount AS bet_amount,
          round_bets.answers,
          round_bets.points
      FROM round_bets
      WHERE round_bets.user_id = ?
    `;
    const [roundBetsRows] = await pool.execute(roundQuery, [userId]);

    if (matchBetsRows.length === 0 && roundBetsRows.length === 0) {
      return res.status(404).json({ message: "No bets found for this user (matches and rounds)" });
    }

    let matchQuestionsRows = [];
    if (matchBetsRows.length > 0) {
      const matchIds = matchBetsRows.map(row => row.match_id);
      const matchQuestionsQuery = `
        SELECT 
            id,
            match_id,
            question,
            options,
            correct_option
        FROM match_questions
        WHERE match_id IN (?)
      `;
      [matchQuestionsRows] = await pool.execute(matchQuestionsQuery, matchIds);
    }

    let roundQuestionsRows = [];
    if (roundBetsRows.length > 0) {
      const roundIds = roundBetsRows.map(row => row.round_id);
      const roundQuestionsQuery = `
        SELECT 
            id,
            round_id,
            question,
            options,
            correct_option
        FROM round_questions
        WHERE round_id IN (?)
      `;
      [roundQuestionsRows] = await pool.execute(roundQuestionsQuery, roundIds);
    }

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

    const totalPoints = teamPlayers && teamPlayers.length > 0
      ? teamPlayers.reduce((sum, player) => sum + player.points, 0)
      : 0;

    const result = {
      matchBets: matchBetsRows.length > 0 ? matchBetsRows.map(matchBet => {
        const matchQuestions = matchQuestionsRows.map(question => {
          const userAnswer = matchBet.answers ? jsonParse(matchBet.answers)[question.id] : {};
          const options = Array.isArray(question.options) ? question.options : JSON.parse(question.options);
          
          return {
            questionId: question.id,
            question: question.question,
            options: options,
            choseOption: userAnswer?.option || null,
            correct: userAnswer?.option === question.correct_option ? 'Yes' : 'No',
            betAmount: userAnswer.amount || 0,
            correctOption: question.correct_option
          };
        });

        return {
          matchId: matchBet.match_id,
          betAmount: matchBet.bet_amount,
          bets: matchQuestions,
          points: matchBet.points || 0
        };
      }) : [],

      rounds: roundBetsRows.length > 0 ? roundBetsRows.map(roundBet => {
        const roundQuestions = roundQuestionsRows.map(question => {
          const userAnswer = roundBet.answers ? jsonParse(roundBet.answers)[question.id] : {};
          const options = Array.isArray(question.options) ? question.options : JSON.parse(question.options);

          return {
            questionId: question.id,
            question: question.question,
            options: options,
            choseOption: userAnswer?.option || null,
            correct: userAnswer?.option === question.correct_option ? 'Yes' : 'No',
            betAmount: userAnswer.amount || 0,
            correctOption: question.correct_option
          };
        });

        return {
          roundId: roundBet.round_id,
          betAmount: roundBet.bet_amount,
          bets: roundQuestions,
          points: roundBet.points || 0
        };
      }) : [],

      dream11: {
        team: teamPlayers,
        totalPoints
      }
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

    const dream11Query = `
        SELECT COUNT(DISTINCT user_id) AS total_dream11_users
        FROM dream11_players
    `;

    const [rows] = await pool.execute(query);
    const [dream11Rows] = await pool.execute(dream11Query);

    if (rows.length === 0) {
      return res
        .status(404)
        .json({ message: "No bets found for the tournament" });
    }

    const result = {
      totalMatchesbetAmount: rows[0].total_match_bets || 0,
      // total_matches: rows[0].total_matches || 0,
      totalMatchesBets: rows[0].total_users_in_matches || 0,
      totalRoundsBetAmount: rows[0].total_round_bets || 0,
      // total_rounds: rows[0].total_rounds || 0,
      totalRoundsBets: rows[0].total_users_in_rounds || 0,
      // total_bet_amount: (rows[0].total_match_bets || 0) + (rows[0].total_round_bets || 0),
      // total_users: rows[0].total_users_in_tournament || 0,
      totalDream11Bets: dream11Rows[0].total_dream11_users || 0,
    };

    res.status(200).json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
