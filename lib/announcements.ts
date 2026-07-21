import {
	collection,
	deleteDoc,
	doc,
	getDoc,
	getDocs,
	orderBy,
	query,
	serverTimestamp,
	setDoc,
	updateDoc,
	limit,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface Announcement {
	id: string;
	title: string;
	body: string;
	publishedAt: Date | null;
}

const ANNOUNCEMENTS_COLLECTION = "announcements";

export async function getAnnouncements(count = 20): Promise<Announcement[]> {
	const q = query(
		collection(db, ANNOUNCEMENTS_COLLECTION),
		orderBy("publishedAt", "desc"),
		limit(count),
	);
	const snap = await getDocs(q);
	return snap.docs.map((d) => ({
		id: d.id,
		...d.data(),
		publishedAt: d.data().publishedAt?.toDate?.() ?? null,
	})) as Announcement[];
}

export async function getAnnouncementById(id: string): Promise<Announcement | null> {
	const snap = await getDoc(doc(db, ANNOUNCEMENTS_COLLECTION, id));
	if (!snap.exists()) return null;
	const data = snap.data();
	return {
		id: snap.id,
		...data,
		publishedAt: data.publishedAt?.toDate?.() ?? null,
	} as Announcement;
}

export async function createAnnouncement(
	title: string,
	body: string,
): Promise<string> {
	const ref = doc(collection(db, ANNOUNCEMENTS_COLLECTION));
	await setDoc(ref, {
		title,
		body,
		publishedAt: serverTimestamp(),
	});
	return ref.id;
}

export async function updateAnnouncement(
	id: string,
	title: string,
	body: string,
): Promise<void> {
	await updateDoc(doc(db, ANNOUNCEMENTS_COLLECTION, id), { title, body });
}

export async function deleteAnnouncement(id: string): Promise<void> {
	await deleteDoc(doc(db, ANNOUNCEMENTS_COLLECTION, id));
}
