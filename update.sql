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
INSERT INTO `matches`(`team_one`, `team_two`, `match_start_time`, `match_title`, `questions`) VALUES 
('1', '2', '2023-05-18 08:55:00', 'match 1', '{"win":"Addmie & Indomie (1.7) , GPL & Corporate(2.3)","toss":"Addmie & Indomie (1.9) , GPL & Corporate(1.9)","sixes":"A.Over 13.5 (1.9), B.Under 10.5 (1.7)","female_player":"Deksha Gupta (2.8), Kavya Medikonda (1.7), Harshita 2.4 , Tanushree (3) others(6)","most_runs":"Bala Satyaprakash Dodi (2.8), Mohit Mohta (3) ,Parmeet (1.8) ,Bhushan Agrawal (2.2) , Akshay Kalra (3) , Siddharth Puranik (2.6) , Naeem Saj (2) , Sanjay Sadhukan (1.9) , Nandha Kumar (2.5), Ankit Somani (3.5), others (6)","most_wickets":"Parmeet (2.8) , Akshay Kalra (2) , Siddharth Puranik (2.5) , Naeem Saj (3) , Sanjay Sadhukan (2) , Ankit Somani (3) , Saurabh Mirgal (2.5) , Sreenu (2) , Other(6) ","team_one_fs":"77","team_one_fs_odds":"Yes (1.8), No(1.8)","team_two_fs":"71","team_two_fs_odds":"Yes (1.8), No(1.8)"}')
;
------------------------------------------------------------

DROP TABLE matches;
CREATE TABLE matches (
  id INT AUTO_INCREMENT PRIMARY KEY,
  team_one VARCHAR(255) NOT NULL,
  team_two VARCHAR(255) NOT NULL,
  match_start_time VARCHAR(150) NOT NULL,
  match_title VARCHAR(50) NOT NULL,
  status enum('0','1') DEFAULT '0',
  questions JSON NOT NULL
);


INSERT INTO `matches`(`team_one`, `team_two`, `match_start_time`, `match_title`, `status`,`questions`) VALUES 
('1', '2', '2023-05-18 08:55:00', 'match 1', '0','{"win":"Addmie & Indomie (1.7) , GPL & Corporate(2.3)","toss":"Addmie & Indomie (1.9) , GPL & Corporate(1.9)","sixes":"A.Over 13.5 (1.9), B.Under 10.5 (1.7)","female_player":"Deksha Gupta (2.8), Kavya Medikonda (1.7), Harshita 2.4 , Tanushree (3) others(6)","most_runs":"Bala Satyaprakash Dodi (2.8), Mohit Mohta (3) ,Parmeet (1.8) ,Bhushan Agrawal (2.2) , Akshay Kalra (3) , Siddharth Puranik (2.6) , Naeem Saj (2) , Sanjay Sadhukan (1.9) , Nandha Kumar (2.5), Ankit Somani (3.5), others (6)","most_wickets":"Parmeet (2.8) , Akshay Kalra (2) , Siddharth Puranik (2.5) , Naeem Saj (3) , Sanjay Sadhukan (2) , Ankit Somani (3) , Saurabh Mirgal (2.5) , Sreenu (2) , Other(6) ","team_one_fs":"77","team_one_fs_odds":"Yes (1.8), No(1.8)","team_two_fs":"71","team_two_fs_odds":"Yes (1.8), No(1.8)"}'),
('3', '4', '2023-05-18 13:40:00', 'match 2','1' ,'{"toss":"Colgate Warriors (1.9), Minimie Vikings & ROWA (1.9)","win":"Colgate Warriors (1.6), Minimie Vikings & ROWA (2.5)","sixes":"Over 15.5 (1.9), Under 11.5 (1.7)","female_player":"Mukta Gokhale (3), Ritambhara (2), Janhavi Deshmukh (3), Shalini Singh (2.3), Yamini (1.6), Vinanti Dani (6), Others(6)","most_runs":"Roshan Gupta (2), Indrajeet Kharade (2.8), Kuldeep Dangwal (2.5), Sekhar Laddha (1.9), Ankit Sharma (3), Tushar (2.2), Gaurav Kumar (1.9), Aditya Kumar (3), Vishal Raj Chauhan (2), Ashish Joshi (3), Chetan Bhala (2.5), others (6)","most_wickets":"Roshan Gupta (2), Sushant Thakur (3), Indrajeet Kharade (3), Murali (2.5), Prakash Pawar (2.8), Roshan Cerejo (2.5), Tushar (2), Gaurav Kumar (2.5), Aditya Kumar (3), Ravi Kant (3), Vishal Raj (2), Ashish Joshi (2), Other(6) ","team_one_fs":"79","team_one_fs_odds":"Yes (1.8), No(1.8)","team_two_fs":"73","team_two_fs_odds":"Yes (1.8), No(1.8)"}'),
('5', '6', '2023-05-18 16:45:00', 'match 3','1', '{"toss":"Lucky Stars (1.9), Power Broncos & ARPN (1.9)","win":"Lucky Stars (2.1), Power Broncos & ARPN (1.8)","sixes":"Over 14.5 (1.9), Under 10.5 (1.7)","female_player":"Nidhi (1.9), Surbhi Mishra (2.5), Vidhya Govindharaj (3), Akanksha Jain (2.2), Jane Fernandes (2.8), Kalpana (3), Others(6)","most_runs":" Pankaj Jajoo (3), Balram Singh (3), Gaurav Srivastava (1.9), Sabyasachi Sur (2.5), Amose Akwin (2.8), Nabeel (3.5), Vapush Bansal (2.5), Laxmipat Sethia (3), Surender Singh (1.9), Thirumoorthi (2.7), others (6)","most_wickets":"Shubhojit Chakraborty (3.5), Vapush Bansal (2), Surender Singh (3), Shailendra Kumar Sharma (3), Prashant Sharma (2.5), Ronald Jacob (1.9), Siddhant Singh (3), Samuel Sonawane (2.4), Other(6) ","team_one_fs":"73","team_one_fs_odds":"Yes (1.8), No(1.8)","team_two_fs":"76","team_two_fs_odds":"Yes (1.8), No(1.8)"}'),
('7', '8', '2023-05-18 18:45:00', 'match 4', '1','{"toss":"Dano Daredevils (1.9), KT CONQUERORS & ROA (1.9)","win":"Dano Daredevils (1.9), KT CONQUERORS & ROA (1.9)","sixes":"Over 12.5 (1.9), Under 8.5 (1.7)","female_player":"Amruta Kalbande (3), Avishi Agarwal (2.6), Uma Santhi Nair (2.2), Chetanbir (1.9), Keerthika Ramar (3.6), Sherlin Dhaya (1.9), Others(6)","most_runs":"Rahul Maheshwari (3), Bharat Vekariya (3), Kalyan (2.5), Siddharth Saboo (3), Bharat Jalan (2.5), Aditya Pandey (3), Bidyoot Gogoi (3), Saiel Naik (2.8), Girdhar Chandak (3), Vaibhav Raijada (3.5), others (6)","most_wickets":"Shivkant Modi (1.9), Sukesh Attuluri (2), Milan (3), Baikunth Rungta (2.6), Kalyan (1.9), Siddharth Saboo (3), Bharat Jalan (3), Aditya Pandey (3.5), Other(6) ","team_one_fs":"70","team_one_fs_odds":"Yes (1.8), No(1.8)","team_two_fs":"67","team_two_fs_odds":"Yes (1.8), No(1.8)"}'),
('9', '10', '2023-05-19 10:45:00', 'match 5', '1','{"win":"BHN Transformers (2.1) , Dufil Crusaders (1.8)","toss":"BHN Transformers (1.9) , Dufil Crusaders (1.9)","sixes":"A.Over 16.5 (1.9), B.Under 12.5 (1.7)","female_player":"Swati Gaggar (3.5), Sonal Agarwal (2.8), Catherine (3), Namrata (3), Srinithi (1.7), Others(6)","most_runs":"Manpreet Singh (2),  Ramniwash Bhatt (3), Bonny (2.8), Parth (3), Shailendra Singh (3), Siddhartha Khandelwal (2.5), Shubham Gayen (1.9), Akhilesh Yadav (2.8), Mushrif Shaikh (1.9), Sarthak Goyal (3), Shobhit Jindal (3.5), Mohit Sharda (4), others (6)","most_wickets":"Akhilesh Yadav (2.8), Anil Sanaboyina (3.5), Girijesh Yadav (3), Kavin (3.5), Mushrif Shaikh (4), Sarthak Goyal (2.6), Shobhit Jindal (3.5), Mohit Sharda (2.1), Rakesh Agarwal (2), Ramniwash Bhatt (2.2), Yash Chaudhary (2), Other(6) ","team_one_fs":"74","team_one_fs_odds":"Yes (1.8), No(1.8)","team_two_fs":"80","team_two_fs_odds":"Yes (1.8), No(1.8)"}'),
('6', '7', '2023-05-19 14:55:00', 'match 6', '1','{"toss":"ARPN and Power Broncos (1.9), Dano Daredevils (1.9)","win":"ARPN and Power Broncos (2.2), Dano Daredevils (1.7)","sixes":"Over 8.5 (2.5), Under 5.5 (1.5)","female_player":"Amruta (3), Avishi (2.6), Jane (2.8), Akanksha (2.2), Kalpana (3), Other (6)","most_runs":"Bidyoot (3), Saiel (2.8), Chetan Katarki (2.5), Girdhar (3), Sandeep Singh (4), Gaurav Shrivastava (1.9), Balram (3), Sumit Thakur (3), Kamlesh Gaggar (4), Other (6)","most_wickets":"Sukesh (1.6), Shivkant Modi (2.0), Milan (4), Samuel (2.4), Ronald (1.9), Siddhant Singh (3), Prashant (2.5), Shailendra Sharma (3), Other (6)","team_one_fs":"68","team_one_fs_odds":"Yes (1.8), No (1.6)","team_two_fs":"62","team_two_fs_odds":"Yes (1.8), No (1.6)"}'),
('10', '4', '2023-05-19 17:20:00', 'match 7', '1','{"toss":"DUFIL CRUSADERS (1.9), ROWA and Minimie Vikings (1.9)","win":"DUFIL CRUSADERS (1.5), ROWA and Minimie Vikings (2.8)","sixes":"Over 10.5 (2.5), Under 6.5 (1.5)","female_player":"Janhavi Deshmukh (3), Yamini (1.6), Shalini (2.3), Catherine (3), Srinithi (1.6), Other (6)","most_runs":"Gaurav Kumar (1.9), Aditya Kumar (1.7), Vishal Raj Chauhan (2), Chetan Bhala (2.5), Ashish Joshi (3), Rakesh Agarwal (3.5), Manpreet (2), Yash Chaudhury (2.4), Bonny (2.8), Siddharth Khandelwal (2.5), Shailendra Singh (3), Other (6)","most_wickets":"Tushar (2), Gaurav Kumar (2.5), Aditya Kumar (1.7), Vishal Raj Chauhan (2), Apoorv Dave (3), Rakesh Agarwal (2), Manpreet (3), Ram Bhatt (2.2), Yash Chaudhary (2), Shailendra Singh (3), Others (6)","team_one_fs":"75","team_one_fs_odds":"Yes (2), No (1.5)","team_two_fs":"62","team_two_fs_odds":"Yes (1.8), No (1.6)"}'),
('2', '8', '2023-05-20 12:50:00', 'Quarter Final 1', '1','{"toss":"GPL & Corporate Falcons (1.9), KT CONQUERORS & ROA (1.9)","win":"GPL & Corporate Falcons (2.3), KT CONQUERORS & ROA (1.7)","sixes":"Over 9.5 (1.9), Under 6.5 (1.7)","female_player":"Harshita (1.7), Tanushree (3), Uma santhi nair (2.2), Chetanbir (1.9), KEERTHIKA RAMAR (3.6), SHERLIN DHAYA S R (1.9), Other (6)","most_runs":"Naeem (2), Sanjay (2.5), Ankit Somani (3.5), Nandha Kumar (2.5), Hrishikesh Vishnupurikar (4), Bharat Vekariya (3), siddharth saboo (2.2), Bharat Jalan (2.5), Aditya Pandey (3), Kalyan (1.7), Other (6)","most_wickets":"Naeem (3), Sanjay (1.8), Ankit Somani (2.5), Saurabh Mirgal (2.5), Sreenu (2), Kalyan (1.9), siddharth saboo (3), ASHAY KOTHARI (4), Bharat Jalan (3), Baikunth Rungta (2.6), Other (6)","team_one_fs":"67","team_one_fs_odds":"Yes (1.8), No (1.6)","team_two_fs":"73","team_two_fs_odds":"Yes (1.8), No (1.6)"}'),
('1', '9', '2023-05-20 14:50:00', 'Quarter Final 2', '1','{"toss":"Indomie Warriors (1.9), BHN Transformers (1.9)","win":"Indomie Warriors (2.1), BHN Transformers (1.7)","sixes":"Over 10.5 (2.2), Under 6.5 (1.7)","female_player":"Deksha Gupta (2.8), Kavya (2), Prachi Kedia (2.1), Sharda Mardolkar (1.7), Swati Gaggar (2.2), Sonal Agarwal (6), Other (6)","most_runs":"Mohit Mohta (3), Bala (2.8), Parmeet (1.8), Akshay Kalra (2.3), Sidhharth Puranik (2.6), Bhushan Agrawal (2.2), Akhilesh Yadav (2.8), Mushrif Shaikh (1.9), Sarthak Goyal (2.5), Shobhit Jindal (3.5), Mohit Sarda (4), Other (6)","most_wickets":"Akshay Kalra (2), Sidhharth Puranik (2.5), Surya Teja (2.7), Parmeet (2.8), Akhilesh Yadav (2.3), Girijesh Yadav (1.9), Kavin (3.5), Sarthak Goyal (2.6), Mohit Sharda (2.1), Other (6)","team_one_fs":"64","team_one_fs_odds":"Yes (2), No (1.4)","team_two_fs":"70","team_two_fs_odds":"Yes (1.8), No (1.6)"}'),
('4', '3', '2023-05-20 17:00:00', 'Quarter Final 3', '1','{"toss":"ROA and Minimie Vikings (1.9), Colgate Warriors (1.9)","win":"ROA and Minimie Vikings (1.8), Colgate Warriors (2.1)","sixes":"Over 9.5 (1.7), Under 7.5 (2.2)","female_player":"Mukta (1.7), Ritambara (2.4), Janhavi Deshmukh (3), Shalini Singh (3), Yamini (1.6), Other (6)","most_runs":"Roshan (1.8), Sushant (2), Indrajeet (2.5), SEKHAR LADDHA (1.9), Kuldeep dangwal (2.5), Ankit Sharma (3), Gaurav Kumar (1.9), Aditya Kumar (1.7), Vishal Raj Chauhan (2), Chetan Bhala (2.5), Ashish Joshi (3), Tushar (2.2), Deepak Singh (4), Other (6)","most_wickets":"Tushar (2), Gaurav Kumar (2.5), Aditya Kumar (1.7), Vishal Raj Chauhan (2), Apoorv Dave (3), Ravi Kant Tripathi (3), Roshan (1.7), Sushant (3), Indrajeet (3), Murali (2.5), Prakash Pawar (2.8), Roshan Cerejo (2.5), Other (6)","team_one_fs":"70","team_one_fs_odds":"Yes (1.8), No (1.6)","team_two_fs":"68","team_two_fs_odds":"Yes (1.8), No (1.6)"}'),
('6', '5', '2023-05-20 19:15:00', 'Quarter Final 4', '1','{"toss":"ARPN and Power Broncos (1.9), Lucky Stars (1.9)","win":"ARPN and Power Broncos (2.5), Lucky Stars (1.6)","sixes":"Over 10.5 (3), Under 7.5 (1.4)","female_player":"Nidhi (1.9), Surbhi Mishra (2.5), Vidhya Govindharaj (3), Akansha (2.2), Jane (1.7), Kalpana (3), Other (6)","most_runs":"Amose Akwin (2.8), Nabeel (3.5), Vapush (2.5), Laxmikant Sethia (3), Surender Singh (2.2), Thirumoorthi (1.7), Kamlesh Gaggar (4), Balram Singh (3), Pankaj Jajoo (3), Gaurav Srivastava (1.7), Sabyasachi Sur (2.5), SAMUEL (4), Other (6)","most_wickets":"Amose Akwin (1.8), Jay (2.5), SUBHOJIT CHAKRABORTY (3.5), Vapush Bansal (2), Surender Singh (2.5), Shailendra kumar Sharma (3), Prashant Sharma (2.5), Ronald Jacob (1.9), Siddhant Singh (3), SAMUEL (2.4), Other (6)","team_one_fs":"63","team_one_fs_odds":"Yes (1.8), No (1.6)","team_two_fs":"70","team_two_fs_odds":"Yes (1.8), No (1.6)"}'),
('2', '6', '2023-05-21 10:15:00', 'Semi Final 1', '1','{"toss":"GPL & Corporate Falcons (1.9), ARPN & Power Broncos (1.9)","win":"GPL & Corporate Falcons (1.6), ARPN & Power Broncos (2.5)","sixes":"Over 6.5 (2.5), Under 6.5 (1.6)","female_player":"Harshita (1.7), Tanushree (3), Nikita Kabra (2.2), Jane (2.8), Akanksha (2.2), Kalpana (3), Other (6)","most_runs":"Naeem (2), Sanjay (2.5), Ankit Somani (3.5), Nandha Kumar (2.5), Hrishikesh Vishnupurikar (4), Gaurav Shrivastava (1.9), Balram (3), Sumit Thakur (3), Kamlesh Gaggar (4), Other (6)","most_wickets":"Naeem (3), Sanjay (1.8), Ankit Somani (2.5), Saurabh Mirgal (2.5), Sreenu (2), Ronald (1.9), Siddhant Singh (3), Prashant (2.5), Shailendra Sharma (3), Other (6)","team_one_fs":"72","team_one_fs_odds":"Yes (1.8), No (1.6)","team_two_fs":"65","team_two_fs_odds":"Yes (2.3), No (1.6)"}'),
('1', '3', '2023-05-21 12:45:00', 'Semi Final 2', '1','{"toss":"Indomie Warriors (1.9), Colgate Warriors (1.9)","win":"Indomie Warriors (2.3), Colgate Warriors (1.6)","sixes":"Over 7.5 (1.4), Under 7.5 (3)","female_player":"Deksha Gupta (2.8), Kavya (2), Prachi Kedia (2.1), Mukta (1.7), Ritambara (2.4), Other (6)","most_runs":"Bala (2.8), Parmeet (1.8), Akshay Kalra (2.3), Sidhharth Puranik (2.6), Bhushan Agrawal (2.2), Roshan (1.8), Sushant (2), Indrajeet (2.5), SEKHAR LADDHA (1.9), Kuldeep dangwal (2.5), Ankit Sharma (3), Other (6)","most_wickets":"Akshay Kalra (2), Sidhharth Puranik (2.5), Surya Teja (2.7), Parmeet (2.8), Roshan (1.7), Sushant (3), Indrajeet (3), Murali (2.5), Prakash Pawar (2.8), Other (6)","team_one_fs":"67","team_one_fs_odds":"Yes (2), No (1.6)","team_two_fs":"72","team_two_fs_odds":"Yes (1.6), No (2)"}'),
('1', '6', '2023-05-21 19:45:00', 'Finals', '1','{"toss":"Indomie & Addmie warriors (1.9), ARPN & Power Broncos (1.9)","win":"Indomie & Addmie warriors (2.2), ARPN & Power Broncos (1.7)","sixes":"Over 9.5 (2.5), Under 8.5 (1.6)","female_player":"Deksha Gupta (2.2), Kavya (2), Prachi Kedia (2.1), Jane (1.7), Akanksha (2.5), Kalpana (3), Other (6)","most_runs":"Bala (2.8), Parmeet (1.8), Akshay Kalra (2.3), Sidhharth Puranik (2.6), Bhushan Agrawal (1.9), Gaurav Shrivastava (1.9), Balram (3), Sumit Thakur (3), Prashant Sharma (4), Other (6)","most_wickets":"Venkat (3), Akshay Kalra (2), Sidhharth Puranik (2.5), Surya Teja (2.7), Parmeet (2.8), Ronald (1.9), Siddhant Singh (3), Prashant (2.5), Shailendra Sharma (3), Samuel (3), Other (6)","team_one_fs":"85","team_one_fs_odds":"Yes (2), No (1.6)","team_two_fs":"80","team_two_fs_odds":"Yes (2), No (1.6)"}')
;


------------------------------------


DROP TABLE time_channel;
CREATE TABLE time_channel (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  start_time VARCHAR(120) NOT NULL,
  status enum('0','1') DEFAULT '1',
  odds VARCHAR(500) DEFAULT ''
);

INSERT INTO `time_channel`(`name`, `start_time`,`status`, `odds`) VALUES 
('round_one', '2023-05-18 08:55:00' , '0','Addmie & Indomie (4.5), GPL & Corporate (5.5), Colgate White Warriors (5.0), ROWA & Minimie Vikings (5.0), Lucky Stars (5.5), ARPN & Power Broncos (5.0), Dano Daredevils (6.0), ROA & KT Conquerors (6.0), BHN Transformers (5.0), Dufil Crusaders (4.0)'),
('round_two', '2023-05-18 08:55:00' , '0','Addmie & Indomie (4.5), GPL & Corporate (5.5), Colgate White Warriors (5.0), ROWA & Minimie Vikings (5.0), Lucky Stars (5.5), ARPN & Power Broncos (5.0), Dano Daredevils (6.0), ROA & KT Conquerors (6.0), BHN Transformers (5.0), Dufil Crusaders (4.0)'),
('semi_finals', '2023-05-21 10:15:00' , '0', "Addmie & Indomie (4.5), GPL & Corporate (3.5), Colgate White Warriors (3), ARPN & Power Broncos (6)"),
('finals', '2023-05-18 08:00:00' , '0', "");

-- match add
-- match time update
-- round time (to add winners table)
-- http://54.90.189.206:3000
