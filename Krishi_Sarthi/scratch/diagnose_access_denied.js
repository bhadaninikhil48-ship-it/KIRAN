import jwt from "../backend/node_modules/jsonwebtoken/index.js";
import db from "../backend/config/db.js";

const JWT_SECRET = process.env.JWT_SECRET || "your_super_secret_key_change_this";
const BASE_URL = "http://localhost:5000";

async function testUserToken(user) {
  console.log(`\nTesting user ID ${user.id} (${user.email}), role in DB: '${user.role}'`);
  
  const token = jwt.sign(
    { id: user.id, role: user.role },
    JWT_SECRET,
    { expiresIn: "1d" }
  );

  const endpoints = [
    "/api/fpo/profile",
    "/api/fpo/members",
    "/api/fpo/lots",
    "/api/fpo/produce/available",
    "/api/fpo/marketplace/requirements",
    "/api/fpo/marketplace/offers",
    "/api/fpo/contracts",
    "/api/buyer/requirements/open"
  ];

  for (const ep of endpoints) {
    try {
      const res = await fetch(`${BASE_URL}${ep}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json().catch(() => ({}));
      console.log(`  ${ep} -> Status ${res.status}:`, data.message || (Array.isArray(data) ? `Array(${data.length})` : Object.keys(data).join(", ")));
    } catch (err) {
      console.log(`  ${ep} -> Error:`, err.message);
    }
  }
}

async function run() {
  const [users] = await db.query("SELECT id, name, email, role FROM users WHERE role = 'fpo' OR email LIKE '%fpo%'");
  for (const u of users) {
    await testUserToken(u);
  }
  process.exit(0);
}

run().catch(console.error);
