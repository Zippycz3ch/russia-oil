// Script to migrate all facilities to new location format
// Changes from lat/lng to location.latitude/location.longitude
// Run this with: node migrate_location_format.js

const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function migrateLocationFormat() {
  try {
    console.log("Migrating all facilities to new location format...\n");

    const snapshot = await db.collection("facilities").get();

    let migratedCount = 0;

    for (const doc of snapshot.docs) {
      const data = doc.data();

      // Check if old format exists
      if (data.lat !== undefined && data.lng !== undefined) {
        const newData = {
          id: data.id,
          name: data.name,
          type: data.type,
          location: {
            latitude: data.lat,
            longitude: data.lng,
          },
          capacity: data.capacity,
          hit: data.hit || false,
        };

        // Add optional fields if they exist
        if (data.description) {
          newData.description = data.description;
        }

        // Update the document
        await db.collection("facilities").doc(doc.id).set(newData);

        console.log(`✓ Migrated: ${data.name}`);
        console.log(`  Old: lat=${data.lat}, lng=${data.lng}`);
        console.log(`  New: location.latitude=${newData.location.latitude}, location.longitude=${newData.location.longitude}\n`);

        migratedCount++;
      } else if (data.location && data.location.latitude !== undefined) {
        console.log(`⊙ Already migrated: ${data.name}\n`);
      } else {
        console.log(`⚠ No location data: ${data.name}\n`);
      }
    }

    console.log(`\n✓ Migration complete!`);
    console.log(`📊 Migrated ${migratedCount} facilities`);
    console.log(`\n✅ New format:`);
    console.log(`   location (map)`);
    console.log(`     ├─ latitude (number)`);
    console.log(`     └─ longitude (number)`);
  } catch (error) {
    console.error("Error during migration:", error);
  } finally {
    process.exit();
  }
}

migrateLocationFormat();
