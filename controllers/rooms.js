const express = require("express");
const router = express.Router();
const pool = require("../db");
const { verifyToken } = require("../middleware/middleware");


router.get('/:roomName', verifyToken, async (req, res) => {
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
        name: room.name
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
        name: roomName
      });
    }
  } catch (error) {
    console.error("Error executing query", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports= router;