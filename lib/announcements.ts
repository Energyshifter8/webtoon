import {
	collection,
	doc,
	getDoc,
	getDocs,
	orderBy,
	query,
	serverTimestamp,
	setDoc,
	deleteDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Announcement } from "@/types/announcement";

const ANNOUNCEMENTS_COLLECTION = "announcements";

export async function getAnnouncements(): Promise<Announcement[]> {
	const q = query(
		collection(db, ANNOUNCEMENTS_COLLECTION),
		orderBy("createdAt", "desc"),
	);
	const snapshot = await getDocs(q);
	return snapshot.docs.map((docSnap) => ({
		id: docSnap.id,
		...docSnap.data(),
		createdAt:
			docSnap.data().createdAt?.toDate?.()?.toISOString() ??
			new Date().toISOString(),
	})) as Announcement[];
}

export async function createAnnouncement(data: {
	title: string;
	content: string;
	author: string;
}): Promise<string> {
	const docRef = doc(collection(db, ANNOUNCEMENTS_COLLECTION));
	await setDoc(docRef, {
		...data,
		createdAt: serverTimestamp(),
	});
	return docRef.id;
}

export async function deleteAnnouncement(id: string): Promise<void> {
	await deleteDoc(doc(db, ANNOUNCEMENTS_COLLECTION, id));
}
