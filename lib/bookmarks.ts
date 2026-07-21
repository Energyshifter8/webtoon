import {
	collection,
	doc,
	deleteDoc,
	getDoc,
	getDocs,
	serverTimestamp,
	setDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export async function getBookmarks(uid: string): Promise<string[]> {
	const snapshot = await getDocs(collection(db, "users", uid, "bookmarks"));
	return snapshot.docs.map((docSnap) => docSnap.id);
}

export async function isBookmarked(uid: string, comicId: string): Promise<boolean> {
	const docRef = doc(db, "users", uid, "bookmarks", comicId);
	const docSnap = await getDoc(docRef);
	return docSnap.exists();
}

export async function toggleBookmark(uid: string, comicId: string): Promise<boolean> {
	const docRef = doc(db, "users", uid, "bookmarks", comicId);
	const docSnap = await getDoc(docRef);

	if (docSnap.exists()) {
		await deleteDoc(docRef);
		return false;
	}
	await setDoc(docRef, {
		comicId,
		createdAt: serverTimestamp(),
	});
	return true;
}
