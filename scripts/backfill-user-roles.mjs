import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'webtoon-33a47';

try {
  initializeApp({ credential: applicationDefault(), projectId });
} catch (e) {
  // may have already been initialized
}

const db = getFirestore();

async function backfillRoles() {
  console.log('Backfilling role field on users collection for project:', projectId);
  const snapshot = await db.collection('users').get();
  console.log('Found', snapshot.size, 'user docs');

  if (snapshot.empty) {
    console.log('No users found. Exiting.');
    return;
  }

  let batch = db.batch();
  let ops = 0;
  let totalUpdated = 0;

  for (const doc of snapshot.docs) {
    const data = doc.data();
    if (data.role === undefined || data.role === null) {
      batch.update(doc.ref, { role: 'user' });
      ops++;
      totalUpdated++;
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

  console.log('Backfill complete. Total docs updated:', totalUpdated);
  console.log('Total docs unchanged (already had role):', snapshot.size - totalUpdated);
}

backfillRoles().then(() => {
  console.log('Done');
  process.exit(0);
}).catch((err) => {
  console.error('Backfill failed:', err);
  process.exit(1);
});
