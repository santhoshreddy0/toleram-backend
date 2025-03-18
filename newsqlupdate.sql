ALTER TABLE users
ADD COLUMN role ENUM('user', 'admin') NOT NULL DEFAULT 'user';

ALTER TABLE teams
ADD COLUMN status ENUM('0', '1') NOT NULL DEFAULT '1';

CREATE TABLE players (
  id INTEGER AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  player_role ENUM('all-rounder', 'batsman', 'bowler', 'wicket-keeper') NOT NULL,
  team_id INTEGER,
  player_logo VARCHAR(255) DEFAULT NULL,
  FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE SET NULL
);

CREATE TABLE match_player_mapping (
  id INTEGER AUTO_INCREMENT PRIMARY KEY,
  match_id INTEGER,
  player_id INTEGER,
  balls_played INTEGER DEFAULT 0,
  player_score INTEGER DEFAULT 0,
  points INTEGER DEFAULT 0,
  fours INTEGER DEFAULT 0,
  sixes INTEGER DEFAULT 0,
  wickets INTEGER DEFAULT 0,
  maiden_overs INTEGER DEFAULT 0,
  stumps INTEGER DEFAULT 0,
  catches INTEGER DEFAULT 0,
  run_outs INTEGER DEFAULT 0,  
  FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE CASCADE,
  FOREIGN KEY (player_id) REFERENCES matches(id) ON DELETE CASCADE
);

CREATE TABLE dream11_players ( id INTEGER AUTO_INCREMENT PRIMARY KEY, player_id INTEGER, user_id INTEGER, responsibility ENUM('captain', 'vice-captain', 'player') NOT NULL, FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE, FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE );