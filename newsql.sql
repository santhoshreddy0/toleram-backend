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
    "POWER BRONCOS",
    "https://tolaram.retool.com/api/file/3a8523be-b47f-4b1e-a8da-646f2e5e5cb3"
  ),
  (
    "CORPORATE FALCONS",
    "https://tolaram.retool.com/api/file/fa43b813-2657-44df-a1f6-8217202bcd9f"
  ),
  (
    "KELLOGG'S CONQUERORS",
    "https://tolaram.retool.com/api/file/94a70eb2-29b8-4094-a201-48c7444366d7"
  ),
  (
    "NUTRIFY LUCKY STARS",
    "https://tolaram.retool.com/api/file/af225c4b-f6de-4c93-8590-27ccb7559da8"
  ),
  (
    "INDOMIE WARRIORS",
    "https://tolaram.retool.com/api/file/22651032-ad6f-4461-9841-f9addea40532"
  ),
  (
    "BHN HUNTERS",
    "https://tolaram.retool.com/api/file/9a79b7b3-477b-4f10-8b93-331c49edfd81"
  ),
  (
    "COLGATE WHITE WARRIORS",
    "https://tolaram.retool.com/api/file/3f883afb-ce46-4d21-a845-eef4206b5b15"
  ),
  (
    "DANOLFZ LANCERS",
    "https://tolaram.retool.com/api/file/a13c2764-7f53-48d1-a929-5cacc75e33ea"
  ),
  (
    "MINIMIE VIKINGS",
    "https://tolaram.retool.com/api/file/984895b9-32d7-4921-a220-dfd92bebe499"
  ),
  (
    "DUFIL CRUSADERS",
    "https://tolaram.retool.com/api/file/903f7bd4-2f3a-4e3f-9773-b4919d2995d1"
  );

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
    can_show enum ('0', '1') DEFAULT '0',
    bet_status enum ('dont_process', 'process', 'completed') DEFAULT 'dont_process'
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
    3,
    4,
    "Kellogg's Conquerors Vs Nutrify Lucky Stars",
    '2024-05-10 07:30:00',
    '1',
    '1'
  ),
  (
    10,
    5,
    'Dufil Crusaders Vs Indomie Warriors',
    '2024-05-10 07:30:00',
    '1',
    '1'
  ),
  (
    6,
    1,
    'BHN Hunters Vs Power Broncos',
    '2024-05-10 07:30:00',
    '1',
    '1'
  ),
  (
    7,
    2,
    'Colgate White Warriors Vs Corporate Falcons',
    '2024-05-10 07:30:00',
    '1',
    '1'
  ),
  (
    8,
    9,
    'DanoLFZ Lancers Vs Minimie Vikings',
    '2024-05-10 07:30:00',
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

INSERT INTO `match_questions` (`match_id`, `question`, `can_show`, `options`)
VALUES
  ('1', 'Toss', '1', '[{ "id": 1, "option": "Kellogg’s Conquerors", "odds": 1.9 }, { "id": 2, "option": "Nutrify Lucky Stars", "odds": 1.9 }]'),
  ('1', 'Match', '1', '[{ "id": 1, "option": "Kellogg’s Conquerors", "odds": 2.3 }, { "id": 2, "option": "Nutrify Lucky Stars", "odds": 1.7 }]'),
  ('1', 'Total no. of 6s', '1', '[{ "id": 1, "option": "Over 8.5", "odds": 4 }, { "id": 2, "option": "Under 6.5", "odds": 1.7 }]'),
  ('1', 'Female Player (Most Runs)?', '1', '[{ "id": 1, "option": "Swati Saboo", "odds": 1.5 }, { "id": 2, "option": "Lakshi Bhavana", "odds": 3 }, { "id": 3, "option": "Jane Fernandes", "odds": 1.6 }, { "id": 4, "option": "Shreya Bhala", "odds": 2.3 }, { "id": 5, "option": "Other", "odds": 5 }]'),
  ('1', 'Male Player (Most Runs)', '1', '[{ "id": 1, "option": "Sekhar Laddha", "odds": 1.9 }, { "id": 2, "option": "Siddharth Saboo", "odds": 3 }, { "id": 3, "option": "Aditya Pandey", "odds": 3 }, { "id": 4, "option": "Mushrif Ali", "odds": 1.5 }, { "id": 5, "option": "Surender Singh", "odds": 1.9 }, { "id": 6, "option": "Thirumoorthi", "odds": 1.6 }, { "id": 5, "option": "Other", "odds": 6 }]'),
  ('1', 'Male Player (Most Wickets)', '1', '[{ "id": 1, "option": "Ronald", "odds": 1.9 }, { "id": 2, "option": "Surender Singh", "odds": 3 }, { "id": 3, "option": "Kavin", "odds": 3.5 }, { "id": 4, "option": "Rakesh Agarwal", "odds": 2 }, { "id": 5, "option": "Subham Gayen", "odds": 3 }, { "id": 6, "option": "Bharat Jalan", "odds": 3 }, { "id": 5, "option": "Other", "odds": 6 }]'),
  ('1', 'Kellogg’s Conquerors – 65 or more in 1st innings', '1', '[{ "id": 1, "option": "Yes", "odds": 1.8 }, { "id": 2, "option": "No", "odds": 1.8 }]'),
  ('1', 'Nutrify Lucky Stars – 70 or more in 1st innings', '1', '[{ "id": 1, "option": "Yes", "odds": 1.8 }, { "id": 2, "option": "No", "odds": 1.8 }]');

INSERT INTO `match_questions` (`match_id`, `question`, `can_show`, `options`)
VALUES
  ('2', 'Toss', '1', '[{ "id": 1, "option": "Dufil Crusaders", "odds": 1.9 }, { "id": 2, "option": "Indomie Warriors", "odds": 1.9 }]'),
  ('2', 'Match', '1', '[{ "id": 1, "option": "Dufil Crusaders", "odds": 1.6 }, { "id": 2, "option": "Indomie Warriors", "odds": 2.4 }]'),
  ('2', 'Total no. of 6s', '1', '[{ "id": 1, "option": "Over 7.5", "odds": 1.7 }, { "id": 2, "option": "Under 5.5", "odds": 3 }]'),
  ('2', 'Female Player (Most Runs)?', '1', '[{ "id": 1, "option": "Deivanai", "odds": 1.8 }, { "id": 2, "option": "Devika", "odds": 2.3 }, { "id": 3, "option": "Deksha Gupta", "odds": 1.8 }, { "id": 4, "option": "Sakthi Rajeshwari", "odds": 3 }, { "id": 5, "option": "Other", "odds": 5 }]'),
  ('2', 'Male Player (Most Runs)', '1', '[{ "id": 1, "option": "Vinit Baid", "odds": 1.7 }, { "id": 2, "option": "Sabyasachi", "odds": 2.5 }, { "id": 3, "option": "Manpreet Singh", "odds": 2 }, { "id": 4, "option": "Amose", "odds": 3 }, { "id": 5, "option": "Shailendra Singh", "odds": 3 }, { "id": 6, "option": "Dodi Bala", "odds": 2.5 }, { "id": 7, "option": "Akshay Kalra", "odds": 3 }, { "id": 8, "option": "Nandha Kumar", "odds": 2.5 }, { "id": 9, "option": "Venkat Manda", "odds": 2 }, { "id": 10, "option": "Shobhit", "odds": 3.5 }, { "id": 11, "option": "Other", "odds": 6 }]'),
  ('2', 'Male Player (Most Wickets)', '1', '[{ "id": 1, "option": "Surya Teja", "odds": 1.8 }, { "id": 2, "option": "Ganesh Gaggar", "odds": 3 }, { "id": 3, "option": "Ravi Tripathi", "odds": 4 }, { "id": 4, "option": "Amose", "odds": 1.8 }, { "id": 5, "option": "Shailendra Singh", "odds": 4 }, { "id": 6, "option": "Manpreet Singh", "odds": 5 }, { "id": 7, "option": "Akshay Kalra", "odds": 2 }, { "id": 8, "option": "Venkat Manda", "odds": 2.5 }, { "id": 9, "option": "Shobhit", "odds": 3.5 }, { "id": 10, "option": "Other", "odds": 6 }]'),
  ('2', 'Dufil Crusaders – 74 or more in 1st innings', '1', '[{ "id": 1, "option": "Yes", "odds": 1.8 }, { "id": 2, "option": "No", "odds": 1.8 }]'),
  ('2', 'Indomie Warriors – 65 or more in 1st innings', '1', '[{ "id": 1, "option": "Yes", "odds": 1.8 }, { "id": 2, "option": "No", "odds": 1.8 }]');

INSERT INTO `match_questions` (`match_id`, `question`, `can_show`, `options`)
VALUES
  ('3', 'Toss', '1', '[{ "id": 1, "option": "BHN Hunters", "odds": 1.9 }, { "id": 2, "option": "Power Broncos", "odds": 1.9 }]'),
  ('3', 'Match', '1', '[{ "id": 1, "option": "BHN Hunters", "odds": 2.2 }, { "id": 2, "option": "Power Broncos", "odds": 1.7 }]'),
  ('3', 'Total no. of 6s', '1', '[{ "id": 1, "option": "Over 6.5", "odds": 1.5 }, { "id": 2, "option": "Under 4.5", "odds": 3 }]'),
  ('3', 'Female Player (Most Runs)?', '1', '[{ "id": 1, "option": "Prachi Kedia", "odds": 3 }, { "id": 2, "option": "Surbhi Mishra", "odds": 2.5 }, { "id": 3, "option": "Srinithi R", "odds": 1.6 }, { "id": 4, "option": "Shradha Mardolkar", "odds": 1.8 }, { "id": 5, "option": "Other", "odds": 5 }]'),
  ('3', 'Male Player (Most Runs)', '1', '[{ "id": 1, "option": "Chetan Katarki", "odds": 1.8 }, { "id": 2, "option": "Kalyan Lakshmi", "odds": 1.6 }, { "id": 3, "option": "Indrajeet", "odds": 2 }, { "id": 4, "option": "Girdhar Chandak", "odds": 3 }, { "id": 5, "option": "Pankaj Jajoo", "odds": 3 }, { "id": 6, "option": "Gaurav Srivastava", "odds": 1.9 }, { "id": 7, "option": "Subhojit Chakraborty", "odds": 2 }, { "id": 8, "option": "Karan Patel", "odds": 3 }, { "id": 9, "option": "Hari Gaddam", "odds": 3 }, { "id": 10, "option": "Samuel Sonawane", "odds": 3.5 }, { "id": 11, "option": "Other", "odds": 6 }]'),
  ('3', 'Male Player (Most Wickets)', '1', '[{ "id": 1, "option": "Gaurav Srivastava", "odds": 4 }, { "id": 2, "option": "Indrajeet", "odds": 3 }, { "id": 3, "option": "Sreenu", "odds": 2 }, { "id": 4, "option": "Kalyan Lakshmi", "odds": 2.5 }, { "id": 5, "option": "Saurabh Mirgal", "odds": 2.5 }, { "id": 6, "option": "Mohit Sharda", "odds": 2.1 }, { "id": 7, "option": "Prashant Sharma", "odds": 1.8 }, { "id": 8, "option": "Subhojit Chakraborty", "odds": 3.5 }, { "id": 9, "option": "Samuel Sonawane", "odds": 2.3 }, { "id": 10, "option": "Other", "odds": 6 }]'),
  ('3', 'BHN Hunters – 63 or more in 1st innings', '1', '[{ "id": 1, "option": "Yes", "odds": 1.8 }, { "id": 2, "option": "No", "odds": 1.8 }]'),
  ('3', 'Power Broncos – 70 or more in 1st innings', '1', '[{ "id": 1, "option": "Yes", "odds": 1.8 }, { "id": 2, "option": "No", "odds": 1.8 }]');

INSERT INTO `match_questions` (`match_id`, `question`, `can_show`, `options`)
VALUES
  ('4', 'Toss', '1', '[{ "id": 1, "option": "Colgate White Warriors", "odds": 1.9 }, { "id": 2, "option": "Corporate Falcons", "odds": 1.9 }]'),
  ('4', 'Match', '1', '[{ "id": 1, "option": "Colgate White Warriors", "odds": 2.2 }, { "id": 2, "option": "Corporate Falcons", "odds": 1.6 }]'),
  ('4', 'Total no. of 6s', '1', '[{ "id": 1, "option": "Over 8.5", "odds": 2.7 }, { "id": 2, "option": "Under 6.5", "odds": 1.5 }]'),
  ('4', 'Female Player (Most Runs)?', '1', '[{ "id": 1, "option": "Prachi Labde", "odds": 3 }, { "id": 2, "option": "Sonal", "odds": 2.8 }, { "id": 3, "option": "Catherine", "odds": 1.7 }, { "id": 4, "option": "Vinanti", "odds": 2.1 }, { "id": 5, "option": "Other", "odds": 5 }]'),
  ('4', 'Male Player (Most Runs)', '1', '[{ "id": 1, "option": "Aditya Kumar", "odds": 1.6 }, { "id": 2, "option": "Sushant Thakur", "odds": 1.9 }, { "id": 3, "option": "Bonny Renny", "odds": 3.5 }, { "id": 4, "option": "Seenivasa Pandian", "odds": 3 }, { "id": 5, "option": "Ankit Somani", "odds": 3.5 }, { "id": 6, "option": "Yash Choudhary", "odds": 3 }, { "id": 7, "option": "Kuldeep Dangwal", "odds": 2.5 }, { "id": 8, "option": "Bharat Vekariya", "odds": 3 }, { "id": 9, "option": "Sarthak Goyal", "odds": 1.7 }, { "id": 10, "option": "Adesh Bajaj", "odds": 3 }, { "id": 11, "option": "Other", "odds": 6 }]'),
  ('4', 'Male Player (Most Wickets)', '1', '[{ "id": 1, "option": "Aditya Kumar", "odds": 1.6 }, { "id": 2, "option": "Sushant Thakur", "odds": 2.3 }, { "id": 3, "option": "Anil Sanaboyina", "odds": 3.5 }, { "id": 4, "option": "Apoor Dave", "odds": 3 }, { "id": 5, "option": "Ankit Somani", "odds": 3 }, { "id": 6, "option": "Yash Choudhary", "odds": 2 }, { "id": 7, "option": "Shivkant Modi", "odds": 1.9 }, { "id": 8, "option": "Danish Mehra", "odds": 3 }, { "id": 9, "option": "Sarthak Goyal", "odds": 2.6 }, { "id": 10, "option": "Selva", "odds": 2 }, { "id": 11, "option": "Other", "odds": 6 }]'),
  ('4', 'Colgate White Warriors – 70 or more in 1st innings', '1', '[{ "id": 1, "option": "Yes", "odds": 1.8 }, { "id": 2, "option": "No", "odds": 1.8 }]'),
  ('4', 'Corporate Falcons – 68 or more in 1st innings', '1', '[{ "id": 1, "option": "Yes", "odds": 1.8 }, { "id": 2, "option": "No", "odds": 1.8 }]');

  INSERT INTO `match_questions` (`match_id`, `question`, `can_show`, `options`)
VALUES
  ('5', 'Toss', '1', '[{ "id": 1, "option": "DanoLFZ Lancers", "odds": 1.9 }, { "id": 2, "option": "Minimie Vikings", "odds": 1.9 }]'),
  ('5', 'Match', '1', '[{ "id": 1, "option": "DanoLFZ Lancers", "odds": 2.4 }, { "id": 2, "option": "Minimie Vikings", "odds": 1.6 }]'),
  ('5', 'Total no. of 6s', '1', '[{ "id": 1, "option": "Over 6.5", "odds": 1.3 }, { "id": 2, "option": "Under 4.5", "odds": 4 }]'),
  ('5', 'Female Player (Most Runs)?', '1', '[{ "id": 1, "option": "Yamini", "odds": 1.5 }, { "id": 2, "option": "Janhavi", "odds": 2 }, { "id": 3, "option": "Sherlin Daya", "odds": 1.6 }, { "id": 4, "option": "Mukta Gokhale", "odds": 3 }, { "id": 5, "option": "Other", "odds": 5 }]'),
  ('5', 'Male Player (Most Runs)', '1', '[{ "id": 1, "option": "Parmeet Singh", "odds": 1.7 }, { "id": 2, "option": "Deepak Singh", "odds": 4 }, { "id": 3, "option": "Vaibhav Raijada", "odds": 3.5 }, { "id": 4, "option": "Akhilesh Yadav", "odds": 2.8 }, { "id": 5, "option": "Balram Singh", "odds": 3 }, { "id": 6, "option": "Siddharth Khandelwal", "odds": 2.5 }, { "id": 7, "option": "Monish Mantri", "odds": 3 }, { "id": 8, "option": "Mohammed Mujeeb", "odds": 1.8 }, { "id": 9, "option": "Vinayagamoorthy", "odds": 2.2 }, { "id": 10, "option": "Girijesh Yadav", "odds": 4 }, { "id": 11, "option": "Other", "odds": 6 }]'),
  ('5', 'Male Player (Most Wickets)', '1', '[{ "id": 1, "option": "Parmeet Singh", "odds": 1.9 }, { "id": 2, "option": "Prakash Pawar", "odds": 2.8 }, { "id": 3, "option": "Akhilesh Yadav", "odds": 2.2 }, { "id": 4, "option": "Sidhant Singh", "odds": 2.4 }, { "id": 5, "option": "Sambit Mukherjee", "odds": 3 }, { "id": 6, "option": "Vinayagamoorthy", "odds": 3 }, { "id": 7, "option": "Girijesh Yadav", "odds": 1.6 }, { "id": 8, "option": "Other", "odds": 6 }]'),
  ('5', 'DanoLFZ Lancers – 65 or more in 1st innings', '1', '[{ "id": 1, "option": "Yes", "odds": 1.8 }, { "id": 2, "option": "No", "odds": 1.8 }]'),
  ('5', 'Minimie Vikings – 74 or more in 1st innings', '1', '[{ "id": 1, "option": "Yes", "odds": 1.8 }, { "id": 2, "option": "No", "odds": 1.8 }]');

DROP TABLE IF EXISTS match_bets;

CREATE TABLE
  match_bets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT REFERENCES users (id),
    match_id INT REFERENCES matches (id),
    answers JSON NOT NULL,
    can_show_points enum ('0', '1') DEFAULT '0',
    points DECIMAL(10, 2) DEFAULT 0
  );

-- Rounds
DROP TABLE IF EXISTS rounds;

CREATE TABLE
  rounds (
    id INT AUTO_INCREMENT PRIMARY KEY,
    round_name VARCHAR(255) NOT NULL,
    can_bet enum ('0', '1') DEFAULT '0',
    can_show enum ('0', '1') DEFAULT '0',
    bet_status enum ('dont_process', 'process', 'completed') DEFAULT 'dont_process'
  );

INSERT INTO
  `rounds` (round_name, can_bet, can_show)
VALUES
  ('TPL Winners (Before Round 1)', '0', '1'),
  ('TPL Winners (Before QFs)', '0', '1'),
  ('TPL Winners (Before SFs)', '0', '1');
  

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

INSERT INTO `round_questions` (round_id, question, can_show, options)
VALUES (
    1,
    'TPL Winners (Before Round 1)',
    '1',
    '[{ "id": 1, "option": "Power Broncos", "odds": 5 },
      { "id": 2, "option": "Corporate Falcons", "odds": 8 },
      { "id": 3, "option": "Kellogg''s Conquerors", "odds": 7 },
      { "id": 4, "option": "Nutrify Lucky Stars", "odds": 5 },
      { "id": 5, "option": "Indomie Warriors", "odds": 6.5 },
      { "id": 6, "option": "BHN Hunters", "odds": 4.5 },
      { "id": 7, "option": "Colgate White Warriors", "odds": 4.5 },
      { "id": 8, "option": "DanoLFZ Lancers", "odds": 6 },
      { "id": 9, "option": "Minimie Vikings", "odds": 3.5 },
      { "id": 10, "option": "Dufil Crusaders", "odds": 4 }]'
);


DROP TABLE IF EXISTS round_bets;

CREATE TABLE
  round_bets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT REFERENCES users (id),
    round_id INT REFERENCES rounds (id),
    answers JSON NOT NULL,
    can_show_points enum ('0', '1') DEFAULT '0',
    points DECIMAL(10, 2) DEFAULT 0
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


INSERT INTO `best_player_questions` (question, can_show, options)
VALUES (
  'Best Female (Most Runs)',
  '1',
  '[{"id": 1, "option": "Yamini", "odds": 1.8}, 
    {"id": 2, "option": "Jane", "odds": 2.0},
    {"id": 3, "option": "Sherlin", "odds": 2.4},
    {"id": 4, "option": "Catherine", "odds": 2.6},
    {"id": 5, "option": "Swati Saboo", "odds": 2.2},
    {"id": 6, "option": "Devika", "odds": 4.5},
    {"id": 7, "option": "Shradha Mardolkar", "odds": 4.0},
    {"id": 8, "option": "Deivanai", "odds": 3.5},
    {"id": 9, "option": "Shreya Bhala", "odds": 5.0},
    {"id": 10, "option": "Other", "odds": 8}]'
);

INSERT INTO `best_player_questions` (question, can_show, options)
VALUES (
  'Best Male (Most Runs)',
  '1',
  '[{"id": 1, "option": "Parmeet", "odds": 2.3},
    {"id": 2, "option": "Aditya Kumar", "odds": 2.0},
    {"id": 3, "option": "Thirumoorthi", "odds": 2.5},
    {"id": 4, "option": "Mushrif", "odds": 2.1},
    {"id": 5, "option": "Kalyan", "odds": 3.2},
    {"id": 6, "option": "Surinder", "odds": 3.8},
    {"id": 7, "option": "Gaurav Shrivastava", "odds": 2.7},
    {"id": 8, "option": "Shekhar Laddha", "odds": 4.0},
    {"id": 9, "option": "Vinit Baid", "odds": 3.1},
    {"id": 10, "option": "Other", "odds": 8}]'
);

INSERT INTO `best_player_questions` (question, can_show, options)
VALUES (
  'Best Male (Most Wickets)',
  '1',
  '[{"id": 1, "option": "Akshay Kalra", "odds": 3.2},
    {"id": 2, "option": "Prashant Sharma", "odds": 3.5},
    {"id": 3, "option": "Aditya Kumar", "odds": 2.2},
    {"id": 4, "option": "Samuel Sonawane", "odds": 3.6},
    {"id": 5, "option": "Shivkant Modi", "odds": 2.4},
    {"id": 6, "option": "Girijesh Yadav", "odds": 3.0},
    {"id": 7, "option": "Surya Teja", "odds": 4.2},
    {"id": 8, "option": "Akhilesh Yadav", "odds": 4.2},
    {"id": 9, "option": "Amose Akwin", "odds": 2.5},
    {"id": 10, "option": "Other", "odds": 8}]'
);
INSERT INTO `best_player_questions` (question, can_show, options)
VALUES (
  'Maximum 6s',
  '1',
  '[{"id": 1, "option": "Manpreet", "odds": 5.0},
    {"id": 2, "option": "Sushant Thakur", "odds": 4.2},
    {"id": 3, "option": "Aditya Kumar", "odds": 3.5},
    {"id": 4, "option": "Sarthak Goel", "odds": 4.6},
    {"id": 5, "option": "Kalyan", "odds": 4.0},
    {"id": 6, "option": "Vinit Baid", "odds": 4.0},
    {"id": 7, "option": "Girdhar Chandak", "odds": 6.0},
    {"id": 8, "option": "Chetan Katarki", "odds": 5.7},
    {"id": 9, "option": "Nandha Kumar", "odds": 5.4},
    {"id": 10, "option": "Other", "odds": 8}]'
);


DROP TABLE IF EXISTS best_player_bets;

CREATE TABLE
  best_player_bets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT REFERENCES users (id),
    answers JSON NOT NULL,
    can_show_points enum ('0', '1') DEFAULT '0',
    points DECIMAL(10, 2) DEFAULT 0
  );
