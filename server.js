const express = require("express");
const app = express();
cors = require("cors");
require("dotenv").config();

app.use(express.json());
app.use(cors());

// Set the default timezone to West African Time (Africa/Lagos)
const moment = require("moment");
require("moment-timezone");
moment.tz.setDefault("Africa/Lagos");

const loginRouter = require("./auth/login");
const signupRouter = require("./auth/signup");

const matchesRouter = require("./controllers/matches");
const bestPlayers = require("./controllers/bestPlayers");
const roundsRoutes = require("./controllers/rounds");
const betHistory = require("./controllers/betHistory");

app.use("/login", loginRouter);
app.use("/signup", signupRouter);
app.use("/matches", matchesRouter);
app.use("/bestplayers", bestPlayers);
app.use("/rounds", roundsRoutes);
app.use("/history", betHistory);

// Start the server
const port = process.env.PORT;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
