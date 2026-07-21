"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { confirmPayment, getPendingPaymentRequests, rejectPayment } from "@/lib/payments";
import type { PaymentRequest } from "@/types/payment-request";

export default function AdminPaymentsPage() {
	const [requests, setRequests] = useState<PaymentRequest[]>([]);
	const [loading, setLoading] = useState(true);
	const [processingId, setProcessingId] = useState<string | null>(null);

	useEffect(() => {
		const fetchRequests = async () => {
			setLoading(true);
			try {
				const data = await getPendingPaymentRequests();
				setRequests(data);
			} catch {
			} finally {
				setLoading(false);
			}
		};
		fetchRequests();
	}, []);

	const handleConfirm = async (requestId: string) => {
		setProcessingId(requestId);
		try {
			await confirmPayment(requestId);
			setRequests((prev) => prev.filter((r) => r.id !== requestId));
		} catch {
		} finally {
			setProcessingId(null);
		}
	};

	const handleReject = async (requestId: string) => {
		setProcessingId(requestId);
		try {
			await rejectPayment(requestId);
			setRequests((prev) => prev.filter((r) => r.id !== requestId));
		} catch {
		} finally {
			setProcessingId(null);
		}
	};

	return (
		<main className="flex flex-1 flex-col items-center px-6 py-10">
			<div className="w-full max-w-3xl">
				<h1 className="mb-6 text-2xl font-bold">Pending Payments</h1>

				{loading ? (
					<p className="text-muted-foreground">Loading payment requests...</p>
				) : requests.length === 0 ? (
					<div className="flex flex-col items-center gap-4 rounded-xl border bg-card p-10 text-center">
						<p className="text-lg font-medium">No pending requests</p>
						<p className="text-sm text-muted-foreground">
							All payment requests have been processed.
						</p>
					</div>
				) : (
					<div className="space-y-4">
						{requests.map((request) => (
							<Card key={request.id}>
								<CardHeader className="pb-3">
									<div className="flex items-center justify-between">
										<CardTitle className="text-base">Payment Request</CardTitle>
										<span className="rounded-md bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
											Pending
										</span>
									</div>
								</CardHeader>
								<CardContent className="space-y-3">
									<div className="grid grid-cols-2 gap-2 text-sm">
										<div>
											<p className="text-muted-foreground">User ID</p>
											<p className="font-mono text-xs">{request.uid}</p>
										</div>
										<div>
											<p className="text-muted-foreground">Amount</p>
											<p className="font-medium">{request.amount}</p>
										</div>
										<div>
											<p className="text-muted-foreground">Transaction Ref</p>
											<p className="font-mono text-xs">{request.transactionRef}</p>
										</div>
										<div>
											<p className="text-muted-foreground">Submitted</p>
											<p className="text-xs">{new Date(request.submittedAt).toLocaleString()}</p>
										</div>
										{request.note && (
											<div className="col-span-2">
												<p className="text-muted-foreground">Note</p>
												<p className="text-xs">{request.note}</p>
											</div>
										)}
									</div>
									<div className="flex gap-2 pt-2">
										<Button
											size="sm"
											onClick={() => handleConfirm(request.id)}
											disabled={processingId === request.id}
										>
											{processingId === request.id ? "Processing..." : "Confirm"}
										</Button>
										<Button
											size="sm"
											variant="destructive"
											onClick={() => handleReject(request.id)}
											disabled={processingId === request.id}
										>
											Reject
										</Button>
									</div>
								</CardContent>
							</Card>
						))}
					</div>
				)}
			</div>
		</main>
	);
}
