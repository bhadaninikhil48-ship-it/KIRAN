import db from "../backend/config/db.js";

async function inspect() {
  const [users] = await db.query("SELECT id, name, email, role FROM users");
  console.log("ALL USERS:", users);

  const [fpoProfiles] = await db.query("SELECT * FROM fpo_profiles");
  console.log("FPO PROFILES:", fpoProfiles);

  process.exit(0);
}

inspect().catch(err => {
  console.error(err);
  process.exit(1);
});
