"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { submitPaymentRequest } from "@/lib/payments";

const paymentSchema = z.object({
	amount: z.coerce.number().min(1, "Amount must be at least 1"),
	transactionRef: z.string().min(1, "Transaction reference is required"),
	note: z.string().optional(),
});

type PaymentFormData = z.infer<typeof paymentSchema>;

export default function AccountPage() {
	const { currentUser, userProfile, membershipStatus, loading: authLoading } = useAuth();
	const [submitting, setSubmitting] = useState(false);
	const [submitted, setSubmitted] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const form = useForm<PaymentFormData>({
		resolver: zodResolver(paymentSchema),
		defaultValues: {
			amount: 0,
			transactionRef: "",
			note: "",
		},
	});

	const onSubmit = async (data: PaymentFormData) => {
		if (!currentUser) return;
		setSubmitting(true);
		setError(null);

		try {
			await submitPaymentRequest({
				uid: currentUser.uid,
				amount: data.amount,
				transactionRef: data.transactionRef,
				note: data.note ?? "",
			});
			setSubmitted(true);
			form.reset();
		} catch (err: unknown) {
			setError(err instanceof Error ? err.message : "Failed to submit payment request");
		} finally {
			setSubmitting(false);
		}
	};

	if (authLoading) {
		return (
			<div className="flex flex-1 items-center justify-center bg-zinc-50 dark:bg-black">
				<p className="text-muted-foreground">Loading...</p>
			</div>
		);
	}

	if (!currentUser) {
		return (
			<div className="flex flex-1 flex-col items-center justify-center bg-zinc-50 gap-4 dark:bg-black">
				<p className="text-lg text-muted-foreground">Please log in to view your account.</p>
				<Link href="/login" className="text-sm font-medium text-primary hover:underline">
					Log in
				</Link>
			</div>
		);
	}

	return (
		<div className="flex flex-1 flex-col bg-zinc-50 dark:bg-black">
			<header className="flex items-center justify-between border-b px-6 py-4">
				<Link href="/" className="text-xl font-bold hover:opacity-80">
					Webtoon
				</Link>
				<div className="flex items-center gap-3">
					<ThemeToggle />
					<Button variant="ghost" size="sm">
						{userProfile?.displayName || currentUser.email}
					</Button>
				</div>
			</header>

			<main className="flex flex-1 flex-col items-center px-6 py-10">
				<div className="w-full max-w-lg space-y-8">
					{/* Membership Status */}
					<Card>
						<CardHeader>
							<CardTitle>Membership</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="flex items-center gap-3">
								<div
									className={`h-3 w-3 rounded-full ${
										membershipStatus === "none"
											? "bg-red-500"
											: membershipStatus === "free"
												? "bg-yellow-500"
												: "bg-green-500"
									}`}
								/>
								<span className="text-lg font-medium capitalize">
									{membershipStatus} membership
								</span>
							</div>
						</CardContent>
					</Card>

					{/* Bank Transfer Info */}
					{membershipStatus === "none" && (
						<Card>
							<CardHeader>
								<CardTitle>Upgrade to Paid Membership</CardTitle>
								<CardDescription>
									Transfer the fee to our bank account, then submit your payment details below.
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-6">
								{/* Bank Info */}
								<div className="rounded-lg border bg-muted/50 p-4 space-y-2">
									<p className="text-sm font-medium">Bank Account</p>
									<p className="text-sm text-muted-foreground">Bank: Example Bank</p>
									<p className="text-sm text-muted-foreground">Account: 1234567890</p>
									<p className="text-sm text-muted-foreground">Name: Webtoon Corp</p>
									<p className="text-xs text-muted-foreground mt-2">
										Please transfer the membership fee and include your username as the transfer
										note.
									</p>
								</div>

								{/* QR placeholder */}
								<div className="flex items-center justify-center rounded-lg border border-dashed bg-muted/30 p-8">
									<p className="text-sm text-muted-foreground">QR Code Placeholder</p>
								</div>

								{/* Payment Form */}
								{submitted ? (
									<div className="rounded-lg border border-green-200 bg-green-50 p-4 text-center dark:border-green-800 dark:bg-green-950">
										<p className="text-sm font-medium text-green-700 dark:text-green-300">
											Payment request submitted! We&apos;ll verify it shortly.
										</p>
									</div>
								) : (
									<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
										{error && (
											<div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
												{error}
											</div>
										)}
										<div className="flex flex-col gap-2">
											<Label htmlFor="amount">Amount Transferred</Label>
											<Input
												id="amount"
												type="number"
												placeholder="0"
												{...form.register("amount")}
											/>
											{form.formState.errors.amount && (
												<p className="text-xs text-destructive">
													{form.formState.errors.amount.message}
												</p>
											)}
										</div>
										<div className="flex flex-col gap-2">
											<Label htmlFor="transactionRef">Transaction Reference</Label>
											<Input
												id="transactionRef"
												placeholder="e.g. TXN-12345 or transfer screenshot ID"
												{...form.register("transactionRef")}
											/>
											{form.formState.errors.transactionRef && (
												<p className="text-xs text-destructive">
													{form.formState.errors.transactionRef.message}
												</p>
											)}
										</div>
										<div className="flex flex-col gap-2">
											<Label htmlFor="note">Note (optional)</Label>
											<Input
												id="note"
												placeholder="Any additional info"
												{...form.register("note")}
											/>
										</div>
										<Button type="submit" className="w-full" disabled={submitting}>
											{submitting ? "Submitting..." : "I've made the transfer"}
										</Button>
									</form>
								)}
							</CardContent>
						</Card>
					)}
				</div>
			</main>
		</div>
	);
}
