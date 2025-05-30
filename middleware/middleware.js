const jwt = require("jsonwebtoken");
const secretKey = "secret";
const pool = require("../db");
const { invalid } = require("moment");

function verifyToken(req, res, next) {
  // Get the token from the request headers or query parameters
  const token = req.headers.token;

  if (!token) {
    return res.status(401).json({ message: "Missing token" });
  }

  try {
    // Verify and decode the token
    const decoded = jwt.verify(token, secretKey);
    req.user = decoded; // Attach the decoded user object to the request

    // Proceed to the next middleware or route handler
    next();
  } catch (error) {
    console.error("Error verifying token", error);
    return res.status(401).json({ message: "Invalid token" });
  }
}

function verifyRole(requiredRole) {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(403).json({ message: "User role not found" });
    }

    if (req.user.role !== requiredRole) {
      return res
        .status(403)
        .json({ message: `Access denied. Required role: ${requiredRole}` });
    }
    next();
  };
}

async function isTournamentStarted(pool) {
  try {
    const [rows] = await pool.execute(
      "SELECT run_super12_bets FROM tournaments WHERE id = 1"
    );

    const runSuper12Bets = rows[0]?.run_super12_bets;
    return runSuper12Bets === "no";
  } catch (error) {
    console.error("Error checking run_super12_bets:", error);
    return false;
  }
}

async function tournament(req, res, next) {
  try {
    const isStarted = await isTournamentStarted(pool);
    if (isStarted) {
      return res
        .status(400)
        .json({ message: "Action not allowed, tournament already started." });
    }
    next();
  } catch (error) {
    console.error("Error fetching matches", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

async function getUserById(userId) {
  const query = "SELECT * FROM users WHERE id = ?";
  const [rows] = await pool.execute(query, [userId]);

  if (rows.length === 1) {
    return rows[0];
  } else {
    return null;
  }
}

module.exports = {
  verifyToken,
  verifyRole,
  getUserById,
  tournament,
  isTournamentStarted,
};
