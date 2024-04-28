CREATE DATABASE tolaram;

USE tolaram;

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
 ('Addmie & Indomie Warriors', 'indomie_&_ADDMIE.png'),
 ('GPL & Corporate Falcons', 'corporate.png'),
 ('Colgate White Warriors', 'colgate.png'),
 ('ROWA & Minimie Vikings', 'ROWA_&_minimie.png'),
 ('Lucky Stars', 'lucky_stars.png'),
 ('Power Brancos', 'power_brancos.png');
 

 
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

INSERT INTO `matches`(team_one, team_two, match_title, match_time, can_bet, can_show) VALUES
(1, 2, 'Addmie & Indomie Warriors vs GPL & Corporate Falcons', '2021-09-10 12:00:00', '1', '1'),
(3, 4, 'Colgate White Warriors vs ROWA & Minimie Vikings', '2021-09-10 12:00:00', '1', '1'),
(5, 6, 'Lucky Stars vs Power Brancos', '2021-09-10 12:00:00', '1', '1');


DROP TABLE IF EXISTS match_questions;

CREATE TABLE match_questions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  match_id INT REFERENCES matches (id),
  question VARCHAR(255) NOT NULL,
  can_show enum ('0', '1') DEFAULT '0',
  correct_option VARCHAR(255) NOT NULL
);

DROP TABLE IF EXISTS question_options;

CREATE TABLE question_options (
  id INT AUTO_INCREMENT PRIMARY KEY,
  question_id INT REFERENCES match_questions (id),
  options VARCHAR(255) NOT NULL,
  odds DOUBLE NOT NULL
);

DROP TABLE IF EXISTS match_bets;

CREATE TABLE match_bets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT REFERENCES users (id),
  match_id INT REFERENCES matches (id),
  answers JSON NOT NULL
);