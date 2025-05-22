CREATE DATABASE tolaram;

USE tolaram;

-- Teams
DROP TABLE IF EXISTS users;

CREATE TABLE
  users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) DEFAULT NULL,
    email VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('user', 'admin') NOT NULL DEFAULT 'user',
    user_logo VARCHAR(225) DEFAULT NULL
  );

DROP TABLE IF EXISTS teams;

CREATE TABLE
  teams (
    id INT AUTO_INCREMENT PRIMARY KEY,
    team_name VARCHAR(255) NOT NULL,
    team_logo VARCHAR(255) NOT NULL,
    status ENUM('0', '1') NOT NULL DEFAULT '1'
  );

-- Matches
DROP TABLE IF EXISTS matches;

CREATE TABLE
  matches (
    id INT AUTO_INCREMENT PRIMARY KEY,
    team_one INT,
    team_two INT,
    match_title VARCHAR(250) NOT NULL,
    match_time DATETIME NOT NULL,
    can_bet ENUM('0', '1') DEFAULT '0',
    can_show ENUM('0', '1') DEFAULT '1',
    bet_status ENUM('dont_process', 'process', 'completed') DEFAULT 'dont_process',
    max_bet_amount DECIMAL(10, 2) DEFAULT 500000,
    FOREIGN KEY (team_one) REFERENCES teams(id),
    FOREIGN KEY (team_two) REFERENCES teams(id)
  );

DROP TABLE IF EXISTS match_questions;

CREATE TABLE
  match_questions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    match_id INT,
    question VARCHAR(255) NOT NULL,
    can_show ENUM('0', '1') DEFAULT '0',
    options JSON NOT NULL,
    correct_option VARCHAR(255) DEFAULT NULL,
    FOREIGN KEY (match_id) REFERENCES matches(id)
  );

DROP TABLE IF EXISTS match_bets;

CREATE TABLE
  match_bets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    match_id INT,
    answers JSON NOT NULL,
    can_show_points ENUM('0', '1') DEFAULT '0',
    points DECIMAL(10, 2) DEFAULT 0,
    total_amount DECIMAL(10, 2) DEFAULT 0.00,
    CONSTRAINT uq_match_bets UNIQUE (user_id, match_id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (match_id) REFERENCES matches(id)
  );

-- Rounds
DROP TABLE IF EXISTS rounds;

CREATE TABLE
  rounds (
    id INT AUTO_INCREMENT PRIMARY KEY,
    round_name VARCHAR(255) NOT NULL,
    can_bet ENUM('0', '1') DEFAULT '0',
    can_show ENUM('0', '1') DEFAULT '1',
    bet_status ENUM('dont_process', 'process', 'completed') DEFAULT 'dont_process',
    max_bet_amount DECIMAL(10, 2) DEFAULT 500000
  );

DROP TABLE IF EXISTS round_questions;

CREATE TABLE
  round_questions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    round_id INT,
    question VARCHAR(255) NOT NULL,
    can_show ENUM('0', '1') DEFAULT '0',
    options JSON NOT NULL,
    correct_option VARCHAR(255) DEFAULT NULL,
    FOREIGN KEY (round_id) REFERENCES rounds(id)
  );

DROP TABLE IF EXISTS round_bets;

CREATE TABLE
  round_bets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    round_id INT,
    answers JSON NOT NULL,
    can_show_points ENUM('0', '1') DEFAULT '0',
    points DECIMAL(10, 2) DEFAULT 0,
    total_amount DECIMAL(10, 2) DEFAULT 0.00,
    CONSTRAINT uq_round_bets UNIQUE (user_id, round_id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (round_id) REFERENCES rounds(id)
  );

DROP TABLE IF EXISTS best_player_questions;

CREATE TABLE
  best_player_questions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    question VARCHAR(255) NOT NULL,
    can_show ENUM('0', '1') DEFAULT '0',
    options JSON NOT NULL,
    correct_option VARCHAR(255) DEFAULT NULL
  );

DROP TABLE IF EXISTS best_player_bets;

CREATE TABLE
  best_player_bets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    answers JSON NOT NULL,
    can_show_points ENUM('0', '1') DEFAULT '0',
    points DECIMAL(10, 2) DEFAULT 0,
    CONSTRAINT uq_best_player_bets UNIQUE (user_id),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

CREATE TABLE players (
  id INTEGER AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  player_role ENUM('all-rounder', 'batsman', 'bowler', 'wicket-keeper') NOT NULL,
  team_id INTEGER,
  player_logo VARCHAR(255) DEFAULT NULL,
  gender ENUM('male', 'female') DEFAULT 'male',
  credits DECIMAL(10, 2) DEFAULT 0.00,
  FOREIGN KEY (team_id) REFERENCES teams(id)
);

CREATE TABLE match_player_mapping (
    id INT PRIMARY KEY AUTO_INCREMENT,
    match_id INT,
    player_id INT,
    balls_played INT DEFAULT 0,
    player_score INT DEFAULT 0,
    points INT DEFAULT 0,
    fours INT DEFAULT 0,
    sixes INT DEFAULT 0,
    wickets INT DEFAULT 0,
    maiden_overs INT DEFAULT 0,
    stumps INT DEFAULT 0,
    catches INT DEFAULT 0,
    run_outs INT DEFAULT 0,
    FOREIGN KEY (player_id) REFERENCES players(id),
    FOREIGN KEY (match_id) REFERENCES matches(id)
);

CREATE TABLE dream11_players (
    id INTEGER AUTO_INCREMENT PRIMARY KEY,
    player_id INTEGER,
    user_id INTEGER,
    role_type ENUM('captain', 'vice-captain', 'player') NOT NULL DEFAULT 'player',
    FOREIGN KEY (player_id) REFERENCES players(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Create rooms table
CREATE TABLE rooms (
  id INT AUTO_INCREMENT PRIMARY KEY,  
  name VARCHAR(255) NOT NULL         
);

-- Create comments table with user_name as a foreign key referencing the users table
CREATE TABLE comments (
  id INT AUTO_INCREMENT PRIMARY KEY, 
  comment TEXT NOT NULL,         
  user_id INT NOT NULL,      
  user_name VARCHAR(255) DEFAULT NULL,       
  room_id INT NOT NULL,            
  created_at DATETIME,
  likes_count INT DEFAULT 0,
  FOREIGN KEY (user_id) REFERENCES users(id),  
  FOREIGN KEY (room_id) REFERENCES rooms(id)  
);

CREATE TABLE tournaments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  no_of_players INT,
  bowlers_min INT,
  batsmen_min INT,
  boatsman_min INT,
  wicket_keepers_min INT,
  all_rounders_min INT,
  female_players_min INT,
  total_credits DECIMAL(10, 2),
  update_leaderboard ENUM('yes', 'no') NOT NULL DEFAULT 'no'
);

ALTER TABLE tournaments
ADD COLUMN run_super12_bets ENUM('yes', 'no') DEFAULT 'no';

ALTER TABLE `players` CHANGE `player_role` `player_role` ENUM('all-rounder','batsman','bowler','wicket-keeper','impact-player') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL;
