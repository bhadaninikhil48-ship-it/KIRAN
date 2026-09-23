-- ============================================================================
-- KIRAN / KRISHI SARTHI MARKETPLACE: FPO SCHEMA MIGRATION (PHASE 1)
-- File: backend/database/fpo_schema.sql
-- Description: Core database tables and polymorphic seller schema additions
--              enabling FPO cluster aggregation alongside existing farmer flow.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Table: fpo_profiles
-- Represents the organizational and administrative profile of an FPO user.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `fpo_profiles` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  `fpo_name` VARCHAR(150) NOT NULL,
  `registration_number` VARCHAR(100) DEFAULT NULL,
  `contact_person` VARCHAR(100) DEFAULT NULL,
  `phone` VARCHAR(20) DEFAULT NULL,
  `email` VARCHAR(150) DEFAULT NULL,
  `office_address` VARCHAR(255) DEFAULT NULL,
  `village_locality` VARCHAR(100) DEFAULT NULL,
  `district` VARCHAR(100) DEFAULT NULL,
  `state` VARCHAR(100) DEFAULT NULL,
  `pincode` VARCHAR(10) DEFAULT NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_fpo_profiles_user_id` (`user_id`),
  UNIQUE KEY `uk_fpo_profiles_reg_no` (`registration_number`),
  KEY `idx_fpo_profiles_district_state` (`district`, `state`),
  CONSTRAINT `fk_fpo_profiles_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------------------------------------------------------
-- 2. Table: fpo_members
-- Represents smallholder farmers enrolled under an FPO.
-- Supports both registered KIRAN farmers (farmer_id populated) and offline members.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `fpo_members` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `fpo_id` INT NOT NULL,
  `farmer_id` INT DEFAULT NULL,
  `member_name` VARCHAR(100) NOT NULL,
  `phone` VARCHAR(20) DEFAULT NULL,
  `village` VARCHAR(100) DEFAULT NULL,
  `district` VARCHAR(100) DEFAULT NULL,
  `state` VARCHAR(100) DEFAULT NULL,
  `land_area_acres` DECIMAL(6,2) DEFAULT NULL,
  `primary_crop` VARCHAR(100) DEFAULT NULL,
  `membership_id` VARCHAR(50) DEFAULT NULL,
  `status` ENUM('active','inactive') NOT NULL DEFAULT 'active',
  `joined_date` DATE DEFAULT NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_fpo_member_farmer` (`fpo_id`, `farmer_id`),
  UNIQUE KEY `uk_fpo_membership_id` (`fpo_id`, `membership_id`),
  KEY `idx_fpo_members_fpo_id` (`fpo_id`),
  KEY `idx_fpo_members_farmer_id` (`farmer_id`),
  CONSTRAINT `fk_fpo_members_fpo` FOREIGN KEY (`fpo_id`) REFERENCES `fpo_profiles` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_fpo_members_farmer` FOREIGN KEY (`farmer_id`) REFERENCES `farmer_profiles` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------------------------------------------------------
-- 3. Table: fpo_lots
-- Represents collective freight lots aggregated by an FPO from member farmers.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `fpo_lots` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `fpo_id` INT NOT NULL,
  `lot_number` VARCHAR(50) NOT NULL,
  `crop_name` VARCHAR(100) NOT NULL,
  `total_quantity` DECIMAL(10,2) NOT NULL,
  `unit` ENUM('kg','quintal','tonne') NOT NULL DEFAULT 'quintal',
  `quality_grade` VARCHAR(50) DEFAULT 'Grade A',
  `expected_price` DECIMAL(10,2) DEFAULT NULL,
  `aggregation_center` VARCHAR(255) DEFAULT NULL,
  `available_from` DATE DEFAULT NULL,
  `status` ENUM('draft','aggregated','offered','contracted','dispatched','completed','cancelled') NOT NULL DEFAULT 'aggregated',
  `description` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_fpo_lots_lot_number` (`lot_number`),
  KEY `idx_fpo_lots_fpo_id` (`fpo_id`),
  KEY `idx_fpo_lots_crop_name` (`crop_name`),
  KEY `idx_fpo_lots_status` (`status`),
  CONSTRAINT `fk_fpo_lots_fpo` FOREIGN KEY (`fpo_id`) REFERENCES `fpo_profiles` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------------------------------------------------------
-- 4. Table: fpo_lot_items
-- Traceability breakdown linking individual member farmer quantities to an FPO lot.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `fpo_lot_items` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `lot_id` INT NOT NULL,
  `member_id` INT DEFAULT NULL,
  `produce_id` INT DEFAULT NULL,
  `farmer_name` VARCHAR(100) NOT NULL,
  `quantity_contributed` DECIMAL(10,2) NOT NULL,
  `unit` ENUM('kg','quintal','tonne') NOT NULL DEFAULT 'quintal',
  `intake_price_per_unit` DECIMAL(10,2) DEFAULT NULL,
  `quality_grade` VARCHAR(50) DEFAULT NULL,
  `intake_date` DATE DEFAULT NULL,
  `notes` VARCHAR(255) DEFAULT NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_fpo_lot_items_lot_id` (`lot_id`),
  KEY `idx_fpo_lot_items_member_id` (`member_id`),
  KEY `idx_fpo_lot_items_produce_id` (`produce_id`),
  CONSTRAINT `fk_fpo_lot_items_lot` FOREIGN KEY (`lot_id`) REFERENCES `fpo_lots` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_fpo_lot_items_member` FOREIGN KEY (`member_id`) REFERENCES `fpo_members` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_fpo_lot_items_produce` FOREIGN KEY (`produce_id`) REFERENCES `produce` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------------------------------------------------------
-- 5. Modify Table: offers
-- Polymorphic seller integration (reusing existing offers table).
-- ----------------------------------------------------------------------------
-- Step 5a: Make farmer_id nullable
ALTER TABLE `offers`
  MODIFY COLUMN `farmer_id` INT NULL;

-- Step 5b: Add FPO columns and seller_type discriminator
ALTER TABLE `offers`
  ADD COLUMN `fpo_id` INT DEFAULT NULL AFTER `farmer_id`,
  ADD COLUMN `fpo_lot_id` INT DEFAULT NULL AFTER `fpo_id`,
  ADD COLUMN `seller_type` ENUM('farmer','fpo') NOT NULL DEFAULT 'farmer' AFTER `fpo_lot_id`,
  ADD KEY `idx_offers_fpo_id` (`fpo_id`),
  ADD KEY `idx_offers_fpo_lot_id` (`fpo_lot_id`),
  ADD KEY `idx_offers_seller` (`seller_type`, `fpo_id`),
  ADD CONSTRAINT `fk_offers_fpo` FOREIGN KEY (`fpo_id`) REFERENCES `fpo_profiles` (`id`) ON DELETE RESTRICT,
  ADD CONSTRAINT `fk_offers_fpo_lot` FOREIGN KEY (`fpo_lot_id`) REFERENCES `fpo_lots` (`id`) ON DELETE SET NULL;

-- ----------------------------------------------------------------------------
-- 6. Modify Table: contracts
-- Polymorphic seller integration with strict transaction history preservation.
-- ----------------------------------------------------------------------------
-- Step 6a: Make farmer_id nullable
ALTER TABLE `contracts`
  MODIFY COLUMN `farmer_id` INT NULL;

-- Step 6b: Add FPO columns and seller_type discriminator
-- Uses ON DELETE RESTRICT on fpo_id to preserve legal deed history.
ALTER TABLE `contracts`
  ADD COLUMN `fpo_id` INT DEFAULT NULL AFTER `farmer_id`,
  ADD COLUMN `fpo_lot_id` INT DEFAULT NULL AFTER `fpo_id`,
  ADD COLUMN `seller_type` ENUM('farmer','fpo') NOT NULL DEFAULT 'farmer' AFTER `fpo_lot_id`,
  ADD KEY `idx_contracts_fpo_id` (`fpo_id`),
  ADD KEY `idx_contracts_fpo_lot_id` (`fpo_lot_id`),
  ADD KEY `idx_contracts_seller` (`seller_type`, `fpo_id`),
  ADD CONSTRAINT `fk_contracts_fpo` FOREIGN KEY (`fpo_id`) REFERENCES `fpo_profiles` (`id`) ON DELETE RESTRICT,
  ADD CONSTRAINT `fk_contracts_fpo_lot` FOREIGN KEY (`fpo_lot_id`) REFERENCES `fpo_lots` (`id`) ON DELETE SET NULL;

-- ----------------------------------------------------------------------------
-- 7. Modify Table: offer_negotiations
-- Expand sender_role enum to support FPO negotiators alongside farmers & buyers.
-- ----------------------------------------------------------------------------
ALTER TABLE `offer_negotiations`
  MODIFY COLUMN `sender_role` ENUM('farmer','fpo','buyer') NOT NULL;
