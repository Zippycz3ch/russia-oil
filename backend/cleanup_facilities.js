const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");

// Initialize Firebase Admin (check if already initialized)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

// IDs of questionable/small refineries to remove (< 100k bbl/d capacity)
const facilitiesToRemove = [
  25, // Kuytun Refinery - 90k
  27, // Arkhangelsk Refinery - 100k (keeping as it's exactly 100k)
  29, // Pskov Refinery - 95k
  31, // Gusinoozersk Refinery - 85k
  35, // Cherdyn Refinery - 75k
  44, // Anzhero-Sudzhensk Refinery - 95k
  45, // Argun Refinery - 80k
  49, // Yermolaevo Refinery - 70k
  57, // Lensk Refinery - 90k
  58, // Chersk Refinery - 65k
  67, // Glazov Refinery - 95k
  71, // Magadan Refinery - 85k
  73, // Ivanovo Refinery - 100k (keeping)
];

async function cleanupFacilities() {
  try {
    console.log("Starting facility cleanup...\n");

    // 1. Fix type inconsistency for Mari Oil Refinery (ID 121)
    console.log("1. Fixing type inconsistency for Mari Oil Refinery (ID 121)...");
    const mariRef = db.collection("facilities").doc("121");
    const mariDoc = await mariRef.get();

    if (mariDoc.exists) {
      await mariRef.update({ type: "refinery" });
      console.log('   ✅ Fixed: Mari Oil Refinery type changed from "Refinery" to "refinery"');
    }

    // 2. Remove small/questionable refineries
    console.log("\n2. Removing small/questionable refineries (< 95k bbl/d)...");
    let removedCount = 0;

    for (const id of facilitiesToRemove) {
      try {
        const docRef = db.collection("facilities").doc(id.toString());
        const docSnap = await docRef.get();

        if (docSnap && docSnap.exists) {
          const data = docSnap.data();
          console.log(`   Removing: ID ${id} - ${data.name} (${(data.capacity / 1000).toFixed(0)}k bbl/d)`);
          await docRef.delete();
          removedCount++;

          // Also remove any hits associated with this facility
          const hitsQuery = await db.collection("hits").where("facilityId", "==", id).get();
          for (const hitDoc of hitsQuery.docs) {
            await hitDoc.ref.delete();
            console.log(`      ↳ Removed associated hit ${hitDoc.id}`);
          }
        }
      } catch (err) {
        console.log(`   ⚠️  Could not remove ID ${id}: ${err.message}`);
      }
    }

    console.log(`\n   ✅ Removed ${removedCount} questionable facilities`);

    // 3. Summary
    console.log("\n" + "=".repeat(80));
    const remainingSnapshot = await db.collection("facilities").get();
    console.log(`\n✅ Cleanup complete!`);
    console.log(`   Remaining facilities: ${remainingSnapshot.size}`);
    console.log(`   Removed facilities: ${removedCount}`);
    console.log(`   Fixed type inconsistencies: 1`);

    // 4. Show remaining facilities by type
    console.log("\nRemaining facilities by type:");
    const byType = {};
    remainingSnapshot.forEach((doc) => {
      const type = doc.data().type;
      byType[type] = (byType[type] || 0) + 1;
    });
    for (const [type, count] of Object.entries(byType)) {
      console.log(`   ${type}: ${count}`);
    }
  } catch (error) {
    console.error("Error:", error);
  } finally {
    process.exit(0);
  }
}

cleanupFacilities();
