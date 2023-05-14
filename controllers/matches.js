const express = require('express');
const router = express.Router();
const pool = require('../db');
const { verifyToken } = require("../middleware/middleware");

router.get("/", verifyToken, async (req, res) => {
  try {
    // Retrieve all available matches from the matches table
    const query = "SELECT * FROM matches";
    const [rows] = await pool.execute(query);

    res.json({ matches: rows });
  } catch (error) {
    console.error("Error executing query", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
