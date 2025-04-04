const express = require("express");
const router = express.Router();
const pool = require("../db");

function validateString(string) {
    if (string && string.trim().length === 0) return false;
    return true;
  }

router.patch("/", async (req, res) => {
    const { logo, name } = req.body;
    const userId = req.user.id;

    if (!name && !logo) {
        return res.status(400).json({ message: "No fields provided to update" });
    }

    if (name && name.length < 3) {
        return res.status(400).json({ message: "Invalid name. Must be at least 3 characters." });
    }

    if(validateString(logo)) {
        return res.status(400).json({ message: "Invalid logo" });
    }

    try {
        let query = "UPDATE users SET ";
        let values = [];

        if (name) {
            query += "name = ?, ";
            values.push(name);
        }

        if (logo) {
            query += "user_logo = ?, ";
            values.push(logo);
        }
        query = query.slice(0, -2) + " WHERE id = ?";
        values.push(userId);

        const [rows] = await pool.execute(query, values);

        if (rows.affectedRows === 1) {
            res.json({ message: "User updated successfully" });
        } else {
            res.status(404).json({ message: "User not found" });
        }
    } catch (error) {
        console.error("Error executing query", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

module.exports = router;
