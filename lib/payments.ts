import {
	collection,
	doc,
	getDocs,
	orderBy,
	query,
	runTransaction,
	serverTimestamp,
	setDoc,
	updateDoc,
	where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { PaymentRequest, PaymentRequestStatus } from "@/types/payment-request";

const PAYMENT_REQUESTS_COLLECTION = "paymentRequests";

export async function submitPaymentRequest(data: {
	uid: string;
	amount: number;
	note: string;
	transactionRef: string;
}): Promise<string> {
	const docRef = doc(collection(db, PAYMENT_REQUESTS_COLLECTION));
	await setDoc(docRef, {
		uid: data.uid,
		amount: data.amount,
		note: data.note,
		transactionRef: data.transactionRef,
		status: "pending" as PaymentRequestStatus,
		submittedAt: serverTimestamp(),
	});
	return docRef.id;
}

export async function getPendingPaymentRequests(): Promise<PaymentRequest[]> {
	const q = query(
		collection(db, PAYMENT_REQUESTS_COLLECTION),
		where("status", "==", "pending"),
		orderBy("submittedAt", "desc"),
	);
	const snapshot = await getDocs(q);
	return snapshot.docs.map((docSnap) => ({
		id: docSnap.id,
		...docSnap.data(),
		submittedAt: docSnap.data().submittedAt?.toDate?.()?.toISOString() ?? new Date().toISOString(),
	})) as PaymentRequest[];
}

export async function confirmPayment(requestId: string): Promise<void> {
	await runTransaction(db, async (transaction) => {
		const requestRef = doc(db, PAYMENT_REQUESTS_COLLECTION, requestId);
		const requestSnap = await transaction.get(requestRef);

		if (!requestSnap.exists()) {
			throw new Error("Payment request not found");
		}

		const requestData = requestSnap.data();
		if (requestData.status !== "pending") {
			throw new Error("Payment request is not pending");
		}

		const userRef = doc(db, "users", requestData.uid);

		transaction.update(requestRef, { status: "confirmed" });
		transaction.update(userRef, { membershipStatus: "paid" });
	});
}

export async function rejectPayment(requestId: string): Promise<void> {
	const requestRef = doc(db, PAYMENT_REQUESTS_COLLECTION, requestId);
	await updateDoc(requestRef, { status: "rejected" });
}
