const express = require("express");
const router = express.Router();
const pool = require("../db");
const { verifyToken } = require("../middleware/middleware");
const { jsonParse } = require("../utils");

router.get("/questions", async (req, res) => {
    try {
        const query = `SELECT * FROM best_player_questions`;
        const [rows] = await pool.execute(query);

        if (rows.length == 0) {
            return res.status(404).json({ message: "No questions found" });
        }

        const questions = rows.map((row) => {
            return {
                id: row.id,
                question: row.question,
                options: jsonParse(row.options),
                correct_option: row.correct_option || null,
            };
        });
        res.json({ questions:  questions });
    } catch (error) {
        console.error("Error executing query", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

router.put("/bets", verifyToken, async (req, res) => {
    try {
        const user_id = req.user.id;
        const { bets } = req.body;

        console.log(user_id);

        if (!bets || bets.length === 0) {
            return res.status(400).json({ message: "Answers are required" });
        }

        // const query = `INSERT INTO best_player_answers (user_id, question_id, option_id)
        //                VALUES ?`;
        // const values = answers.map((answer) => [user_id, answer.question_id, answer.option_id]);
        // await pool.query(query, [values]);

        const query = "Select * from rounds where id = ?";
        const [rows] = await pool.execute(query, [1]);
        if (rows.length === 0) {
            return res.status(404).json({ message: "Round not found" });
        }

        const round = rows[0];
        if (round.can_bet == 0) {
            return res
                .status(400)
                .json({ message: "Betting is closed for this match" });
        }

        const bestPlayerQuestions = `SELECT * FROM best_player_questions`;

        const [questions] = await pool.execute(bestPlayerQuestions);

        if(questions.length === 0) {
            return res.status(404).json({ message: "No questions found" });
        }


        let questionMap = {};

        questions.forEach((row) => {
            let data = {};
            data["option"] = bets[row.id]?.option || null;
            data["amount"] = bets[row.id]?.amount || 0;
            questionMap[row.id] = data;

        });


        const existingBetsQuery =
            "SELECT * FROM best_player_bets WHERE user_id = ?";
        const [existingBets] = await pool.execute(existingBetsQuery, [
            user_id,
        ]);

        if(existingBets.length == 0) {
            const insertQuery = "INSERT INTO best_player_bets (user_id, answers) VALUES (?, ?)";
            await pool.execute(insertQuery, [user_id, JSON.stringify(questionMap)]);
            res.status(200).json({ message: "bets saved successfully" });
        } else {
            const updateQuery = "UPDATE best_player_bets SET answers = ? WHERE user_id = ?";
            await pool.execute(updateQuery, [JSON.stringify(questionMap), user_id]);
            res.json({ message: "bets updated successfully" });
        }
    } catch (error) {
        console.error("Error executing query", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

router.get("/bets", verifyToken, async (req, res) => {
    try {
        const user_id = req.user.id;
        const query = "SELECT * FROM best_player_bets WHERE user_id = ?";
        const [rows] = await pool.execute(query, [user_id]);

        if (rows.length === 0) {
            return res.status(404).json({ message: "No bets found" });
        }

        const bets = rows[0];
        res.json({ bets: jsonParse(bets.answers) });
    } catch (error) {
        console.error("Error executing query", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

module.exports = router;
