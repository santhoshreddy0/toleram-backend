const express = require('express');
const app = express();
cors = require('cors')

app.use(express.json());
app.use(cors());

const moment = require('moment');
require('moment-timezone');

// Set the default timezone to West African Time (Africa/Lagos)
moment.tz.setDefault('Africa/Lagos');

const loginRouter = require('./auth/login');
const signupRouter = require('./auth/signup');
const matchesRouter  = require('./controllers/matches')
const userBetsRoutes = require('./controllers/userBets');

app.use('/login', loginRouter);
app.use('/signup', signupRouter);
app.use('/matches', matchesRouter);
app.use('/userbets', userBetsRoutes);


// Start the server
const port = 3000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});