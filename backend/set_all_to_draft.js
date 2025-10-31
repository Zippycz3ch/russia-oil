const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function setAllToDraft() {
  try {
    const facilitiesRef = db.collection("facilities");
    const snapshot = await facilitiesRef.get();

    console.log(`Found ${snapshot.size} facilities to update...`);

    let updated = 0;
    const batch = db.batch();

    snapshot.forEach((doc) => {
      batch.update(doc.ref, { draft: true });
      updated++;
    });

    await batch.commit();

    console.log(`✓ Successfully set ${updated} facilities to draft mode`);
    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

setAllToDraft();
