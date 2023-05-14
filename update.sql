CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL
);

CREATE TABLE matches (
  id INT AUTO_INCREMENT PRIMARY KEY,
  team1 VARCHAR(255) NOT NULL,
  team2 VARCHAR(255) NOT NULL,
  match_start_time DATETIME NOT NULL,
  match_title VARCHAR(50) NOT NULL,
  match_winner VARCHAR(255)
);


INSERT INTO `matches`(`team1`, `team2`, `match_start_time`, `match_title`, `match_winner`) 
VALUES ('team A', 'team B', '2023-05-14 15:00:00', 'match 1', NULL);

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