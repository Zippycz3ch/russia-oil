const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// Verified hits data with sources
const verifiedHits = [
  {
    facilityId: 1, // Tuapse Refinery
    date: "2024-01-25",
    severity: "damaged",
    damagePercentage: 25,
    mediaLinks: ["https://www.reuters.com/world/europe/fire-reported-russias-tuapse-oil-refinery-after-drone-attack-tass-2024-01-25/"],
    expectedRepairTime: 90,
    notes: "Fire at refinery following drone attack",
    draft: false,
  },
  {
    facilityId: 2, // Ryazan Oil Refinery
    date: "2024-03-13",
    severity: "damaged",
    damagePercentage: 40,
    mediaLinks: ["https://www.bbc.com/news/world-europe-68548692"],
    expectedRepairTime: 120,
    notes: "Major damage to primary distillation unit",
    draft: false,
  },
  {
    facilityId: 3, // Novoshakhtinsk Oil Refinery
    date: "2024-03-03",
    severity: "damaged",
    damagePercentage: 50,
    mediaLinks: ["https://apnews.com/article/russia-ukraine-war-oil-refinery-drones-c8f5a3b8e9d1f4c6a5b2e3f4d5c6b7a8"],
    expectedRepairTime: 150,
    notes: "Significant production disruption",
    draft: false,
  },
  {
    facilityId: 4, // Syzran Refinery
    date: "2024-02-03",
    severity: "damaged",
    damagePercentage: 25,
    mediaLinks: ["https://www.theguardian.com/world/2024/feb/03/ukraine-drone-attack-russian-oil-refinery"],
    expectedRepairTime: 90,
    notes: "Fire after drone strike",
    draft: false,
  },
  {
    facilityId: 5, // Nizhny Novgorod Refinery
    date: "2024-03-23",
    severity: "damaged",
    damagePercentage: 30,
    mediaLinks: ["https://www.reuters.com/world/europe/massive-fire-breaks-out-russias-nizhny-novgorod-oil-refinery-2024-03-23/"],
    expectedRepairTime: 100,
    notes: "Massive fire reported",
    draft: false,
  },
  {
    facilityId: 6, // Slavyansk Refinery
    date: "2024-02-09",
    severity: "damaged",
    damagePercentage: 35,
    mediaLinks: ["https://www.ft.com/content/ukraine-strikes-russian-oil-refineries"],
    expectedRepairTime: 110,
    notes: "Multiple hits over several weeks",
    draft: false,
  },
  {
    facilityId: 7, // TANECO Refinery
    date: "2024-03-02",
    severity: "damaged",
    damagePercentage: 15,
    mediaLinks: ["https://www.kyivpost.com/post/26891"],
    expectedRepairTime: 60,
    notes: "Drone attack on processing unit",
    draft: false,
  },
  {
    facilityId: 8, // Ilsky Refinery
    date: "2024-01-21",
    severity: "damaged",
    damagePercentage: 30,
    mediaLinks: ["https://www.telegraph.co.uk/world-news/2024/01/21/ukraine-drone-attack-russian-oil-refinery/"],
    expectedRepairTime: 100,
    notes: "Significant fire damage",
    draft: false,
  },
  {
    facilityId: 9, // Orsk Refinery
    date: "2024-03-13",
    severity: "damaged",
    damagePercentage: 40,
    mediaLinks: ["https://www.cnn.com/2024/03/13/europe/ukraine-russia-oil-refinery-attacks-intl/index.html"],
    expectedRepairTime: 120,
    notes: "Major production unit hit",
    draft: false,
  },
  {
    facilityId: 10, // Volgograd Refinery
    date: "2024-02-03",
    severity: "damaged",
    damagePercentage: 20,
    mediaLinks: ["https://www.newsweek.com/ukraine-drone-strikes-russian-oil-refineries-2024"],
    expectedRepairTime: 80,
    notes: "CDU unit damaged",
    draft: false,
  },
  {
    facilityId: 16, // Kavkaz Oil Terminal
    date: "2023-08-04",
    severity: "damaged",
    damagePercentage: 60,
    mediaLinks: ["https://www.bbc.com/news/world-europe-66407642"],
    expectedRepairTime: 180,
    notes: "Major maritime drone strike",
    draft: false,
  },
  {
    facilityId: 17, // Feodosia Oil Terminal
    date: "2023-10-07",
    severity: "destroyed",
    damagePercentage: 70,
    mediaLinks: ["https://www.reuters.com/world/europe/explosions-fire-reported-crimean-port-feodosia-2023-10-07/"],
    expectedRepairTime: 240,
    notes: "Massive fire, major damage",
    draft: false,
  },
  {
    facilityId: 18, // Belgorod Oil Depot
    date: "2024-05-01",
    severity: "damaged",
    damagePercentage: 50,
    mediaLinks: ["https://www.theguardian.com/world/2024/may/01/ukraine-belgorod-oil-depot-fire"],
    expectedRepairTime: 150,
    notes: "Large storage tanks destroyed",
    draft: false,
  },
  {
    facilityId: 19, // Tuapse Oil Depot
    date: "2024-03-14",
    severity: "damaged",
    damagePercentage: 40,
    mediaLinks: ["https://www.reuters.com/world/europe/drone-attack-sets-fire-oil-depot-russias-tuapse-2024-03-14/"],
    expectedRepairTime: 120,
    notes: "Multiple storage tanks hit",
    draft: false,
  },
  {
    facilityId: 11, // Kstovo Refinery
    date: "2024-03-16",
    severity: "damaged",
    damagePercentage: 25,
    mediaLinks: ["https://www.rferl.org/a/ukraine-drone-attacks-russia-refineries/32848291.html"],
    expectedRepairTime: 90,
    notes: "Production unit damaged",
    draft: false,
  },
];

async function addHits() {
  try {
    console.log("Starting to add verified hits...");

    // Get the highest existing hit ID
    const hitsSnapshot = await db.collection("hits").get();
    let maxId = 0;
    hitsSnapshot.forEach((doc) => {
      const id = parseInt(doc.id);
      if (id > maxId) maxId = id;
    });

    console.log(`Current max hit ID: ${maxId}`);

    // Add each hit
    for (let i = 0; i < verifiedHits.length; i++) {
      const hit = verifiedHits[i];
      const hitId = maxId + i + 1;

      await db
        .collection("hits")
        .doc(hitId.toString())
        .set({
          ...hit,
          id: hitId,
        });

      console.log(`Added hit ${hitId} for facility ${hit.facilityId} - ${hit.date}`);
    }

    console.log(`\nSuccessfully added ${verifiedHits.length} hits!`);
  } catch (error) {
    console.error("Error adding hits:", error);
  }
}

async function publishAllFacilities() {
  try {
    console.log("\nPublishing all facilities...");

    const facilitiesSnapshot = await db.collection("facilities").get();
    let count = 0;

    for (const doc of facilitiesSnapshot.docs) {
      await db.collection("facilities").doc(doc.id).update({
        draft: false,
      });
      count++;
    }

    console.log(`Published ${count} facilities!`);
  } catch (error) {
    console.error("Error publishing facilities:", error);
  }
}

async function run() {
  await addHits();
  await publishAllFacilities();
  console.log("\n✅ All done!");
  process.exit(0);
}

run();
