import db from "../config/db.js";

/**
 * Helper to fetch the FPO profile associated with a user ID.
 * @param {number} userId 
 * @returns {Promise<Object|null>}
 */
const getFpoProfileByUserId = async (userId) => {
    const [profiles] = await db.query(
        "SELECT * FROM fpo_profiles WHERE user_id = ?",
        [userId]
    );
    return profiles.length > 0 ? profiles[0] : null;
};

// ============================================================================
// FPO PROFILE CONTROLLERS
// ============================================================================

/**
 * Get the authenticated FPO's profile.
 * GET /api/fpo/profile
 */
export const getProfile = async (req, res) => {
    try {
        const userId = req.user.id;

        const [profiles] = await db.query(
            `SELECT 
                fp.id,
                fp.user_id,
                fp.fpo_name,
                fp.registration_number,
                fp.contact_person,
                fp.phone,
                fp.email,
                fp.office_address,
                fp.village_locality,
                fp.district,
                fp.state,
                fp.pincode,
                fp.created_at,
                fp.updated_at,
                u.name AS user_name,
                u.email AS user_email,
                (SELECT COUNT(*) FROM fpo_members fm WHERE fm.fpo_id = fp.id AND fm.status = 'active') AS active_members_count,
                (SELECT COUNT(*) FROM fpo_members fm WHERE fm.fpo_id = fp.id) AS total_members_count
             FROM fpo_profiles fp
             JOIN users u ON fp.user_id = u.id
             WHERE fp.user_id = ?`,
            [userId]
        );

        if (profiles.length === 0) {
            return res.status(404).json({
                message: "FPO profile not found. Please create your profile."
            });
        }

        res.status(200).json({
            profile: profiles[0]
        });

    } catch (error) {
        console.error("Error in getProfile (FPO):", error);
        res.status(500).json({
            message: "Server error"
        });
    }
};

/**
 * Create a new FPO profile for the authenticated user.
 * POST /api/fpo/profile
 */
export const createProfile = async (req, res) => {
    try {
        const userId = req.user.id;

        const {
            fpo_name,
            registration_number,
            contact_person,
            phone,
            email,
            office_address,
            village_locality,
            district,
            state,
            pincode
        } = req.body;

        // Validation: fpo_name is required
        if (!fpo_name || typeof fpo_name !== "string" || !fpo_name.trim()) {
            return res.status(400).json({
                message: "FPO name is required"
            });
        }

        // Prevent duplicate FPO profiles for the same user
        const existing = await getFpoProfileByUserId(userId);
        if (existing) {
            return res.status(400).json({
                message: "FPO profile already exists for this user"
            });
        }

        // Validate registration_number uniqueness if provided
        const trimmedRegNo = registration_number && registration_number.trim() ? registration_number.trim() : null;
        if (trimmedRegNo) {
            const [regCheck] = await db.query(
                "SELECT id FROM fpo_profiles WHERE registration_number = ?",
                [trimmedRegNo]
            );
            if (regCheck.length > 0) {
                return res.status(400).json({
                    message: "Registration number already registered by another FPO"
                });
            }
        }

        const [result] = await db.query(
            `INSERT INTO fpo_profiles
             (user_id, fpo_name, registration_number, contact_person, phone, email, office_address, village_locality, district, state, pincode)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                userId,
                fpo_name.trim(),
                trimmedRegNo,
                contact_person ? contact_person.trim() : null,
                phone ? phone.trim() : null,
                email ? email.trim() : null,
                office_address ? office_address.trim() : null,
                village_locality ? village_locality.trim() : null,
                district ? district.trim() : null,
                state ? state.trim() : null,
                pincode ? pincode.trim() : null
            ]
        );

        const [newProfile] = await db.query(
            "SELECT * FROM fpo_profiles WHERE id = ?",
            [result.insertId]
        );

        res.status(201).json({
            message: "FPO profile created successfully",
            profile: newProfile[0]
        });

    } catch (error) {
        console.error("Error in createProfile (FPO):", error);
        if (error.code === "ER_DUP_ENTRY") {
            return res.status(400).json({
                message: "FPO profile or registration number already exists"
            });
        }
        res.status(500).json({
            message: "Server error"
        });
    }
};

/**
 * Update the authenticated user's FPO profile.
 * PUT /api/fpo/profile
 */
export const updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;

        const fpo = await getFpoProfileByUserId(userId);
        if (!fpo) {
            return res.status(404).json({
                message: "FPO profile not found. Please create one first."
            });
        }

        const {
            fpo_name,
            registration_number,
            contact_person,
            phone,
            email,
            office_address,
            village_locality,
            district,
            state,
            pincode
        } = req.body;

        // If fpo_name provided, cannot be empty
        if (fpo_name !== undefined && (!fpo_name || typeof fpo_name !== "string" || !fpo_name.trim())) {
            return res.status(400).json({
                message: "FPO name cannot be empty"
            });
        }

        // Check registration_number uniqueness against other FPOs
        const trimmedRegNo = registration_number !== undefined
            ? (registration_number && registration_number.trim() ? registration_number.trim() : null)
            : undefined;

        if (trimmedRegNo) {
            const [regCheck] = await db.query(
                "SELECT id FROM fpo_profiles WHERE registration_number = ? AND id != ?",
                [trimmedRegNo, fpo.id]
            );
            if (regCheck.length > 0) {
                return res.status(400).json({
                    message: "Registration number already registered by another FPO"
                });
            }
        }

        await db.query(
            `UPDATE fpo_profiles
             SET fpo_name = COALESCE(?, fpo_name),
                 registration_number = CASE WHEN ? = 1 THEN ? ELSE registration_number END,
                 contact_person = COALESCE(?, contact_person),
                 phone = COALESCE(?, phone),
                 email = COALESCE(?, email),
                 office_address = COALESCE(?, office_address),
                 village_locality = COALESCE(?, village_locality),
                 district = COALESCE(?, district),
                 state = COALESCE(?, state),
                 pincode = COALESCE(?, pincode)
             WHERE id = ?`,
            [
                fpo_name !== undefined ? fpo_name.trim() : null,
                trimmedRegNo !== undefined ? 1 : 0,
                trimmedRegNo !== undefined ? trimmedRegNo : null,
                contact_person !== undefined ? contact_person : null,
                phone !== undefined ? phone : null,
                email !== undefined ? email : null,
                office_address !== undefined ? office_address : null,
                village_locality !== undefined ? village_locality : null,
                district !== undefined ? district : null,
                state !== undefined ? state : null,
                pincode !== undefined ? pincode : null,
                fpo.id
            ]
        );

        const [updatedProfile] = await db.query(
            `SELECT 
                fp.*,
                u.name AS user_name,
                u.email AS user_email,
                (SELECT COUNT(*) FROM fpo_members fm WHERE fm.fpo_id = fp.id AND fm.status = 'active') AS active_members_count,
                (SELECT COUNT(*) FROM fpo_members fm WHERE fm.fpo_id = fp.id) AS total_members_count
             FROM fpo_profiles fp
             JOIN users u ON fp.user_id = u.id
             WHERE fp.id = ?`,
            [fpo.id]
        );

        res.status(200).json({
            message: "FPO profile updated successfully",
            profile: updatedProfile[0]
        });

    } catch (error) {
        console.error("Error in updateProfile (FPO):", error);
        if (error.code === "ER_DUP_ENTRY") {
            return res.status(400).json({
                message: "Registration number already exists"
            });
        }
        res.status(500).json({
            message: "Server error"
        });
    }
};

// ============================================================================
// FPO MEMBER MANAGEMENT CONTROLLERS
// ============================================================================

/**
 * Get all members enrolled under the authenticated FPO.
 * GET /api/fpo/members
 */
export const getMembers = async (req, res) => {
    try {
        const userId = req.user.id;

        const fpo = await getFpoProfileByUserId(userId);
        if (!fpo) {
            return res.status(404).json({
                message: "FPO profile not found. Please create your FPO profile first."
            });
        }

        const { status, search } = req.query;

        let query = `
            SELECT 
                fm.id,
                fm.fpo_id,
                fm.farmer_id,
                fm.member_name,
                fm.phone,
                fm.village,
                fm.district,
                fm.state,
                fm.land_area_acres,
                fm.primary_crop,
                fm.membership_id,
                fm.status,
                fm.joined_date,
                fm.created_at,
                u.name AS kiran_farmer_name,
                u.email AS kiran_farmer_email,
                CASE WHEN fm.farmer_id IS NOT NULL THEN 1 ELSE 0 END AS is_registered_farmer
            FROM fpo_members fm
            LEFT JOIN farmer_profiles fp ON fm.farmer_id = fp.id
            LEFT JOIN users u ON fp.user_id = u.id
            WHERE fm.fpo_id = ?
        `;
        const queryParams = [fpo.id];

        if (status && (status === "active" || status === "inactive")) {
            query += " AND fm.status = ?";
            queryParams.push(status);
        }

        if (search && search.trim()) {
            query += " AND (fm.member_name LIKE ? OR fm.phone LIKE ? OR fm.membership_id LIKE ? OR fm.village LIKE ?)";
            const term = `%${search.trim()}%`;
            queryParams.push(term, term, term, term);
        }

        query += " ORDER BY fm.created_at DESC";

        const [members] = await db.query(query, queryParams);

        const [stats] = await db.query(
            `SELECT 
                COUNT(*) AS total,
                SUM(status = 'active') AS active,
                SUM(status = 'inactive') AS inactive,
                SUM(farmer_id IS NOT NULL) AS registered_farmers,
                SUM(farmer_id IS NULL) AS offline_farmers
             FROM fpo_members
             WHERE fpo_id = ?`,
            [fpo.id]
        );

        res.status(200).json({
            stats: {
                total: stats[0].total || 0,
                active: stats[0].active || 0,
                inactive: stats[0].inactive || 0,
                registered_farmers: stats[0].registered_farmers || 0,
                offline_farmers: stats[0].offline_farmers || 0
            },
            members
        });

    } catch (error) {
        console.error("Error in getMembers:", error);
        res.status(500).json({
            message: "Server error"
        });
    }
};

/**
 * Add a new member to the authenticated FPO.
 * Supports both registered KIRAN farmers (with valid farmer_id) and offline farmers (farmer_id is null).
 * POST /api/fpo/members
 */
export const addMember = async (req, res) => {
    try {
        const userId = req.user.id;

        const fpo = await getFpoProfileByUserId(userId);
        if (!fpo) {
            return res.status(404).json({
                message: "FPO profile not found. Please create your FPO profile first."
            });
        }

        const {
            farmer_id,
            member_name,
            phone,
            village,
            district,
            state,
            land_area_acres,
            primary_crop,
            membership_id,
            status,
            joined_date
        } = req.body;

        let resolvedName = member_name ? member_name.trim() : null;
        let resolvedPhone = phone ? phone.trim() : null;
        let resolvedVillage = village ? village.trim() : null;
        let resolvedDistrict = district ? district.trim() : null;
        let resolvedState = state ? state.trim() : null;
        let validFarmerId = null;

        // If farmer_id is provided, validate it belongs to an actual farmer_profile
        if (farmer_id !== undefined && farmer_id !== null && farmer_id !== "") {
            const [farmerRows] = await db.query(
                `SELECT fp.id, fp.phone, fp.village, fp.district, fp.state, u.name, u.email
                 FROM farmer_profiles fp
                 JOIN users u ON fp.user_id = u.id
                 WHERE fp.id = ?`,
                [farmer_id]
            );

            if (farmerRows.length === 0) {
                return res.status(400).json({
                    message: "Invalid farmer ID. Farmer profile does not exist."
                });
            }

            validFarmerId = farmerRows[0].id;

            // Check if this registered farmer is already enrolled in this FPO
            const [existingFarmerMember] = await db.query(
                "SELECT id FROM fpo_members WHERE fpo_id = ? AND farmer_id = ?",
                [fpo.id, validFarmerId]
            );

            if (existingFarmerMember.length > 0) {
                return res.status(400).json({
                    message: "This farmer is already enrolled as a member in your FPO."
                });
            }

            // Auto-populate snapshot details from farmer record if not supplied
            if (!resolvedName) resolvedName = farmerRows[0].name;
            if (!resolvedPhone) resolvedPhone = farmerRows[0].phone;
            if (!resolvedVillage) resolvedVillage = farmerRows[0].village;
            if (!resolvedDistrict) resolvedDistrict = farmerRows[0].district;
            if (!resolvedState) resolvedState = farmerRows[0].state;
        }

        // For offline farmers (or if farmer details lacked a name), name is mandatory
        if (!resolvedName) {
            return res.status(400).json({
                message: "Member name is required"
            });
        }

        // Validate membership_id uniqueness within this FPO
        const trimmedMembershipId = membership_id && membership_id.trim() ? membership_id.trim() : null;
        if (trimmedMembershipId) {
            const [existingMemId] = await db.query(
                "SELECT id FROM fpo_members WHERE fpo_id = ? AND membership_id = ?",
                [fpo.id, trimmedMembershipId]
            );
            if (existingMemId.length > 0) {
                return res.status(400).json({
                    message: `Membership ID '${trimmedMembershipId}' already exists in your FPO.`
                });
            }
        }

        const memberStatus = (status && ["active", "inactive"].includes(status)) ? status : "active";
        const memberJoinedDate = joined_date ? joined_date : new Date().toISOString().slice(0, 10);

        const [insertResult] = await db.query(
            `INSERT INTO fpo_members
             (fpo_id, farmer_id, member_name, phone, village, district, state, land_area_acres, primary_crop, membership_id, status, joined_date)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                fpo.id,
                validFarmerId,
                resolvedName,
                resolvedPhone,
                resolvedVillage,
                resolvedDistrict,
                resolvedState,
                land_area_acres ? parseFloat(land_area_acres) : null,
                primary_crop ? primary_crop.trim() : null,
                trimmedMembershipId,
                memberStatus,
                memberJoinedDate
            ]
        );

        const [newMember] = await db.query(
            `SELECT 
                fm.*,
                CASE WHEN fm.farmer_id IS NOT NULL THEN 1 ELSE 0 END AS is_registered_farmer
             FROM fpo_members fm
             WHERE fm.id = ?`,
            [insertResult.insertId]
        );

        res.status(201).json({
            message: "FPO member added successfully",
            member: newMember[0]
        });

    } catch (error) {
        console.error("Error in addMember:", error);
        if (error.code === "ER_DUP_ENTRY") {
            return res.status(400).json({
                message: "Duplicate entry: farmer or membership ID is already registered in this FPO."
            });
        }
        res.status(500).json({
            message: "Server error"
        });
    }
};

/**
 * Update an existing member's information or status.
 * PUT /api/fpo/members/:id
 */
export const updateMember = async (req, res) => {
    try {
        const userId = req.user.id;
        const memberId = req.params.id;

        const fpo = await getFpoProfileByUserId(userId);
        if (!fpo) {
            return res.status(404).json({
                message: "FPO profile not found"
            });
        }

        // Verify member belongs to this FPO
        const [memberRows] = await db.query(
            "SELECT * FROM fpo_members WHERE id = ? AND fpo_id = ?",
            [memberId, fpo.id]
        );

        if (memberRows.length === 0) {
            return res.status(404).json({
                message: "Member not found or does not belong to your FPO"
            });
        }

        const existingMember = memberRows[0];
        const {
            farmer_id,
            member_name,
            phone,
            village,
            district,
            state,
            land_area_acres,
            primary_crop,
            membership_id,
            status,
            joined_date
        } = req.body;

        if (member_name !== undefined && (!member_name || !member_name.trim())) {
            return res.status(400).json({
                message: "Member name cannot be empty"
            });
        }

        // Validate farmer_id if updating
        let updatedFarmerId = existingMember.farmer_id;
        if (farmer_id !== undefined) {
            if (farmer_id === null || farmer_id === "") {
                updatedFarmerId = null;
            } else {
                const [checkFarmer] = await db.query(
                    "SELECT id FROM farmer_profiles WHERE id = ?",
                    [farmer_id]
                );
                if (checkFarmer.length === 0) {
                    return res.status(400).json({
                        message: "Invalid farmer ID. Farmer profile does not exist."
                    });
                }
                const [dupFarmer] = await db.query(
                    "SELECT id FROM fpo_members WHERE fpo_id = ? AND farmer_id = ? AND id != ?",
                    [fpo.id, farmer_id, memberId]
                );
                if (dupFarmer.length > 0) {
                    return res.status(400).json({
                        message: "This farmer is already enrolled as another member in your FPO."
                    });
                }
                updatedFarmerId = farmer_id;
            }
        }

        // Validate membership_id if updating
        const trimmedMembershipId = membership_id !== undefined
            ? (membership_id && membership_id.trim() ? membership_id.trim() : null)
            : undefined;

        if (trimmedMembershipId) {
            const [dupMemId] = await db.query(
                "SELECT id FROM fpo_members WHERE fpo_id = ? AND membership_id = ? AND id != ?",
                [fpo.id, trimmedMembershipId, memberId]
            );
            if (dupMemId.length > 0) {
                return res.status(400).json({
                    message: `Membership ID '${trimmedMembershipId}' is already used by another member.`
                });
            }
        }

        if (status !== undefined && !["active", "inactive"].includes(status)) {
            return res.status(400).json({
                message: "Status must be either 'active' or 'inactive'"
            });
        }

        await db.query(
            `UPDATE fpo_members
             SET farmer_id = ?,
                 member_name = COALESCE(?, member_name),
                 phone = COALESCE(?, phone),
                 village = COALESCE(?, village),
                 district = COALESCE(?, district),
                 state = COALESCE(?, state),
                 land_area_acres = COALESCE(?, land_area_acres),
                 primary_crop = COALESCE(?, primary_crop),
                 membership_id = CASE WHEN ? = 1 THEN ? ELSE membership_id END,
                 status = COALESCE(?, status),
                 joined_date = COALESCE(?, joined_date)
             WHERE id = ? AND fpo_id = ?`,
            [
                updatedFarmerId,
                member_name !== undefined ? member_name.trim() : null,
                phone !== undefined ? phone : null,
                village !== undefined ? village : null,
                district !== undefined ? district : null,
                state !== undefined ? state : null,
                land_area_acres !== undefined ? (land_area_acres ? parseFloat(land_area_acres) : null) : null,
                primary_crop !== undefined ? primary_crop : null,
                trimmedMembershipId !== undefined ? 1 : 0,
                trimmedMembershipId !== undefined ? trimmedMembershipId : null,
                status !== undefined ? status : null,
                joined_date !== undefined ? joined_date : null,
                memberId,
                fpo.id
            ]
        );

        const [updatedMember] = await db.query(
            `SELECT 
                fm.*,
                CASE WHEN fm.farmer_id IS NOT NULL THEN 1 ELSE 0 END AS is_registered_farmer
             FROM fpo_members fm
             WHERE fm.id = ?`,
            [memberId]
        );

        res.status(200).json({
            message: "FPO member updated successfully",
            member: updatedMember[0]
        });

    } catch (error) {
        console.error("Error in updateMember:", error);
        if (error.code === "ER_DUP_ENTRY") {
            return res.status(400).json({
                message: "Duplicate entry for farmer or membership ID in this FPO."
            });
        }
        res.status(500).json({
            message: "Server error"
        });
    }
};

/**
 * Remove or deactivate a member from the FPO.
 * If the member has historical lot contributions, soft-deactivates status to preserve audit trail.
 * DELETE /api/fpo/members/:id
 */
export const deleteMember = async (req, res) => {
    try {
        const userId = req.user.id;
        const memberId = req.params.id;

        const fpo = await getFpoProfileByUserId(userId);
        if (!fpo) {
            return res.status(404).json({
                message: "FPO profile not found"
            });
        }

        // Verify member belongs to this FPO
        const [memberRows] = await db.query(
            "SELECT id, member_name FROM fpo_members WHERE id = ? AND fpo_id = ?",
            [memberId, fpo.id]
        );

        if (memberRows.length === 0) {
            return res.status(404).json({
                message: "Member not found or does not belong to your FPO"
            });
        }

        // Check if member has historical lot intake contributions
        const [lotItems] = await db.query(
            "SELECT COUNT(*) AS count FROM fpo_lot_items WHERE member_id = ?",
            [memberId]
        );

        if (lotItems[0].count > 0) {
            // Soft deactivate to protect historical audit trail
            await db.query(
                "UPDATE fpo_members SET status = 'inactive' WHERE id = ? AND fpo_id = ?",
                [memberId, fpo.id]
            );
            return res.status(200).json({
                message: "Member has historical lot intake records. Status set to 'inactive' to preserve audit history.",
                action: "deactivated"
            });
        }

        // Hard delete if no lot history exists
        await db.query(
            "DELETE FROM fpo_members WHERE id = ? AND fpo_id = ?",
            [memberId, fpo.id]
        );

        res.status(200).json({
            message: "Member removed successfully",
            action: "deleted"
        });

    } catch (error) {
        console.error("Error in deleteMember:", error);
        res.status(500).json({
            message: "Server error"
        });
    }
};

/**
 * Search registered KIRAN farmers by name, phone, email, or village to facilitate member enrollment.
 * GET /api/fpo/farmers/search?q=...
 */
export const searchFarmers = async (req, res) => {
    try {
        const { q } = req.query;
        if (!q || !q.trim() || q.trim().length < 2) {
            return res.status(400).json({
                message: "Search query must be at least 2 characters"
            });
        }

        const term = `%${q.trim()}%`;
        const [farmers] = await db.query(
            `SELECT 
                fp.id AS farmer_profile_id,
                u.id AS user_id,
                u.name,
                u.email,
                fp.phone,
                fp.village,
                fp.district,
                fp.state
             FROM farmer_profiles fp
             JOIN users u ON fp.user_id = u.id
             WHERE u.name LIKE ? OR fp.phone LIKE ? OR u.email LIKE ? OR fp.village LIKE ?
             LIMIT 20`,
            [term, term, term, term]
        );

        res.status(200).json({
            farmers
        });

    } catch (error) {
        console.error("Error in searchFarmers:", error);
        res.status(500).json({
            message: "Server error"
        });
    }
};

// ============================================================================
// PHASE 2B: FPO PRODUCE AGGREGATION & LOT MANAGEMENT CONTROLLERS
// ============================================================================

/**
 * Standard weight conversion helpers across supported units (kg, quintal, tonne).
 * 1 quintal = 100 kg
 * 1 tonne = 1000 kg = 10 quintals
 */
export const toKg = (qty, unit) => {
    const q = parseFloat(qty);
    if (isNaN(q) || q <= 0) return 0;
    const u = (unit || "").toLowerCase();
    if (u === "tonne") return q * 1000;
    if (u === "quintal") return q * 100;
    return q; // kg
};

export const fromKg = (qtyInKg, targetUnit) => {
    const q = parseFloat(qtyInKg);
    if (isNaN(q)) return 0;
    const u = (targetUnit || "").toLowerCase();
    if (u === "tonne") return +(q / 1000).toFixed(2);
    if (u === "quintal") return +(q / 100).toFixed(2);
    return +(q).toFixed(2); // kg
};

/**
 * Generates a unique collision-free lot number for an FPO.
 * Pattern: LOT-YYYYMMDD-<fpoId>-<random5Digits>
 */
const generateLotNumber = async (fpoId, dbOrConn) => {
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    for (let attempt = 0; attempt < 5; attempt++) {
        const rand = Math.floor(10000 + Math.random() * 90000);
        const candidate = `LOT-${dateStr}-${fpoId}-${rand}`;
        const [existing] = await dbOrConn.query(
            "SELECT id FROM fpo_lots WHERE lot_number = ?",
            [candidate]
        );
        if (existing.length === 0) return candidate;
    }
    return `LOT-${dateStr}-${fpoId}-${Date.now()}`;
};

/**
 * Controlled lot lifecycle transitions.
 * Draft -> Aggregated -> Offered -> Contracted -> Dispatched -> Completed.
 * Active lots can be cancelled, releasing allocated quantities.
 */
const ALLOWED_STATUS_TRANSITIONS = {
    draft: ["aggregated", "cancelled"],
    aggregated: ["draft", "offered", "cancelled"],
    offered: ["aggregated", "contracted", "cancelled"],
    contracted: ["dispatched"],
    dispatched: ["completed"],
    completed: [],
    cancelled: []
};

/**
 * Create a new FPO aggregation lot.
 * POST /api/fpo/lots
 */
export const createLot = async (req, res) => {
    try {
        const userId = req.user.id;

        const fpo = await getFpoProfileByUserId(userId);
        if (!fpo) {
            return res.status(404).json({
                message: "FPO profile not found. Please create your FPO profile first."
            });
        }

        const {
            crop_name,
            lot_number,
            unit,
            quality_grade,
            expected_price,
            aggregation_center,
            available_from,
            status,
            description
        } = req.body;

        // Validation
        if (!crop_name || typeof crop_name !== "string" || !crop_name.trim()) {
            return res.status(400).json({
                message: "Crop name is required"
            });
        }

        const lotUnit = (unit && ["kg", "quintal", "tonne"].includes(unit)) ? unit : "quintal";
        const lotStatus = (status && ["draft", "aggregated"].includes(status)) ? status : "aggregated";

        // Unique lot number generation or validation
        let finalLotNumber = lot_number ? lot_number.trim() : null;
        if (finalLotNumber) {
            const [existing] = await db.query(
                "SELECT id FROM fpo_lots WHERE lot_number = ?",
                [finalLotNumber]
            );
            if (existing.length > 0) {
                return res.status(400).json({
                    message: `Lot number '${finalLotNumber}' is already in use. Please provide a unique lot number or omit to auto-generate.`
                });
            }
        } else {
            finalLotNumber = await generateLotNumber(fpo.id, db);
        }

        const [insertResult] = await db.query(
            `INSERT INTO fpo_lots
             (fpo_id, lot_number, crop_name, total_quantity, unit, quality_grade, expected_price, aggregation_center, available_from, status, description)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                fpo.id,
                finalLotNumber,
                crop_name.trim(),
                0.00, // Total quantity starts at 0 and increments with contributions
                lotUnit,
                quality_grade ? quality_grade.trim() : "Grade A",
                expected_price ? parseFloat(expected_price) : null,
                aggregation_center ? aggregation_center.trim() : null,
                available_from || null,
                lotStatus,
                description ? description.trim() : null
            ]
        );

        const [newLot] = await db.query(
            "SELECT * FROM fpo_lots WHERE id = ?",
            [insertResult.insertId]
        );

        res.status(201).json({
            message: "FPO aggregation lot created successfully",
            lot: newLot[0]
        });

    } catch (error) {
        console.error("Error in createLot:", error);
        if (error.code === "ER_DUP_ENTRY") {
            return res.status(400).json({
                message: "Lot number already exists"
            });
        }
        res.status(500).json({
            message: "Server error"
        });
    }
};

/**
 * Get all aggregation lots for the authenticated FPO.
 * GET /api/fpo/lots
 */
export const getLots = async (req, res) => {
    try {
        const userId = req.user.id;

        const fpo = await getFpoProfileByUserId(userId);
        if (!fpo) {
            return res.status(404).json({
                message: "FPO profile not found"
            });
        }

        const { status, crop_name, search } = req.query;

        let query = `
            SELECT 
                fl.*,
                (SELECT COUNT(*) FROM fpo_lot_items fli WHERE fli.lot_id = fl.id) AS items_count,
                (SELECT COUNT(DISTINCT fli.member_id) FROM fpo_lot_items fli WHERE fli.lot_id = fl.id) AS contributing_members_count
            FROM fpo_lots fl
            WHERE fl.fpo_id = ?
        `;
        const queryParams = [fpo.id];

        if (status && status.trim()) {
            query += " AND fl.status = ?";
            queryParams.push(status.trim());
        }

        if (crop_name && crop_name.trim()) {
            query += " AND fl.crop_name = ?";
            queryParams.push(crop_name.trim());
        }

        if (search && search.trim()) {
            query += " AND (fl.lot_number LIKE ? OR fl.crop_name LIKE ? OR fl.aggregation_center LIKE ?)";
            const term = `%${search.trim()}%`;
            queryParams.push(term, term, term);
        }

        query += " ORDER BY fl.created_at DESC";

        const [lots] = await db.query(query, queryParams);

        // Aggregate statistics
        const [stats] = await db.query(
            `SELECT 
                COUNT(*) AS total_lots,
                SUM(status = 'draft') AS draft_lots,
                SUM(status = 'aggregated') AS aggregated_lots,
                SUM(status = 'offered') AS offered_lots,
                SUM(status = 'contracted') AS contracted_lots,
                SUM(status = 'completed') AS completed_lots,
                SUM(status = 'cancelled') AS cancelled_lots
             FROM fpo_lots
             WHERE fpo_id = ?`,
            [fpo.id]
        );

        res.status(200).json({
            stats: {
                total_lots: stats[0].total_lots || 0,
                draft_lots: stats[0].draft_lots || 0,
                aggregated_lots: stats[0].aggregated_lots || 0,
                offered_lots: stats[0].offered_lots || 0,
                contracted_lots: stats[0].contracted_lots || 0,
                completed_lots: stats[0].completed_lots || 0,
                cancelled_lots: stats[0].cancelled_lots || 0
            },
            lots
        });

    } catch (error) {
        console.error("Error in getLots:", error);
        res.status(500).json({
            message: "Server error"
        });
    }
};

/**
 * Get single lot details along with its item breakdown.
 * GET /api/fpo/lots/:id
 */
export const getLotById = async (req, res) => {
    try {
        const userId = req.user.id;
        const lotId = req.params.id;

        const fpo = await getFpoProfileByUserId(userId);
        if (!fpo) {
            return res.status(404).json({
                message: "FPO profile not found"
            });
        }

        const [lots] = await db.query(
            `SELECT 
                fl.*,
                (SELECT COUNT(*) FROM fpo_lot_items fli WHERE fli.lot_id = fl.id) AS items_count,
                (SELECT COUNT(DISTINCT fli.member_id) FROM fpo_lot_items fli WHERE fli.lot_id = fl.id) AS contributing_members_count
             FROM fpo_lots fl
             WHERE fl.id = ? AND fl.fpo_id = ?`,
            [lotId, fpo.id]
        );

        if (lots.length === 0) {
            return res.status(404).json({
                message: "Lot not found or does not belong to your FPO"
            });
        }

        const [items] = await db.query(
            `SELECT 
                fli.*,
                fm.membership_id,
                fm.phone AS member_phone,
                fm.village AS member_village,
                p.crop_name AS produce_crop_name,
                p.quantity AS produce_original_quantity,
                p.unit AS produce_original_unit
             FROM fpo_lot_items fli
             LEFT JOIN fpo_members fm ON fli.member_id = fm.id
             LEFT JOIN produce p ON fli.produce_id = p.id
             WHERE fli.lot_id = ?
             ORDER BY fli.created_at ASC`,
            [lotId]
        );

        res.status(200).json({
            lot: lots[0],
            items
        });

    } catch (error) {
        console.error("Error in getLotById:", error);
        res.status(500).json({
            message: "Server error"
        });
    }
};

/**
 * Update lot properties or advance lot status along the allowed lifecycle.
 * PUT /api/fpo/lots/:id
 */
export const updateLot = async (req, res) => {
    try {
        const userId = req.user.id;
        const lotId = req.params.id;

        const fpo = await getFpoProfileByUserId(userId);
        if (!fpo) {
            return res.status(404).json({
                message: "FPO profile not found"
            });
        }

        const [lots] = await db.query(
            "SELECT * FROM fpo_lots WHERE id = ? AND fpo_id = ?",
            [lotId, fpo.id]
        );

        if (lots.length === 0) {
            return res.status(404).json({
                message: "Lot not found or does not belong to your FPO"
            });
        }

        const lot = lots[0];

        // Terminal states cannot be modified
        if (["completed", "cancelled"].includes(lot.status)) {
            return res.status(400).json({
                message: `Lot is in '${lot.status}' status and cannot be modified`
            });
        }

        const {
            crop_name,
            quality_grade,
            expected_price,
            aggregation_center,
            available_from,
            status,
            description
        } = req.body;

        // Controlled Status Lifecycle Validation
        let updatedStatus = lot.status;
        if (status !== undefined && status !== lot.status) {
            const allowedTransitions = ALLOWED_STATUS_TRANSITIONS[lot.status] || [];
            if (!allowedTransitions.includes(status)) {
                return res.status(400).json({
                    message: `Invalid status transition from '${lot.status}' to '${status}'. Allowed transitions: [${allowedTransitions.join(", ")}]`
                });
            }
            updatedStatus = status;
        }

        if (crop_name !== undefined && (!crop_name || !crop_name.trim())) {
            return res.status(400).json({
                message: "Crop name cannot be empty"
            });
        }

        await db.query(
            `UPDATE fpo_lots
             SET crop_name = COALESCE(?, crop_name),
                 quality_grade = COALESCE(?, quality_grade),
                 expected_price = COALESCE(?, expected_price),
                 aggregation_center = COALESCE(?, aggregation_center),
                 available_from = COALESCE(?, available_from),
                 status = ?,
                 description = COALESCE(?, description)
             WHERE id = ? AND fpo_id = ?`,
            [
                crop_name !== undefined ? crop_name.trim() : null,
                quality_grade !== undefined ? quality_grade.trim() : null,
                expected_price !== undefined ? parseFloat(expected_price) : null,
                aggregation_center !== undefined ? aggregation_center.trim() : null,
                available_from !== undefined ? available_from : null,
                updatedStatus,
                description !== undefined ? description.trim() : null,
                lot.id,
                fpo.id
            ]
        );

        const [updatedLot] = await db.query(
            "SELECT * FROM fpo_lots WHERE id = ?",
            [lot.id]
        );

        res.status(200).json({
            message: "FPO lot updated successfully",
            lot: updatedLot[0]
        });

    } catch (error) {
        console.error("Error in updateLot:", error);
        res.status(500).json({
            message: "Server error"
        });
    }
};

/**
 * Delete a lot and release allocations.
 * Allowed only for lots in draft, aggregated, or cancelled status with no active marketplace commitments.
 * DELETE /api/fpo/lots/:id
 */
export const deleteLot = async (req, res) => {
    try {
        const userId = req.user.id;
        const lotId = req.params.id;

        const fpo = await getFpoProfileByUserId(userId);
        if (!fpo) {
            return res.status(404).json({
                message: "FPO profile not found"
            });
        }

        const [lots] = await db.query(
            "SELECT * FROM fpo_lots WHERE id = ? AND fpo_id = ?",
            [lotId, fpo.id]
        );

        if (lots.length === 0) {
            return res.status(404).json({
                message: "Lot not found or does not belong to your FPO"
            });
        }

        const lot = lots[0];

        // Safety check: Cannot delete lots that have progressed into contractual or fulfillment states
        if (["offered", "contracted", "dispatched", "completed"].includes(lot.status)) {
            return res.status(400).json({
                message: `Cannot delete lot in '${lot.status}' status. Active commercial commitments exist.`
            });
        }

        // Safety check: verify no offers or contracts reference this lot
        const [activeOffers] = await db.query(
            "SELECT id FROM offers WHERE fpo_lot_id = ?",
            [lot.id]
        );
        if (activeOffers.length > 0) {
            return res.status(400).json({
                message: "Cannot delete lot linked to existing marketplace offers"
            });
        }

        const [activeContracts] = await db.query(
            "SELECT id FROM contracts WHERE fpo_lot_id = ?",
            [lot.id]
        );
        if (activeContracts.length > 0) {
            return res.status(400).json({
                message: "Cannot delete lot linked to active contracts"
            });
        }

        // Hard delete lot (fpo_lot_items cascade automatically, releasing produce allocations)
        await db.query(
            "DELETE FROM fpo_lots WHERE id = ? AND fpo_id = ?",
            [lot.id, fpo.id]
        );

        res.status(200).json({
            message: "FPO lot deleted successfully"
        });

    } catch (error) {
        console.error("Error in deleteLot:", error);
        res.status(500).json({
            message: "Server error"
        });
    }
};

/**
 * Get all traceable item contributions for a specific lot.
 * GET /api/fpo/lots/:lotId/items
 */
export const getLotItems = async (req, res) => {
    try {
        const userId = req.user.id;
        const lotId = req.params.lotId;

        const fpo = await getFpoProfileByUserId(userId);
        if (!fpo) {
            return res.status(404).json({
                message: "FPO profile not found"
            });
        }

        const [lots] = await db.query(
            "SELECT * FROM fpo_lots WHERE id = ? AND fpo_id = ?",
            [lotId, fpo.id]
        );

        if (lots.length === 0) {
            return res.status(404).json({
                message: "Lot not found or does not belong to your FPO"
            });
        }

        const [items] = await db.query(
            `SELECT 
                fli.*,
                fm.membership_id,
                fm.phone AS member_phone,
                fm.village AS member_village,
                p.crop_name AS produce_crop_name,
                p.quantity AS produce_original_quantity,
                p.unit AS produce_original_unit
             FROM fpo_lot_items fli
             LEFT JOIN fpo_members fm ON fli.member_id = fm.id
             LEFT JOIN produce p ON fli.produce_id = p.id
             WHERE fli.lot_id = ?
             ORDER BY fli.created_at ASC`,
            [lotId]
        );

        res.status(200).json({
            lot_id: lots[0].id,
            lot_number: lots[0].lot_number,
            crop_name: lots[0].crop_name,
            total_quantity: lots[0].total_quantity,
            unit: lots[0].unit,
            status: lots[0].status,
            total_items: items.length,
            items
        });

    } catch (error) {
        console.error("Error in getLotItems:", error);
        res.status(500).json({
            message: "Server error"
        });
    }
};

/**
 * Add produce contribution to an FPO lot.
 * CRITICAL: Implements database transactions and SELECT ... FOR UPDATE row locking
 * to strictly prevent race conditions and double-allocation of farmer produce.
 * POST /api/fpo/lots/:lotId/items
 */
export const addLotItem = async (req, res) => {
    const userId = req.user.id;
    const lotId = req.params.lotId;

    const {
        member_id,
        produce_id,
        quantity_contributed,
        unit,
        intake_price_per_unit,
        quality_grade,
        intake_date,
        notes
    } = req.body;

    // Basic payload validations
    const qty = parseFloat(quantity_contributed);
    if (isNaN(qty) || qty <= 0) {
        return res.status(400).json({
            message: "Quantity contributed must be a positive number greater than 0"
        });
    }

    if (!member_id) {
        return res.status(400).json({
            message: "Member ID is required"
        });
    }

    // Connect to database for transactional row locking
    const conn = await db.getConnection();

    try {
        await conn.beginTransaction();

        // 1. Resolve and verify FPO profile
        const [fpoProfiles] = await conn.query(
            "SELECT id FROM fpo_profiles WHERE user_id = ?",
            [userId]
        );
        if (fpoProfiles.length === 0) {
            await conn.rollback();
            return res.status(404).json({
                message: "FPO profile not found. Please complete your FPO profile first."
            });
        }
        const fpoId = fpoProfiles[0].id;

        // 2. Lock and verify the lot
        const [lots] = await conn.query(
            "SELECT * FROM fpo_lots WHERE id = ? AND fpo_id = ? FOR UPDATE",
            [lotId, fpoId]
        );
        if (lots.length === 0) {
            await conn.rollback();
            return res.status(404).json({
                message: "Lot not found or does not belong to your FPO"
            });
        }
        const lot = lots[0];

        // Ensure lot status permits intake additions
        if (!["draft", "aggregated"].includes(lot.status)) {
            await conn.rollback();
            return res.status(400).json({
                message: `Cannot add contributions to lot in '${lot.status}' status. Only 'draft' and 'aggregated' lots permit item additions.`
            });
        }

        // 3. Lock and verify the member belongs to the authenticated FPO
        const [members] = await conn.query(
            "SELECT * FROM fpo_members WHERE id = ? AND fpo_id = ? FOR UPDATE",
            [member_id, fpoId]
        );
        if (members.length === 0) {
            await conn.rollback();
            return res.status(404).json({
                message: "Member not found or does not belong to your FPO"
            });
        }
        const member = members[0];

        if (member.status !== "active") {
            await conn.rollback();
            return res.status(400).json({
                message: "Cannot allocate produce from an inactive member"
            });
        }

        const contributionUnit = (unit && ["kg", "quintal", "tonne"].includes(unit)) ? unit : lot.unit;
        const requestedKg = toKg(qty, contributionUnit);

        let validProduceId = null;

        // 4. Double-Allocation Guard: If produce_id is supplied, lock and validate produce availability
        if (produce_id !== undefined && produce_id !== null && produce_id !== "") {
            const [produceRows] = await conn.query(
                "SELECT * FROM produce WHERE id = ? FOR UPDATE",
                [produce_id]
            );

            if (produceRows.length === 0) {
                await conn.rollback();
                return res.status(400).json({
                    message: "Produce record not found"
                });
            }
            const produce = produceRows[0];

            // Ownership check: Produce must belong to the farmer associated with this FPO member
            if (!member.farmer_id || produce.farmer_id !== member.farmer_id) {
                await conn.rollback();
                return res.status(400).json({
                    message: "Produce record does not belong to the specified FPO member"
                });
            }

            // Eligibility check: Produce must be available
            if (produce.status !== "available") {
                await conn.rollback();
                return res.status(400).json({
                    message: `Produce is currently marked as '${produce.status}' and cannot be aggregated`
                });
            }

            // Calculate active allocations across all non-cancelled lots (locked with FOR UPDATE)
            const [activeAllocations] = await conn.query(
                `SELECT fli.quantity_contributed, fli.unit
                 FROM fpo_lot_items fli
                 JOIN fpo_lots fl ON fli.lot_id = fl.id
                 WHERE fli.produce_id = ? AND fl.status != 'cancelled'
                 FOR UPDATE`,
                [produce.id]
            );

            let alreadyAllocatedKg = 0;
            for (const alloc of activeAllocations) {
                alreadyAllocatedKg += toKg(alloc.quantity_contributed, alloc.unit);
            }

            const totalOriginalProduceKg = toKg(produce.quantity, produce.unit);
            const remainingAvailableKg = Math.max(0, totalOriginalProduceKg - alreadyAllocatedKg);

            // Floating point tolerance epsilon
            if (requestedKg > remainingAvailableKg + 0.001) {
                const remainingInRequestedUnit = fromKg(remainingAvailableKg, contributionUnit);
                await conn.rollback();
                return res.status(400).json({
                    message: `Requested quantity (${qty} ${contributionUnit}) exceeds available unallocated produce quantity (${remainingInRequestedUnit} ${contributionUnit})`,
                    available_quantity: remainingInRequestedUnit,
                    unit: contributionUnit
                });
            }

            validProduceId = produce.id;
        }

        // 5. Insert new contribution into fpo_lot_items
        const [insertResult] = await conn.query(
            `INSERT INTO fpo_lot_items
             (lot_id, member_id, produce_id, farmer_name, quantity_contributed, unit, intake_price_per_unit, quality_grade, intake_date, notes)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                lot.id,
                member.id,
                validProduceId,
                member.member_name,
                qty,
                contributionUnit,
                intake_price_per_unit ? parseFloat(intake_price_per_unit) : null,
                quality_grade ? quality_grade.trim() : null,
                intake_date || new Date().toISOString().slice(0, 10),
                notes ? notes.trim() : null
            ]
        );

        // 6. Atomically recalculate and update lot's total_quantity
        const [allLotItems] = await conn.query(
            "SELECT quantity_contributed, unit FROM fpo_lot_items WHERE lot_id = ?",
            [lot.id]
        );

        let totalLotKg = 0;
        for (const item of allLotItems) {
            totalLotKg += toKg(item.quantity_contributed, item.unit);
        }
        const updatedTotalQuantity = fromKg(totalLotKg, lot.unit);

        await conn.query(
            "UPDATE fpo_lots SET total_quantity = ? WHERE id = ?",
            [updatedTotalQuantity, lot.id]
        );

        // Commit transaction
        await conn.commit();

        // 7. Return inserted contribution with lot summary
        const [createdItem] = await db.query(
            `SELECT 
                fli.*,
                fm.membership_id,
                fm.phone AS member_phone,
                p.crop_name AS produce_crop_name
             FROM fpo_lot_items fli
             LEFT JOIN fpo_members fm ON fli.member_id = fm.id
             LEFT JOIN produce p ON fli.produce_id = p.id
             WHERE fli.id = ?`,
            [insertResult.insertId]
        );

        res.status(201).json({
            message: "Produce contribution added to lot successfully",
            item: createdItem[0],
            lot_total_quantity: updatedTotalQuantity,
            lot_unit: lot.unit
        });

    } catch (error) {
        await conn.rollback();
        console.error("Error in addLotItem:", error);
        res.status(500).json({
            message: "Server error during produce allocation"
        });
    } finally {
        conn.release();
    }
};

/**
 * Remove a produce contribution from a lot and atomically recalculate lot total quantity.
 * DELETE /api/fpo/lots/:lotId/items/:itemId
 */
export const removeLotItem = async (req, res) => {
    const userId = req.user.id;
    const { lotId, itemId } = req.params;

    const conn = await db.getConnection();

    try {
        await conn.beginTransaction();

        // 1. Resolve FPO profile
        const [fpoProfiles] = await conn.query(
            "SELECT id FROM fpo_profiles WHERE user_id = ?",
            [userId]
        );
        if (fpoProfiles.length === 0) {
            await conn.rollback();
            return res.status(404).json({
                message: "FPO profile not found"
            });
        }
        const fpoId = fpoProfiles[0].id;

        // 2. Lock and verify the lot
        const [lots] = await conn.query(
            "SELECT * FROM fpo_lots WHERE id = ? AND fpo_id = ? FOR UPDATE",
            [lotId, fpoId]
        );
        if (lots.length === 0) {
            await conn.rollback();
            return res.status(404).json({
                message: "Lot not found or does not belong to your FPO"
            });
        }
        const lot = lots[0];

        // Ensure lot status permits contribution removal
        if (!["draft", "aggregated"].includes(lot.status)) {
            await conn.rollback();
            return res.status(400).json({
                message: `Cannot remove contributions from lot in '${lot.status}' status. Quantity is committed.`
            });
        }

        // 3. Verify item belongs to this lot
        const [items] = await conn.query(
            "SELECT * FROM fpo_lot_items WHERE id = ? AND lot_id = ? FOR UPDATE",
            [itemId, lot.id]
        );
        if (items.length === 0) {
            await conn.rollback();
            return res.status(404).json({
                message: "Item not found in this lot"
            });
        }

        // 4. Delete the item
        await conn.query(
            "DELETE FROM fpo_lot_items WHERE id = ?",
            [itemId]
        );

        // 5. Recalculate lot total_quantity
        const [remainingItems] = await conn.query(
            "SELECT quantity_contributed, unit FROM fpo_lot_items WHERE lot_id = ?",
            [lot.id]
        );

        let totalLotKg = 0;
        for (const item of remainingItems) {
            totalLotKg += toKg(item.quantity_contributed, item.unit);
        }
        const updatedTotalQuantity = fromKg(totalLotKg, lot.unit);

        await conn.query(
            "UPDATE fpo_lots SET total_quantity = ? WHERE id = ?",
            [updatedTotalQuantity, lot.id]
        );

        await conn.commit();

        res.status(200).json({
            message: "Produce contribution removed from lot successfully",
            lot_total_quantity: updatedTotalQuantity,
            lot_unit: lot.unit
        });

    } catch (error) {
        await conn.rollback();
        console.error("Error in removeLotItem:", error);
        res.status(500).json({
            message: "Server error"
        });
    } finally {
        conn.release();
    }
};

/**
 * Get all available produce listings across member farmers of the authenticated FPO,
 * including original quantity, already-allocated quantity, and remaining available quantity.
 * GET /api/fpo/produce/available
 */
export const getAvailableMemberProduce = async (req, res) => {
    try {
        const userId = req.user.id;

        const fpo = await getFpoProfileByUserId(userId);
        if (!fpo) {
            return res.status(404).json({
                message: "FPO profile not found"
            });
        }

        const [rows] = await db.query(
            `SELECT 
                p.id AS produce_id,
                p.crop_name,
                p.quantity AS original_quantity,
                p.unit,
                p.quality_grade,
                p.expected_harvest_date,
                p.available_from,
                p.location,
                p.status AS produce_status,
                fm.id AS member_id,
                fm.member_name,
                fm.phone AS member_phone,
                fm.village AS member_village,
                fm.membership_id
             FROM produce p
             JOIN farmer_profiles fp ON p.farmer_id = fp.id
             JOIN fpo_members fm ON fm.farmer_id = fp.id
             WHERE fm.fpo_id = ? AND fm.status = 'active' AND p.status = 'available'
             ORDER BY p.created_at DESC`,
            [fpo.id]
        );

        // Calculate allocated and available quantity for each produce record
        const enrichedProduce = await Promise.all(
            rows.map(async (prod) => {
                const [allocations] = await db.query(
                    `SELECT fli.quantity_contributed, fli.unit
                     FROM fpo_lot_items fli
                     JOIN fpo_lots fl ON fli.lot_id = fl.id
                     WHERE fli.produce_id = ? AND fl.status != 'cancelled'`,
                    [prod.produce_id]
                );

                let allocatedKg = 0;
                for (const alloc of allocations) {
                    allocatedKg += toKg(alloc.quantity_contributed, alloc.unit);
                }

                const originalKg = toKg(prod.original_quantity, prod.unit);
                const availableKg = Math.max(0, originalKg - allocatedKg);

                return {
                    ...prod,
                    allocated_quantity: fromKg(allocatedKg, prod.unit),
                    available_quantity: fromKg(availableKg, prod.unit),
                    is_fully_allocated: availableKg <= 0.001
                };
            })
        );

        res.status(200).json({
            available_produce: enrichedProduce
        });

    } catch (error) {
        console.error("Error in getAvailableMemberProduce:", error);
        res.status(500).json({
            message: "Server error"
        });
    }
};

// ============================================================================
// PHASE 2C-A: FPO MARKETPLACE REQUIREMENTS & OFFER CREATION
// ============================================================================

/**
 * Get open buyer requirements eligible for FPO marketplace bidding,
 * with filters for crop, location, search, quantity, and annotations for the FPO's matching lots.
 * GET /api/fpo/marketplace/requirements
 */
export const getMarketplaceRequirements = async (req, res) => {
    try {
        const userId = req.user.id;

        const fpo = await getFpoProfileByUserId(userId);
        if (!fpo) {
            return res.status(404).json({
                message: "FPO profile not found"
            });
        }

        const { crop, location, search, min_quantity, max_quantity } = req.query;

        let query = `
            SELECT
                br.id,
                br.buyer_id,
                br.crop_name,
                br.quantity,
                br.unit,
                br.quality_grade,
                br.max_price,
                br.required_by,
                br.location,
                br.status,
                br.created_at,
                u.name AS buyer_name,
                u.email AS buyer_email,
                (SELECT COUNT(*) FROM offers o WHERE o.requirement_id = br.id) AS total_offers_count,
                (SELECT COUNT(*) FROM offers o WHERE o.requirement_id = br.id AND o.fpo_id = ? AND o.seller_type = 'fpo') AS my_fpo_offers_count
            FROM buyer_requirements br
            LEFT JOIN users u ON br.buyer_id = u.id
            WHERE br.status = 'open'
        `;
        const queryParams = [fpo.id];

        if (crop && crop.trim()) {
            query += " AND br.crop_name LIKE ?";
            queryParams.push(`%${crop.trim()}%`);
        }

        if (location && location.trim()) {
            query += " AND br.location LIKE ?";
            queryParams.push(`%${location.trim()}%`);
        }

        if (search && search.trim()) {
            query += " AND (br.crop_name LIKE ? OR br.location LIKE ? OR u.name LIKE ?)";
            const term = `%${search.trim()}%`;
            queryParams.push(term, term, term);
        }

        if (min_quantity && !isNaN(parseFloat(min_quantity))) {
            query += " AND br.quantity >= ?";
            queryParams.push(parseFloat(min_quantity));
        }

        if (max_quantity && !isNaN(parseFloat(max_quantity))) {
            query += " AND br.quantity <= ?";
            queryParams.push(parseFloat(max_quantity));
        }

        query += " ORDER BY br.created_at DESC";

        const [requirements] = await db.query(query, queryParams);

        // Fetch eligible aggregated lots for this FPO to make bidding seamless
        const [eligibleLots] = await db.query(
            `SELECT id, lot_number, crop_name, total_quantity, unit, quality_grade, expected_price, aggregation_center
             FROM fpo_lots
             WHERE fpo_id = ? AND status = 'aggregated' AND total_quantity > 0`,
            [fpo.id]
        );

        res.status(200).json({
            requirements,
            eligible_lots: eligibleLots
        });

    } catch (error) {
        console.error("Error in getMarketplaceRequirements:", error);
        res.status(500).json({
            message: "Server error"
        });
    }
};

/**
 * Submit an FPO marketplace offer against an open buyer requirement.
 * Reuses existing offers table with seller_type = 'fpo', fpo_id, fpo_lot_id, and farmer_id = NULL.
 * Uses database transactions and SELECT ... FOR UPDATE row-locking on the lot and buyer requirement.
 * Atomically transitions lot status from 'aggregated' to 'offered'.
 * POST /api/fpo/marketplace/offers
 */
export const createMarketplaceOffer = async (req, res) => {
    const userId = req.user.id;
    const {
        requirement_id,
        fpo_lot_id,
        offered_quantity,
        quantity,
        offered_price,
        offer_price,
        message
    } = req.body;

    const finalQuantity = offered_quantity !== undefined ? parseFloat(offered_quantity) : parseFloat(quantity);
    const finalPrice = offered_price !== undefined ? parseFloat(offered_price) : parseFloat(offer_price);

    if (!requirement_id || isNaN(finalQuantity) || finalQuantity <= 0 || isNaN(finalPrice) || finalPrice <= 0) {
        return res.status(400).json({
            message: "Requirement ID, valid positive quantity, and valid positive offer price are required"
        });
    }

    if (!fpo_lot_id) {
        return res.status(400).json({
            message: "FPO Lot ID is required"
        });
    }

    const conn = await db.getConnection();

    try {
        await conn.beginTransaction();

        // 1. Resolve FPO profile
        const [fpoProfiles] = await conn.query(
            "SELECT id FROM fpo_profiles WHERE user_id = ?",
            [userId]
        );
        if (fpoProfiles.length === 0) {
            await conn.rollback();
            return res.status(404).json({
                message: "FPO profile not found. Please create your FPO profile first."
            });
        }
        const fpoId = fpoProfiles[0].id;

        // 2. Lock and verify the FPO Lot
        const [lots] = await conn.query(
            "SELECT * FROM fpo_lots WHERE id = ? AND fpo_id = ? FOR UPDATE",
            [fpo_lot_id, fpoId]
        );

        if (lots.length === 0) {
            await conn.rollback();
            return res.status(404).json({
                message: "FPO lot not found or does not belong to your FPO"
            });
        }
        const lot = lots[0];

        // Lot status must be 'aggregated'
        if (lot.status !== "aggregated") {
            await conn.rollback();
            return res.status(400).json({
                message: `Cannot submit offer for lot in '${lot.status}' status. Lot must be in 'aggregated' status to submit marketplace offers.`
            });
        }

        // Lot must have quantity
        const lotQuantity = parseFloat(lot.total_quantity);
        if (isNaN(lotQuantity) || lotQuantity <= 0) {
            await conn.rollback();
            return res.status(400).json({
                message: "Selected FPO lot has no aggregated produce quantity"
            });
        }

        // 3. Lock and verify Buyer Requirement
        const [requirements] = await conn.query(
            "SELECT * FROM buyer_requirements WHERE id = ? FOR UPDATE",
            [requirement_id]
        );

        if (requirements.length === 0) {
            await conn.rollback();
            return res.status(404).json({
                message: "Buyer requirement not found"
            });
        }
        const requirement = requirements[0];

        if (requirement.status !== "open") {
            await conn.rollback();
            return res.status(400).json({
                message: `This buyer requirement is no longer open for offers (status: '${requirement.status}')`
            });
        }

        // Prevent self-offering
        if (requirement.buyer_id === userId) {
            await conn.rollback();
            return res.status(400).json({
                message: "You cannot submit an offer on your own requirement"
            });
        }

        // 4. Crop compatibility check
        if (lot.crop_name.trim().toLowerCase() !== requirement.crop_name.trim().toLowerCase()) {
            await conn.rollback();
            return res.status(400).json({
                message: `Crop mismatch: Buyer requirement is for '${requirement.crop_name}', but selected lot is for '${lot.crop_name}'`
            });
        }

        // 5. Quantity compatibility check
        const offeredKg = toKg(finalQuantity, requirement.unit || lot.unit);
        const lotTotalKg = toKg(lotQuantity, lot.unit);

        if (offeredKg > lotTotalKg + 0.001) {
            const lotAvailableInOfferUnit = fromKg(lotTotalKg, requirement.unit || lot.unit);
            await conn.rollback();
            return res.status(400).json({
                message: `Offered quantity (${finalQuantity} ${requirement.unit || lot.unit}) exceeds lot total available quantity (${lotAvailableInOfferUnit} ${requirement.unit || lot.unit})`
            });
        }

        // Check duplicate active offer
        const [existingOffers] = await conn.query(
            "SELECT id FROM offers WHERE requirement_id = ? AND fpo_id = ? AND fpo_lot_id = ? AND status = 'pending'",
            [requirement.id, fpoId, lot.id]
        );
        if (existingOffers.length > 0) {
            await conn.rollback();
            return res.status(400).json({
                message: "An active pending offer for this requirement using this lot already exists"
            });
        }

        // 6. Insert offer into `offers`
        const [offerResult] = await conn.query(
            `INSERT INTO offers (
                requirement_id,
                farmer_id,
                fpo_id,
                fpo_lot_id,
                seller_type,
                offer_price,
                quantity,
                message,
                status
             ) VALUES (?, NULL, ?, ?, 'fpo', ?, ?, ?, 'pending')`,
            [
                requirement.id,
                fpoId,
                lot.id,
                finalPrice,
                finalQuantity,
                message ? message.trim() : null
            ]
        );

        // 7. Atomically transition lot status: aggregated -> offered
        await conn.query(
            "UPDATE fpo_lots SET status = 'offered' WHERE id = ?",
            [lot.id]
        );

        await conn.commit();

        // 8. Return created offer
        const [newOffer] = await db.query(
            `SELECT 
                o.*,
                br.crop_name,
                br.unit,
                br.quality_grade,
                br.location AS delivery_location,
                fl.lot_number,
                fp.fpo_name
             FROM offers o
             JOIN buyer_requirements br ON o.requirement_id = br.id
             JOIN fpo_lots fl ON o.fpo_lot_id = fl.id
             JOIN fpo_profiles fp ON o.fpo_id = fp.id
             WHERE o.id = ?`,
            [offerResult.insertId]
        );

        res.status(201).json({
            message: "FPO marketplace offer submitted successfully",
            offer: newOffer[0]
        });

    } catch (error) {
        await conn.rollback();
        console.error("Error in createMarketplaceOffer:", error);
        res.status(500).json({
            message: "Server error during offer creation"
        });
    } finally {
        conn.release();
    }
};

/**
 * Get all submitted marketplace offers for the authenticated FPO.
 * GET /api/fpo/marketplace/offers
 */
export const getMyMarketplaceOffers = async (req, res) => {
    try {
        const userId = req.user.id;

        const fpo = await getFpoProfileByUserId(userId);
        if (!fpo) {
            return res.status(404).json({
                message: "FPO profile not found"
            });
        }

        const [offers] = await db.query(
            `SELECT
                o.id,
                o.requirement_id,
                o.seller_type,
                o.fpo_id,
                o.fpo_lot_id,
                o.offer_price,
                o.quantity,
                o.message,
                o.status,
                o.created_at,
                br.crop_name,
                br.unit,
                br.quality_grade,
                br.max_price,
                br.location AS buyer_location,
                br.required_by,
                u.name AS buyer_name,
                fl.lot_number,
                fl.total_quantity AS lot_total_quantity,
                fl.unit AS lot_unit,
                fl.status AS lot_status
             FROM offers o
             JOIN buyer_requirements br ON o.requirement_id = br.id
             JOIN users u ON br.buyer_id = u.id
             JOIN fpo_lots fl ON o.fpo_lot_id = fl.id
             WHERE o.fpo_id = ? AND o.seller_type = 'fpo'
             ORDER BY o.created_at DESC`,
            [fpo.id]
        );

        res.status(200).json({
            offers
        });

    } catch (error) {
        console.error("Error in getMyMarketplaceOffers:", error);
        res.status(500).json({
            message: "Server error"
        });
    }
};

/**
 * Phase 2C-B2: Get all contracts for the authenticated FPO.
 * GET /api/fpo/contracts
 */
export const getFpoContracts = async (req, res) => {
    try {
        const userId = req.user.id;

        const fpo = await getFpoProfileByUserId(userId);
        if (!fpo) {
            return res.status(404).json({
                message: "FPO profile not found"
            });
        }

        const [contracts] = await db.query(
            `SELECT
                c.id,
                c.offer_id,
                c.requirement_id,
                c.fpo_id,
                c.fpo_lot_id,
                c.seller_type,
                c.buyer_id,
                c.crop_name,
                c.quantity,
                c.unit,
                c.agreed_price,
                c.total_amount,
                c.quality_grade,
                c.delivery_location,
                c.required_by,
                c.status,
                c.created_at,
                u.name AS buyer_name,
                u.email AS buyer_email,
                fl.lot_number,
                fl.aggregation_center,
                br.location AS buyer_location
             FROM contracts c
             JOIN users u ON c.buyer_id = u.id
             LEFT JOIN fpo_lots fl ON c.fpo_lot_id = fl.id
             LEFT JOIN buyer_requirements br ON c.requirement_id = br.id
             WHERE c.seller_type = 'fpo' AND c.fpo_id = ?
             ORDER BY c.created_at DESC`,
            [fpo.id]
        );

        res.status(200).json({
            contracts
        });

    } catch (error) {
        console.error("Error in getFpoContracts:", error);
        res.status(500).json({
            message: "Server error"
        });
    }
};

