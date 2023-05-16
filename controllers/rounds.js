
const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/middleware");

const pool = require("../db");


// Endpoint to update a user bet
router.put("/", verifyToken, async (req, res) => {
  try {
    const {
        start_time,
        status,
        id
    } = req.body;

    let query_fields =
      "start_time = ?, status = ?";
    let values = [
        start_time ,
        status,
        id
    ];
    // Update the user bet in the database
    const query = `UPDATE time_channel SET ${query_fields} WHERE id = ?`;
    await pool.execute(query, values);

    res.json({ message: "updated" });
  } catch (error) {
    console.error("Error updating rounds", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/", async (req, res) => {
    try {
  
      // Fetch all user bets from the database
      const query = "SELECT * FROM time_channel";
      const [rows] = await pool.execute(query);
  
      res.json({ rounds: rows });
    } catch (error) {
      console.error("Error retrieving roundas", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });


module.exports = router;
