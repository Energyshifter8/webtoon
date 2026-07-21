import {
	collection,
	doc,
	getDoc,
	getDocs,
	orderBy,
	query,
	where,
	limit as firestoreLimit,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Comic } from "@/types/comic";

const COMICS_COLLECTION = "comics";

export async function getComics(): Promise<Comic[]> {
	const snapshot = await getDocs(collection(db, COMICS_COLLECTION));
	return snapshot.docs.map((docSnap) => ({
		id: docSnap.id,
		...docSnap.data(),
	})) as Comic[];
}

export async function getComicById(id: string): Promise<Comic | null> {
	const docRef = doc(db, COMICS_COLLECTION, id);
	const docSnap = await getDoc(docRef);
	if (!docSnap.exists()) return null;
	return { id: docSnap.id, ...docSnap.data() } as Comic;
}

export async function getTrendingComics(count = 10): Promise<Comic[]> {
	const q = query(
		collection(db, COMICS_COLLECTION),
		orderBy("viewsWeekly", "desc"),
		firestoreLimit(count),
	);
	const snapshot = await getDocs(q);
	return snapshot.docs.map((docSnap) => ({
		id: docSnap.id,
		...docSnap.data(),
	})) as Comic[];
}

export async function getPopularComics(
	period: "weekly" | "monthly" | "allTime",
	count = 10,
): Promise<Comic[]> {
	const field =
		period === "weekly"
			? "viewsWeekly"
			: period === "monthly"
				? "viewsMonthly"
				: "viewsAllTime";
	const q = query(
		collection(db, COMICS_COLLECTION),
		orderBy(field, "desc"),
		firestoreLimit(count),
	);
	const snapshot = await getDocs(q);
	return snapshot.docs.map((docSnap) => ({
		id: docSnap.id,
		...docSnap.data(),
	})) as Comic[];
}

export async function getFeaturedComic(): Promise<Comic | null> {
	const q = query(
		collection(db, COMICS_COLLECTION),
		where("featured", "==", true),
		firestoreLimit(1),
	);
	const snapshot = await getDocs(q);
	if (snapshot.empty) return null;
	const docSnap = snapshot.docs[0];
	return { id: docSnap.id, ...docSnap.data() } as Comic;
}

export async function getComicsByGenre(
	genre: string,
	count = 20,
): Promise<Comic[]> {
	const q = query(
		collection(db, COMICS_COLLECTION),
		where("genres", "array-contains", genre),
		firestoreLimit(count),
	);
	const snapshot = await getDocs(q);
	return snapshot.docs.map((docSnap) => ({
		id: docSnap.id,
		...docSnap.data(),
	})) as Comic[];
}

export async function searchComics(
	searchTerm: string,
): Promise<Comic[]> {
	const snapshot = await getDocs(collection(db, COMICS_COLLECTION));
	const all = snapshot.docs.map((docSnap) => ({
		id: docSnap.id,
		...docSnap.data(),
	})) as Comic[];
	const lower = searchTerm.toLowerCase();
	return all.filter(
		(c) =>
			c.title.toLowerCase().includes(lower) ||
			c.author.toLowerCase().includes(lower) ||
			c.genres?.some((g) => g.toLowerCase().includes(lower)),
	);
}
