// Script to add descriptions to facilities missing them
// Run this with: node add_missing_descriptions.js

const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function addMissingDescriptions() {
  try {
    console.log("Checking for facilities without descriptions...\n");

    const snapshot = await db.collection("facilities").get();

    let addedCount = 0;

    for (const doc of snapshot.docs) {
      const data = doc.data();

      // Check if description is missing
      if (!data.description || data.description.trim() === "") {
        let description = "";

        // Generate appropriate description based on type and name
        if (data.type === "refinery") {
          description = `Major Russian refinery with processing capacity of ${data.capacity.toLocaleString()} barrels per day. Part of Russia's critical oil refining infrastructure.`;
        } else if (data.type === "extraction") {
          description = `Oil extraction site producing ${data.capacity.toLocaleString()} barrels per day. Important source of Russian crude oil.`;
        } else if (data.type === "storage") {
          description = `Oil storage facility with capacity of ${data.capacity.toLocaleString()} barrels per day. Critical for Russia's oil logistics network.`;
        } else {
          description = `Russian oil facility with capacity of ${data.capacity.toLocaleString()} barrels per day.`;
        }

        // Update with description
        await db.collection("facilities").doc(doc.id).update({
          description: description,
        });

        console.log(`✓ Added description to: ${data.name}`);
        console.log(`  "${description}"\n`);

        addedCount++;
      }
    }

    if (addedCount === 0) {
      console.log("✓ All facilities already have descriptions!");
    } else {
      console.log(`\n✓ Added descriptions to ${addedCount} facilities!`);
    }
  } catch (error) {
    console.error("Error adding descriptions:", error);
  } finally {
    process.exit();
  }
}

addMissingDescriptions();
