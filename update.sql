CREATE DATABASE tolaram;
USE DATABASE tolaram;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL
);

INSERT INTO `users`(`name`, `email`, `password`) VALUES 
('santhosh', 'test@test.com', '123456789' );

CREATE TABLE matches (
  id INT AUTO_INCREMENT PRIMARY KEY,
  team_one VARCHAR(255) NOT NULL,
  team_two VARCHAR(255) NOT NULL,
  match_start_time DATETIME NOT NULL,
  match_title VARCHAR(50) NOT NULL,
  match_winner VARCHAR(255)
);


INSERT INTO `matches`(`team_one`, `team_two`, `match_start_time`, `match_title`, `match_winner`) VALUES 
('1', '2', '2023-05-18 08:00:00', 'match 1', NULL),
('3', '4', '2023-05-18 10:45:00', 'match 2', NULL),
('5', '6', '2023-05-18 13:30:00', 'match 3', NULL),
('7', '8', '2023-05-18 16:15:00', 'match 4', NULL),
('9', '10', '2023-05-19 08:00:00', 'match 5', NULL)
;

CREATE TABLE user_bets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  match_id INT NOT NULL,
  who_wins VARCHAR(255) DEFAULT NULL,
  who_wins_bet INT DEFAULT NULL,
  who_wins_toss VARCHAR(255) DEFAULT NULL,
  who_wins_toss_bet INT DEFAULT NULL,
  most_runs_male VARCHAR(255) DEFAULT NULL,
  most_runs_male_bet INT DEFAULT NULL,
  best_female_player VARCHAR(255) DEFAULT NULL,
  best_female_player_bet INT DEFAULT NULL,
  first_inn_score VARCHAR(255) DEFAULT NULL,
  first_inn_score_bet INT DEFAULT NULL,
  max_sixes VARCHAR(255) DEFAULT NULL,
  max_sixes_bet INT DEFAULT NULL
);