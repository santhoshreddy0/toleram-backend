const express = require("express");
const router = express.Router();
const pool = require("../db");
const { verifyToken } = require("../middleware/middleware");
const crypto = require("crypto");
const moment = require("moment");

function validateString(string) {
  if (!string || string.trim().length === 0) return false;
  return true;
}

router.get("/getRoom/:roomName", verifyToken, async (req, res) => {
  const { roomName } = req.params;

  if (!roomName) {
    return res.status(400).json({ message: "Room name cannot be empty" });
  }

  try {
    const [roomRows] = await pool.execute(
      "SELECT * FROM rooms WHERE name = ?",
      [roomName]
    );

    if (roomRows.length > 0) {
      // If the room exists, send the room ID and name
      const room = roomRows[0];
      return res.status(200).json({
        id: room.id,
        name: room.name,
      });
    } else {
      // If the room doesn't exist, create a new room
      const [insertRoom] = await pool.execute(
        "INSERT INTO rooms (name) VALUES (?)",
        [roomName]
      );
      const newRoomId = insertRoom.insertId;

      return res.status(201).json({
        id: newRoomId,
        name: roomName,
      });
    }
  } catch (error) {
    console.error("Error executing query", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/rooms/:roomdId", verifyToken, async (req, res) => {
  const { roomdId } = req.params;
  const { comment } = req.body;
  const user_id = req.user.id;

  const created_at = moment.utc().format("YYYY-MM-DD HH:mm:ss");

  if (!validateString(comment)) {
    return res.status(400).json({ message: "Comment cannot be empty" });
  }

  if (!roomdId) {
    return res.status(400).json({ message: "Room ID is required" });
  }

  try {
    const [roomRows] = await pool.execute("SELECT * FROM rooms WHERE id = ?", [
      roomdId,
    ]);

    if (roomRows.length === 0) {
      return res.status(404).json({ message: "Room not found" });
    }

    const [insertComment] = await pool.execute(
      "INSERT INTO comments (room_id, user_id, comment, created_at) VALUES (?, ?, ?, ?)",
      [roomdId, user_id, comment, created_at]
    );

    res.status(200).json({
      message: "Comment added successfully",
      id: insertComment.insertId,
    });
  } catch (error) {
    console.error("Error executing query", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

const ITEMS_PER_PAGE = parseInt(process.env.ITEMS_PER_PAGE, 10) || 50;
const SECRET_KEY = crypto
  .createHash("sha256")
  .update(process.env.SECRET_KEY)
  .digest();
const IV_LENGTH = 16;

function encryptText(text) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv("aes-256-cbc", SECRET_KEY, iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return iv.toString("hex") + ":" + encrypted;
}

function decryptText(encryptedText) {
  const [ivHex, encrypted] = encryptedText.split(":");
  const iv = Buffer.from(ivHex, "hex");
  const decipher = crypto.createDecipheriv("aes-256-cbc", SECRET_KEY, iv);
  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");
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
      // return res.status(400).json({ message: "Invalid token" });
    }
  }

  if (isNaN(roomId)) {
    return res.status(400).json({ message: "Invalid room id" });
  }

  try {
    let query = `
  SELECT comments.*, users.name, users.email
  FROM comments
  JOIN users ON comments.user_id = users.id
  WHERE comments.room_id = ?
`;

    let params = [roomId];

    if (lastSeenId > 0) {
      query += " AND comments.id < ? ORDER BY comments.created_at DESC LIMIT ?";
      params = [roomId, lastSeenId, ITEMS_PER_PAGE];
    } else if (firstSeenId > 0) {
      query += " AND comments.id > ? ORDER BY comments.created_at DESC LIMIT ?";
      params = [roomId, firstSeenId, ITEMS_PER_PAGE];
    } else {
      query += " ORDER BY comments.created_at DESC LIMIT ?";
      params = [roomId, ITEMS_PER_PAGE];
    }

    const [rows] = await pool.query(query, params);

    if (rows.length === 0) {
      return res.status(404).json({ message: "No comments found" });
    }

    let nextToken = null;
    let prevToken = null;

    // If there are more comments after this batch, send nextToken
    if (rows.length === ITEMS_PER_PAGE) {
      nextToken = encryptText(
        JSON.stringify({
          lastSeenId: rows[rows.length - 1].id,
          firstSeenId: rows[0].id,
        })
      );
    }

    // If there are more comments before this batch, send prevToken
    if (firstSeenId > 0) {
      prevToken = encryptText(
        JSON.stringify({
          firstSeenId: rows[0].id,
          lastSeenId: rows[rows.length - 1].id,
        })
      );
    }

    return res.status(200).json({
      comments: rows,
      nextToken,
      prevToken,
    });
  } catch (error) {
    console.error("Error executing query", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
