import { collection, doc, getDoc, getDocs } from "firebase/firestore";
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
