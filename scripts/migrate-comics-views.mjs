import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize admin SDK. Prefer GOOGLE_APPLICATION_CREDENTIALS or ADC.
// Set FIREBASE_PROJECT env or default to webtoon-33a47
const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'webtoon-33a47';

try {
  initializeApp({ credential: applicationDefault(), projectId });
} catch (e) {
  // may have already been initialized in some environments
}

const db = getFirestore();

async function migrate() {
  console.log('Starting comics fields migration for project:', projectId);
  const snapshot = await db.collection('comics').get();
  console.log('Found', snapshot.size, 'comic docs');
  if (snapshot.empty) {
    console.log('No comics found. Exiting.');
    return;
  }

  let batch = db.batch();
  let ops = 0;
  let totalUpdates = 0;

  for (const doc of snapshot.docs) {
    const data = doc.data();
    const updates = {};
    if (typeof data.viewsWeekly !== 'number') updates.viewsWeekly = 0;
    if (typeof data.viewsMonthly !== 'number') updates.viewsMonthly = 0;
    if (typeof data.viewsAllTime !== 'number') updates.viewsAllTime = 0;

    if (Object.keys(updates).length > 0) {
      batch.update(doc.ref, updates);
      ops++;
      totalUpdates++;
    }

    if (ops >= 400) {
      console.log('Committing batch of', ops, 'updates');
      await batch.commit();
      batch = db.batch();
      ops = 0;
    }
  }

  if (ops > 0) {
    console.log('Committing final batch of', ops, 'updates');
    await batch.commit();
  }

  console.log('Migration complete. Total docs updated:', totalUpdates);

  // Quick check: try a simple ordered query to detect index requirement
  try {
    console.log('Running test query: order by viewsWeekly desc limit 1');
    const qsnap = await db.collection('comics').orderBy('viewsWeekly', 'desc').limit(1).get();
    console.log('Test query succeeded. Returned docs:', qsnap.size);
  } catch (err) {
    console.error('Test query failed — may require an index or other issue. Error:');
    console.error(err.message || err);
    console.error('If Firestore requires a composite index, follow the link in the error message to create it, or add the index definition to firestore.indexes.json and deploy.');
  }

  // Print sample docs after migration (up to 5)
  console.log('Sample of updated docs (first 5):');
  const after = await db.collection('comics').limit(5).get();
  after.docs.forEach((d) => {
    const dd = d.data();
    console.log(d.id, { viewsWeekly: dd.viewsWeekly, viewsMonthly: dd.viewsMonthly, viewsAllTime: dd.viewsAllTime });
  });
}

migrate().then(() => {
  console.log('Done');
  process.exit(0);
}).catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
