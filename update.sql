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
  questions JSON NOT NULL
);


INSERT INTO `matches`(`team_one`, `team_two`, `match_start_time`, `match_title`, `questions`) VALUES 
('1', '2', '2023-05-18 08:00:00', 'match 1', '{"win":"Addmie & Indomie (1.9) , GPL & Corporate(1.9)","toss":"Addmie & Indomie (1.7) , GPL & Corporate(2.2)","sixes":"Over 17.5 (1.9), Under 13.5 (1.9)","female_player":"Over 17.5(1.9),Under 13.5(1.9),Option C(2.0),Option D(3.5)","most_runs":"Over 17.5(1.9),Under 13.5(1.9),Option C(2.0),Option D(3.5),Other(8)","most_wickets":"Over 17.5(1.9),Under 13.5(1.9),Option C(2.0),Option D(3.5),Other(8)","team_one_fs":"80","team_two_fs":"80"}'),
('3', '4', '2023-05-18 10:45:00', 'match 2', '{"win":"Addmie & Indomie (1.9) , GPL & Corporate(1.9)","toss":"Addmie & Indomie (1.7) , GPL & Corporate(2.2)","sixes":"Over 17.5 (1.9), Under 13.5 (1.9)","female_player":"Over 17.5(1.9),Under 13.5(1.9),Option C(2.0),Option D(3.5)","most_runs":"Over 17.5(1.9),Under 13.5(1.9),Option C(2.0),Option D(3.5),Other(8)","most_wickets":"Over 17.5(1.9),Under 13.5(1.9),Option C(2.0),Option D(3.5),Other(8)","team_one_fs":"80","team_two_fs":"80"}'),
('5', '6', '2023-05-18 13:30:00', 'match 3', '{"win":"Addmie & Indomie (1.9) , GPL & Corporate(1.9)","toss":"Addmie & Indomie (1.7) , GPL & Corporate(2.2)","sixes":"Over 17.5 (1.9), Under 13.5 (1.9)","female_player":"Over 17.5(1.9),Under 13.5(1.9),Option C(2.0),Option D(3.5)","most_runs":"Over 17.5(1.9),Under 13.5(1.9),Option C(2.0),Option D(3.5),Other(8)","most_wickets":"Over 17.5(1.9),Under 13.5(1.9),Option C(2.0),Option D(3.5),Other(8)","team_one_fs":"80","team_two_fs":"80"}'),
('7', '8', '2023-05-18 16:15:00', 'match 4', '{"win":"Addmie & Indomie (1.9) , GPL & Corporate(1.9)","toss":"Addmie & Indomie (1.7) , GPL & Corporate(2.2)","sixes":"Over 17.5 (1.9), Under 13.5 (1.9)","female_player":"Over 17.5(1.9),Under 13.5(1.9),Option C(2.0),Option D(3.5)","most_runs":"Over 17.5(1.9),Under 13.5(1.9),Option C(2.0),Option D(3.5),Other(8)","most_wickets":"Over 17.5(1.9),Under 13.5(1.9),Option C(2.0),Option D(3.5),Other(8)","team_one_fs":"80","team_two_fs":"80"}'),
('9', '10', '2023-05-19 08:00:00', 'match 5', '{"win":"Addmie & Indomie (1.9) , GPL & Corporate(1.9)","toss":"Addmie & Indomie (1.7) , GPL & Corporate(2.2)","sixes":"Over 17.5 (1.9), Under 13.5 (1.9)","female_player":"Over 17.5(1.9),Under 13.5(1.9),Option C(2.0),Option D(3.5)","most_runs":"Over 17.5(1.9),Under 13.5(1.9),Option C(2.0),Option D(3.5),Other(8)","most_wickets":"Over 17.5(1.9),Under 13.5(1.9),Option C(2.0),Option D(3.5),Other(8)","team_one_fs":"80","team_two_fs":"80"}')
;

CREATE TABLE user_bets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  match_id INT NOT NULL,
  wins VARCHAR(255) DEFAULT NULL,
  wins_bet INT DEFAULT NULL,
  toss VARCHAR(255) DEFAULT NULL,
  toss_bet INT DEFAULT NULL,
  sixes VARCHAR(255) DEFAULT NULL,
  sixes_bet INT DEFAULT NULL,
  female_player VARCHAR(255) DEFAULT NULL,
  female_player_bet INT DEFAULT NULL,
  most_runs VARCHAR(255) DEFAULT NULL,
  most_runs_bet INT DEFAULT NULL,
  most_wickets VARCHAR(255) DEFAULT NULL,
  most_wickets_bet INT DEFAULT NULL,
  team_one_fs VARCHAR(255) DEFAULT NULL,
  team_one_fs_bet INT DEFAULT NULL,
  team_two_fs VARCHAR(255) DEFAULT NULL,
  team_two_fs_bet INT DEFAULT NULL
);