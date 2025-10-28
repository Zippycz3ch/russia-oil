// Script to add sample hit records to Firebase
// Run this with: node add_sample_hits.js

const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function addSampleHits() {
  try {
    console.log("Adding sample hit records...\n");

    // Hit records for Refinery 1 (Multiple hits)
    const refinery1Hits = [
      {
        id: 1,
        facilityId: 1,
        date: "2024-03-15",
        videoLink: "https://youtube.com/watch?v=sample1",
        expectedRepairTime: 30,
        notes: "Direct hit on storage tanks, significant damage to infrastructure",
      },
      {
        id: 2,
        facilityId: 1,
        date: "2024-05-20",
        videoLink: "https://youtube.com/watch?v=sample2",
        expectedRepairTime: 45,
        notes: "Secondary strike on processing units, fire reported",
      },
      {
        id: 3,
        facilityId: 1,
        date: "2024-08-10",
        videoLink: "https://youtube.com/watch?v=sample3",
        expectedRepairTime: 60,
        notes: "Major damage to distillation towers, operations halted",
      },
    ];

    // Hit records for Refinery 5 (Multiple hits)
    const refinery5Hits = [
      {
        id: 4,
        facilityId: 5,
        date: "2024-04-02",
        videoLink: "https://youtube.com/watch?v=sample4",
        expectedRepairTime: 25,
        notes: "Strike on tank farm, multiple explosions reported",
      },
      {
        id: 5,
        facilityId: 5,
        date: "2024-07-15",
        videoLink: "https://youtube.com/watch?v=sample5",
        expectedRepairTime: 40,
        notes: "Damage to cooling systems and pipeline connections",
      },
    ];

    // Hit records for Refinery 10 (Multiple hits)
    const refinery10Hits = [
      {
        id: 6,
        facilityId: 10,
        date: "2024-06-05",
        videoLink: "https://youtube.com/watch?v=sample6",
        expectedRepairTime: 35,
        notes: "Hit on main processing unit, production reduced by 50%",
      },
      {
        id: 7,
        facilityId: 10,
        date: "2024-09-12",
        videoLink: "https://youtube.com/watch?v=sample7",
        expectedRepairTime: 50,
        notes: "Strike on storage facilities, significant fuel loss",
      },
      {
        id: 8,
        facilityId: 10,
        date: "2024-10-20",
        videoLink: "https://youtube.com/watch?v=sample8",
        expectedRepairTime: 30,
        notes: "Damage to electrical infrastructure and control systems",
      },
    ];

    // Combine all hits
    const allHits = [...refinery1Hits, ...refinery5Hits, ...refinery10Hits];

    // Add hits to Firestore
    const batch = db.batch();

    for (const hit of allHits) {
      const hitRef = db.collection("hits").doc(hit.id.toString());
      batch.set(hitRef, hit);
      console.log(`Added hit ${hit.id} for facility ${hit.facilityId} (${hit.date})`);
    }

    await batch.commit();
    console.log("\n✅ All hits added successfully!");

    // Mark facilities as hit
    console.log("\nMarking facilities as hit...");
    const facilityUpdates = db.batch();

    facilityUpdates.update(db.collection("facilities").doc("1"), { hit: true });
    facilityUpdates.update(db.collection("facilities").doc("5"), { hit: true });
    facilityUpdates.update(db.collection("facilities").doc("10"), { hit: true });

    await facilityUpdates.commit();
    console.log("✅ Facilities marked as hit!");

    console.log("\n📊 Summary:");
    console.log("- Facility 1: 3 hits");
    console.log("- Facility 5: 2 hits");
    console.log("- Facility 10: 3 hits");
    console.log("- Total: 8 hit records added\n");
  } catch (error) {
    console.error("Error adding hits:", error);
  } finally {
    process.exit();
  }
}

addSampleHits();
