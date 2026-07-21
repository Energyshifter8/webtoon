"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { signOut } from "firebase/auth";
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
import { auth } from "@/lib/firebase";
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

	const handleSignOut = async () => {
		await signOut(auth);
	};

	if (authLoading) {
		return (
			<div className="flex flex-1 items-center justify-center bg-background">
				<div className="flex flex-col items-center gap-4">
					<div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
					<p className="text-sm text-muted-foreground">Loading...</p>
				</div>
			</div>
		);
	}

	if (!currentUser) {
		return (
			<div className="flex flex-1 flex-col items-center justify-center bg-background gap-6 px-6">
				<div className="text-6xl">🔒</div>
				<div className="text-center">
					<h2 className="text-2xl font-bold">Welcome back</h2>
					<p className="mt-2 text-muted-foreground">
						Log in to view your account and manage your membership.
					</p>
				</div>
				<Link href="/login">
					<Button className="h-12 rounded-xl px-8 font-medium transition-all hover:shadow-lg hover:shadow-primary/25">
						Log in
					</Button>
				</Link>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-background">
			<header className="glass sticky top-0 z-50 border-b border-border/50">
				<div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-6">
					<Link href="/" className="text-xl font-bold gradient-text">
						Webtoon
					</Link>
					<div className="flex items-center gap-4">
						<ThemeToggle />
						<Button
							variant="ghost"
							size="sm"
							onClick={handleSignOut}
							className="text-muted-foreground hover:text-foreground"
						>
							Sign out
						</Button>
					</div>
				</div>
			</header>

			<main className="mx-auto max-w-4xl px-6 py-10">
				<div className="mb-10 animate-slide-up">
					<h1 className="text-3xl font-bold tracking-tight">Account</h1>
					<p className="mt-2 text-muted-foreground">Manage your membership and payment details</p>
				</div>

				<div className="grid gap-6 md:grid-cols-3">
					<div className="md:col-span-1">
						<Card className="animate-slide-up overflow-hidden">
							<div className="gradient-hero p-6 text-white">
								<div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 text-3xl">
									👤
								</div>
								<p className="font-medium">{userProfile?.displayName || "User"}</p>
								<p className="text-sm text-white/70">{currentUser.email}</p>
							</div>
							<CardContent className="p-6">
								<div className="space-y-4">
									<div>
										<p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
											Status
										</p>
										<div className="mt-2 flex items-center gap-2">
											<div
												className={`h-2.5 w-2.5 rounded-full ${
													membershipStatus === "paid"
														? "bg-green-500 shadow-sm shadow-green-500/50"
														: membershipStatus === "free"
															? "bg-amber-500 shadow-sm shadow-amber-500/50"
															: "bg-muted-foreground/40"
												}`}
											/>
											<span className="text-sm font-medium capitalize">{membershipStatus}</span>
										</div>
									</div>
									<div>
										<p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
											Member since
										</p>
										<p className="mt-2 text-sm">Today</p>
									</div>
								</div>
							</CardContent>
						</Card>
					</div>

					<div className="md:col-span-2">
						{membershipStatus === "none" ? (
							<Card className="animate-slide-up">
								<CardHeader>
									<div className="flex items-center gap-3">
										<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
											✨
										</div>
										<div>
											<CardTitle>Upgrade Membership</CardTitle>
											<CardDescription>
												Transfer the fee and submit your payment details
											</CardDescription>
										</div>
									</div>
								</CardHeader>
								<CardContent className="space-y-6">
									<div className="rounded-xl border border-primary/20 bg-primary/5 p-5">
										<p className="mb-3 text-sm font-medium">Bank Transfer Details</p>
										<div className="space-y-1.5 text-sm text-muted-foreground">
											<p>
												Bank: <span className="font-medium text-foreground">Example Bank</span>
											</p>
											<p>
												Account:{" "}
												<span className="font-mono font-medium text-foreground">1234567890</span>
											</p>
											<p>
												Name: <span className="font-medium text-foreground">Webtoon Corp</span>
											</p>
										</div>
										<p className="mt-3 text-xs text-muted-foreground">
											Include your username as the transfer note for faster verification.
										</p>
									</div>

									<div className="flex items-center justify-center rounded-xl border border-dashed border-border/60 bg-muted/20 p-8">
										<div className="text-center">
											<div className="mb-2 text-4xl">📱</div>
											<p className="text-sm text-muted-foreground">QR Code</p>
										</div>
									</div>

									{submitted ? (
										<div className="flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-950">
											<div className="text-xl">✅</div>
											<div>
												<p className="text-sm font-medium text-green-700 dark:text-green-300">
													Payment request submitted!
												</p>
												<p className="text-xs text-green-600/80 dark:text-green-400/80">
													We&apos;ll verify it shortly.
												</p>
											</div>
										</div>
									) : (
										<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
											{error && (
												<div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
													{error}
												</div>
											)}

											<div className="grid gap-4 sm:grid-cols-2">
												<div className="space-y-2">
													<Label htmlFor="amount" className="text-sm font-medium">
														Amount
													</Label>
													<Input
														id="amount"
														type="number"
														placeholder="0"
														className="h-11 rounded-xl border-border/50 bg-muted/30"
														{...form.register("amount")}
													/>
													{form.formState.errors.amount && (
														<p className="text-xs text-destructive">
															{form.formState.errors.amount.message}
														</p>
													)}
												</div>

												<div className="space-y-2">
													<Label htmlFor="transactionRef" className="text-sm font-medium">
														Transaction Ref
													</Label>
													<Input
														id="transactionRef"
														placeholder="TXN-12345"
														className="h-11 rounded-xl border-border/50 bg-muted/30"
														{...form.register("transactionRef")}
													/>
													{form.formState.errors.transactionRef && (
														<p className="text-xs text-destructive">
															{form.formState.errors.transactionRef.message}
														</p>
													)}
												</div>
											</div>

											<div className="space-y-2">
												<Label htmlFor="note" className="text-sm font-medium">
													Note (optional)
												</Label>
												<Input
													id="note"
													placeholder="Any additional info"
													className="h-11 rounded-xl border-border/50 bg-muted/30"
													{...form.register("note")}
												/>
											</div>

											<Button
												type="submit"
												className="h-12 w-full rounded-xl font-medium transition-all hover:shadow-lg hover:shadow-primary/25"
												disabled={submitting}
											>
												{submitting ? "Submitting..." : "Submit Payment"}
											</Button>
										</form>
									)}
								</CardContent>
							</Card>
						) : (
							<Card className="animate-slide-up">
								<CardContent className="p-8">
									<div className="flex flex-col items-center gap-4 text-center">
										<div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-green-400 to-emerald-500 text-4xl text-white shadow-lg shadow-green-500/25">
											🎉
										</div>
										<div>
											<h3 className="text-xl font-bold">You&apos;re all set!</h3>
											<p className="mt-2 text-muted-foreground">
												Your {membershipStatus} membership is active. Enjoy reading!
											</p>
										</div>
										<Link href="/">
											<Button className="mt-2 rounded-xl px-8">Start Reading</Button>
										</Link>
									</div>
								</CardContent>
							</Card>
						)}
					</div>
				</div>
			</main>
		</div>
	);
}
