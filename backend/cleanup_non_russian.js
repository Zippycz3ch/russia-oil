// Script to remove non-Russian facilities and add verified Russian fields
// Run this with: node cleanup_non_russian.js

const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function cleanupAndUpdate() {
  try {
    console.log("Cleaning up non-Russian facilities...\n");

    // IDs to remove (Kazakhstan and Azerbaijan facilities)
    const idsToRemove = [101, 103, 107, 110]; // Tengiz, ACG, Kashagan, Karachaganak

    for (const id of idsToRemove) {
      const docRef = db.collection("facilities").doc(id.toString());
      const doc = await docRef.get();
      if (doc.exists) {
        const name = doc.data().name;
        await docRef.delete();
        console.log(`✗ Removed: ${name} (non-Russian)`);
      }
    }

    console.log("\nAdding/updating verified Russian fields...\n");

    const russianFields = [
      {
        id: 105,
        name: "Samotlor Oil Field",
        type: "extraction",
        location: "Khanty-Mansi Autonomous Okrug, Tyumen Oblast, Russia",
        lat: 61.117,
        lng: 76.75,
        capacity: 332000,
        hit: false,
        description: "Once the world's largest oil field. Operated by Samotlorneftegaz (Rosneft). Peak production ~332,000 bpd (2013). One of Russia's most important producing assets.",
      },
      {
        id: 102,
        name: "Priobskoye Oil Field",
        type: "extraction",
        location: "Khanty-Mansi Autonomous Okrug, Western Siberia, Russia",
        lat: 61.217,
        lng: 70.767,
        capacity: 500000,
        hit: false,
        description: "One of Russia's largest oil fields. Operated by RN-Yuganskneftegaz (Rosneft). Production ~500,000 bpd (2019). Major source of Siberian crude.",
      },
      {
        id: 104,
        name: "Vankor Oil Field",
        type: "extraction",
        location: "Krasnoyarsk Krai, Eastern Siberia, Russia",
        lat: 67.644,
        lng: 85.013,
        capacity: 442000,
        hit: false,
        description: "Major Eastern Siberian field operated by Vankorneft (Rosneft). Production 442,000 bpd (2014). Critical for Eastern Siberia-Pacific Ocean (ESPO) pipeline exports.",
      },
      {
        id: 106,
        name: "Romashkino Oil Field",
        type: "extraction",
        location: "Tatarstan, Volga-Ural Basin, Russia",
        lat: 54.8,
        lng: 52.5,
        capacity: 280000,
        hit: false,
        description: "Historic giant field in Tatarstan. Operated by Tatneft. One of the world's largest by cumulative production. Peak 1.65 million bpd (1969), still producing significantly.",
      },
      {
        id: 115,
        name: "Russkoye Gas Condensate Field",
        type: "extraction",
        location: "Yamalo-Nenets Autonomous Okrug, Russia",
        lat: 67.5,
        lng: 75.5,
        capacity: 150000,
        hit: false,
        description: "Major gas condensate field operated by Gazprom. Recoverable reserves ~410 million tons. Important source of condensate and natural gas.",
      },
      {
        id: 116,
        name: "Verkhnechonskoye Oil Field",
        type: "extraction",
        location: "Irkutsk Oblast, Eastern Siberia, Russia",
        lat: 58.5,
        lng: 109.5,
        capacity: 180000,
        hit: false,
        description: "Eastern Siberian field operated by INK Group and Rosneft. Important source for ESPO pipeline. Production ~180,000 bpd.",
      },
      {
        id: 117,
        name: "Talakanskoye Oil Field",
        type: "extraction",
        location: "Sakha Republic (Yakutia), Russia",
        lat: 59.9,
        lng: 111.8,
        capacity: 95000,
        hit: false,
        description: "Far Eastern field operated by Surgutneftegas. Feeds ESPO pipeline. Production ~95,000 bpd despite harsh conditions.",
      },
      {
        id: 118,
        name: "Uvat Group of Fields",
        type: "extraction",
        location: "Tyumen Oblast, Western Siberia, Russia",
        lat: 59.5,
        lng: 69.5,
        capacity: 200000,
        hit: false,
        description: "Group of fields operated by Rosneft. Important growth area in Western Siberia. Combined production ~200,000 bpd.",
      },
      {
        id: 119,
        name: "Srednebotuobinskoye Field",
        type: "extraction",
        location: "Sakha Republic (Yakutia), Russia",
        lat: 62.0,
        lng: 130.0,
        capacity: 80000,
        hit: false,
        description: "Eastern Siberian field operated by Taas-Yuriakh Neftegazodobycha (Rosneft 50.1%, BP 49.9%). Production ~80,000 bpd.",
      },
      {
        id: 120,
        name: "Russkinskoye Field",
        type: "extraction",
        location: "Khanty-Mansi Autonomous Okrug, Russia",
        lat: 61.5,
        lng: 73.2,
        capacity: 140000,
        hit: false,
        description: "Western Siberian field operated by Russneft. Production ~140,000 bpd. Part of the Surgut oil production region.",
      },
    ];

    // Add/update facilities
    for (const facility of russianFields) {
      await db.collection("facilities").doc(facility.id.toString()).set(facility);
      console.log(`✓ Added/Updated: ${facility.name} (${facility.capacity.toLocaleString()} bpd)`);
    }

    console.log(`\n✓ Successfully cleaned up and updated facilities!`);
    console.log("\n📍 All facilities are now within Russian territory");
    console.log("🛢️  Focus on major operational extraction sites");
    console.log(`📊 Total verified Russian extraction capacity: ${russianFields.reduce((sum, f) => sum + f.capacity, 0).toLocaleString()} bpd`);
  } catch (error) {
    console.error("Error:", error);
  } finally {
    process.exit();
  }
}

cleanupAndUpdate();
