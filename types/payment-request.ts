export type PaymentRequestStatus = "pending" | "confirmed" | "rejected";

export interface PaymentRequest {
	id: string;
	uid: string;
	amount: number;
	note: string;
	transactionRef: string;
	status: PaymentRequestStatus;
	submittedAt: string;
}
