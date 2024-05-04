CREATE DATABASE tolaram;

USE tolaram;

-- Teams
DROP TABLE IF EXISTS users;

CREATE TABLE
  users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) DEFAULT NULL,
    email VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL
  );

INSERT INTO
  `users` (`name`, `email`, `password`)
VALUES
  ('santhosh', 'admin@gmail.com', '123456789');

DROP TABLE IF EXISTS teams;

CREATE TABLE
  teams (
    id INT AUTO_INCREMENT PRIMARY KEY,
    team_name VARCHAR(255) NOT NULL,
    team_logo VARCHAR(255) NOT NULL
  );

INSERT INTO
  `teams` (`team_name`, `team_logo`)
VALUES
  (
    'Addmie & Indomie Warriors',
    'indomie_&_ADDMIE.png'
  ),
  ('GPL & Corporate Falcons', 'corporate.png'),
  ('Colgate White Warriors', 'colgate.png'),
  ('ROWA & Minimie Vikings', 'ROWA_&_minimie.png'),
  ('Lucky Stars', 'lucky_stars.png'),
  ('Power Brancos', 'power_brancos.png');

-- Matches
DROP TABLE IF EXISTS matches;

CREATE TABLE
  matches (
    id INT AUTO_INCREMENT PRIMARY KEY,
    team_one INT REFERENCES teams (id),
    team_two INT REFERENCES teams (id),
    match_title VARCHAR(250) NOT NULL,
    match_time DATETIME NOT NULL,
    can_bet enum ('0', '1') DEFAULT '0',
    can_show enum ('0', '1') DEFAULT '0'
  );

INSERT INTO
  `matches` (
    team_one,
    team_two,
    match_title,
    match_time,
    can_bet,
    can_show
  )
VALUES
  (
    1,
    2,
    'Addmie & Indomie Warriors vs GPL & Corporate Falcons',
    '2021-09-10 12:00:00',
    '1',
    '1'
  ),
  (
    3,
    4,
    'Colgate White Warriors vs ROWA & Minimie Vikings',
    '2021-09-10 12:00:00',
    '1',
    '1'
  ),
  (
    5,
    6,
    'Lucky Stars vs Power Brancos',
    '2021-09-10 12:00:00',
    '1',
    '1'
  );

DROP TABLE IF EXISTS match_questions;

CREATE TABLE
  match_questions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    match_id INT REFERENCES matches (id),
    question VARCHAR(255) NOT NULL,
    can_show enum ('0', '1') DEFAULT '0',
    options JSON NOT NULL,
    correct_option VARCHAR(255) DEFAULT NULL
  );

INSERT INTO
  `match_questions` (`match_id`, `question`, `can_show`, `options`)
VALUES
  (
    '1',
    'Who will win the toss?',
    '1',
    '[{ "id": 1, "option": "Addmie & Indomie Warriors", "odds": 1.5 }, { "id": 2, "option": "GPL & Corporate Falcons", "odds": 1.5 }]'
  ),
  (
    '1',
    'Who will win the match?',
    '1',
    '[{ "id": 1, "option": "Addmie & Indomie Warriors", "odds": 1.5 }, { "id": 2, "option": "GPL & Corporate Falcons", "odds": 1.5 }]'
  ),
  (
    '1',
    'How many 6s will be hit in the match?',
    '1',
    '[{ "id": 1, "option": "0-5", "odds": 1.5 }, { "id": 2, "option": "6-10", "odds": 1.5 }, { "id": 3, "option": "11-15", "odds": 1.5 }, { "id": 4, "option": "16-20", "odds": 1.5 }, { "id": 5, "option": "21-25", "odds": 1.5 }]'
  ),
  (
    '1',
    'Which female player will score the most runs in this match?',
    '1',
    '[{ "id": 1, "option": "Addmie & Indomie Warriors", "odds": 1.5 }, { "id": 2, "option": "GPL & Corporate Falcons", "odds": 1.5 }]'
  ),
  (
    '1',
    'Who will score the most runs?',
    '1',
    '[{ "id": 1, "option": "Addmie & Indomie Warriors", "odds": 1.5 }, { "id": 2, "option": "GPL & Corporate Falcons", "odds": 1.5 }]'
  ),
  (
    '1',
    'Who will take the most wickets?',
    '1',
    '[{ "id": 1, "option": "Addmie & Indomie Warriors", "odds": 1.5 }, { "id": 2, "option": "GPL & Corporate Falcons", "odds": 1.5 }]'
  ),
  (
    '1',
    'Will team 1 score X or more runs in the first innings?',
    '1',
    '[{ "id": 1, "option": "Yes", "odds": 1.5 }, { "id": 2, "option": "No", "odds": 1.5 }]'
  ),
  (
    '1',
    'Will team 2 score X or more runs in the first innings?',
    '1',
    '[{ "id": 1, "option": "Yes", "odds": 1.5 }, { "id": 2, "option": "No", "odds": 1.5 }]'
  );

DROP TABLE IF EXISTS match_bets;

CREATE TABLE
  match_bets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT REFERENCES users (id),
    match_id INT REFERENCES matches (id),
    answers JSON NOT NULL
  );

-- Rounds
DROP TABLE IF EXISTS rounds;

CREATE TABLE
  rounds (
    id INT AUTO_INCREMENT PRIMARY KEY,
    round_name VARCHAR(255) NOT NULL,
    can_bet enum ('0', '1') DEFAULT '0',
    can_show enum ('0', '1') DEFAULT '0'
  );

INSERT INTO
  `rounds` (round_name, can_bet, can_show)
VALUES
  ('Round 1', '0', '1'),
  ('Round 2', '0', '1'),
  ('Semis', '0', '1'),
  ('Finals', '0', '1');

DROP TABLE IF EXISTS round_questions;

CREATE TABLE
  round_questions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    round_id INT REFERENCES rounds (id),
    question VARCHAR(255) NOT NULL,
    can_show enum ('0', '1') DEFAULT '0',
    options JSON NOT NULL,
    correct_option VARCHAR(255) DEFAULT NULL
  );

INSERT INTO
  `round_questions` (round_id, question, can_show, options)
VALUES
  (
    1,
    'Who will win the tournament ?',
    '1',
    '[{ "id": 1, "option": "Addmie & Indomie Warriors", "odds": 1.5 }, { "id": 2, "option": "GPL & Corporate Falcons", "odds": 1.5 }]'
  ),
  (
    2,
    'Who will win the tournament ?',
    '1',
    '[{ "id": 1, "option": "Addmie & Indomie Warriors", "odds": 1.5 }, { "id": 2, "option": "GPL & Corporate Falcons", "odds": 1.5 }]'
  ),
  (
    3,
    'Who will win the tournament ?',
    '1',
    '[{ "id": 1, "option": "Addmie & Indomie Warriors", "odds": 1.5 }, { "id": 2, "option": "GPL & Corporate Falcons", "odds": 1.5 }]'
  ),
  (
    4,
    'Who will win the tournament ?',
    '1',
    '[{ "id": 1, "option": "Addmie & Indomie Warriors", "odds": 1.5 }, { "id": 2, "option": "GPL & Corporate Falcons", "odds": 1.5 }]'
  );

DROP TABLE IF EXISTS round_bets;

CREATE TABLE
  round_bets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT REFERENCES users (id),
    round_id INT REFERENCES rounds (id),
    answers JSON NOT NULL
  );

DROP TABLE IF EXISTS best_player_questions;

CREATE TABLE
  best_player_questions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    question VARCHAR(255) NOT NULL,
    can_show enum ('0', '1') DEFAULT '0',
    options JSON NOT NULL,
    correct_option VARCHAR(255) DEFAULT NULL
  );

INSERT INTO
  `best_player_questions` (question, can_show, options)
VALUES
  (
    'Who will be the best female player ?',
    '1',
    '[{"id": 1, "option": "Addmie & Indomie Warriors", "odds": 1.5}, {"id": 2, "option": "GPL & Corporate Falcons", "odds": 1.5}]'
  ),
  (
    'Who will score the most runs ?',
    '1',
    '[{"id": 1, "option": "Addmie & Indomie Warriors", "odds": 1.5}, {"id": 2, "option": "GPL & Corporate Falcons", "odds": 1.5}]'
  ),
  (
    'Who will take the most wickets ?',
    '1',
    '[{"id": 1, "option": "Addmie & Indomie Warriors", "odds": 1.5}, {"id": 2, "option": "GPL & Corporate Falcons", "odds": 1.5}]'
  ),
  (
    'Who will hit maximum sixes ?',
    '1',
    '[{"id": 1, "option": "Addmie & Indomie Warriors", "odds": 1.5}, {"id": 2, "option": "GPL & Corporate Falcons", "odds": 1.5}]'
  );

DROP TABLE IF EXISTS best_player_bets;

CREATE TABLE
  best_player_bets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT REFERENCES users (id),
    answers JSON NOT NULL
  );