import {
	collection,
	deleteDoc,
	doc,
	getDocs,
	serverTimestamp,
	setDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getPosterUrl } from "@/lib/get-poster";
import type { Comic } from "@/types/comic";

export async function getBookmarks(uid: string): Promise<Comic[]> {
	const snap = await getDocs(collection(db, "users", uid, "bookmarks"));
	return snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Comic[];
}

export async function isBookmarked(uid: string, comicId: string): Promise<boolean> {
	const snap = await doc(db, "users", uid, "bookmarks", comicId);
	const { getDoc } = await import("firebase/firestore");
	const snapDoc = await getDoc(snap);
	return snapDoc.exists();
}

export async function toggleBookmark(
	uid: string,
	comic: Comic,
): Promise<boolean> {
	const ref = doc(db, "users", uid, "bookmarks", comic.id);
	const { getDoc } = await import("firebase/firestore");
	const existing = await getDoc(ref);
	if (existing.exists()) {
		await deleteDoc(ref);
		return false;
	}
	await setDoc(ref, {
		id: comic.id,
		title: comic.title,
		posterUrl: getPosterUrl(comic),
		genres: comic.genres,
		rating: comic.rating,
		author: comic.author,
		accessLevel: comic.accessLevel,
		addedAt: serverTimestamp(),
	});
	return true;
}
