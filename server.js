const express = require('express');
const app = express();
cors = require('cors')

app.use(express.json());
app.use(cors());

const moment = require('moment');
require('moment-timezone');
const config = require('./config');
// Set the default timezone to West African Time (Africa/Lagos)
moment.tz.setDefault('Africa/Lagos');

const loginRouter = require('./auth/login');
const signupRouter = require('./auth/signup');
const matchesRouter  = require('./controllers/matches')
const userBetsRoutes = require('./controllers/userBets');
const tournamentBetsRoutes = require('./controllers/tournament');
const winnersBetsRoutes = require('./controllers/winners');
const roundsRoutes = require('./controllers/rounds')

app.use('/login', loginRouter);
app.use('/signup', signupRouter);
app.use('/matches', matchesRouter);
app.use('/userbets', userBetsRoutes);
app.use('/players', tournamentBetsRoutes);
app.use('/winners', winnersBetsRoutes);
app.use('/rounds', roundsRoutes);


// Start the server
const port = config.server_port;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});