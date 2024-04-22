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

DROP TABLE matches;
CREATE TABLE matches (
  id INT AUTO_INCREMENT PRIMARY KEY,
  team_one VARCHAR(255) NOT NULL,
  team_two VARCHAR(255) NOT NULL,
  match_start_time DAT NOT NULL,
  match_title VARCHAR(50) NOT NULL,
  status enum('0','1') DEFAULT '0',
  questions JSON NOT NULL
);

