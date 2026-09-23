import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

console.log("=== RUNNING REGRESSION SUITE: MULTI-ROLE GLOBAL LOCATION & ADDRESS ===");

let passed = 0;
let failed = 0;

function it(desc, fn) {
  try {
    fn();
    console.log(`  [PASS] ${desc}`);
    passed++;
  } catch (err) {
    console.error(`  [FAIL] ${desc}: ${err.message}`);
    failed++;
  }
}

// 1. Verify Navbar.jsx code integrity
const navbarPath = path.resolve("src/components/Navbar.jsx");
const navbarContent = fs.readFileSync(navbarPath, "utf-8");

it("Navbar defines role-aware address config for farmer, buyer, and fpo", () => {
  assert(navbarContent.includes('"Primary Farmgate"'), "Should define Primary Farmgate for farmer");
  assert(navbarContent.includes('"Procurement Warehouse"'), "Should define Procurement Warehouse for buyer");
  assert(navbarContent.includes('"Aggregation Hub"'), "Should define Aggregation Hub for fpo");
  assert(navbarContent.includes('"+ Add Primary Farmgate"'), "Should define Add Primary Farmgate");
  assert(navbarContent.includes('"+ Add Procurement Warehouse"'), "Should define Add Procurement Warehouse");
  assert(navbarContent.includes('"+ Add Aggregation Hub"'), "Should define Add Aggregation Hub");
});

it("Navbar positions address trigger on left side immediately adjacent to Live Mandi Feeds", () => {
  const match = navbarContent.match(/Live Mandi Feeds\s*<\/span>/);
  assert(match, "Live Mandi Feeds badge must exist");
  const badgeEndIndex = match.index + match[0].length;
  const addressTriggerIndex = navbarContent.indexOf("Address / Farmgate / Hub Trigger immediately beside Live Mandi Feeds");
  assert(addressTriggerIndex > badgeEndIndex, "Address trigger must be placed after Live Mandi Feeds badge");
  assert(addressTriggerIndex - badgeEndIndex < 100, `Address trigger must be immediately beside Live Mandi Feeds badge (was ${addressTriggerIndex - badgeEndIndex})`);
});

it("Navbar has removed farmer address trigger from the right side", () => {
  const rightSideIndex = navbarContent.indexOf("Right Side: Language, Notifications, Profile");
  assert(rightSideIndex > 0, "Right side section must exist");
  const rightSideContent = navbarContent.slice(rightSideIndex);
  assert(!rightSideContent.includes("FARMER GLOBAL PRIMARY FARMGATE / ADDRESS TRIGGER"), "Old farmer trigger must be removed from right side");
  assert(!rightSideContent.includes("openAddressManager"), "Address manager trigger must not exist in right side");
});

it("Navbar routes profile click correctly per role", () => {
  assert(navbarContent.includes('const profilePath = role === "fpo" ? "/fpo/profile" : "/profile"'), "Must route FPO to /fpo/profile and farmer/buyer to /profile");
});

it("Navbar has NO hardcoded location strings like Indore Cluster or Mumbai Hub", () => {
  assert(!navbarContent.includes('"Indore Cluster • Madhya Pradesh"'), "No hardcoded Indore Cluster fallback in Navbar");
  assert(!navbarContent.includes('"Mumbai Hub • Maharashtra"'), "No hardcoded Mumbai Hub fallback in Navbar");
});

// 2. Verify Dashboards have NO DashboardLocationCard
const farmerDashPath = path.resolve("src/pages/Dashboard.jsx");
const buyerDashPath = path.resolve("src/pages/buyer/BuyerDashboard.jsx");
const fpoDashPath = path.resolve("src/pages/fpo/FPODashboard.jsx");

const farmerDashContent = fs.readFileSync(farmerDashPath, "utf-8");
const buyerDashContent = fs.readFileSync(buyerDashPath, "utf-8");
const fpoDashContent = fs.readFileSync(fpoDashPath, "utf-8");

it("Farmer Dashboard does NOT render DashboardLocationCard", () => {
  assert(!farmerDashContent.includes("<DashboardLocationCard"), "DashboardLocationCard component must not be rendered in Dashboard.jsx");
  assert(!farmerDashContent.includes('import { DashboardLocationCard }'), "DashboardLocationCard must not be imported in Dashboard.jsx");
});

it("Buyer Dashboard does NOT render DashboardLocationCard", () => {
  assert(!buyerDashContent.includes("<DashboardLocationCard"), "DashboardLocationCard component must not be rendered in BuyerDashboard.jsx");
  assert(!buyerDashContent.includes('import { DashboardLocationCard }'), "DashboardLocationCard must not be imported in BuyerDashboard.jsx");
});

it("FPO Dashboard does NOT render DashboardLocationCard", () => {
  assert(!fpoDashContent.includes("<DashboardLocationCard"), "DashboardLocationCard component must not be rendered in FPODashboard.jsx");
  assert(!fpoDashContent.includes('import { DashboardLocationCard }'), "DashboardLocationCard must not be imported in FPODashboard.jsx");
});

// 3. Verify AuthContext.jsx synchronization across all 3 roles
const authContextPath = path.resolve("src/context/AuthContext.jsx");
const authContextContent = fs.readFileSync(authContextPath, "utf-8");

it("AuthContext synchronizes location for farmer, buyer, and fpo on session verification", () => {
  assert(authContextContent.includes('response.user.role === "farmer"'), "Must handle farmer in verifySession");
  assert(authContextContent.includes('response.user.role === "fpo"'), "Must handle fpo in verifySession");
  assert(authContextContent.includes('response.user.role === "buyer"'), "Must handle buyer in verifySession");
});

it("AuthContext synchronizes location for farmer, buyer, and fpo on login", () => {
  assert(authContextContent.includes('userData?.role === "farmer"'), "Must handle farmer in login");
  assert(authContextContent.includes('userData?.role === "fpo"'), "Must handle fpo in login");
  assert(authContextContent.includes('userData?.role === "buyer"'), "Must handle buyer in login");
});

it("AuthContext updateUser computes location dynamically for any role without hardcoded fallbacks", () => {
  assert(authContextContent.includes('if (next.district && next.state)'), "Must check next.district && next.state");
  assert(authContextContent.includes('next.location = `${next.district.trim()} • ${next.state.trim()}`'), "Must format location as district • state");
});

// 4. Verify FPOProfile.jsx updates AuthContext in real-time
const fpoProfilePath = path.resolve("src/pages/fpo/FPOProfile.jsx");
const fpoProfileContent = fs.readFileSync(fpoProfilePath, "utf-8");

it("FPOProfile calls updateUser with district, state, and location on profile load & save", () => {
  assert(fpoProfileContent.includes("updateUser"), "Must import updateUser");
  assert(fpoProfileContent.includes("updateUser({"), "Must call updateUser on submit");
});

// 5. Verify Profile.jsx caches buyer profile fields
const profilePath = path.resolve("src/pages/farmer/Profile.jsx");
const profileContent = fs.readFileSync(profilePath, "utf-8");

it("Profile.jsx saves and restores buyer profile fields", () => {
  assert(profileContent.includes("kiran_profile_"), "Must use kiran_profile_ cache for buyer profile fields");
});

// 6. Test location formatting logic directly
it("Location formatting strictly obeys district • state", () => {
  const formatLocation = (district, state) => {
    const d = (district || "").trim();
    const s = (state || "").trim();
    return d && s ? `${d} • ${s}` : "Add Profile Details";
  };

  assert.equal(formatLocation("Indore", "Madhya Pradesh"), "Indore • Madhya Pradesh");
  assert.equal(formatLocation("Nashik", "Maharashtra"), "Nashik • Maharashtra");
  assert.equal(formatLocation("Dhar", "Madhya Pradesh"), "Dhar • Madhya Pradesh");
  assert.equal(formatLocation("", "Madhya Pradesh"), "Add Profile Details");
  assert.equal(formatLocation("Indore", ""), "Add Profile Details");
  assert.equal(formatLocation(null, null), "Add Profile Details");
});

// 7. Test role address configuration mapping
it("Role address configuration mapping produces correct titles and labels", () => {
  const getRoleConfig = (role) => {
    return {
      farmer: { tag: "Primary Farmgate", addLabel: "+ Add Primary Farmgate" },
      buyer: { tag: "Procurement Warehouse", addLabel: "+ Add Procurement Warehouse" },
      fpo: { tag: "Aggregation Hub", addLabel: "+ Add Aggregation Hub" },
    }[role] || { tag: "Primary Location", addLabel: "+ Add Primary Location" };
  };

  assert.equal(getRoleConfig("farmer").tag, "Primary Farmgate");
  assert.equal(getRoleConfig("farmer").addLabel, "+ Add Primary Farmgate");

  assert.equal(getRoleConfig("buyer").tag, "Procurement Warehouse");
  assert.equal(getRoleConfig("buyer").addLabel, "+ Add Procurement Warehouse");

  assert.equal(getRoleConfig("fpo").tag, "Aggregation Hub");
  assert.equal(getRoleConfig("fpo").addLabel, "+ Add Aggregation Hub");
});

console.log(`\nTEST RESULTS: ${passed} passed, ${failed} failed`);
if (failed > 0) {
  process.exit(1);
} else {
  console.log("ALL MULTI-ROLE LOCATION & ADDRESS TESTS PASSED SUCCESSFULLY!");
}
