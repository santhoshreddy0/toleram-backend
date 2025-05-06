const express = require("express");
const router = express.Router();
const pool = require("../../db");
const { jsonParse } = require("../../utils");
const RedisClient = require("../../redis");
const { LEADERBOARD_KEY } = require("../../constants");

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

router.get("/users/bets", async (req, res) => {
  const { email } = req.query;

  try {
    const [[user]] = await pool.execute(`SELECT * FROM users WHERE email = ?`, [
      email,
    ]);
    if (!user)
      return res.status(404).json({ message: "No user found with the email" });

    const userId = user.id;

    const [matchBets] = await pool.execute(
      `SELECT 
        mb.match_id,
        mb.total_amount AS bet_amount,
        mb.answers,
        mb.points,
        m.match_title
      FROM match_bets mb
      JOIN matches m ON mb.match_id = m.id
      WHERE mb.user_id = ?`,
      [userId]
    );

    const [roundBets] = await pool.execute(
      `SELECT 
        rb.round_id,
        rb.total_amount AS bet_amount,
        rb.answers,
        rb.points,
        r.round_name AS round_title
      FROM round_bets rb
      JOIN rounds r ON rb.round_id = r.id
      WHERE rb.user_id = ?`,
      [userId]
    );

    const matchIds = matchBets.map((b) => b.match_id);
    const roundIds = roundBets.map((b) => b.round_id);

    const matchQsQuery = matchIds.length
      ? `SELECT id, match_id, question, options, correct_option
         FROM match_questions
         WHERE match_id IN (${matchIds.map(() => "?").join(",")})`
      : null;

    const roundQsQuery = roundIds.length
      ? `SELECT id, round_id, question, options, correct_option
         FROM round_questions
         WHERE round_id IN (${roundIds.map(() => "?").join(",")})`
      : null;

    const [matchQuestions = []] = matchQsQuery
      ? await pool.execute(matchQsQuery, matchIds)
      : [[]];
    const [roundQuestions = []] = roundQsQuery
      ? await pool.execute(roundQsQuery, roundIds)
      : [[]];

    const matchQMap = matchQuestions.reduce((acc, q) => {
      if (!acc[q.match_id]) acc[q.match_id] = [];
      acc[q.match_id].push(q);
      return acc;
    }, {});

    const roundQMap = roundQuestions.reduce((acc, q) => {
      if (!acc[q.round_id]) acc[q.round_id] = [];
      acc[q.round_id].push(q);
      return acc;
    }, {});

    const parseJSON = (val) => {
      try {
        return typeof val === "string" ? JSON.parse(val) : val || {};
      } catch {
        return {};
      }
    };

    const formatBets = (
      bets,
      qMap,
      idKey,
      titleKey = null,
      responseTitleKey = null
    ) =>
      bets.map((bet) => {
        const questions = qMap[bet[idKey]] || [];
        const answers = parseJSON(bet.answers);

        const formattedQs = questions
          .filter((q) => {
            const userAns = answers[q.id];
            return userAns && userAns.option != null;
          })
          .map((q) => {
            const options = Array.isArray(q.options)
              ? q.options
              : parseJSON(q.options);
            const userAns = answers[q.id];
            return {
              questionId: q.id,
              question: q.question,
              options,
              choseOption: userAns.option,
              correct:
                q.correct_option && userAns.option == q.correct_option
                  ? "Yes"
                  : "No",
              betAmount: userAns.amount || 0,
              correctOption: q.correct_option,
            };
          });

        const betData = {
          [idKey]: bet[idKey],
          betAmount: bet.bet_amount,
          points: bet.points || 0,
          bets: formattedQs,
        };

        if (titleKey && responseTitleKey) {
          betData[responseTitleKey] = bet[titleKey];
        }

        return betData;
      });

    const [teamPlayers] = await pool.execute(
      `SELECT
        dp.player_id,
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
      LEFT JOIN match_player_mapping mpm ON dp.player_id = mpm.player_id
      LEFT JOIN players p ON p.id = dp.player_id
      WHERE dp.user_id = ?
      GROUP BY dp.player_id, dp.role_type`,
      [userId]
    );

    const totalPoints = teamPlayers.reduce((sum, p) => sum + p.points, 0);

    const { password, ...userWithoutPassword } = user;

    const userRank = await RedisClient.zRevRank(
      LEADERBOARD_KEY,
      String(userId)
    );

    res.status(200).json({
      user: userWithoutPassword,
      matchBets: formatBets(
        matchBets,
        matchQMap,
        "match_id",
        "match_title",
        "matchTitle"
      ),
      roundBets: formatBets(
        roundBets,
        roundQMap,
        "round_id",
        "round_title",
        "roundTitle"
      ),
      dream11: {
        team: teamPlayers,
        totalPoints,
        userRank: userRank !== null ? userRank + 1 : null,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/bets", async (req, res) => {
  try {
    const query = `WITH match_summary AS (
    SELECT 
        SUM(total_amount) AS total_match_bet_amount,
  			COUNT(*) AS match_bet_count
    FROM match_bets
),
round_summary AS (
    SELECT 
        SUM(total_amount) AS total_round_bet_amount,
  			COUNT(*) AS round_bet_count
    FROM round_bets
)
SELECT 
    m.total_match_bet_amount,
    m.match_bet_count,
		r.total_round_bet_amount,
		r.round_bet_count
FROM match_summary m
CROSS JOIN round_summary r`;

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
      totalMatchesbetAmount: rows[0].total_match_bet_amount || 0,
      // total_matches: rows[0].total_matches || 0,
      totalMatchesBets: rows[0].match_bet_count || 0,
      totalRoundsBetAmount: rows[0].total_round_bet_amount || 0,
      // total_rounds: rows[0].total_rounds || 0,
      totalRoundsBets: rows[0].round_bet_count || 0,
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

router.get("/match/bets", async (req, res) => {
  try {
    const query = `SELECT 
    mt.id AS matchId,
    mt.match_title AS matchTitle,
    COALESCE(SUM(m.total_amount), 0) AS totalAmount,
    COALESCE(COUNT(DISTINCT m.user_id), 0) AS totalBets
FROM 
    matches mt
LEFT JOIN 
    match_bets m ON mt.id = m.match_id
GROUP BY 
    mt.id, mt.match_title`;

    const [matchRows] = await pool.execute(query);
    if (matchRows.length === 0) {
      res.status(404).json({ message: "No match bets found" });
    }
    res.status(200).json(matchRows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/round/bets", async (req, res) => {
  try {
    const query = `SELECT 
    rd.id AS roundId,
    rd.round_name AS roundName,
    COALESCE(SUM(r.total_amount), 0) AS totalAmount,
    COALESCE(COUNT(DISTINCT r.user_id), 0) AS totalBets
FROM 
    rounds rd
LEFT JOIN 
    round_bets r ON rd.id = r.round_id
GROUP BY 
    rd.id, rd.round_name`;

    const [matchRows] = await pool.execute(query);
    if (matchRows.length === 0) {
      res.status(404).json({ message: "No round bets found" });
    }
    res.status(200).json(matchRows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.delete("/bets/dream11/leaderboard", async (req, res) => {
  try {
    await RedisClient.delete(LEADERBOARD_KEY);
    return res
      .status(200)
      .json({ message: "Leaderboard cleared successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
