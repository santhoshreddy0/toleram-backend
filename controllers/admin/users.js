
const express = require("express");
const router = express.Router();
const pool = require("../../db");
const { jsonParse } = require("../../utils");


router.get("/search", async (req, res) => {
    try {
      const { email } = req.query;
  
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }

      const query = `
        SELECT *
        FROM users
        WHERE email LIKE ?
      `;
  
      const [rows] = await pool.execute(query, [`${email}%`]);
      if (rows.length === 0) {
        return res.status(404).json({ message: "No users found with this email pattern" });
      }

      res.status(200).json(rows);
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  module.exports = router;
  