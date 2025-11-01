const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function verifyFacilities() {
  try {
    console.log("Fetching all facilities from Firebase...\n");

    const facilitiesSnapshot = await db.collection("facilities").get();
    const facilities = [];

    facilitiesSnapshot.forEach((doc) => {
      const data = doc.data();
      facilities.push({
        id: doc.id,
        name: data.name,
        type: data.type,
        capacity: data.capacity,
        gasCapacity: data.gasCapacity,
        latitude: data.location?.latitude,
        longitude: data.location?.longitude,
        draft: data.draft,
      });
    });

    // Sort by ID
    facilities.sort((a, b) => parseInt(a.id) - parseInt(b.id));

    console.log(`Total facilities: ${facilities.length}\n`);
    console.log("=".repeat(100));

    // Group by type
    const byType = facilities.reduce((acc, f) => {
      if (!acc[f.type]) acc[f.type] = [];
      acc[f.type].push(f);
      return acc;
    }, {});

    for (const [type, list] of Object.entries(byType)) {
      console.log(`\n${type.toUpperCase()} (${list.length}):`);
      console.log("-".repeat(100));
      list.forEach((f) => {
        const cap = f.type.toLowerCase() === "storage" ? `${(f.capacity / 1000).toFixed(0)}k bbl` : `${(f.capacity / 1000).toFixed(0)}k bbl/d`;
        const gas = f.gasCapacity ? ` | Gas: ${(f.gasCapacity / 1000000000).toFixed(1)}B m³/yr` : "";
        const coords = `${f.latitude?.toFixed(2)}, ${f.longitude?.toFixed(2)}`;
        console.log(`${f.id.padStart(3)}. ${f.name.padEnd(45)} | ${cap.padEnd(12)} ${gas} | ${coords}`);
      });
    }

    console.log("\n" + "=".repeat(100));
    console.log("\nFacilities by Type:");
    for (const [type, list] of Object.entries(byType)) {
      console.log(`  ${type}: ${list.length}`);
    }

    // Check for drafts
    const drafts = facilities.filter((f) => f.draft);
    console.log(`\nDraft facilities: ${drafts.length}`);

    // Check for missing coordinates
    const missingCoords = facilities.filter((f) => !f.latitude || !f.longitude);
    if (missingCoords.length > 0) {
      console.log(`\n⚠️  Facilities missing coordinates: ${missingCoords.length}`);
      missingCoords.forEach((f) => console.log(`  - ${f.id}: ${f.name}`));
    }

    // Check for suspicious names (test data indicators)
    const suspicious = facilities.filter((f) => f.name.toLowerCase().includes("test") || f.name.toLowerCase().includes("sample") || f.name.toLowerCase().includes("fake") || f.name.toLowerCase().includes("example"));
    if (suspicious.length > 0) {
      console.log(`\n⚠️  Suspicious facility names (possible test data): ${suspicious.length}`);
      suspicious.forEach((f) => console.log(`  - ${f.id}: ${f.name}`));
    }

    // Export to JSON for review
    const fs = require("fs");
    fs.writeFileSync("facilities_export.json", JSON.stringify(facilities, null, 2));
    console.log("\n✅ Exported all facilities to facilities_export.json for detailed review");
  } catch (error) {
    console.error("Error:", error);
  } finally {
    process.exit(0);
  }
}

verifyFacilities();
