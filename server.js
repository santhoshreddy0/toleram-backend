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
const teamsRouter = require("./controllers/teams");
const playersRouter = require("./controllers/players");
const dream11 = require("./controllers/dream11");
const adminRouter = require("./controllers/admin");
const commentsRouter = require("./controllers/comments");
const roomsRouter = require("./controllers/rooms");
const userRouter = require("./controllers/user");
const tournamentRouter = require("./controllers/tournament");
const { verifyToken, verifyRole } = require("./middleware/middleware");

app.use("/login", loginRouter);
app.use("/signup", signupRouter);
app.use("/matches", matchesRouter);
app.use("/bestplayers", bestPlayers);
app.use("/rounds", roundsRoutes);
app.use("/history", betHistory);
app.use("/teams", teamsRouter);
app.use("/players", playersRouter);
app.use('/dream11', verifyToken, dream11);
app.use('/comments', commentsRouter);
app.use('/rooms', roomsRouter);
app.use("/user", verifyToken, userRouter);
app.use('/tournament', tournamentRouter);
app.use('/admin', verifyToken, verifyRole('admin'), adminRouter);
// Start the server
const port = process.env.PORT;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
