CREATE DATABASE tolaram;
USE tolaram;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) DEFAULT NULL,
  email VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL
);

INSERT INTO `users`(`name`, `email`, `password`) VALUES 
('santhosh', 'admin@gmail.com', '123456789' );

CREATE TABLE matches (
  id INT AUTO_INCREMENT PRIMARY KEY,
  team_one VARCHAR(255) NOT NULL,
  team_two VARCHAR(255) NOT NULL,
  match_start_time VARCHAR(150) NOT NULL,
  match_title VARCHAR(50) NOT NULL,
  questions JSON NOT NULL
);


INSERT INTO `matches`(`team_one`, `team_two`, `match_start_time`, `match_title`, `questions`) VALUES 
('1', '2', '2023-05-18 08:00:00', 'match 1', '{"win":"Addmie & Indomie (1.7) , GPL & Corporate(2.3)","toss":"Addmie & Indomie (1.9) , GPL & Corporate(1.9)","sixes":"A.Over 13.5 (1.9), B.Under 10.5 (1.7)","female_player":"Deksha Gupta (2.8), Kavya Medikonda (1.7), Harshita 2.4 , Tanushree (3)","most_runs":"Bala Satyaprakash Dodi (2.8), Mohit Mohta (3) ,Parmeet (1.8) ,Bhushan Agrawal (2.2) , Akshay Kalra (3) , Siddharth Puranik (2.6) , Naeem Saj (2) , Sanjay Sadhukan (1.9) , Nandha Kumar (2.5), Ankit Somani (3.5), others (6)","most_wickets":"Parmeet (2.8) , Akshay Kalra (2) , Siddharth Puranik (2.5) , Naeem Saj (3) , Sanjay Sadhukan (2) , Ankit Somani (3) , Saurabh Mirgal (2.5) , Sreenu (2) , Other(6) ","team_one_fs":"80","team_one_fs_odds":"Yes (1.8), No(1.8)","team_two_fs":"75","team_two_fs_odds":"Yes (1.8), No(1.8)"}'),
('3', '4', '2023-05-18 10:45:00', 'match 2', '{"toss":"Colgate Warriors (1.9), Minimie Vikings & ROWA (1.9)","win":"Colgate Warriors (1.6), Minimie Vikings & ROWA (2.5)","sixes":"Over 15.5 (1.9), Under 11.5 (1.7)","female_player":"Mukta Gokhale (3), Ritambhara (2), Janhavi Deshmukh (3), Shalini Singh (2.3), Yamini (1.6), Vinanti Dani (6), Others(6)","most_runs":"Roshan Gupta (2), Indrajeet Kharade (2.8), Kuldeep Dangwal (2.5), Sekhar Laddha (1.9), Ankit Sharma (3), Tushar (2.2), Gaurav Kumar (1.9), Aditya Kumar (3), Vishal Raj Chauhan (2), Ashish Joshi (3), Chetan Bhala (2.5), others (6)","most_wickets":"Roshan Gupta (2), Sushant Thakur (3), Indrajeet Kharade (3), Murali (2.5), Prakash Pawar (2.8), Roshan Cerejo (2.5), Tushar (2), Gaurav Kumar (2.5), Aditya Kumar (3), Ravi Kant (3), Vishal Raj (2), Ashish Joshi (2), Other(6) ","team_one_fs":"80","team_one_fs_odds":"Yes (1.8), No(1.8)","team_two_fs":"75","team_two_fs_odds":"Yes (1.8), No(1.8)"}'),
('5', '6', '2023-05-18 13:30:00', 'match 3', '{"toss":"Lucky Stars (1.9), Power Broncos & ARPN (1.9)","win":"Lucky Stars (1.7), Power Broncos & ARPN (2.3)","sixes":"Over 13.5 (1.9), Under 10.5 (1.7)","female_player":"Nidhi (1.9), Surbhi Mishra (2.5), Vidhya Govindharaj (3), Akanksha Jain (2.2), Jane Fernandes (2.8), Kalpana (3), Others(6)","most_runs":" Pankaj Jajoo (3), Balram Singh (3), Gaurav Srivastava (1.9), Sabyasachi Sur (2.5), Amose Akwin (2.8), Nabeel (3.5), Vapush Bansal (2.5), Laxmipat Sethia (3), Surender Singh (1.9), Thirumoorthi (2.7), others (6)","most_wickets":"Shubhojit Chakraborty (3.5), Vapush Bansal (2), Surender Singh (3), Shailendra Kumar Sharma (3), Prashant Sharma (2.5), Ronald Jacob (1.9), Siddhant Singh (3), Samuel Sonawane (2.4), Other(6) ","team_one_fs":"80","team_one_fs_odds":"Yes (1.8), No(1.8)","team_two_fs":"75","team_two_fs_odds":"Yes (1.8), No(1.8)"}'),
('7', '8', '2023-05-18 16:15:00', 'match 4', '{"toss":"Dano Daredevils (1.9), KT CONQUERORS & ROA (1.9)","win":"Dano Daredevils (1.7), KT CONQUERORS & ROA (2.3)","sixes":"Over 13.5 (1.9), Under 10.5 (1.7)","female_player":"Amruta Kalbande (3), Avishi Agarwal (2.6), Reha (3), Uma Santhi Nair (2.2), Chetanbir (1.9), Keerthika Ramar (3.6), Sherlin Dhaya (1.9), Others(6)","most_runs":" Bharat Vekariya (3), Kalyan (2.5), Siddharth Saboo (3), Bharat Jalan (2.5), Aditya Pandey (3), Bidyoot Gogoi (3), Saiel Naik (2.8), Girdhar Chandak (3), Vaibhav Raijada (3.5), others (6)","most_wickets":"Shivkant Modi (1.9), Sukesh Attuluri (2), Milan (3), Baikunth Rungta (2.6), Kalyan (1.9), Siddharth Saboo (3), Bharat Jalan (3), Aditya Pandey (3.5), Other(6) ","team_one_fs":"80","team_one_fs_odds":"Yes (1.8), No(1.8)","team_two_fs":"75","team_two_fs_odds":"Yes (1.8), No(1.8)"}'),
('9', '10', '2023-05-19 08:00:00', 'match 5', '{"win":"BHN Transformers (2.1) , Dufil Crusaders (1.8)","toss":"BHN Transformers (1.9) , Dufil Crusaders (1.9)","sixes":"A.Over 16.5 (1.9), B.Under 12.5 (1.7)","female_player":"Swati Gaggar (3.5), Sonal Agarwal (2.8), Catherine (3), Namrata (3), Others(6)","most_runs":"Manpreet Singh (2), Rahul Maheshwari (3), Ramniwash Bhatt (3), Bonny (2.8), Parth (3), Shailendra Singh (3), Siddhartha Khandelwal (2.5), Shubham Gayen (1.9), Akhilesh Yadav (2.8), Mushrif Shaikh (1.9), Sarthak Goyal (3), Shobhit Jindal (3.5), Mohit Sharda (4), others (6)","most_wickets":"Akhilesh Yadav (2.8), Anil Sanaboyina (3.5), Girijesh Yadav (3), Kavin (3.5), Mushrif Shaikh (4), Sarthak Goyal (2.6), Shobhit Jindal (3.5), Mohit Sharda (2.1), Rakesh Agarwal (2), Ramniwash Bhatt (2.2), Yash Chaudhary (2), Other(6) ","team_one_fs":"80","team_one_fs_odds":"Yes (1.8), No(1.8)","team_two_fs":"75","team_two_fs_odds":"Yes (1.8), No(1.8)"}')
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



CREATE TABLE tounament_bets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  sixes VARCHAR(255) DEFAULT NULL,
  sixes_bet INT DEFAULT NULL,
  female_player VARCHAR(255) DEFAULT NULL,
  female_player_bet INT DEFAULT NULL,
  most_runs VARCHAR(255) DEFAULT NULL,
  most_runs_bet INT DEFAULT NULL,
  most_wickets VARCHAR(255) DEFAULT NULL,
  most_wickets_bet INT DEFAULT NULL
);

CREATE TABLE winners (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  team VARCHAR(255) DEFAULT NULL,
  bet INT DEFAULT NULL,
  round VARCHAR(255) DEFAULT NULL
);

CREATE TABLE time_channel (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  start_time VARCHAR(120) NOT NULL,
  status enum('0','1') DEFAULT '1',
  odds VARCHAR(500) DEFAULT ''
);

INSERT INTO `time_channel`(`name`, `start_time`,`status`, `odds`) VALUES 
('round_one', '2023-05-18 08:00:00' , '1','Addmie & Indomie (4.5), GPL & Corporate (5.5), Colgate White Warriors (5.0), ROWA & Minimie Vikings (5.0), Lucky Stars (5.5), ARPN & Power Broncos (5.0), Dano Daredevils (6.0), ROA & KT Conquerors (6.0), BHN Transformers (5.0), Dufil Crusaders (4.0)'),
('eliminators', '2023-05-18 08:00:00' , '0', ""),
('semi_finals', '2023-05-18 08:00:00' , '0', ""),
('finals', '2023-05-18 08:00:00' , '0', "");

-- match add
-- match time update
-- round time (to add winners table)
-- http://54.90.189.206:3000
