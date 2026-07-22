"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { auth, db } from "@/lib/firebase";

const signupSchema = z
	.object({
		displayName: z.string().min(2, "Name must be at least 2 characters"),
		email: z.string().email("Please enter a valid email address"),
		password: z.string().min(6, "Password must be at least 6 characters"),
		confirmPassword: z.string(),
	})
	.refine((val) => val.password === val.confirmPassword, {
		message: "Passwords do not match",
		path: ["confirmPassword"],
	});

type SignupFormData = z.infer<typeof signupSchema>;

export default function SignupPage() {
	const router = useRouter();
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);

	const form = useForm<SignupFormData>({
		resolver: zodResolver(signupSchema),
		defaultValues: {
			displayName: "",
			email: "",
			password: "",
			confirmPassword: "",
		},
	});

	const onSubmit = async (data: SignupFormData) => {
		setError(null);
		setLoading(true);

		try {
			const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
			const user = userCredential.user;
			console.log("[signup] Auth user created:", user.uid);

			await updateProfile(user, { displayName: data.displayName });
			console.log("[signup] Profile updated with displayName");

			console.log("[signup] Writing Firestore doc: users/" + user.uid);
			await setDoc(doc(db, "users", user.uid), {
				email: data.email,
				displayName: data.displayName,
				role: "user",
				membershipStatus: "none",
				createdAt: serverTimestamp(),
			});
			console.log("[signup] Firestore doc written successfully");

			router.push("/");
		} catch (err: unknown) {
			console.error("[signup] Error during signup:", err);
			if (err instanceof Error) {
				if (err.message.includes("auth/email-already-in-use")) {
					setError("An account with this email already exists.");
				} else {
					setError(err.message);
				}
			} else {
				setError("An unexpected error occurred.");
			}
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="flex min-h-screen">
			<div className="hidden flex-1 items-center justify-center lg:flex">
				<div className="gradient-hero flex h-full w-full flex-col items-center justify-center p-12 text-white">
					<div className="animate-float mb-8 text-8xl">✨</div>
					<h1 className="mb-4 text-4xl font-bold tracking-tight">Join Webtoon A+</h1>
					<p className="max-w-sm text-center text-lg text-white/80">
						Create your account and unlock a universe of captivating stories and vibrant characters.
					</p>
					<div className="mt-10 flex gap-3">
						<div className="h-2 w-2 rounded-full bg-white/40" />
						<div className="h-2 w-2 rounded-full bg-white/70" />
						<div className="h-2 w-2 rounded-full bg-white/40" />
					</div>
				</div>
			</div>

			<div className="flex flex-1 items-center justify-center px-6 py-12">
				<div className="w-full max-w-sm space-y-8">
					<div>
						<Link href="/" className="mb-8 inline-block text-2xl font-bold gradient-text lg:hidden">
							Webtoon A+
						</Link>
						<h2 className="text-3xl font-bold tracking-tight">Create an account</h2>
						<p className="mt-2 text-sm text-muted-foreground">							Start your Webtoon A+ adventure today</p>
					</div>

					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
						{error && (
							<div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
								{error}
							</div>
						)}

						<div className="space-y-2">
							<Label htmlFor="displayName" className="text-sm font-medium">
								Name
							</Label>
							<Input
								id="displayName"
								placeholder="Your name"
								className="h-12 rounded-xl border-border/50 bg-muted/30 px-4 transition-all focus:border-primary focus:bg-background focus:ring-2 focus:ring-primary/20"
								{...form.register("displayName")}
							/>
							{form.formState.errors.displayName && (
								<p className="text-xs text-destructive">
									{form.formState.errors.displayName.message}
								</p>
							)}
						</div>

						<div className="space-y-2">
							<Label htmlFor="email" className="text-sm font-medium">
								Email
							</Label>
							<Input
								id="email"
								type="email"
								placeholder="you@example.com"
								className="h-12 rounded-xl border-border/50 bg-muted/30 px-4 transition-all focus:border-primary focus:bg-background focus:ring-2 focus:ring-primary/20"
								{...form.register("email")}
							/>
							{form.formState.errors.email && (
								<p className="text-xs text-destructive">{form.formState.errors.email.message}</p>
							)}
						</div>

						<div className="space-y-2">
							<Label htmlFor="password" className="text-sm font-medium">
								Password
							</Label>
							<Input
								id="password"
								type="password"
								placeholder="At least 6 characters"
								className="h-12 rounded-xl border-border/50 bg-muted/30 px-4 transition-all focus:border-primary focus:bg-background focus:ring-2 focus:ring-primary/20"
								{...form.register("password")}
							/>
							{form.formState.errors.password && (
								<p className="text-xs text-destructive">{form.formState.errors.password.message}</p>
							)}
						</div>

						<div className="space-y-2">
							<Label htmlFor="confirmPassword" className="text-sm font-medium">
								Confirm Password
							</Label>
							<Input
								id="confirmPassword"
								type="password"
								placeholder="Confirm your password"
								className="h-12 rounded-xl border-border/50 bg-muted/30 px-4 transition-all focus:border-primary focus:bg-background focus:ring-2 focus:ring-primary/20"
								{...form.register("confirmPassword")}
							/>
							{form.formState.errors.confirmPassword && (
								<p className="text-xs text-destructive">
									{form.formState.errors.confirmPassword.message}
								</p>
							)}
						</div>

						<Button
							type="submit"
							className="h-12 w-full rounded-xl font-medium transition-all hover:shadow-lg hover:shadow-primary/25"
							disabled={loading}
						>
							{loading ? "Creating account..." : "Sign up"}
						</Button>
					</form>

					<p className="text-center text-sm text-muted-foreground">
						Already have an account?{" "}
						<Link
							href="/login"
							className="font-medium text-primary transition-colors hover:text-primary/80"
						>
							Log in
						</Link>
					</p>
				</div>
			</div>
		</div>
	);
}
