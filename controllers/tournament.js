const express = require("express");
const router = express.Router();
const pool = require("../db");
const { verifyToken, tournament } = require("../middleware/middleware");

router.get("/", verifyToken, async (req, res) => {
  try {
    const query = "SELECT * FROM tournaments";

    const [results] = await pool.execute(query);

    const formattedResults = results.map((row) => {
      const formattedRow = {};
      for (let key in row) {
        const camelCaseKey = key.replace(/_([a-z])/g, (match, letter) =>
          letter.toUpperCase()
        );
        formattedRow[camelCaseKey] = row[key];
      }
      return formattedRow;
    });

    res.json({ tournament: formattedResults });
  } catch (error) {
    console.error("Error executing query", error);
  }
});

module.exports = router;
