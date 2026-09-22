import db from "../config/db.js";

// Ensure table exists on initialization
let tableInitialized = false;
async function ensureAddressTable() {
  if (tableInitialized) return;
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS \`addresses\` (
        \`id\` INT NOT NULL AUTO_INCREMENT,
        \`user_id\` INT NOT NULL,
        \`user_role\` ENUM('farmer', 'fpo', 'buyer') NOT NULL,
        \`name\` VARCHAR(150) NOT NULL,
        \`tag\` VARCHAR(100) DEFAULT 'Farm / Location',
        \`village_locality\` VARCHAR(255) NOT NULL,
        \`landmark\` VARCHAR(255) DEFAULT NULL,
        \`district\` VARCHAR(100) NOT NULL,
        \`state\` VARCHAR(100) NOT NULL,
        \`pincode\` VARCHAR(20) DEFAULT NULL,
        \`full_address\` TEXT NOT NULL,
        \`latitude\` DECIMAL(10, 7) DEFAULT NULL,
        \`longitude\` DECIMAL(10, 7) DEFAULT NULL,
        \`is_default\` TINYINT(1) NOT NULL DEFAULT 0,
        \`created_at\` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        KEY \`idx_user_id\` (\`user_id\`),
        CONSTRAINT \`fk_addresses_user\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\` (\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
    `);
    tableInitialized = true;
  } catch (err) {
    console.error("Failed to ensure addresses table:", err.message);
  }
}

/**
 * Get all addresses for the authenticated user
 */
export const getAddresses = async (req, res) => {
  try {
    await ensureAddressTable();
    const userId = req.user.id;

    const [rows] = await db.query(
      `SELECT * FROM addresses 
       WHERE user_id = ? 
       ORDER BY is_default DESC, id DESC`,
      [userId]
    );

    return res.json({
      success: true,
      addresses: rows || [],
    });
  } catch (error) {
    console.error("Error in getAddresses:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve saved addresses",
      addresses: [],
    });
  }
};

/**
 * Create a new address for the authenticated user
 */
export const createAddress = async (req, res) => {
  try {
    await ensureAddressTable();
    const userId = req.user.id;
    const userRole = req.user.role || "farmer";

    const {
      name,
      tag,
      village_locality,
      landmark,
      district,
      state,
      pincode,
      full_address,
      latitude,
      longitude,
      is_default,
    } = req.body;

    if (!village_locality || !district || !state) {
      return res.status(400).json({
        success: false,
        message: "Village/Locality, District, and State are required fields.",
      });
    }

    const effectiveName = (name && name.trim()) || "Authorized Contact";
    const effectiveTag = (tag && tag.trim()) || (userRole === "buyer" ? "Warehouse" : userRole === "fpo" ? "Aggregation Center" : "Farm 1");
    
    // Auto-generate full formatted address if not supplied
    const effectiveFullAddress = (full_address && full_address.trim()) || [
      village_locality,
      landmark,
      district,
      state,
      pincode ? `PIN: ${pincode}` : null,
    ].filter(Boolean).join(", ");

    // Check existing address count for this user
    const [existing] = await db.query(
      "SELECT id FROM addresses WHERE user_id = ?",
      [userId]
    );

    // If first address or is_default is true, mark as default
    const shouldBeDefault = existing.length === 0 || Boolean(is_default);

    if (shouldBeDefault && existing.length > 0) {
      // Unset previous defaults
      await db.query(
        "UPDATE addresses SET is_default = 0 WHERE user_id = ?",
        [userId]
      );
    }

    const [insertResult] = await db.query(
      `INSERT INTO addresses 
       (user_id, user_role, name, tag, village_locality, landmark, district, state, pincode, full_address, latitude, longitude, is_default)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        userRole,
        effectiveName,
        effectiveTag,
        village_locality.trim(),
        landmark ? landmark.trim() : null,
        district.trim(),
        state.trim(),
        pincode ? pincode.trim() : null,
        effectiveFullAddress,
        latitude != null && !isNaN(Number(latitude)) ? Number(latitude) : null,
        longitude != null && !isNaN(Number(longitude)) ? Number(longitude) : null,
        shouldBeDefault ? 1 : 0,
      ]
    );

    const [createdRows] = await db.query(
      "SELECT * FROM addresses WHERE id = ?",
      [insertResult.insertId]
    );

    return res.status(201).json({
      success: true,
      message: "Address added successfully",
      address: createdRows[0],
    });
  } catch (error) {
    console.error("Error in createAddress:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to save address: " + error.message,
    });
  }
};

/**
 * Update an existing address
 */
export const updateAddress = async (req, res) => {
  try {
    await ensureAddressTable();
    const userId = req.user.id;
    const addressId = req.params.id;

    const [existing] = await db.query(
      "SELECT * FROM addresses WHERE id = ? AND user_id = ?",
      [addressId, userId]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Address not found or unauthorized.",
      });
    }

    const current = existing[0];
    const {
      name,
      tag,
      village_locality,
      landmark,
      district,
      state,
      pincode,
      full_address,
      latitude,
      longitude,
      is_default,
    } = req.body;

    const shouldBeDefault = is_default !== undefined ? Boolean(is_default) : Boolean(current.is_default);

    if (shouldBeDefault && !current.is_default) {
      await db.query(
        "UPDATE addresses SET is_default = 0 WHERE user_id = ?",
        [userId]
      );
    }

    const updatedFullAddress = full_address || [
      village_locality || current.village_locality,
      landmark !== undefined ? landmark : current.landmark,
      district || current.district,
      state || current.state,
      (pincode || current.pincode) ? `PIN: ${pincode || current.pincode}` : null,
    ].filter(Boolean).join(", ");

    await db.query(
      `UPDATE addresses 
       SET name = ?, tag = ?, village_locality = ?, landmark = ?, district = ?, state = ?, pincode = ?, full_address = ?, latitude = ?, longitude = ?, is_default = ?
       WHERE id = ? AND user_id = ?`,
      [
        name || current.name,
        tag || current.tag,
        village_locality || current.village_locality,
        landmark !== undefined ? landmark : current.landmark,
        district || current.district,
        state || current.state,
        pincode !== undefined ? pincode : current.pincode,
        updatedFullAddress,
        latitude != null ? Number(latitude) : current.latitude,
        longitude != null ? Number(longitude) : current.longitude,
        shouldBeDefault ? 1 : 0,
        addressId,
        userId,
      ]
    );

    const [updatedRows] = await db.query(
      "SELECT * FROM addresses WHERE id = ?",
      [addressId]
    );

    return res.json({
      success: true,
      message: "Address updated successfully",
      address: updatedRows[0],
    });
  } catch (error) {
    console.error("Error in updateAddress:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update address",
    });
  }
};

/**
 * Delete an address
 */
export const deleteAddress = async (req, res) => {
  try {
    await ensureAddressTable();
    const userId = req.user.id;
    const addressId = req.params.id;

    const [existing] = await db.query(
      "SELECT * FROM addresses WHERE id = ? AND user_id = ?",
      [addressId, userId]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Address not found or unauthorized.",
      });
    }

    const wasDefault = Boolean(existing[0].is_default);

    await db.query(
      "DELETE FROM addresses WHERE id = ? AND user_id = ?",
      [addressId, userId]
    );

    // If deleted address was default, promote another address if one exists
    if (wasDefault) {
      const [remaining] = await db.query(
        "SELECT id FROM addresses WHERE user_id = ? ORDER BY id DESC LIMIT 1",
        [userId]
      );
      if (remaining.length > 0) {
        await db.query(
          "UPDATE addresses SET is_default = 1 WHERE id = ?",
          [remaining[0].id]
        );
      }
    }

    return res.json({
      success: true,
      message: "Address deleted successfully",
    });
  } catch (error) {
    console.error("Error in deleteAddress:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete address",
    });
  }
};

/**
 * Mark an address as the user's primary/default
 */
export const setDefaultAddress = async (req, res) => {
  try {
    await ensureAddressTable();
    const userId = req.user.id;
    const addressId = req.params.id;

    const [existing] = await db.query(
      "SELECT id FROM addresses WHERE id = ? AND user_id = ?",
      [addressId, userId]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Address not found or unauthorized.",
      });
    }

    await db.query(
      "UPDATE addresses SET is_default = 0 WHERE user_id = ?",
      [userId]
    );

    await db.query(
      "UPDATE addresses SET is_default = 1 WHERE id = ? AND user_id = ?",
      [addressId, userId]
    );

    return res.json({
      success: true,
      message: "Default address updated",
    });
  } catch (error) {
    console.error("Error in setDefaultAddress:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to set default address",
    });
  }
};
