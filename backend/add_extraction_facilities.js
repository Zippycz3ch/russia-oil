// Script to add major extraction facilities to Firebase
// Run this with: node add_extraction_facilities.js

const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function addExtractionFacilities() {
  try {
    console.log("Adding major extraction facilities...\n");

    const facilities = [
      {
        id: 101,
        name: "Tengiz Oil Field",
        type: "extraction",
        location: "Atyrau Oblast, Kazakhstan",
        lat: 45.0,
        lng: 54.5,
        capacity: 630000,
        hit: false,
        description: "One of the world's deepest producing oil fields. Operated by Tengizchevroil LLP with Chevron (50%), ExxonMobil (25%), KazMunayGas (20%), and Lukoil (5%). Accounts for ~4.5% of FSU daily output.",
      },
      {
        id: 102,
        name: "Priobskoye Oil Field (Northern Part)",
        type: "extraction",
        location: "Khanty-Mansi Autonomous Okrug, Russia",
        lat: 61.0,
        lng: 71.5,
        capacity: 430000,
        hit: false,
        description: "Operated by RN-Yuganskneftegaz (Rosneft). Peak production was 670,000 bpd in 2009. Accounts for ~3.09% of FSU daily output.",
      },
      {
        id: 103,
        name: "Azeri-Chirag-Guneshli Oil Field",
        type: "extraction",
        location: "Caspian Sea, Azerbaijan",
        lat: 40.5,
        lng: 50.5,
        capacity: 360000,
        hit: false,
        description: "Major offshore field operated by BP. Peak production 822,000 bpd in 2010. Partners include BP (30%), SOCAR (25%), and others. Accounts for ~2.60% of FSU daily output.",
      },
      {
        id: 104,
        name: "Vankor Oil Field",
        type: "extraction",
        location: "Krasnoyarsk Krai, Russia",
        lat: 63.8,
        lng: 87.8,
        capacity: 226000,
        hit: false,
        description: "Operated by Vankorneft (Rosneft). Partners include ONGC (26%), Indian Oil (8%), BPCL (7.9%). Accounts for ~1.63% of FSU daily output.",
      },
      {
        id: 105,
        name: "Samotlor Oil Field",
        type: "extraction",
        location: "Khanty-Mansi Autonomous Okrug, Russia",
        lat: 61.1,
        lng: 76.7,
        capacity: 323000,
        hit: false,
        description: "Once the world's largest oil field. Operated by Samotlorneftegaz (Rosneft). Peak production 3.25 million bpd in 1980. Accounts for ~2.32% of FSU daily output.",
      },
      {
        id: 106,
        name: "Romashkino Oil Field",
        type: "extraction",
        location: "Tatarstan, Russia",
        lat: 54.8,
        lng: 52.5,
        capacity: 280000,
        hit: false,
        description: "One of the world's largest oil fields by cumulative production. Operated by Tatneft. Peak production 1.65 million bpd in 1969. Accounts for ~2.05% of FSU daily output.",
      },
      {
        id: 107,
        name: "Kashagan Oil Field",
        type: "extraction",
        location: "Caspian Sea, Kazakhstan",
        lat: 45.3,
        lng: 51.8,
        capacity: 360000,
        hit: false,
        description:
          "One of the largest discoveries in recent decades. Consortium includes Eni (16.81%), Shell (16.81%), ExxonMobil (16.81%), TotalEnergies (16.81%), KazMunayGas (16.87%), CNPC (8.33%), Inpex (7.56%). Accounts for ~2.65% of FSU daily output.",
      },
      {
        id: 108,
        name: "Sakhalin-1 (Chaivo-Odoptu-Arkutun)",
        type: "extraction",
        location: "Okhotsk Sea, Russia",
        lat: 52.5,
        lng: 143.5,
        capacity: 190000,
        hit: false,
        description: "Offshore oil field operated by Sakhalin-1. Partners include ONGC (20%), Rosneft (20%), Sakhalin-1 (30%), JOGMEC (15.5%), and Japanese companies. Accounts for ~1.37% of FSU daily output.",
      },
      {
        id: 109,
        name: "Fedorovo Oil Field",
        type: "extraction",
        location: "Khanty-Mansi Autonomous Okrug, Russia",
        lat: 61.4,
        lng: 73.5,
        capacity: 213000,
        hit: false,
        description: "Operated by Surgutneftegas. Peak production 703,000 bpd in 1983. Accounts for ~1.53% of FSU daily output.",
      },
      {
        id: 110,
        name: "Karachaganak Gas Condensate Field",
        type: "extraction",
        location: "West Kazakhstan Region, Kazakhstan",
        lat: 51.2,
        lng: 53.0,
        capacity: 280000,
        hit: false,
        description: "One of the world's largest gas condensate fields. Operated by Karachaganak Petroleum Operating. Partners include Shell (29.25%), Eni (29.25%), Chevron (18%), Lukoil (13.5%), KazMunayGas (10%).",
      },
      {
        id: 111,
        name: "Surgutneftegas Northern Fields",
        type: "extraction",
        location: "Khanty-Mansi Autonomous Okrug, Russia",
        lat: 61.5,
        lng: 73.0,
        capacity: 350000,
        hit: false,
        description: "Complex of oil fields operated by Surgutneftegas, one of Russia's major oil producers. Includes multiple production sites in Western Siberia.",
      },
      {
        id: 112,
        name: "Lukoil West Siberia Fields",
        type: "extraction",
        location: "Khanty-Mansi Autonomous Okrug, Russia",
        lat: 61.2,
        lng: 72.0,
        capacity: 400000,
        hit: false,
        description: "Cluster of oil fields operated by Lukoil in Western Siberia, including Imilor, Krasnoleninsky, and other major producing assets.",
      },
      {
        id: 113,
        name: "Urals Oil Field Complex",
        type: "extraction",
        location: "Perm Krai & Bashkortostan, Russia",
        lat: 58.0,
        lng: 56.0,
        capacity: 320000,
        hit: false,
        description: "Historic oil-producing region with multiple fields. Major operators include Lukoil and regional companies. Key source of Urals crude blend.",
      },
      {
        id: 114,
        name: "Sakhalin-2 (Piltun-Astokhskoye-Lunskoye)",
        type: "extraction",
        location: "Okhotsk Sea, Russia",
        lat: 52.8,
        lng: 143.8,
        capacity: 150000,
        hit: false,
        description: "Offshore oil and gas project operated by Sakhalin Energy. Partners include Gazprom (50% + 1 share), Shell (27.5% - 1 share), Mitsui (12.5%), Mitsubishi (10%).",
      },
    ];

    // Add facilities to Firestore
    for (const facility of facilities) {
      await db.collection("facilities").doc(facility.id.toString()).set(facility);
      console.log(`✓ Added: ${facility.name} (${facility.capacity.toLocaleString()} bpd)`);
    }

    console.log(`\n✓ Successfully added ${facilities.length} extraction facilities!`);
    console.log("\nThese facilities represent major oil production sites across:");
    console.log("- Russia (Western Siberia, Tatarstan, Urals, Sakhalin)");
    console.log("- Kazakhstan (Tengiz, Kashagan, Karachaganak)");
    console.log("- Azerbaijan (Azeri-Chirag-Guneshli)");
  } catch (error) {
    console.error("Error adding facilities:", error);
  } finally {
    process.exit();
  }
}

addExtractionFacilities();
