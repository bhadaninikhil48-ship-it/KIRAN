import assert from "node:assert/strict";

const BASE_URL = "http://localhost:5000";

let passed = 0;
let failed = 0;

function it(desc, fn) {
  try {
    fn();
    console.log(`  ✓ ${desc}`);
    passed++;
  } catch (err) {
    console.error(`  ✗ ${desc}: ${err.message}`);
    failed++;
  }
}

async function req(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, data };
}

async function runLiveTests() {
  console.log("==================================================");
  console.log("LIVE MULTI-ROLE LOCATION & ADDRESS INTEGRATION TESTS");
  console.log("==================================================");

  const timestamp = Date.now();

  // -----------------------------------------------------------------
  // 1. FARMER PERSONA
  // -----------------------------------------------------------------
  console.log("\n--- 1. FARMER PERSONA ---");
  const farmerEmail = `test_farmer_${timestamp}@kiran.in`;
  const farmerRegister = await req("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({
      name: "Farmer Ramesh",
      email: farmerEmail,
      password: "password123",
      role: "farmer",
    }),
  });
  it("Farmer registration returns 201", () => assert.equal(farmerRegister.status, 201));

  const farmerLogin = await req("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email: farmerEmail, password: "password123" }),
  });
  const farmerToken = farmerLogin.data?.token;
  const farmerId = farmerLogin.data?.user?.id;
  it("Farmer login returns token and user", () => {
    assert.ok(farmerToken);
    assert.equal(farmerLogin.data?.user?.role, "farmer");
  });

  // Profile update
  const farmerProfileUpdate = await req("/api/farmer/profile", {
    method: "PUT",
    headers: { Authorization: `Bearer ${farmerToken}` },
    body: JSON.stringify({
      name: "Farmer Ramesh",
      phone: "9876543210",
      village: "Kota",
      district: "Bilaspur",
      state: "Chhattisgarh",
    }),
  });
  it("Farmer profile update returns 200", () => assert.equal(farmerProfileUpdate.status, 200));

  const farmerProfileGet = await req("/api/farmer/profile", {
    headers: { Authorization: `Bearer ${farmerToken}` },
  });
  it("Farmer profile has district Bilaspur and state Chhattisgarh", () => {
    assert.equal(farmerProfileGet.data?.profile?.district, "Bilaspur");
    assert.equal(farmerProfileGet.data?.profile?.state, "Chhattisgarh");
  });

  // Address creation
  const farmerAddressRes = await req("/api/addresses", {
    method: "POST",
    headers: { Authorization: `Bearer ${farmerToken}` },
    body: JSON.stringify({
      tag: "Primary Farmgate",
      name: "Ramesh Farm 1",
      village_locality: "Kota Agri Hub",
      district: "Bilaspur",
      state: "Chhattisgarh",
      pincode: "495001",
      is_default: 1,
    }),
  });
  it("Farmer address creation returns 201", () => assert.equal(farmerAddressRes.status, 201));
  it("Farmer address has user_role farmer and tag Primary Farmgate", () => {
    assert.equal(farmerAddressRes.data?.address?.user_role, "farmer");
    assert.equal(farmerAddressRes.data?.address?.tag, "Primary Farmgate");
  });

  // -----------------------------------------------------------------
  // 2. BUYER PERSONA
  // -----------------------------------------------------------------
  console.log("\n--- 2. BUYER PERSONA ---");
  const buyerEmail = `test_buyer_${timestamp}@kiran.in`;
  const buyerRegister = await req("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({
      name: "Buyer SuperMart",
      email: buyerEmail,
      password: "password123",
      role: "buyer",
    }),
  });
  it("Buyer registration returns 201", () => assert.equal(buyerRegister.status, 201));

  const buyerLogin = await req("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email: buyerEmail, password: "password123" }),
  });
  const buyerToken = buyerLogin.data?.token;
  const buyerId = buyerLogin.data?.user?.id;
  it("Buyer login returns token and user", () => {
    assert.ok(buyerToken);
    assert.equal(buyerLogin.data?.user?.role, "buyer");
  });

  // Address creation for Buyer
  const buyerAddressRes = await req("/api/addresses", {
    method: "POST",
    headers: { Authorization: `Bearer ${buyerToken}` },
    body: JSON.stringify({
      tag: "Procurement Warehouse",
      name: "SuperMart Central Cold Store",
      village_locality: "Vashi APMC Sector 19",
      district: "Navi Mumbai",
      state: "Maharashtra",
      pincode: "400703",
      is_default: 1,
    }),
  });
  it("Buyer address creation returns 201", () => assert.equal(buyerAddressRes.status, 201));
  it("Buyer address has user_role buyer and tag Procurement Warehouse", () => {
    assert.equal(buyerAddressRes.data?.address?.user_role, "buyer");
    assert.equal(buyerAddressRes.data?.address?.tag, "Procurement Warehouse");
  });

  const buyerAddressList = await req("/api/addresses", {
    headers: { Authorization: `Bearer ${buyerToken}` },
  });
  it("Buyer address list returns 1 saved warehouse address", () => {
    assert.equal(buyerAddressList.data?.addresses?.length, 1);
    assert.equal(buyerAddressList.data?.addresses[0]?.village_locality, "Vashi APMC Sector 19");
  });

  // -----------------------------------------------------------------
  // 3. FPO PERSONA
  // -----------------------------------------------------------------
  console.log("\n--- 3. FPO PERSONA ---");
  const fpoEmail = `test_fpo_${timestamp}@kiran.in`;
  const fpoRegister = await req("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({
      name: "Kisan Vikas FPO",
      email: fpoEmail,
      password: "password123",
      role: "fpo",
    }),
  });
  it("FPO registration returns 201", () => assert.equal(fpoRegister.status, 201));

  const fpoLogin = await req("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email: fpoEmail, password: "password123" }),
  });
  const fpoToken = fpoLogin.data?.token;
  const fpoId = fpoLogin.data?.user?.id;
  it("FPO login returns token and user", () => {
    assert.ok(fpoToken);
    assert.equal(fpoLogin.data?.user?.role, "fpo");
  });

  // FPO Profile creation
  const fpoProfileCreate = await req("/api/fpo/profile", {
    method: "POST",
    headers: { Authorization: `Bearer ${fpoToken}` },
    body: JSON.stringify({
      fpo_name: "Kisan Vikas Producer Co Ltd",
      registration_number: `FPO-${timestamp}`,
      contact_person: "Mr. Sharma",
      phone: "9123456789",
      email: fpoEmail,
      office_address: "Main Market Road",
      village_locality: "Badnawar",
      district: "Dhar",
      state: "Madhya Pradesh",
      pincode: "454660",
    }),
  });
  it("FPO profile creation returns 201 or 200", () => {
    assert.ok(fpoProfileCreate.status === 201 || fpoProfileCreate.status === 200);
  });

  const fpoProfileGet = await req("/api/fpo/profile", {
    headers: { Authorization: `Bearer ${fpoToken}` },
  });
  it("FPO profile has district Dhar and state Madhya Pradesh", () => {
    assert.equal(fpoProfileGet.data?.profile?.district, "Dhar");
    assert.equal(fpoProfileGet.data?.profile?.state, "Madhya Pradesh");
  });

  // Address creation for FPO
  const fpoAddressRes = await req("/api/addresses", {
    method: "POST",
    headers: { Authorization: `Bearer ${fpoToken}` },
    body: JSON.stringify({
      tag: "Aggregation Hub",
      name: "Badnawar Aggregation Center",
      village_locality: "Badnawar Cluster Yard",
      district: "Dhar",
      state: "Madhya Pradesh",
      pincode: "454660",
      is_default: 1,
    }),
  });
  it("FPO address creation returns 201", () => assert.equal(fpoAddressRes.status, 201));
  it("FPO address has user_role fpo and tag Aggregation Hub", () => {
    assert.equal(fpoAddressRes.data?.address?.user_role, "fpo");
    assert.equal(fpoAddressRes.data?.address?.tag, "Aggregation Hub");
  });

  const fpoAddressList = await req("/api/addresses", {
    headers: { Authorization: `Bearer ${fpoToken}` },
  });
  it("FPO address list returns 1 saved aggregation hub address", () => {
    assert.equal(fpoAddressList.data?.addresses?.length, 1);
    assert.equal(fpoAddressList.data?.addresses[0]?.village_locality, "Badnawar Cluster Yard");
  });

  // -----------------------------------------------------------------
  // 4. CLEANUP
  // -----------------------------------------------------------------
  console.log("\nCleaning up test artifacts...");
  await req(`/api/addresses/${farmerAddressRes.data?.address?.id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${farmerToken}` },
  });
  await req(`/api/addresses/${buyerAddressRes.data?.address?.id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${buyerToken}` },
  });
  await req(`/api/addresses/${fpoAddressRes.data?.address?.id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${fpoToken}` },
  });
  console.log("Cleanup complete.");

  console.log("==================================================");
  console.log(`TOTAL LIVE TESTS: ${passed} passed, ${failed} failed`);
  console.log("==================================================");

  if (failed > 0) process.exit(1);
}

runLiveTests();
