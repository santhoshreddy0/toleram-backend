const express = require("express");
const router = express.Router();
const pool = require("../db");
const { verifyToken } = require("../middleware/middleware");
const crypto = require('crypto');
const moment = require("moment");

function validateString(string) {
    if (!string || string.trim().length === 0) return false;
    return true;
}
router.post("/rooms/:roomdId", verifyToken, async (req, res) => {
    const { roomdId } = req.params;
    const { comment } = req.body;
    const user_id = req.user.id;
    const user_name = req.user.name;

    const created_at = moment.utc().format('YYYY-MM-DD HH:mm:ss');

    if (!validateString(comment)) {
        return res.status(400).json({ message: "Comment cannot be empty" });
    }

    if (!roomdId) {
        return res.status(400).json({ message: "Room ID is required" });
    }

    try {
        const [roomRows] = await pool.execute(
            "SELECT * FROM rooms WHERE id = ?",
            [roomdId]
        );

        if (roomRows.length === 0) {
            return res.status(404).json({ message: "Room not found" });
        }

        await pool.execute(
            "INSERT INTO comments (room_id, user_id, user_name, comment, created_at, likes_count) VALUES (?, ?, ?, ?, ?, ?)",
            [roomdId, user_id, user_name, comment, created_at, 0]
        );

        res.status(200).json({ message: "Comment added successfully" });

    } catch (error) {
        console.error("Error executing query", error);
        res.status(500).json({ message: "Internal server error" });
    }
});




ITEMS_PER_PAGE = 10;
const SECRET_KEY = crypto.createHash('sha256').update(process.env.SECRET_KEY).digest();
const IV_LENGTH = 16;

function encryptText(text) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-cbc', SECRET_KEY, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

function decryptText(encryptedText) {
  const [ivHex, encrypted] = encryptedText.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', SECRET_KEY, iv);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

router.get("/rooms/:roomId", async (req, res) => {
  const roomId = parseInt(req.params.roomId, 10);
  const { token } = req.query;
  let lastSeenId = 0;
  let firstSeenId = 0;

  if (token) {
    try {
      const decryptedToken = decryptText(token);
      const state = JSON.parse(decryptedToken);
      lastSeenId = parseInt(state.lastSeenId, 10) || 0;
      firstSeenId = parseInt(state.firstSeenId, 10) || 0;
    } catch (err) {
    //   return res.status(400).json({ message: "Invalid token" });
    }
  }

  if (isNaN(roomId)){
    return res.status(400).json({ message: "Invalid roomId" });
  }

  try {
    let query = "SELECT * FROM comments WHERE room_id = ? ORDER BY created_at DESC LIMIT ?";
    let params = [roomId, ITEMS_PER_PAGE];

    if (lastSeenId > 0) {
      query = "SELECT * FROM comments WHERE room_id = ? AND id < ? ORDER BY created_at DESC LIMIT ?";
      params = [roomId, lastSeenId, ITEMS_PER_PAGE];
    } else if (firstSeenId > 0) {
      query = "SELECT * FROM comments WHERE room_id = ? AND id > ? ORDER BY created_at DESC LIMIT ?";
      params = [roomId, firstSeenId, ITEMS_PER_PAGE];
    }

    const [rows] = await pool.query(query, params);

    if (rows.length === 0) {
      return res.status(404).json({ message: "No comments found" });
    }

    const nextToken = encryptText(
      JSON.stringify({ lastSeenId: rows[rows.length - 1].id })
    );

    const prevToken = encryptText(
      JSON.stringify({ firstSeenId: rows[0].id })
    );

    
    return res.status(200).json({
      comments:rows,
      nextToken,
      prevToken,
    });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
});




module.exports = router;
