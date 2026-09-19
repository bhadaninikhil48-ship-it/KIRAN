-- MySQL dump 10.13  Distrib 8.0.45, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: kiran
-- ------------------------------------------------------
-- Server version	8.0.45

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `buyer_requirements`
--

DROP TABLE IF EXISTS `buyer_requirements`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `buyer_requirements` (
  `id` int NOT NULL AUTO_INCREMENT,
  `buyer_id` int NOT NULL,
  `crop_name` varchar(100) NOT NULL,
  `quantity` decimal(10,2) NOT NULL,
  `unit` enum('kg','quintal','tonne') NOT NULL DEFAULT 'kg',
  `quality_grade` varchar(50) DEFAULT NULL,
  `max_price` decimal(10,2) DEFAULT NULL,
  `required_by` date DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL,
  `status` enum('open','fulfilled','cancelled') NOT NULL DEFAULT 'open',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `buyer_id` (`buyer_id`),
  CONSTRAINT `buyer_requirements_ibfk_1` FOREIGN KEY (`buyer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `buyer_requirements`
--

LOCK TABLES `buyer_requirements` WRITE;
/*!40000 ALTER TABLE `buyer_requirements` DISABLE KEYS */;
INSERT INTO `buyer_requirements` VALUES (1,3,'Tomato',500.00,'kg','Grade A',30.00,'2026-10-01','Indore','open','2026-09-19 07:49:22'),(2,3,'Lasun',2000.00,'kg','Grade B',5000.00,'2026-09-21','Gaya','open','2026-09-19 07:55:58'),(3,3,'Mango',500.00,'kg','Grade A',59.95,'2026-09-15','Jaipur','open','2026-09-19 09:29:19'),(4,3,'Grapes',400.00,'kg','Grade A',34.98,'2026-09-26','Gaya','open','2026-09-19 09:46:30'),(5,3,'Litchi',2.00,'quintal','Grade B',50.00,'2026-09-25','London','open','2026-09-19 13:52:40');
/*!40000 ALTER TABLE `buyer_requirements` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `contracts`
--

DROP TABLE IF EXISTS `contracts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `contracts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `offer_id` int NOT NULL,
  `requirement_id` int NOT NULL,
  `farmer_id` int NOT NULL,
  `buyer_id` int NOT NULL,
  `crop_name` varchar(100) NOT NULL,
  `quantity` decimal(10,2) NOT NULL,
  `unit` enum('kg','quintal','tonne') NOT NULL,
  `agreed_price` decimal(10,2) NOT NULL,
  `total_amount` decimal(12,2) NOT NULL,
  `quality_grade` varchar(50) DEFAULT NULL,
  `delivery_location` varchar(255) DEFAULT NULL,
  `required_by` date DEFAULT NULL,
  `status` enum('active','completed','cancelled') NOT NULL DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `offer_id` (`offer_id`),
  KEY `requirement_id` (`requirement_id`),
  KEY `farmer_id` (`farmer_id`),
  KEY `buyer_id` (`buyer_id`),
  CONSTRAINT `contracts_ibfk_1` FOREIGN KEY (`offer_id`) REFERENCES `offers` (`id`) ON DELETE CASCADE,
  CONSTRAINT `contracts_ibfk_2` FOREIGN KEY (`requirement_id`) REFERENCES `buyer_requirements` (`id`) ON DELETE CASCADE,
  CONSTRAINT `contracts_ibfk_3` FOREIGN KEY (`farmer_id`) REFERENCES `farmer_profiles` (`id`) ON DELETE CASCADE,
  CONSTRAINT `contracts_ibfk_4` FOREIGN KEY (`buyer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `contracts`
--

LOCK TABLES `contracts` WRITE;
/*!40000 ALTER TABLE `contracts` DISABLE KEYS */;
INSERT INTO `contracts` VALUES (1,5,4,2,3,'Grapes',500.00,'kg',50.00,25000.00,'Grade A','Gaya','2026-09-26','active','2026-09-19 10:16:57'),(2,4,3,2,3,'Mango',497.00,'kg',29.96,14890.12,'Grade A','Jaipur','2026-09-15','active','2026-09-19 10:18:54'),(3,8,3,2,3,'Mango',400.00,'kg',70.00,28000.00,'Grade A','Jaipur','2026-09-15','active','2026-09-19 13:49:26'),(4,9,5,2,3,'Litchi',400.00,'quintal',400.00,160000.00,'Grade B','London','2026-09-25','active','2026-09-19 14:15:34');
/*!40000 ALTER TABLE `contracts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `farmer_profiles`
--

DROP TABLE IF EXISTS `farmer_profiles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `farmer_profiles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `village` varchar(100) DEFAULT NULL,
  `district` varchar(100) DEFAULT NULL,
  `state` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`),
  CONSTRAINT `farmer_profiles_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `farmer_profiles`
--

LOCK TABLES `farmer_profiles` WRITE;
/*!40000 ALTER TABLE `farmer_profiles` DISABLE KEYS */;
INSERT INTO `farmer_profiles` VALUES (1,1,'9876543210','Example Village','Bilaspur','Chhattisgarh','2026-09-18 18:32:45'),(2,2,'7091657042','RiverView','Koni','Chattisgarh','2026-09-18 18:53:55');
/*!40000 ALTER TABLE `farmer_profiles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `market_prices`
--

DROP TABLE IF EXISTS `market_prices`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `market_prices` (
  `id` int NOT NULL AUTO_INCREMENT,
  `market_name` varchar(100) NOT NULL,
  `district` varchar(100) DEFAULT NULL,
  `state` varchar(100) DEFAULT NULL,
  `crop_name` varchar(100) NOT NULL,
  `min_price` decimal(10,2) DEFAULT NULL,
  `max_price` decimal(10,2) DEFAULT NULL,
  `modal_price` decimal(10,2) DEFAULT NULL,
  `arrival_quantity` decimal(12,2) DEFAULT NULL,
  `arrival_unit` enum('kg','quintal','tonne') DEFAULT 'quintal',
  `price_date` date NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `market_prices`
--

LOCK TABLES `market_prices` WRITE;
/*!40000 ALTER TABLE `market_prices` DISABLE KEYS */;
INSERT INTO `market_prices` VALUES (1,'Indore Mandi','Indore','Madhya Pradesh','Tomato',2500.00,2900.00,2750.00,120.00,'quintal','2026-09-19','2026-09-18 21:13:35'),(2,'Dewas Mandi','Dewas','Madhya Pradesh','Tomato',2600.00,3000.00,2850.00,95.00,'quintal','2026-09-19','2026-09-18 21:13:35'),(3,'Ujjain Mandi','Ujjain','Madhya Pradesh','Tomato',2450.00,2950.00,2800.00,110.00,'quintal','2026-09-19','2026-09-18 21:13:35'),(4,'Indore Mandi','Indore','Madhya Pradesh','Potato',1800.00,2200.00,2000.00,150.00,'quintal','2026-09-19','2026-09-18 21:13:35');
/*!40000 ALTER TABLE `market_prices` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `offer_negotiations`
--

DROP TABLE IF EXISTS `offer_negotiations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `offer_negotiations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `offer_id` int NOT NULL,
  `sender_id` int NOT NULL,
  `sender_role` enum('farmer','buyer') NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `quantity` decimal(10,2) NOT NULL,
  `message` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `offer_id` (`offer_id`),
  KEY `sender_id` (`sender_id`),
  CONSTRAINT `offer_negotiations_ibfk_1` FOREIGN KEY (`offer_id`) REFERENCES `offers` (`id`) ON DELETE CASCADE,
  CONSTRAINT `offer_negotiations_ibfk_2` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `offer_negotiations`
--

LOCK TABLES `offer_negotiations` WRITE;
/*!40000 ALTER TABLE `offer_negotiations` DISABLE KEYS */;
INSERT INTO `offer_negotiations` VALUES (1,6,3,'buyer',28.00,500.00,'Can you accept ₹28 per kg?','2026-09-19 11:12:17'),(2,6,3,'buyer',28.00,500.00,'Can you accept ₹28 per kg?','2026-09-19 11:12:32'),(3,6,3,'buyer',28.00,40.00,'Can you accept ₹28 per kg?','2026-09-19 11:14:03'),(4,6,2,'farmer',30.00,500.00,'Tis is my final now','2026-09-19 13:32:42'),(5,8,3,'buyer',65.00,500.00,'Buyer , itna hi milega?','2026-09-19 13:45:04'),(6,8,2,'farmer',70.00,400.00,'That\'s my final now.','2026-09-19 13:46:56'),(7,9,3,'buyer',550.00,600.00,'Last Litchi','2026-09-19 14:12:36'),(8,9,2,'farmer',400.00,400.00,'Farmer litchi','2026-09-19 14:14:40');
/*!40000 ALTER TABLE `offer_negotiations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `offers`
--

DROP TABLE IF EXISTS `offers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `offers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `requirement_id` int NOT NULL,
  `farmer_id` int NOT NULL,
  `offer_price` decimal(10,2) NOT NULL,
  `quantity` decimal(10,2) NOT NULL,
  `message` text,
  `status` enum('pending','accepted','rejected','cancelled') NOT NULL DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `requirement_id` (`requirement_id`),
  KEY `farmer_id` (`farmer_id`),
  CONSTRAINT `offers_ibfk_1` FOREIGN KEY (`requirement_id`) REFERENCES `buyer_requirements` (`id`) ON DELETE CASCADE,
  CONSTRAINT `offers_ibfk_2` FOREIGN KEY (`farmer_id`) REFERENCES `farmer_profiles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `offers`
--

LOCK TABLES `offers` WRITE;
/*!40000 ALTER TABLE `offers` DISABLE KEYS */;
INSERT INTO `offers` VALUES (1,2,2,29.00,500.00,'I can supply Grade A fresh tomatoes from Indore.','rejected','2026-09-19 08:26:33'),(2,2,2,6000.00,500.00,'That\'s my Final Price','accepted','2026-09-19 08:37:19'),(3,1,2,50.00,29999.00,'Hello','accepted','2026-09-19 09:23:40'),(4,3,2,29.96,497.00,'Mango is tasty','accepted','2026-09-19 09:44:02'),(5,4,2,50.00,500.00,'Lot ready ?','accepted','2026-09-19 10:15:57'),(6,2,2,70.00,599.00,'Lasun ?','pending','2026-09-19 11:06:16'),(7,2,2,70.00,587.00,'helo123','pending','2026-09-19 12:06:10'),(8,3,2,75.00,505.00,'My mango is special.❤️','accepted','2026-09-19 13:40:53'),(9,5,2,60.00,1.00,'1 Quintile ready now','accepted','2026-09-19 13:56:29');
/*!40000 ALTER TABLE `offers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `produce`
--

DROP TABLE IF EXISTS `produce`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `produce` (
  `id` int NOT NULL AUTO_INCREMENT,
  `farmer_id` int NOT NULL,
  `crop_name` varchar(100) NOT NULL,
  `quantity` decimal(10,2) NOT NULL,
  `unit` enum('kg','quintal') NOT NULL DEFAULT 'kg',
  `quality_grade` varchar(50) DEFAULT NULL,
  `expected_harvest_date` date DEFAULT NULL,
  `available_from` date DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL,
  `status` enum('available','sold','cancelled') NOT NULL DEFAULT 'available',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `farmer_id` (`farmer_id`),
  CONSTRAINT `produce_ibfk_1` FOREIGN KEY (`farmer_id`) REFERENCES `farmer_profiles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `produce`
--

LOCK TABLES `produce` WRITE;
/*!40000 ALTER TABLE `produce` DISABLE KEYS */;
INSERT INTO `produce` VALUES (1,2,'Tomato',800.00,'kg','Grade A','2026-10-10','2026-10-12','Indore, Madhya Pradesh','available','2026-09-18 19:16:07'),(3,2,'Lasun',2000.00,'kg','Grade-A++','2026-09-13','2026-09-16','London','available','2026-09-18 19:38:03'),(6,2,'Locky',200.00,'kg','Grade C','2026-09-23','2026-09-25','Bhopal','available','2026-09-18 20:46:18'),(7,2,'Carrot',890.00,'kg','Grade C','2026-09-27','2026-09-29','Japan','available','2026-09-18 21:04:42');
/*!40000 ALTER TABLE `produce` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('farmer','fpo','buyer') NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Test Farmer','farmer@test.com','$2b$10$H4c452N9fxuvajSNFqeDLuhADh/D0/3TQwDPlm4QoqLwHG6N1SbJ2','farmer','2026-09-18 16:14:34'),(2,'Demo','Demo@gmail.com','$2b$10$3uIAuuNwiOSRv/V8Ig/tu./w9qcVqjY2yIT/JOoSgRd4tpcTdTF7.','farmer','2026-09-18 17:13:54'),(3,'Demo','Demo3@gmail.com','$2b$10$EY1gkknIbsxNghRuE5tIZeg3Fqd4/RWHfgF1OFQA8HsiR7GNd/ECi','buyer','2026-09-18 17:14:41');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-09-19 20:04:30
